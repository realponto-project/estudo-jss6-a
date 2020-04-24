/* eslint-disable max-len */
const R = require("ramda");
const moment = require("moment");
// const axios = require('axios')
const Cnpj = require("@fnando/cnpj/es");
const Cpf = require("@fnando/cpf/es");

const formatQuery = require("../../../../helpers/lazyLoad");
const database = require("../../../../database");

const { FieldValidationError } = require("../../../../helpers/errors");

const Equip = database.model("equip");
const Product = database.model("product");
const FreeMarket = database.model("freeMarket");
const FreeMarketParts = database.model("freeMarketParts");
// const Notification = database.model('notification')

module.exports = class FreeMarketDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options;

    console.log(bodyData);

    const freeMarket = R.omit(["id"], bodyData);

    const freeMarketNotHasProp = (prop) => R.not(R.has(prop, freeMarket));
    const bodyHasProp = (prop) => R.has(prop, bodyData);

    const field = {
      codigo: false,
      razaoSocial: false,
      cpfOuCnpj: false,
    };
    const message = {
      codigo: "",
      razaoSocial: "",
      cpfOuCnpj: "",
    };

    let errors = false;

    if (freeMarketNotHasProp("trackingCode") || !freeMarket.trackingCode) {
      errors = true;
      field.codigo = true;
      message.codigo = "Digite o código de rastreio.";
    } else {
      const freeMarketHasExist = await FreeMarket.findOne({
        where: { trackingCode: freeMarket.trackingCode },
        paranoid: false,
        transaction,
      });

      if (freeMarketHasExist) {
        errors = true;
        field.codigo = true;
        message.codigo = "Codigo já registrado.";
      }
    }

    if (freeMarketNotHasProp("name") || !freeMarket.name) {
      errors = true;
      field.razaoSocial = true;
      message.razaoSocial = "Digite o nome ou razão social.";
    }

    if (!freeMarketNotHasProp("cnpjOrCpf")) {
      const { cnpjOrCpf } = freeMarket;

      if (!Cnpj.isValid(cnpjOrCpf) && !Cpf.isValid(cnpjOrCpf)) {
        errors = true;
        field.cpfOuCnpj = true;
        message.cpfOuCnpj = "O cnpj ou o cpf informado não é válido.";
      }
    }

    if (
      !bodyHasProp("freeMarketParts") ||
      bodyData.freeMarketParts.length === 0
    ) {
      errors = true;
      field.freeMarketParts = true;
      message.freeMarketParts = "Informe ao menos uma peça para reserva.";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    freeMarket.cnpjOrCpf = freeMarket.cnpjOrCpf.replace(/\D/gi, "");

    const freeMarketCreated = await FreeMarket.create(freeMarket, {
      transaction,
    });

    if (bodyHasProp("freeMarketParts")) {
      const { freeMarketParts } = bodyData;

      const kitPartsCreattedPromises = freeMarketParts.map(async (item) => {
        const freeMarketPartsCreatted = {
          ...item,
          freeMarketId: freeMarketCreated.id,
        };

        const freeMarketPartCreated = await FreeMarketParts.create(
          freeMarketPartsCreatted,
          { transaction }
        );

        const product = await Product.findByPk(item.productId, {
          transaction,
        });

        if (product.serial) {
          const { serialNumberArray } = item;

          if (serialNumberArray.length !== parseInt(item.amount, 10)) {
            errors = true;
            field.serialNumbers = true;
            message.serialNumbers =
              "quantidade adicionada nãop condiz com a quantidade de números de série.";
          }

          if (serialNumberArray.length > 0) {
            await serialNumberArray.map(async (serialNumber) => {
              const equip = await Equip.findOne({
                where: {
                  serialNumber,
                  reserved: false,
                  productId: product.id,
                },
                transaction,
              });

              if (!equip) {
                errors = true;
                field.serialNumber = true;
                message.serialNumber = `este equipamento não esta cadastrado nessa base de estoque/ ${serialNumber} ja esta reservado`;
                throw new FieldValidationError([{ field, message }]);
              }
            });
            await serialNumberArray.map(async (serialNumber) => {
              const equip = await Equip.findOne({
                where: {
                  serialNumber,
                  reserved: false,
                  productId: product.id,
                },
                transaction,
              });
              await equip.update(
                {
                  ...equip,
                  freeMarketPartId: freeMarketPartCreated.id,
                  reserved: true,
                },
                { transaction }
              );
              await equip.destroy({ transaction });
            });
          }
        }

        const productUpdate = {
          ...product,
          available: (
            parseInt(product.available, 10) - parseInt(item.amount, 10)
          ).toString(),
          amount: (
            parseInt(product.amount, 10) - parseInt(item.amount, 10)
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

        // if (parseInt(productBaseUpdate.available, 10) < parseInt(productBase.product.minimumStock, 10)) {
        //   const messageNotification = `${productBase.product.name} está abaixo da quantidade mínima disponível no estoque, que é de ${productBase.product.minimumStock} unidades`

        //   await Notification.create({ message: messageNotification }, { transaction })
        // }

        await product.update(productUpdate, { transaction });
      });
      await Promise.all(kitPartsCreattedPromises);
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const response = await FreeMarket.findByPk(freeMarketCreated.id, {
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

    const freeMarketCount = await FreeMarket.findAndCountAll({
      where: getWhere("freeMarket"),
      limit: 1,
      offset: 0,
      transaction,
    });

    const freeMarket = await FreeMarket.findAndCountAll({
      where: getWhere("freeMarket"),
      include: [
        // {
        //   model: Technician,
        //   where: getWhere('technician'),
        // },
        {
          model: Product,
        },
      ],
      order: [[newOrder.field, newOrder.direction]],
      limit,
      offset,
      transaction,
    });

    const { rows } = freeMarket;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: freeMarketCount.count,
        rows: [],
      };
    }

    const formatProduct = R.map(async (item) => {
      console.log(JSON.parse(JSON.stringify(item)));
      const resp = {
        name: item.name,
        id: item.freeMarketParts.id,
        amount: item.freeMarketParts.amount,
      };

      if (item.serial) {
        const equips = await Equip.findAll({
          where: { freeMarketPartId: item.freeMarketParts.id },
          paranoid: false,
          transaction,
        });

        resp.serialNumbers = equips.map((equip) => equip.serialNumber);
      }

      return resp;
    });

    const formatDateFunct = (date) => {
      moment.locale("pt-br");
      const formatDate = moment(date).format("L");
      const formatHours = moment(date).format("LT");
      const dateformated = `${formatDate} ${formatHours}`;
      return dateformated;
    };

    const formatData = R.map(async (item) => {
      const resp = {
        id: item.id,
        trackingCode: item.trackingCode,
        name: item.name,
        products: await Promise.all(formatProduct(item.products)),
        createdAt: formatDateFunct(item.createdAt),
      };
      return resp;
    });

    const freeMarketList = await Promise.all(formatData(rows));

    let show = limit;
    if (freeMarketCount.count < show) {
      show = freeMarketCount.count;
    }

    const response = {
      page: pageResponse,
      show,
      count: freeMarketCount.count,
      rows: freeMarketList,
    };

    return response;
  }
};
