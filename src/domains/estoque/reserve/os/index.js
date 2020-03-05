const R = require("ramda");
const moment = require("moment");
const Sequelize = require("sequelize");
// const axios = require('axios')
const Cnpj = require("@fnando/cnpj/es");
const Cpf = require("@fnando/cpf/es");

const formatQuery = require("../../../../helpers/lazyLoad");
const database = require("../../../../database");
const { FieldValidationError } = require("../../../../helpers/errors");
const ConsertoDomain = require("../../conserto");

const Os = database.model("os");
const OsParts = database.model("osParts");
const Product = database.model("product");
const ProductBase = database.model("productBase");
const StockBase = database.model("stockBase");
const Technician = database.model("technician");
const Equip = database.model("equip");
const KitOut = database.model("kitOut");
const KitParts = database.model("kitParts");
// const Notification = database.model('notification')
const StatusExpedition = database.model("statusExpedition");
const Conserto = database.model("conserto");

const { Op: operators } = Sequelize;

const consertoDomain = new ConsertoDomain();

module.exports = class OsDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options;

    const reserve = R.omit(["id", "osParts"], bodyData);

    const reserveNotHasProp = prop => R.not(R.has(prop, reserve));
    const bodyHasProp = prop => R.has(prop, bodyData);
    const HasProp = (prop, obj) => R.has(prop, obj);

    const field = {
      // Os: false,
      razaoSocial: false,
      data: false,
      cnpj: false,
      date: false,
      osParts: false,
      technician: false
    };
    const message = {
      // Os: '',
      razaoSocial: "",
      data: "",
      cnpj: "",
      date: "",
      osParts: "",
      technician: ""
    };

    let errors = false;

    // if (reserveNotHasProp('os') || !reserve.os) {
    //   errors = true
    //   field.Os = true
    //   message.Os = 'Por favor o numero da OS.'
    // } else if (/\D/ig.test(reserve.os)) {
    //   errors = true
    //   field.Os = true
    //   message.Os = 'OS deve cnter apenas números.'
    // }

    if (reserveNotHasProp("razaoSocial") || !reserve.razaoSocial) {
      errors = true;
      field.razaoSocial = true;
      message.razaoSocial = "Por favor a razão social.";
    }

    if (reserveNotHasProp("cnpj") || !reserve.cnpj) {
      errors = true;
      field.cnpj = true;
      message.cnpj = "Por favor informar o cnpj.";
    } else {
      const cnpj = reserve.cnpj.replace(/\D/g, "");

      if (!Cnpj.isValid(cnpj) && !Cpf.isValid(cnpj)) {
        errors = true;
        field.cnpj = true;
        message.cnpj = "O cnpj informado não é válido.";
      }
    }
    if (reserveNotHasProp("date") || !reserve.date) {
      errors = true;
      field.data = true;
      message.data = "Por favor a data de atendimento.";
    }

    if (!bodyHasProp("osParts") || !bodyData.osParts) {
      errors = true;
      field.osParts = true;
      message.osParts = "Deve haver ao menos um peça associada.";
    }

    if (reserveNotHasProp("technicianId") || !reserve.technicianId) {
      errors = true;
      field.technician = true;
      message.technician = "Por favor o ID do tecnico";
    } else {
      const { technicianId } = bodyData;
      const technicianExist = await Technician.findByPk(technicianId, {
        transaction
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

    const reserveHasExist = await Os.findOne({
      where: {
        date: {
          [operators.gte]: moment(reserve.date)
            .startOf("day")
            .toString(),
          [operators.lte]: moment(reserve.date)
            .endOf("day")
            .toString()
        },
        razaoSocial: reserve.razaoSocial,
        cnpj: reserve.cnpj.replace(/\D/g, "")
      },
      transaction
    });

    if (reserveHasExist && process.env.NODE_ENV !== "test") {
      field.message = true;
      message.message = "Há uma reserva nesta data para esta empresa";
      throw new FieldValidationError([{ field, message }]);
    }

    const reserveAll = await Os.findAll({ paranoid: false, transaction });

    reserve.os = (reserveAll.length + 1).toString();
    reserve.cnpj = reserve.cnpj.replace(/\D/g, "");

    const reserveCreated = await Os.create(reserve, { transaction });

    // await reserveCreated.update({
    // ...reserveCreated,
    //  os: reserveCreated.id.toString() }, {
    //  transaction })

    if (bodyHasProp("osParts")) {
      const { osParts } = bodyData;

      const osPartsCreattedPromises = osParts.map(async item => {
        if (!HasProp("status", item) || !item.status) {
          field.status = true;
          message.status = "status cannot null";
          throw new FieldValidationError([{ field, message }]);
        }

        const status = await StatusExpedition.findOne({
          where: { status: item.status },
          transaction
        });

        if (!status) {
          field.status = true;
          message.status = "status inválid";
          throw new FieldValidationError([{ field, message }]);
        }

        if (item.status === "CONSERTO") {
          const conserto = await consertoDomain.add(item, { transaction });

          const osPartsCreatted = {
            amount: "1",
            consertoId: conserto.id,
            statusExpeditionId: status.id,
            oId: reserveCreated.id
          };

          const osPartCreated = await OsParts.create(osPartsCreatted, {
            transaction
          });

          // throw new FieldValidationError([{ field, message }]);
        } else {
          const productBase = await ProductBase.findByPk(item.productBaseId, {
            include: [
              {
                model: Product
              }
            ],
            transaction
          });

          const osPartsCreatted = {
            ...item,
            statusExpeditionId: status.id,
            oId: reserveCreated.id
          };

          if (!productBase) {
            errors = true;
            field.peca = true;
            message.peca = "produto não oconst a na base de dados";
          }

          if (errors) {
            throw new FieldValidationError([{ field, message }]);
          }

          const osPartCreated = await OsParts.create(osPartsCreatted, {
            transaction
          });

          if (productBase.product.serial) {
            const { serialNumberArray } = item;

            if (serialNumberArray.length !== parseInt(item.amount, 10)) {
              errors = true;
              field.serialNumbers = true;
              message.serialNumbers =
                "quantidade adicionada nãop condiz com a quantidade de números de série.";
            }

            if (serialNumberArray.length > 0) {
              await serialNumberArray.map(async serialNumber => {
                const equip = await Equip.findOne({
                  where: {
                    serialNumber,
                    reserved: false,
                    productBaseId: productBase.id
                  },
                  transaction
                });

                if (!equip) {
                  errors = true;
                  field.serialNumber = true;
                  message.serialNumber = `este equipamento não esta cadastrado nessa base de estoque/ ${serialNumber} ja esta reservado`;
                  throw new FieldValidationError([{ field, message }]);
                }
              });
              await serialNumberArray.map(async serialNumber => {
                const equip = await Equip.findOne({
                  where: {
                    serialNumber,
                    reserved: false,
                    productBaseId: productBase.id
                  },
                  transaction
                });

                await equip.update(
                  {
                    ...equip,
                    osPartId: osPartCreated.id,
                    reserved: true
                  },
                  { transaction }
                );

                // const equip1 = await Equip.findOne({
                //   where: {
                //     serialNumber,
                //     reserved: false,
                //     productBaseId: productBase.id,
                //   },
                //   transaction,
                // })
              });
            }
          }

          const productBaseUpdate = {
            ...productBase,
            available: (
              parseInt(productBase.available, 10) - parseInt(item.amount, 10)
            ).toString(),
            reserved: (
              parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)
            ).toString()
          };

          if (
            parseInt(productBaseUpdate.available, 10) < 0 ||
            parseInt(productBaseUpdate.available, 10) < 0
          ) {
            field.productBaseUpdate = true;
            message.productBaseUpdate = "Número negativo não é valido";
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

          await productBase.update(productBaseUpdate, { transaction });
        }
      });
      await Promise.all(osPartsCreattedPromises);
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    // const teste = await Os.findByPk(reserveCreated.id, {
    //   include: [
    //     {
    //       model: ProductBase,
    //       // include: [{
    //       //   model: Product,
    //       // }],
    //     },
    //     {
    //       model: Technician,
    //     },
    //   ],
    //   transaction,
    // })

    const response = await Os.findByPk(reserveCreated.id, {
      include: [
        {
          model: ProductBase
          // include: [{
          //   model: Product,
          // }],
        },
        {
          model: Technician
        }
      ],
      transaction
    });

    return response;
  }

  async delete(osId, options = {}) {
    const { transaction = null } = options;

    const field = {
      os: false
    };
    const message = {
      os: ""
    };

    const os = await Os.findByPk(osId, { transaction });

    if (os) {
      const osParts = await OsParts.findAll({
        where: { oId: osId },
        transaction
      });

      const osPartsPromise = osParts.map(async item => {
        const productBase = await ProductBase.findByPk(item.productBaseId, {
          include: [Product],
          transaction
        });

        const equips = await Equip.findAll({
          where: { osPartId: item.id },
          transaction
        });

        const equipUpdatePromise = equips.map(async equip => {
          await equip.update(
            {
              ...equip,
              reserved: false
            },
            { transaction }
          );
        });

        await Promise.all(equipUpdatePromise);

        const productBaseUpdate = {
          ...productBase,
          available: (
            parseInt(productBase.available, 10) + parseInt(item.amount, 10)
          ).toString(),
          reserved: (
            parseInt(productBase.reserved, 10) - parseInt(item.amount, 10)
          ).toString()
        };

        if (
          parseInt(productBaseUpdate.available, 10) < 0 ||
          parseInt(productBaseUpdate.available, 10) < 0
        ) {
          field.productBaseUpdate = true;
          message.productBaseUpdate = "Número negativo não é valido";
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

        await productBase.update(productBaseUpdate, { transaction });

        await item.destroy({ transaction });
      });

      await Promise.all(osPartsPromise);

      await os.destroy({ transaction });
    } else {
      field.os = true;
      message.os = "Os não encontrada";

      throw new FieldValidationError([{ field, message }]);
    }

    const osDeleted = await Os.findByPk(osId, { transaction });

    if (!osDeleted) {
      return "sucesso";
    }
    return "erro";
  }

  async update(bodyData, options = {}) {
    const { transaction = null } = options;

    const reserve = R.omit(["id"], bodyData);
    const oldReserve = await Os.findByPk(bodyData.id, { transaction });

    const reserveOs = { ...oldReserve };

    const HasProp = (prop, obj) => R.has(prop, obj);
    const reserveHasProp = prop => R.has(prop, reserve);

    const field = {
      date: false
    };
    const message = {
      date: ""
    };

    let errors = false;

    if (reserveHasProp("date")) {
      if (!reserve.date) {
        errors = true;
        field.date = true;
        message.date = "date não pode ser nula.";
      } else {
        reserveOs.date = reserve.date;
      }
    }

    const reserveHasExist = await Os.findOne({
      where: {
        date: {
          [operators.gte]: moment(reserve.date)
            .startOf("day")
            .toString(),
          [operators.lte]: moment(reserve.date)
            .endOf("day")
            .toString()
        },
        razaoSocial: oldReserve.razaoSocial,
        cnpj: oldReserve.cnpj.replace(/\D/g, "")
      },
      transaction
    });

    if (
      reserveHasExist &&
      reserveHasExist.id !== bodyData.id &&
      process.env.NODE_ENV !== "test"
    ) {
      field.message = true;
      message.message = "Há uma reserva nesta data para esta empresa";
      throw new FieldValidationError([{ field, message }]);
    }

    if (reserveHasProp("technicianId")) {
      const technician = await Technician.findByPk(reserve.technicianId, {
        transaction
      });
      if (!technician) {
        errors = true;
        field.technicianId = true;
        message.technicianId = "Técnico não foi encontrado.";
      } else reserveOs.technicianId = reserve.technicianId;
    }

    if (reserveHasProp("osParts")) {
      const { osParts } = reserve;

      let osPartsAll = await OsParts.findAll({
        where: { oId: bodyData.id },
        attributes: ["id", "productBaseId"],
        transaction
      });

      const osPartsUpdatePromises = osParts.map(async item => {
        if (R.prop("id", item)) {
          const osPartsReturn = await OsParts.findByPk(item.id, {
            transaction
          });

          // eslint-disable-next-line consistent-return
          osPartsAll = await osPartsAll.filter(itemOld => {
            if (itemOld.id !== item.id) {
              return itemOld.id;
            }
            return null;
          });

          const productBase = await ProductBase.findByPk(
            osPartsReturn.productBaseId,
            { include: [Product], transaction }
          );

          if (productBase) {
            const productBaseUpdate = {
              ...productBase,
              available: (
                parseInt(productBase.available, 10) +
                parseInt(osPartsReturn.amount, 10) -
                parseInt(item.amount, 10)
              ).toString(),
              reserved: (
                parseInt(productBase.reserved, 10) -
                parseInt(osPartsReturn.amount, 10) +
                parseInt(item.amount, 10)
              ).toString()
            };

            if (
              parseInt(productBaseUpdate.available, 10) < 0 ||
              parseInt(productBaseUpdate.available, 10) < 0
            ) {
              field.productBaseUpdate = true;
              message.productBaseUpdate = "Número negativo não é valido";
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

            const osPartsUpdate = {
              ...osPartsReturn,
              amount: item.amount
            };

            await osPartsReturn.update(osPartsUpdate, { transaction });
            await productBase.update(productBaseUpdate, { transaction });
          }
        } else {
          if (!HasProp("status", item) || !item.status) {
            field.status = true;
            message.status = "status cannot null";
            throw new FieldValidationError([{ field, message }]);
          }

          const status = await StatusExpedition.findOne({
            where: { status: item.status },
            transaction
          });

          if (!status) {
            field.status = true;
            message.status = "status inválid";
            throw new FieldValidationError([{ field, message }]);
          }

          if (item.status === "CONSERTO") {
            const conserto = await consertoDomain.add(item, { transaction });

            const osPartsCreatted = {
              amount: "1",
              consertoId: conserto.id,
              statusExpeditionId: status.id,
              oId: bodyData.id
            };

            await OsParts.create(osPartsCreatted, {
              transaction
            });
          } else {
            const osPartsCreatted = {
              ...item,
              statusExpeditionId: status.id,
              oId: bodyData.id
            };

            const osPartCreated = await OsParts.create(osPartsCreatted, {
              transaction
            });

            const productBase = await ProductBase.findByPk(item.productBaseId, {
              include: [
                {
                  model: Product,
                  attributes: ["serial"]
                }
              ],
              transaction
            });

            if (!productBase) {
              field.peca = true;
              message.peca = "produto não oconst a na base de dados";
              throw new FieldValidationError([{ field, message }]);
            }

            if (productBase.product.serial) {
              const { serialNumberArray } = item;

              if (serialNumberArray.length !== parseInt(item.amount, 10)) {
                errors = true;
                field.serialNumbers = true;
                message.serialNumbers =
                  "quantidade adicionada nãop condiz com a quantidade de números de série.";
              }

              if (serialNumberArray.length > 0) {
                await serialNumberArray.map(async serialNumber => {
                  const equip = await Equip.findOne({
                    where: {
                      serialNumber,
                      reserved: false,
                      productBaseId: productBase.id
                    },
                    transaction
                  });

                  if (!equip) {
                    errors = true;
                    field.serialNumber = true;
                    message.serialNumber = `este equipamento não esta cadastrado nessa base de estoque/ ${serialNumber} ja esta reservado`;
                    throw new FieldValidationError([{ field, message }]);
                  }
                });

                await serialNumberArray.map(async serialNumber => {
                  const equip = await Equip.findOne({
                    where: {
                      serialNumber,
                      reserved: false,
                      productBaseId: productBase.id
                    },
                    transaction
                  });

                  await equip.update(
                    {
                      ...equip,
                      osPartId: osPartCreated.id,
                      reserved: true
                    },
                    { transaction }
                  );
                });
              }
            }

            const productBaseUpdate = {
              ...productBase,
              available: (
                parseInt(productBase.available, 10) - parseInt(item.amount, 10)
              ).toString(),
              reserved: (
                parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)
              ).toString()
            };

            if (
              parseInt(productBaseUpdate.available, 10) < 0 ||
              parseInt(productBaseUpdate.available, 10) < 0
            ) {
              field.productBaseUpdate = true;
              message.productBaseUpdate = "Número negativo não é valido";
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

            await productBase.update(productBaseUpdate, { transaction });
          }
        }
      });
      await Promise.all(osPartsUpdatePromises);

      if (osPartsAll.length > 0) {
        const osPartsdeletePromises = osPartsAll.map(async item => {
          const osPartDelete = await OsParts.findByPk(item.id, { transaction });

          const equips = await Equip.findAll({
            where: { osPartId: item.id },
            transaction
          });

          const equipUpdatePromise = equips.map(async equip => {
            await equip.update(
              {
                ...equip,
                reserved: false,
                osPartId: null
              },
              { transaction }
            );
          });

          await Promise.all(equipUpdatePromise);

          const productBase = await ProductBase.findByPk(item.productBaseId, {
            transaction
          });

          if (productBase) {
            const productBaseUpdate = {
              ...productBase,
              available: (
                parseInt(productBase.available, 10) +
                parseInt(osPartDelete.amount, 10)
              ).toString(),
              reserved: (
                parseInt(productBase.reserved, 10) -
                parseInt(osPartDelete.amount, 10)
              ).toString()
            };

            if (
              parseInt(productBaseUpdate.available, 10) < 0 ||
              parseInt(productBaseUpdate.available, 10) < 0
            ) {
              field.productBaseUpdate = true;
              message.productBaseUpdate = "Número negativo não é valido";
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

            await productBase.update(productBaseUpdate, { transaction });
          }

          osPartDelete.destroy({ transaction });
        });

        await Promise.all(osPartsdeletePromises);
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    await oldReserve.update(reserveOs, { transaction });

    const response = await Os.findByPk(oldReserve.id, { transaction });

    return response;
  }

  async getAll(options = {}) {
    const inicialOrder = {
      field: "createdAt",
      acendent: true,
      direction: "DESC"
    };
    const { query = null, transaction = null } = options;

    const newQuery = Object.assign({}, query);
    const newOrder = query && query.order ? query.order : inicialOrder;

    if (newOrder.acendent) {
      newOrder.direction = "DESC";
    } else {
      newOrder.direction = "ASC";
    }

    const required =
      R.prop("required", query) === undefined
        ? true
        : R.prop("required", query);
    const paranoid =
      R.prop("paranoid", query) === undefined
        ? false
        : R.prop("paranoid", query);

    const { getWhere, limit, offset, pageResponse } = formatQuery(newQuery);

    const { count } = await Os.findAndCountAll({
      where: getWhere("os"),
      include: [
        {
          model: Technician,
          where: getWhere("technician")
        }
      ],
      limit: 0,
      paranoid,
      transaction
    });

    const os = await Os.findAndCountAll({
      where: getWhere("os"),
      include: [
        {
          model: Technician,
          where: getWhere("technician")
        },
        {
          model: ProductBase,
          include: [
            {
              model: Product
            }
          ],
          through: {
            paranoid
          }
        },
        {
          model: Conserto,
          include: [
            {
              model: Product
            }
          ],
          paranoid,
          through: {
            paranoid
          }
          // required: !getWhere("osParts")
        }
      ],
      order: [[newOrder.field, newOrder.direction]],
      limit,
      offset,
      paranoid,
      transaction
    });

    const { rows } = os;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: os.count,
        rows: []
      };
    }

    const formatDateFunct = date => {
      moment.locale("pt-br");
      const formatDate = moment(date).format("L");
      const formatHours = moment(date).format("LT");
      const dateformated = `${formatDate} ${formatHours}`;
      return dateformated;
    };

    // const formatProductDelete = R.map(item => {
    //   const resp = {
    //     name: item.productBase
    //       ? item.productBase.product.name
    //       : item.conserto.product.name,
    //     osPartsId: item.id,
    //     amount: item.amount,
    //     output: item.output,
    //     missOut: item.missOut,
    //     return: item.return,
    //     status: item.statusExpedition.status,
    //     quantMax:
    //       parseInt(item.amount, 10) -
    //       parseInt(item.return, 10) -
    //       parseInt(item.output, 10) -
    //       parseInt(item.missOut, 10)
    //   };
    //   return resp;
    // });

    const formatKitOut = R.map(item => {
      const resp = {
        name: `#${item.kitPart.productBase.product.name}`,
        amount: "-",
        output: item.amount,
        missOut: "-",
        return: "-"
      };
      return resp;
    });

    const findKitOuts = async os => {
      const kitOuts = await KitOut.findAll({
        where: { os },
        include: [
          {
            model: KitParts,
            include: [
              {
                model: ProductBase,
                include: [
                  {
                    model: Product
                  }
                ]
              }
            ]
          }
        ],
        transaction
      });

      return formatKitOut(kitOuts);
    };

    let notDelet = {};

    const formatProduct = (productBases, index) => {
      return R.map(async item => {
        const { osParts } = item;
        const { amount, output, missOut } = osParts;
        const status = await StatusExpedition.findByPk(
          osParts.statusExpeditionId,
          {
            attributes: ["status"],
            transaction
          }
        );
        notDelet[index] =
          output !== "0" ||
          missOut !== "0" ||
          osParts.return !== "0" ||
          !!notDelet[index];
        let equips = [];

        const serial = item.product.serial;

        if (serial) {
          equips = await Equip.findAll({
            attributes: ["serialNumber"],
            where: { osPartId: osParts.id },
            transaction
          });
          notDelet[index] = parseInt(amount, 10) !== equips.length;
        }

        const quantMax =
          parseInt(amount, 10) -
          parseInt(osParts.return, 10) -
          parseInt(output, 10) -
          parseInt(missOut, 10);

        const resp = {
          serialNumbers: equips,
          name: item.product.name,
          serial: item.product.serial,
          id: osParts.id,
          amount,
          output,
          missOut,
          return: osParts.return,
          quantMax,
          status: status && status.status
        };

        return resp;
      }, productBases);
    };

    const formatConserto = (conserto, index) => {
      return R.map(async item => {
        const { osParts, serialNumber } = item;
        const { amount, output, missOut } = osParts;
        const status = await StatusExpedition.findByPk(
          osParts.statusExpeditionId,
          {
            attributes: ["status"],
            transaction
          }
        );

        notDelet[index] =
          output !== "0" ||
          missOut !== "0" ||
          osParts.return !== "0" ||
          notDelet[index];

        const resp = {
          serialNumbers: [{ serialNumber }],
          name: item.product.name,
          serial: item.product.serial,
          id: osParts.id,
          amount,
          output,
          missOut,
          return: osParts.return,
          quantMax: 1,
          status: status && status.status
        };

        return resp;
      }, conserto);
    };

    const mapIndexed = R.addIndex(R.map);

    const formatData = mapIndexed(async (item, index) => {
      const resp = {
        id: item.id,
        razaoSocial: item.razaoSocial,
        cnpj: item.cnpj,
        date: item.date,
        formatedDate: moment(item.date).format("L"),
        technician: item.technician.name,
        technicianId: item.technicianId,
        os: item.os,
        createdAt: formatDateFunct(item.createdAt),
        products: [
          ...(await Promise.all(formatProduct(item.productBases, index))),
          ...(await Promise.all(formatConserto(item.consertos, index))),
          ...(await findKitOuts(item.os))
        ],
        notDelet:
          (item.productBases &&
            item.productBases.filter(
              productBase => productBase.osParts.deletedAt !== null
            ).length !== 0) ||
          (item.consertos &&
            item.consertos.filter(
              conserto => conserto.osParts.deletedAt !== null
            ).length !== 0) ||
          notDelet[index]
      };

      return resp;
    });

    const osList = await Promise.all(formatData(rows));

    let show = limit;
    if (count < show) {
      show = count;
    }

    const response = {
      page: pageResponse,
      show,
      count,
      rows: osList
    };

    return response;
  }

  async getOsByOs(os, options = {}) {
    const { transaction = null } = options;

    const formatDateFunct = date => {
      moment.locale("pt-br");
      const formatDate = moment(date);
      return formatDate;
    };

    const osReturn = await Os.findOne({
      where: { os },
      include: [
        {
          model: Technician
        },
        {
          model: ProductBase,
          include: [
            {
              model: Product
            },
            {
              model: StockBase
            }
          ]
        }
      ],
      transaction
    });

    if (!osReturn) {
      return {
        razaoSocial: "",
        cnpj: "",
        // data: formatDateFunct(new Date()),
        technician: "",
        reserve: []
      };
    }

    const formatedReserve = R.map(item => {
      const resp = {
        stockBase: item.stockBase.stockBase,
        amount: item.osParts.amount,
        nomeProdutoCarrinho: item.product.name,
        productId: item.productId
      };
      return resp;
    });

    const response = {
      razaoSocial: osReturn.razaoSocial,
      cnpj: osReturn.cnpj,
      data: formatDateFunct(osReturn.date),
      technician: osReturn.technician.name,
      reserve: formatedReserve(osReturn.productBases)
    };

    return response;
  }

  async output(bodyData, options = {}) {
    const { transaction = null } = options;
    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData));
    // const bodyHasProp = prop => R.has(prop, bodyData)

    const field = {
      osPartsId: false,
      add: false
    };
    const message = {
      osPartsId: "",
      add: ""
    };

    let errors = false;

    if (bodyDataNotHasProp("osPartsId") || !bodyData.osPartsId) {
      errors = true;
      field.osPartsId = true;
      message.osPartsId = "Informe o id do produto.";
    } else {
      const osPart = await OsParts.findByPk(bodyData.osPartsId, {
        transaction
      });

      if (!osPart) {
        errors = true;
        field.osPartsId = true;
        message.osPartsId = "produto não foi encontrada.";
      }
    }

    if (bodyDataNotHasProp("add") || !bodyData.add) {
      errors = true;
      field.add = true;
      message.add = "Por favor a quantidade";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const osPart = await OsParts.findByPk(bodyData.osPartsId, { transaction });

    const { add } = bodyData;

    const key = R.keys(add)[0];

    const value = R.prop([key], add);

    const total =
      parseInt(osPart.amount, 10) -
      parseInt(osPart.output, 10) -
      parseInt(osPart.missOut, 10) -
      parseInt(osPart.return, 10);

    if (parseInt(value, 10) > total) {
      errors = true;
      field.add = true;
      message.add = "quantidade adicionada exede o limite";
      throw new FieldValidationError([{ field, message }]);
    }

    const productBase = await ProductBase.findByPk(osPart.productBaseId, {
      include: [
        {
          model: Product,
          attributes: ["serial"]
        }
      ],
      transaction
    });

    // throw new FieldValidationError([{ field, message }]);

    if (!!productBase) {
      let productBaseUpdate = {};

      if (productBase.product.serial) {
        const { serialNumberArray } = bodyData;

        if (serialNumberArray.length !== parseInt(value, 10)) {
          errors = true;
          field.serialNumbers = true;
          message.serialNumbers =
            "quantidade adicionada nãop condiz com a quantidade de números de série.";
        }

        if (serialNumberArray.length > 0) {
          await serialNumberArray.map(async serialNumber => {
            const equip = await Equip.findOne({
              where: {
                serialNumber,
                reserved: true,
                productBaseId: productBase.id
              },
              transaction
            });

            if (!equip) {
              errors = true;
              field.serialNumber = true;
              message.serialNumber =
                "este equipamento não esta cadastrado nessa base de estoque";
              throw new FieldValidationError([{ field, message }]);
            }
          });
          await serialNumberArray.map(async serialNumber => {
            const equip = await Equip.findOne({
              where: {
                serialNumber,
                reserved: true,
                productBaseId: productBase.id
              },
              transaction
            });

            if (key !== "output") {
              await equip.update(
                {
                  ...equip,
                  osPartId: null
                },
                { transaction }
              );
            }

            if (key !== "return") {
              await equip.destroy({ transaction });
            } else {
              await equip.update(
                {
                  ...equip,
                  reserved: false
                },
                { transaction }
              );
            }
          });
        }
      }

      if (key === "return") {
        productBaseUpdate = {
          ...productBase,
          available: (
            parseInt(productBase.available, 10) + parseInt(value, 10)
          ).toString(),
          reserved: (
            parseInt(productBase.reserved, 10) - parseInt(value, 10)
          ).toString()
        };
      } else {
        productBaseUpdate = {
          ...productBase,
          amount: (
            parseInt(productBase.amount, 10) - parseInt(value, 10)
          ).toString(),
          reserved: (
            parseInt(productBase.reserved, 10) - parseInt(value, 10)
          ).toString()
        };
      }

      if (
        parseInt(productBaseUpdate.available, 10) < 0 ||
        parseInt(productBaseUpdate.available, 10) < 0
      ) {
        field.productBaseUpdate = true;
        message.productBaseUpdate = "Número negativo não é valido";
        throw new FieldValidationError([{ field, message }]);
      }

      await productBase.update(productBaseUpdate, { transaction });
    } else {
      const conserto = await Conserto.findByPk(osPart.consertoId, {
        transaction
      });

      await conserto.destroy({ transaction });
    }

    const osPartUpdate = {
      ...osPart,
      [key]: (parseInt(value, 10) + parseInt(osPart[key], 10)).toString()
    };

    await osPart.update(osPartUpdate, { transaction });

    const osPartsUpdate = await OsParts.findByPk(bodyData.osPartsId, {
      transaction
    });

    if (total - parseInt(value, 10) === 0) {
      await osPartsUpdate.destroy({ transaction });
    }

    const os = await Os.findByPk(osPart.oId, {
      include: [
        {
          model: ProductBase
        },
        {
          model: Conserto
        }
      ],
      transaction
    });

    if (os.productBases.length === 0 && os.consertos.length === 0) {
      await os.destroy({ transaction });
    }

    const response = await OsParts.findByPk(bodyData.osPartsId, {
      transaction
    });

    return response;
  }
};
