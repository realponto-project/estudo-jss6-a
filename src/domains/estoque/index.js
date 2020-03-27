const R = require("ramda");
// const moment = require('moment')

const formatQuery = require("../../helpers/lazyLoad");
const database = require("../../database");

const { FieldValidationError } = require("../../helpers/errors");

// const Mark = database.model('mark')
// const Company = database.model('company')
// const Entrance = database.model('entrance')
const Product = database.model("product");
// const User = database.model('user')
const Mark = database.model("mark");
const StockBase = database.model("stockBase");
const ProductBase = database.model("productBase");
const Notification = database.model("notification");
const Equip = database.model("equip");

module.exports = class StockDomain {
  async getAll(options = {}) {
    const inicialOrder = {
      field: "createdAt",
      acendent: true,
      direction: "ASC"
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

    const productBases = await ProductBase.findAndCountAll({
      // where: getWhere('productBase'),
      attributes: ["id", "amount", "available", "analysis"],
      include: [
        {
          model: Product,
          attributes: ["name", "category", "minimumStock", "serial", "id"],
          where: getWhere("product"),
          // order: [
          //   ['name', 'ASC'],
          // ],
          include: [
            {
              model: Mark,
              where: getWhere("mark"),
              attributes: ["mark"],
              required: true
            }
          ],
          required: true
        },
        {
          model: StockBase,
          attributes: ["stockBase"],
          where: getWhere("stockBase")
        }
      ],
      order: [[newOrder.field, newOrder.direction]],
      limit,
      offset,
      transaction
    });

    const { rows } = productBases;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: productBases.count,
        rows: []
      };
    }

    // const formatDateFunct = (date) => {
    //   moment.locale('pt-br')
    //   const formatDate = moment(date).format('L')
    //   const formatHours = moment(date).format('LT')
    //   const dateformated = `${formatDate} ${formatHours}`
    //   return dateformated
    // }

    const formatData = R.map(productBase => {
      const resp = {
        id: productBase.id,
        amount: productBase.amount,
        analysis: productBase.analysis,
        available: productBase.available,
        serial: productBase.product.serial,
        productId: productBase.product.id,
        name: productBase.product.name,
        category: productBase.product.category,
        minimumStock: productBase.product.minimumStock,
        manufacturer: productBase.product.mark.mark,
        stockBase: productBase.stockBase.stockBase
      };
      return resp;
    });

    const productBasesList = formatData(rows);

    let show = limit;
    if (productBases.count < show) {
      show = productBases.count;
    }

    const response = {
      page: pageResponse,
      show,
      count: productBases.count,
      rows: productBasesList
    };

    return response;
  }

  async getAllNotification(options = {}) {
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

    const { limit, offset, pageResponse } = formatQuery(newQuery);

    const notifications = await Notification.findAndCountAll({
      // attributes: ['id', 'amount', 'available'],
      order: [[newOrder.field, newOrder.direction]],
      limit,
      offset,
      transaction
    });

    const { rows } = notifications;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: notifications.count,
        rows: []
      };
    }

    const formatData = R.map(entrance => {
      const resp = {
        id: entrance.id,
        message: entrance.message
      };
      return resp;
    });

    const notificationsList = formatData(rows);

    let show = limit;
    if (notifications.count < show) {
      show = notifications.count;
    }

    const response = {
      page: pageResponse,
      show,
      count: notifications.count,
      rows: notificationsList
    };

    return response;
  }

  async updatteProductBase(body, options = {}) {
    const { transaction = null } = options;

    console.log(body);
    const bodyNotHasProp = prop => R.not(R.has(prop, body));

    let errors = false;

    const field = {
      id: false,
      amount: false,
      serialNumbers: false
    };

    const message = {
      id: false,
      amount: false,
      serialNumbers: false
    };

    let productBase = null;

    if (bodyNotHasProp("id") || !body.id) {
      errors = true;
      field.id = true;
      message.id = "";
    } else {
      productBase = await ProductBase.findByPk(body.id, { transaction });
    }

    if (
      bodyNotHasProp("amount") ||
      !body.amount ||
      typeof body.amount !== "number"
    ) {
      errors = true;
      field.amount = true;
      message.amount = "";
    }

    if (bodyNotHasProp("serialNumbers") || !body.serialNumbers) {
      errors = true;
      field.serialNumbers = true;
      message.serialNumbers = "";
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }]);
    }

    const { serialNumbers } = body;
    console.log("teste");

    const serialNumbersFindPromises = serialNumbers.map(async item => {
      const serialNumberHasExist = await Equip.findOne({
        where: { serialNumber: item },
        attributes: [],
        paranoid: false,
        transaction
      });

      if (serialNumberHasExist) {
        field.serialNumbers = true;
        message.serialNumbers = `${item} já está registrado`;
        throw new FieldValidationError([{ field, message }]);
      }
    });
    await Promise.all(serialNumbersFindPromises);

    const serialNumbersCreatePromises = serialNumbers.map(async item => {
      const equipCreate = {
        productBaseId: productBase.id,
        serialNumber: item,
        loan: false
      };

      await Equip.create(equipCreate, { transaction });
    });
    await Promise.all(serialNumbersCreatePromises);

    const analysis = (
      parseInt(productBase.analysis, 10) - body.amount
    ).toString();

    const amount = (parseInt(productBase.amount, 10) + body.amount).toString();

    const available = (
      parseInt(productBase.available, 10) + body.amount
    ).toString();

    return await productBase.update(
      { analysis, amount, available },
      { transaction }
    );
  }
};
