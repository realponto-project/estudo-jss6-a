/* eslint-disable max-len */
const R = require("ramda");
const moment = require("moment");
// const axios = require('axios')

// const Cnpj = require('@fnando/cnpj/dist/node')
// const Cpf = require('@fnando/cpf/dist/node')

const formatQuery = require("../../../../helpers/lazyLoad");
const database = require("../../../../database");

const { FieldValidationError } = require("../../../../helpers/errors");

const Equip = database.model("equip");
const Product = database.model("product");
// const Notification = database.model('notification')
const Technician = database.model("technician");
const TechnicianReserveParts = database.model("technicianReserveParts");
const TechnicianReserve = database.model("technicianReserve");

module.exports = class TechnicianReserveDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options;

    const technicianReserve = R.omit(
      ["id", "technicianReserveParts"],
      bodyData
    );

    const technicianReserveNotHasProp = (prop) =>
      R.not(R.has(prop, technicianReserve));
    const bodyHasProp = (prop) => R.has(prop, bodyData);

    const field = {
      razaoSocial: false,
      data: false,
      technicianReserveParts: false,
      technicianId: false,
    };
    const message = {
      razaoSocial: "",
      data: "",
      technicianReserveParts: "",
      technicianId: "",
    };

    let errors = false;

    if (
      technicianReserveNotHasProp("razaoSocial") ||
      !technicianReserve.razaoSocial
    ) {
      errors = true;
      field.razaoSocial = true;
      message.razaoSocial = "Digite o nome ou razão social.";
    }

    if (technicianReserveNotHasProp("date") || !technicianReserve.date) {
      errors = true;
      field.data = true;
      message.data = "Por favor a data de atendimento.";
    }

    if (
      !bodyHasProp("technicianReserveParts") ||
      !bodyData.technicianReserveParts
    ) {
      errors = true;
      field.technicianReserveParts = true;
      message.technicianReserveParts = "Deve haver ao menos um peça associada.";
    }

    if (
      technicianReserveNotHasProp("technicianId") ||
      !technicianReserve.technicianId
    ) {
      errors = true;
      field.technician = true;
      message.technician = "Por favor o ID do tecnico";
    } else {
      const { technicianId } = bodyData;
      const technicianExist = await Technician.findByPk(technicianId, {
        transaction,
      });

      if (!technicianExist) {
        errors = true;
        field.technician = true;
        message.technician = "Técnico não encomtrado";
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const technicianReserveCreated = await TechnicianReserve.create(
      technicianReserve,
      {
        transaction,
      }
    );
    console.log("teste");
    console.log(bodyData);

    if (bodyHasProp("technicianReserveParts")) {
      const { technicianReserveParts } = bodyData;

      const technicianReservePartsCreattedPromises = technicianReserveParts.map(
        async (item) => {
          const product = await Product.findByPk(item.productId, {
            transaction,
          });

          const technicianReservePartsCreatted = {
            ...item,
            technicianReserveId: technicianReserveCreated.id,
          };

          if (!product) {
            field.peca = true;
            message.peca = "produto foi encontrado";
            throw new FieldValidationError([{ field, message }]);
          }

          const technicianReservePartCreated = await TechnicianReserveParts.create(
            technicianReservePartsCreatted,
            {
              transaction,
            }
          );

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
                    technicianReservePartId: technicianReservePartCreated.id,
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

          // if (
          //   parseInt(productBaseUpdate.available, 10)
          //   < parseInt(productBase.product.minimumStock, 10)
          // ) {
          //   const messageNotification = `${productBase.product.name} está abaixo da quantidade mínima disponível no estoque, que é de ${productBase.product.minimumStock} unidades`

          //   await Notification.create(
          //     { message: messageNotification },
          //     { transaction },
          //   )
          // }

          await product.update(productUpdate, { transaction });
        }
      );
      await Promise.all(technicianReservePartsCreattedPromises);
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const response = await TechnicianReserve.findByPk(
      technicianReserveCreated.id,
      {
        include: [
          {
            model: Product,
          },
        ],
        transaction,
      }
    );

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

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery);

    const technicianReserve = await TechnicianReserve.findAndCountAll({
      where: getWhere("technicianReserve"),
      include: [
        {
          model: Technician,
          where: getWhere("technician"),
        },
        {
          model: Product,
        },
      ],
      order: [[inicialOrder.field, inicialOrder.direction]],
      limit,
      offset,
      transaction,
    });

    const { rows, count } = technicianReserve;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count,
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

    const formatProduct = (products) => {
      return R.map(async (item) => {
        console.log(JSON.parse(JSON.stringify(item)));
        const { technicianReserveParts } = item;
        const { amount, output, missOut } = technicianReserveParts;

        // let equips = [];

        // const serial = item.product.serial;

        // if (serial) {
        //   equips = await Equip.findAll({
        //     attributes: ["serialNumber"],
        //     where: { osPartId: osParts.id },
        //     transaction
        //   });
        //   notDelet[index] = parseInt(amount, 10) !== equips.length;
        // }

        const quantMax =
          parseInt(amount, 10) -
          parseInt(technicianReserveParts.return, 10) -
          parseInt(output, 10) -
          parseInt(missOut, 10);

        const resp = {
          // serialNumbers: equips,
          name: item.name,
          serial: item.serial,
          amount,
          output,
          missOut,
          return: technicianReserveParts.return,
          quantMax,
        };

        return resp;
      }, products);
    };

    const formatData = R.map(async (item) => {
      const resp = {
        id: item.id,
        razaoSocial: item.razaoSocial,
        cnpj: item.cnpj,
        date: item.date,
        formatedDate: moment(item.date).format("L"),
        technician: item.technician.name,
        technicianId: item.technicianId,
        createdAt: formatDateFunct(item.createdAt),
        products: [...(await Promise.all(formatProduct(item.products)))],
      };

      return resp;
    });

    const technicianReserveList = await Promise.all(formatData(rows));

    const response = {
      page: pageResponse,
      show: R.min(count, limit),
      count,
      rows: technicianReserveList,
    };

    return response;
  }
};
