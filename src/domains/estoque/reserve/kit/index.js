/* eslint-disable max-len */
const R = require("ramda");
const moment = require("moment");
// const axios = require('axios')
const Sequelize = require("sequelize");

const { Op: operators } = Sequelize;

const formatQuery = require("../../../../helpers/lazyLoad");
const database = require("../../../../database");

const { FieldValidationError } = require("../../../../helpers/errors");

const Kit = database.model("kit");
const Technician = database.model("technician");
const KitParts = database.model("kitParts");
const Product = database.model("product");
const Notification = database.model("notification");

module.exports = class KitDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options;

    const bodyDataNotHasProp = (prop) => R.not(R.has(prop, bodyData));
    const bodyHasProp = (prop) => R.has(prop, bodyData);

    const field = {
      kitParts: false,
    };
    const message = {
      kitParts: false,
    };

    let errors = false;

    if (bodyDataNotHasProp("kitParts") || !bodyData.kitParts) {
      errors = true;
      field.kitParts = true;
      message.kitParts = "Ao menos uma peça deve ser associada.";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const technicial = await Technician.findAll({
      where: { external: true },
      transaction,
    });

    const oldKit = await Kit.findAll({
      include: [
        {
          model: Technician,
          // required: true,
        },
      ],
      transaction,
    });

    let count = {};
    let count1 = {};

    if (oldKit.length > 0) {
      const oldKitDelete = oldKit.map(async (itemOldKit) => {
        const oldKitParts = await KitParts.findAll({
          where: { kitId: itemOldKit.id },
          attributes: ["id", "amount", "productId"],
          transaction,
        });

        const kitPartsDeletePromises = oldKitParts.map(async (item) => {
          if (itemOldKit.technicianId) {
            const product = await Product.findByPk(item.productId, {
              transaction,
            });

            count = {
              ...count,
              [item.productId]: count[item.productId]
                ? count[item.productId]
                : 0,
            };

            count[item.productId] += parseInt(item.amount, 10);

            const productUpdate = {
              ...product,
              available: (
                parseInt(product.available, 10) + count[item.productId]
              ).toString(),
              reserved: (
                parseInt(product.reserved, 10) - count[item.productId]
              ).toString(),
            };

            if (
              parseInt(productUpdate.available, 10) < 0 ||
              parseInt(productUpdate.reserved, 10) < 0
            ) {
              field.productUpdate = true;
              message.productUpdate = "Número negativo não é valido";
              throw new FieldValidationError([{ field, message }]);
            }
            await product.update(productUpdate, { transaction });
          }

          await item.destroy({ transaction });
        });

        await Promise.all(kitPartsDeletePromises);

        await itemOldKit.destroy({ transaction });
      });
      await Promise.all(oldKitDelete);
    }

    const kitCreatedPromise = technicial.map(async (itemTec) => {
      const kitCreated = await Kit.create(
        { technicianId: itemTec.id },
        { transaction }
      );

      if (bodyHasProp("kitParts")) {
        const { kitParts } = bodyData;

        const kitPartsCreattedPromises = kitParts.map(async (item) => {
          const product = await Product.findByPk(item.productId, {
            transaction,
          });

          const kitPartsCreatted = {
            amount: item.amount,
            kitId: kitCreated.id,
            productId: product.id,
          };

          await KitParts.create(kitPartsCreatted, { transaction });

          count1 = {
            ...count1,
            [item.productId]: count1[item.productId]
              ? count1[item.productId]
              : 0,
          };

          count1[item.productId] += parseInt(item.amount, 10);

          const productUpdate = {
            ...product,
            available: (
              parseInt(product.available, 10) - count1[item.productId]
            ).toString(),
            reserved: (
              parseInt(product.reserved, 10) + count1[item.productId]
            ).toString(),
          };

          if (
            parseInt(productUpdate.available, 10) < 0 ||
            parseInt(productUpdate.available, 10) < 0
          ) {
            field.productUpdate = true;
            message.productUpdate = "Número negativo não é valido";
            throw new FieldValidationError([{ field, message }]);
          }

          if (
            parseInt(productUpdate.available, 10) <
            parseInt(product.minimumStock, 10)
          ) {
            const messageNotification = `${product.name} está abaixo da quantidade mínima disponível no estoque, que é de ${product.minimumStock} unidades`;

            await Notification.create(
              { message: messageNotification },
              { transaction }
            );
          }

          await product.update(productUpdate, { transaction });
          count1 = 0;
        });
        await Promise.all(kitPartsCreattedPromises);
      }
    });

    await Promise.all(kitCreatedPromise);

    const kitCreatedTecNull = await Kit.create({ transaction });

    if (bodyHasProp("kitParts")) {
      const { kitParts } = bodyData;

      const kitPartsCreattedPromises = kitParts.map(async (item) => {
        const product = await Product.findByPk(item.productId, {
          transaction,
        });

        const kitPartsCreatted = {
          amount: item.amount,
          kitId: kitCreatedTecNull.id,
          productId: product.id,
        };

        await KitParts.create(kitPartsCreatted, { transaction });
      });
      await Promise.all(kitPartsCreattedPromises);
    }

    const response = await Kit.findAll({
      include: [
        {
          model: Product,
        },
      ],
      transaction,
    });

    return response;
  }

  async getAll(options = {}) {
    const inicialOrder = {
      field: "createdAt",
      acendent: true,
      direction: "DESC",
    };

    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);
    const newOrder = query && query.order ? query.order : inicialOrder;

    if (newOrder.acendent) {
      newOrder.direction = "DESC";
    } else {
      newOrder.direction = "ASC";
    }

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery);

    const kitParts = await KitParts.findAndCountAll({
      where: getWhere("kitParts"),
      include: [
        {
          model: Product,
          where: getWhere("product"),
        },
        {
          model: Kit,
          include: [
            {
              model: Technician,
              where: newQuery.filters && {
                name: {
                  [operators.eq]:
                    newQuery.filters &&
                    newQuery.filters.technician.specific.name,
                },
              },
            },
          ],
          required: true,
        },
      ],
      order: [[newOrder.field, newOrder.direction]],
      limit,
      offset,
      transaction,
    });

    const { rows, count } = kitParts;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: kitParts.count,
        rows: [],
      };
    }

    const formatDateFunct = (date) => {
      moment.locale("pt-br");
      const formatDate = moment(date).format("L");
      const formatHours = moment(date).format("LT");
      const dateformated = `${formatDate} ${formatHours}`;
      return dateformated;
    };

    const formatData = await R.map((kitPart) => {
      console.log(JSON.parse(JSON.stringify(kitPart)));
      const resp = {
        kitPartId: kitPart.id,
        amount: kitPart.amount,
        // oldAmount: entrance.oldAmount,
        // stockBase: entrance.stockBase,
        // responsibleUser: entrance.responsibleUser,
        // razaoSocial: entrance.company.razaoSocial,
        // category: entrance.product.category,
        // description: entrance.product.description,
        // SKU: entrance.product.SKU,
        // minimumStock: entrance.product.minimumStock,
        // amount: entrance.product.amount,
        // mark: entrance.product.mark.mark,
        // // eslint-disable-next-line max-len
        name: kitPart.product ? kitPart.product.name : null,
        quantMax: kitPart.product
          ? parseInt(kitPart.product.available, 10)
          : null,
        updatedAt: formatDateFunct(kitPart.updatedAt),
      };
      return resp;
    });

    const kitPartsList = formatData(rows);

    // const kitPartsList = formatData(rows).filter((item) => {
    //   if (item.name.indexOf(query.filters.name.toUpperCase()) !== -1) return item
    // })

    let show = limit;
    if (count < show) {
      show = count;
    }

    const response = {
      page: pageResponse,
      show,
      count,
      rows: kitPartsList,
    };

    return response;
  }

  async getKitDefaultValue(options = {}) {
    const inicialOrder = {
      field: "createdAt",
      acendent: true,
      direction: "DESC",
    };

    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);
    const newOrder = query && query.order ? query.order : inicialOrder;

    if (newOrder.acendent) {
      newOrder.direction = "DESC";
    } else {
      newOrder.direction = "ASC";
    }

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery);

    const kitParts = await KitParts.findAndCountAll({
      where: getWhere("kitParts"),
      include: [
        {
          model: Product,
          where: getWhere("product"),
          required: true,
        },
        {
          model: Kit,
          where: { technicianId: null },
          required: true,
        },
      ],
      order: [[newOrder.field, newOrder.direction]],
      limit,
      offset,
      transaction,
    });

    const { rows } = kitParts;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: kitParts.count,
        rows: [],
      };
    }

    const formatData = await R.map((kitPart) => {
      const resp = {
        amount: parseInt(kitPart.amount, 10),
        itemCarrinho: kitPart.product.name,
        productId: kitPart.product.id,
        // oldAmount: kitPart.oldAmount,
        // stockBase: kitPart.stockBase,
        // responsibleUser: kitPart.responsibleUser,
        // razaoSocial: kitPart.company.razaoSocial,
        // category: kitPart.product.category,
        // description: kitPart.product.description,
        // SKU: kitPart.product.SKU,
        // minimumStock: kitPart.product.minimumStock,
        // amount: kitPart.product.amount,
        // mark: kitPart.product.mark.mark,
        // // eslint-disable-next-line max-len
        // createdAt: formatDateFunct(kitPart.createdAt),
      };
      return resp;
    });

    const kitPartsList = formatData(rows);

    // const kitPartsList = formatData(rows).filter((item) => {
    //   if (item.name.indexOf(query.filters.name.toUpperCase()) !== -1) return item
    // })

    let show = limit;
    if (kitParts.count < show) {
      show = kitParts.count;
    }

    const response = {
      page: pageResponse,
      show,
      count: kitParts.count,
      rows: kitPartsList,
    };

    return response;
  }
};
