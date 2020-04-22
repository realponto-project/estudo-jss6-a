const R = require("ramda");
const moment = require("moment");
const Sequelize = require("sequelize");

const { Op: operators } = Sequelize;

const formatQuery = require("../../../helpers/lazyLoad");
const database = require("../../../database");

const { FieldValidationError } = require("../../../helpers/errors");

// const Mark = database.model('mark')
const Company = database.model("company");
const Entrance = database.model("entrance");
const Product = database.model("product");
const User = database.model("user");
const Mark = database.model("mark");
// const Part = database.model('part')
// const EquipModel = database.model('equipModel')
const Equip = database.model("equip");

module.exports = class EntranceDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options;

    const entrance = R.omit(["id"], bodyData);

    const entranceNotHasProp = (prop) => R.not(R.has(prop, entrance));
    // const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))

    const field = {
      amountAdded: false,
      productId: false,
      companyId: false,
      message: false,
      responsibleUser: false,
      analysis: false,
    };
    const message = {
      amountAdded: "",
      productId: "",
      companyId: "",
      message: "",
      responsibleUser: "",
      analysis: "",
    };

    let errors = false;

    if (entranceNotHasProp("analysis") || !entrance.analysis) {
      errors = true;
      field.analysis = true;
      message.analysis = "analysis cannot undefined";
    } else if (/\D/gi.test(entrance.analysis)) {
      errors = true;
      field.analysis = true;
      message.analysis = "Não é permitido letras.";
    }

    if (entranceNotHasProp("amountAdded") || !entrance.amountAdded) {
      errors = true;
      field.amountAdded = true;
      message.amountAdded = "Por favor informar a quantidade adicionada.";
    } else if (/\D/gi.test(entrance.amountAdded)) {
      errors = true;
      field.amountAdded = true;
      message.amountAdded = "Não é permitido letras.";
    }

    if (entranceNotHasProp("responsibleUser")) {
      errors = true;
      field.responsibleUser = true;
      message.responsibleUser = "username não está sendo passado.";
    } else if (bodyData.responsibleUser) {
      const { responsibleUser } = bodyData;

      const user = await User.findOne({
        where: { username: responsibleUser },
        transaction,
      });

      if (!user) {
        errors = true;
        field.responsibleUser = true;
        message.responsibleUser = "username inválido.";
      }
    } else {
      errors = true;
      field.responsibleUser = true;
      message.responsibleUser = "username não pode ser nulo.";
    }

    if (entranceNotHasProp("productId") || !entrance.productId) {
      errors = true;
      field.productId = true;
      message.productId = "Por favor o produto.";
    }

    if (entranceNotHasProp("companyId") || !entrance.companyId) {
      errors = true;
      field.companyId = true;
      message.companyId = "Por favor informar o fornecedor.";
    } else {
      const fornecedor = await Company.findByPk(entrance.companyId, {
        where: { relation: "fornecedor" },
        transaction,
      });

      if (!fornecedor) {
        errors = true;
        field.companyId = true;
        message.companyId = "Fornecedor não encontrado";
      }
    }

    const product = await Product.findByPk(entrance.productId, {
      transaction,
    });

    if (!product) {
      errors = true;
      field.productId = true;
      message.productId = "Produto não encontrado";
    }

    if (product.serial && !entrance.analysis) {
      if (
        entranceNotHasProp("serialNumbers") ||
        entrance.serialNumbers.length === 0
      ) {
        errors = true;
        field.message = true;
        message.message = "Por favor ao menos um numero de série.";
        // eslint-disable-next-line eqeqeq
      } else if (entrance.serialNumbers.length != entrance.amountAdded) {
        errors = true;
        field.message = true;
        message.message =
          "Quantidade adicionada não condiz com a quantidade de números de série.";
      } else {
        const { serialNumbers } = entrance;

        // eslint-disable-next-line max-len
        const filterSerialNumber = serialNumbers.filter(
          (este, i) => serialNumbers.indexOf(este) === i
        );

        if (serialNumbers.length !== filterSerialNumber.length) {
          errors = true;
          field.message = true;
          message.message = "Há números de série repetido.";
        }
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const analysis = (
      parseInt(product.analysis, 10) + parseInt(entrance.analysis, 10)
    ).toString();

    // eslint-disable-next-line max-len
    const amount = (
      parseInt(product.amount, 10) + parseInt(entrance.amountAdded, 10)
    ).toString();
    // eslint-disable-next-line max-len
    const available = (
      parseInt(product.available, 10) + parseInt(entrance.amountAdded, 10)
    ).toString();

    await product.update({ analysis, amount, available }, { transaction });

    entrance.amountAdded = Math.max.apply(null, [
      entrance.analysis,
      entrance.amountAdded,
    ]);

    entrance.analysis = entrance.analysis !== "0";

    const entranceCreated = await Entrance.create(entrance, { transaction });

    if (product.serial && entrance.serialNumbers) {
      const { serialNumbers } = entrance;

      const serialNumbersFindPromises = serialNumbers.map(async (item) => {
        const serialNumberHasExist = await Equip.findOne({
          where: { serialNumber: item },
          attributes: [],
          paranoid: false,
          transaction,
        });

        if (serialNumberHasExist) {
          field.serialNumbers = true;
          message.serialNumbers = `${item} já está registrado`;
          throw new FieldValidationError([{ field, message }]);
        }
      });
      await Promise.all(serialNumbersFindPromises);

      const serialNumbersCreatePromises = serialNumbers.map(async (item) => {
        const equipCreate = {
          productId: product.id,
          serialNumber: item,
          entranceId: entranceCreated.id,
        };

        await Equip.create(equipCreate, { transaction });
      });
      await Promise.all(serialNumbersCreatePromises);
    }

    const response = await Entrance.findByPk(entranceCreated.id, {
      include: [
        {
          model: Company,
        },
        {
          model: Product,
        },
      ],
      transaction,
    });

    return response;
  }

  async update(bodyData, options = {}) {
    const { transaction = null } = options;

    const entrance = R.omit(["id"], bodyData);

    const oldEntrance = await Entrance.findByPk(bodyData.id, {
      include: [{ model: Product }],
      transaction,
    });

    const entranceNotHasProp = (prop) => R.not(R.has(prop, entrance));

    const field = {
      amountAdded: false,
      productId: false,
      companyId: false,
      message: false,
      responsibleUser: false,
    };
    const message = {
      amountAdded: "",
      productId: "",
      companyId: "",
      message: "",
      responsibleUser: "",
    };

    let errors = false;

    if (entranceNotHasProp("amountAdded") || !entrance.amountAdded) {
      errors = true;
      field.amountAdded = true;
      message.amountAdded = "Por favor informar a quantidade adicionada.";
    } else if (/\D/gi.test(entrance.amountAdded)) {
      errors = true;
      field.amountAdded = true;
      message.amountAdded = "Não é permitido letras.";
    }

    if (entranceNotHasProp("responsibleUser")) {
      errors = true;
      field.responsibleUser = true;
      message.responsibleUser = "username não está sendo passado.";
    } else if (bodyData.responsibleUser) {
      const { responsibleUser } = bodyData;

      const user = await User.findOne({
        where: { username: responsibleUser },
        transaction,
      });

      if (!user) {
        errors = true;
        field.responsibleUser = true;
        message.responsibleUser = "username inválido.";
      }
    } else {
      errors = true;
      field.responsibleUser = true;
      message.responsibleUser = "username não pode ser nulo.";
    }

    if (entranceNotHasProp("productId") || !entrance.productId) {
      errors = true;
      field.productId = true;
      message.productId = "Por favor o produto.";
    }

    if (entranceNotHasProp("companyId") || !entrance.companyId) {
      errors = true;
      field.companyId = true;
      message.companyId = "Por favor informar o fornecedor.";
    } else {
      const fornecedor = await Company.findByPk(entrance.companyId, {
        where: { relation: "fornecedor" },
        transaction,
      });

      if (!fornecedor) {
        errors = true;
        field.companyId = true;
        message.companyId = "Fornecedor não encontrado";
      }
    }

    const product = await Product.findByPk(entrance.productId, {
      transaction,
    });

    if (!product) {
      errors = true;
      field.productId = true;
      message.productId = "Produto não encontrado";
    }

    // if (product.serial) {
    //   if (
    //     entranceNotHasProp("serialNumbers") ||
    //     entrance.serialNumbers.length === 0
    //   ) {
    //     errors = true;
    //     field.message = true;
    //     message.message = "Por favor ao menos um numero de série.";
    //     // eslint-disable-next-line eqeqeq
    //   } else if (entrance.serialNumbers.length != entrance.amountAdded) {
    //     errors = true;
    //     field.message = true;
    //     message.message =
    //       "Quantidade adicionada não condiz com a quantidade de números de série.";
    //   } else {
    //     const { serialNumbers } = entrance;

    //     // eslint-disable-next-line max-len
    //     const filterSerialNumber = serialNumbers.filter(
    //       (este, i) => serialNumbers.indexOf(este) === i
    //     );

    //     if (serialNumbers.length !== filterSerialNumber.length) {
    //       errors = true;
    //       field.message = true;
    //       message.message = "Há números de série repetido.";
    //     }
    //   }
    // }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    if (oldEntrance.analysis) {
      const analysis = (
        parseInt(oldEntrance.product.analysis, 10) -
        parseInt(oldEntrance.amountAdded, 10)
      ).toString();
      await product.update({ analysis }, { transaction });
    } else {
      const amount = (
        parseInt(oldEntrance.product.amount, 10) -
        parseInt(oldEntrance.amountAdded, 10)
      ).toString();
      const available = (
        parseInt(oldEntrance.product.available, 10) -
        parseInt(oldEntrance.amountAdded, 10)
      ).toString();
      await product.update({ amount, available }, { transaction });
    }

    //   if (
    //     parseInt(oldProductBaseUpdate.amount, 10) < 0 ||
    //     parseInt(oldProductBaseUpdate.available, 10) < 0
    //   ) {
    //     field.oldProductBaseUpdate = true;
    //     message.oldProductBaseUpdate = "Número negativo não é valido";
    //     throw new FieldValidationError([{ field, message }]);
    //   }
    //   await oldProductBase.update(oldProductBaseUpdate, { transaction });
    // }

    if (!productBase) {
      await ProductBase.create(
        {
          productId: entrance.productId,
          amount: entrance.amountAdded,
          available: entrance.amountAdded,
          reserved: "0",
        },
        { transaction }
      );

      entrance.oldAmount = "0";
    } else {
      entrance.oldAmount = (
        parseInt(productBase.amount, 10) - parseInt(oldEntrance.amountAdded, 10)
      ).toString();

      // eslint-disable-next-line max-len
      const amount = (
        parseInt(productBase.amount, 10) + parseInt(entrance.amountAdded, 10)
      ).toString();
      // eslint-disable-next-line max-len
      const available = (
        parseInt(productBase.available, 10) + parseInt(entrance.amountAdded, 10)
      ).toString();

      const productBaseUpdate = {
        ...productBase,
        amount,
        available,
      };

      if (
        parseInt(productBaseUpdate.amount, 10) < 0 ||
        parseInt(productBaseUpdate.available, 10) < 0
      ) {
        field.productBaseUpdate = true;
        message.productBaseUpdate = "Número negativo não é valido";
        throw new FieldValidationError([{ field, message }]);
      }

      await productBase.update(productBaseUpdate, { transaction });
    }

    productBase = await ProductBase.findOne({
      where: {
        productId: entrance.productId,
      },
      transaction,
    });

    if (product.serial) {
      const { serialNumbers } = entrance;

      const serialNumbersFindPromises = serialNumbers.map(async (item) => {
        const equip = await Equip.findOne({
          where: {
            serialNumber: item,
            reserved: false,
          },
          include: [
            {
              model: ProductBase,
              where: { id: oldProductBase.id },
              attributes: [],
            },
          ],
          transaction,
        });

        if (!equip) {
          field.serialNumbers = true;
          message.serialNumbers = `${item} não está registrado`;
          throw new FieldValidationError([{ field, message }]);
        }

        const equipUpdate = {
          ...equip,
          productBaseId: productBase.id,
        };

        await equip.update(equipUpdate, { transaction });
      });
      await Promise.all(serialNumbersFindPromises);
    }

    const newEntrance = {
      ...oldEntrance,
      ...entrance,
    };

    await oldEntrance.update(newEntrance, { transaction });

    const response = await Entrance.findByPk(bodyData.id, {
      include: [
        {
          model: Company,
        },
        {
          model: Product,
        },
      ],
      transaction,
    });

    return response;
  }

  async delete(id, options = {}) {
    const { transaction = null } = options;

    const deletEntrance = await Entrance.findByPk(id, { transaction });

    const field = {
      id: false,
    };
    const message = {
      id: "",
    };

    if (!deletEntrance) {
      field.id = true;
      message.id = "entrada não econtrada";
      throw new FieldValidationError([{ field, message }]);
    }

    const equips = await Equip.findAll({
      where: { entranceId: id },
      order: [["serialNumber", "ASC"]],
      paranoid: false,
      transaction,
    });

    const equipDeletePromise = equips.map(async (item) => {
      if (item.deletedAt !== null || item.reserved === true) {
        field.reserved = true;
        message.reserved = "Há equipamento liberado ou reservado";
        throw new FieldValidationError([{ field, message }]);
      }
      await item.destroy({ force: true, transaction });
    });

    await Promise.all(equipDeletePromise);

    const product = await Product.findByPk(deletEntrance.productId, {
      transaction,
    });

    if (!product) {
      field.message = true;
      message.message = "product não encontrada.";
      throw new FieldValidationError([{ field, message }]);
    } else {
      let analysis = parseInt(product.analysis, 10);
      let amount = parseInt(product.amount, 10);
      let available = parseInt(product.available, 10);

      if (deletEntrance.analysis) {
        analysis = (
          analysis - parseInt(deletEntrance.amountAdded, 10)
        ).toString();
      } else {
        amount = (amount - parseInt(deletEntrance.amountAdded, 10)).toString();
        available = (
          available - parseInt(deletEntrance.amountAdded, 10)
        ).toString();
      }

      const productUpdate = {
        ...product,
        amount,
        available,
        analysis,
      };

      console.log("testet");
      if (analysis < 0 || amount < 0 || available < 0) {
        field.productBaseUpdate = true;
        message.productBaseUpdate = "Número negativo não é valido";
        throw new FieldValidationError([{ field, message }]);
      }
      await product.update(productUpdate, { transaction });
    }

    await deletEntrance.destroy({ force: true, transaction });

    return "sucesso";
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

    const entrances = await Entrance.findAndCountAll({
      where: getWhere("entrance"),
      include: [
        { model: Company },
        {
          model: Product,
          where: getWhere("product"),
          include: [
            {
              model: Mark,
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

    const { rows } = entrances;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: entrances.count,
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

    // eslint-disable-next-line consistent-return
    const formatData = R.map((entrance) => {
      if (entrance.product) {
        const resp = {
          id: entrance.id,
          amountAdded: entrance.amountAdded,
          oldAmount: entrance.oldAmount,
          responsibleUser: entrance.responsibleUser,
          companyId: entrance.company.id,
          razaoSocial: entrance.company.razaoSocial,
          productId: entrance.product.id,
          serial: entrance.product.serial,
          category: entrance.product.category,
          description: entrance.product.description,
          SKU: entrance.product.SKU,
          minimumStock: entrance.product.minimumStock,
          amount: entrance.product.amount,
          mark: entrance.product.mark.mark,
          // eslint-disable-next-line max-len
          name: entrance.product.name,
          createdAtNotFormatted: entrance.createdAt,
          createdAt: formatDateFunct(entrance.createdAt),
        };
        return resp;
      }
      return "";
    });

    const entrancesList = formatData(rows);

    // const entrancesList = formatData(rows).filter((item) => {
    //   if (item.name.indexOf(query.filters.name.toUpperCase()) !== -1) return item
    // })

    let show = limit;
    if (entrances.count < show) {
      show = entrances.count;
    }

    const response = {
      page: pageResponse,
      show,
      count: entrances.count,
      rows: entrancesList,
    };

    return response;
  }
};
