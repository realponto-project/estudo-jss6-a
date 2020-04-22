const R = require("ramda");
const moment = require("moment");
const Sequelize = require("sequelize");
// const axios = require('axios')

const formatQuery = require("../../../../../helpers/lazyLoad");
const database = require("../../../../../database");

const { FieldValidationError } = require("../../../../../helpers/errors");

const KitOut = database.model("kitOut");
const Kit = database.model("kit");
const KitParts = database.model("kitParts");
const Product = database.model("product");
const Technician = database.model("technician");
const Os = database.model("os");
const Conserto = database.model("conserto");
const OsParts = database.model("osParts");

const { Op: operators } = Sequelize;

module.exports = class KitOutDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options;

    const bodyDataNotHasProp = (prop) => R.not(R.has(prop, bodyData));

    const field = {
      reposicao: false,
      expedicao: false,
      perda: false,
      os: false,
      kitPartId: false,
      message: false,
    };
    const message = {
      reposicao: "",
      expedicao: "",
      perda: "",
      action: "",
      amount: "",
      os: "",
      kitPartId: "",
      message: "",
    };

    let errors = false;

    if (
      bodyDataNotHasProp("reposicao") ||
      !bodyData.reposicao ||
      /\D/.test(bodyData.reposicao)
    ) {
      errors = true;
      field.reposicao = true;
      message.reposicao = "Ação inválida";
    }

    if (
      bodyDataNotHasProp("expedicao") ||
      !bodyData.expedicao ||
      /\D/.test(bodyData.expedicao)
    ) {
      errors = true;
      field.expedicao = true;
      message.expedicao = "Ação inválida";
    }

    if (
      bodyDataNotHasProp("perda") ||
      !bodyData.perda ||
      /\D/.test(bodyData.perda)
    ) {
      errors = true;
      field.perda = true;
      message.perda = "Ação inválida";
    }

    // if (bodyDataNotHasProp('amount')
    // || !bodyData.amount
    // || /\D/.test(bodyData.amount)
    // || parseInt(bodyData.amount, 10) < 1) {
    //   errors = true
    //   field.amount = true
    //   message.amount = 'não é numero'
    // }

    if (bodyDataNotHasProp("kitPartId") || !bodyData.kitPartId) {
      errors = true;
      field.kitPartId = true;
      message.kitPartId = "Por favor o ID do tecnico";
    } else {
      const { kitPartId } = bodyData;
      const kitPartExist = await KitParts.findByPk(kitPartId, { transaction });

      if (!kitPartExist) {
        errors = true;
        field.kitPartId = true;
        message.kitPartId = "Técnico não encomtrado";
      }
    }
    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const kitPartExist = await KitParts.findByPk(bodyData.kitPartId, {
      attributes: ["kitId"],
      include: [
        {
          model: Kit,
          attributes: ["technicianId"],
          include: [{ model: Technician, attributes: ["name"] }],
        },
      ],
      transaction,
    });

    const perdaNumber = parseInt(bodyData.perda, 10);
    const reposicaoNumber = parseInt(bodyData.reposicao, 10);
    const expedicaoNumber = parseInt(bodyData.expedicao, 10);

    if (perdaNumber === 0 && reposicaoNumber === 0 && expedicaoNumber === 0) {
      field.message = true;
      message.message = "Quantidade invalida";
      throw new FieldValidationError([{ field, message }]);
    }
    const { kitPartId } = bodyData;

    const kitPart = await KitParts.findByPk(kitPartId, { transaction });

    let productBase = await ProductBase.findByPk(kitPart.productBaseId, {
      transaction,
    });

    if (perdaNumber > 0) {
      const { perda } = bodyData;

      const kitOut = {
        action: "perda",
        amount: perda,
        kitPartId,
      };

      await KitOut.create(kitOut, { transaction });

      const productBaseUpdate = {
        ...productBase,
        available: productBase.available,
        amount: (
          parseInt(productBase.amount, 10) - parseInt(perda, 10)
        ).toString(),
        reserved: (
          parseInt(productBase.reserved, 10) - parseInt(perda, 10)
        ).toString(),
      };

      await productBase.update(productBaseUpdate, { transaction });

      productBase = await ProductBase.findByPk(kitPart.productBaseId, {
        transaction,
      });
    }

    if (reposicaoNumber > 0) {
      const { reposicao } = bodyData;

      const kitOut = {
        action: "reposicao",
        amount: reposicao,
        kitPartId,
      };

      await KitOut.create(kitOut, { transaction });

      const productBaseUpdate = {
        ...productBase,
        available: (
          parseInt(productBase.available, 10) - parseInt(reposicao, 10)
        ).toString(),
        reserved: (
          parseInt(productBase.reserved, 10) + parseInt(reposicao, 10)
        ).toString(),
      };

      await productBase.update(productBaseUpdate, { transaction });

      productBase = await ProductBase.findByPk(kitPart.productBaseId, {
        transaction,
      });
    }

    if (expedicaoNumber > 0) {
      const { expedicao } = bodyData;

      if (parseInt(expedicao, 10) > parseInt(kitPart.amount, 10)) {
        field.expedicao = true;
        message.expedicao =
          "expedição não pode ser maior que o valor da reserva";
        throw new FieldValidationError([{ field, message }]);
      }

      if (bodyDataNotHasProp("os") || !bodyData.os || /\D/.test(bodyData.os)) {
        field.os = true;
        message.os = "Ação inválida";
        throw new FieldValidationError([{ field, message }]);
      }

      const { os } = bodyData;

      const osExist = await Os.findOne({
        where: { os },
        include: [{ model: Technician, attributes: ["name"] }],
        // paranoid: false,
        transaction,
      });

      if (!osExist) {
        field.os = true;
        message.os = "OS inválida";
        throw new FieldValidationError([{ field, message }]);
      } else {
        if (osExist.deletedAt !== null) {
          field.os = true;
          message.os = "OS encerrada";
          throw new FieldValidationError([{ field, message }]);
        }

        if (kitPartExist.kit.technician.name !== osExist.technician.name) {
          field.os = true;
          message.os = `O tecnico que está relacionado com a OS ${osExist.os} é o/a ${osExist.technician.name}`;
          throw new FieldValidationError([{ field, message }]);
        }
      }

      const kitOutReturn = await KitOut.findOne({
        where: {
          os,
          kitPartId: bodyData.kitPartId,
        },
        transaction,
      });

      if (kitOutReturn) {
        const kitOutUpdate = {
          ...kitOutReturn,
          amount: (
            parseInt(kitOutReturn.amount, 10) + parseInt(expedicao, 10)
          ).toString(),
        };

        await kitOutReturn.update(kitOutUpdate, { transaction });
      } else {
        const kitOut = {
          action: "expedicao",
          amount: expedicao,
          kitPartId,
          os,
        };
        await KitOut.create(kitOut, { transaction });

        const productBaseUpdate = {
          ...productBase,
          amount: (
            parseInt(productBase.amount, 10) - parseInt(expedicao, 10)
          ).toString(),
          reserved: (
            parseInt(productBase.reserved, 10) - parseInt(expedicao, 10)
          ).toString(),
        };

        await productBase.update(productBaseUpdate, { transaction });

        productBase = await ProductBase.findByPk(kitPart.productBaseId, {
          transaction,
        });
      }
    }

    const amount =
      parseInt(kitPart.amount, 10) +
      reposicaoNumber -
      expedicaoNumber -
      perdaNumber;

    if (amount < 0) {
      field.amount = true;
      message.amount = "quantidade inválida";
      throw new FieldValidationError([{ field, message }]);
    }

    const kitPartUpdate = {
      ...kitPart,
      amount,
    };

    await kitPart.update(kitPartUpdate, { transaction });

    return "sucesso";

    // if (expedicaoNumber > 0 && !bodyDataNotHasProp('os') || !bodyData.os) {
    //   const { expedicao } = bodyData

    //   const kitOut = {
    //     action: 'expedicao',
    //     amount: expedicao,
    //     kitPartId,
    //   }

    //   await KitOut.create(kitOut, { transaction })
    // }

    // const kitOutCreated = await KitOut.create(kitOut, { transaction })

    // if (bodyHasProp('kitPartsOut')) {
    //   const { kitPartsOut } = bodyData

    //   const kitPartsOutCreattedPromises = kitPartsOut.map(async (item) => {
    //     const kitPartsOutCreatted = {
    //       ...item,
    //       kitOutId: kitOutCreated.id,
    //     }

    //     await KitPartsOut.create(kitPartsOutCreatted, { transaction })

    //     const stockBase = await StockBase.findOne({
    //       where: { stockBase: item.stockBase },
    //       transaction,
    //     })

    //     const productBase = await ProductBase.findOne({
    //       where: {
    //         productId: item.productId,
    //         stockBaseId: stockBase.id,
    //       },
    //     })

    // const productBaseUpdate = {
    //   ...productBase,
    //   available: (parseInt(productBase.available, 10) - parseInt(item.amount, 10)).toString(),
    //   reserved: (parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)).toString(),
    // }

    //     await productBase.update(productBaseUpdate, { transaction })
    //   })
    //   await Promise.all(kitPartsOutCreattedPromises)
    // }

    // const response = await KitOut.findByPk(kitOutCreated.id, {
    //   // include: [{
    //   //   model: Product,
    //   // }],
    //   transaction,
    // })

    // return response
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

    const { getWhere, limit, pageResponse } = formatQuery(newQuery);

    console.log(getWhere("product"));

    const kitOut = await KitOut.findAndCountAll({
      where: getWhere("kitOut"),
      include: [
        {
          model: KitParts,
          paranoid: false,
          required: true,
          include: [
            {
              model: ProductBase,
              include: [
                {
                  model: Product,
                  where: getWhere("product"),
                },
              ],
              required: true,
            },
            {
              model: Kit,
              paranoid: false,
              include: [
                {
                  model: Technician,
                  where: getWhere("technician"),
                },
              ],
              required: true,
            },
          ],
        },
      ],
      order: [["createdAt", "ASC"]],
      limit: 10,
      transaction,
    });

    const osConserto = await OsParts.findAndCountAll({
      where: { ...getWhere("osParts"), missOut: { [operators.ne]: "0" } },
      include: [
        {
          model: Os,
          where: getWhere("os"),
          paranoid: false,
          include: [
            {
              model: Technician,
              where: getWhere("technician"),
            },
          ],
        },
        {
          model: Conserto,
          include: [
            {
              model: Product,
              where: getWhere("product"),
            },
          ],
          required: true,
          paranoid: false,
        },
      ],
      order: [["createdAt", "ASC"]],
      limit: 10,
      paranoid: false,
      transaction,
    });

    // console.log(JSON.parse(JSON.stringify(osConserto)));

    const osProductBase = await OsParts.findAndCountAll({
      where: { ...getWhere("osParts"), missOut: { [operators.ne]: "0" } },
      include: [
        {
          model: Os,
          where: getWhere("os"),
          paranoid: false,
          include: [
            {
              model: Technician,
              where: getWhere("technician"),
            },
          ],
        },
        {
          model: ProductBase,
          include: [
            {
              model: Product,
              where: getWhere("product"),
            },
          ],
          required: true,
        },
      ],
      order: [["createdAt", "ASC"]],
      limit: 10,
      paranoid: false,
      transaction,
    });

    // console.log(JSON.parse(JSON.stringify(osProductBase)));

    if (
      kitOut.rows.length === 0 &&
      osConserto.rows.length === 0 &&
      osProductBase.rows.length === 0
    ) {
      return {
        rows: [],
      };
    }

    const formatDateFunct = (date) => {
      moment.locale("pt-br");
      const formatDate = moment(date).format("L");
      return formatDate;
    };

    const formatKitOut = R.map(async (item) => {
      const resp = {
        id: item.id,
        amount: item.amount,
        name: item.kitPart.productBase.product.name,
        technician: item.kitPart.kit.technician.name,
        createdAt: formatDateFunct(item.createdAt),
      };
      return resp;
    });

    const formatProductBase = R.map(async (item) => {
      const resp = {
        // id: item.id,
        os: item.o.os,
        amount: item.missOut,
        name: item.productBase.product.name,
        technician: item.o.technician.name,
        createdAt: formatDateFunct(item.createdAt),
      };
      return resp;
    });

    const formatConserto = R.map(async (item) => {
      const resp = {
        // id: item.id,
        os: item.o.os,
        amount: item.missOut,
        name: item.conserto.product.name,
        technician: item.o.technician.name,
        createdAt: formatDateFunct(item.createdAt),
      };
      return resp;
    });

    const kitOutList =
      kitOut.rows.length !== 0
        ? await Promise.all(formatKitOut(kitOut.rows))
        : [];

    const osConsertoList =
      osConserto.rows.length !== 0
        ? await Promise.all(formatConserto(osConserto.rows))
        : [];

    const osProductBaseList =
      osProductBase.rows.length !== 0
        ? await Promise.all(formatProductBase(osProductBase.rows))
        : [];

    const response = {
      rows: [...kitOutList, ...osConsertoList, ...osProductBaseList],
    };

    return response;
  }
};
