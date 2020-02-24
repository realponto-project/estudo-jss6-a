const R = require("ramda");
// const moment = require('moment')

const formatQuery = require("../../helpers/lazyLoad");
const database = require("../../database");

// const { FieldValidationError } = require('../../helpers/errors')

// const Mark = database.model('mark')
// const Company = database.model('company')
// const Entrance = database.model('entrance')
const Product = database.model("product");
// const User = database.model('user')
const Mark = database.model("mark");
const StockBase = database.model("stockBase");
const ProductBase = database.model("productBase");
const Notification = database.model("notification");
// const Equip = database.model('equip')

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

    const entrances = await ProductBase.findAndCountAll({
      // where: getWhere('productBase'),
      attributes: ["id", "amount", "available"],
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

    const { rows } = entrances;

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: entrances.count,
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

    const formatData = R.map(entrance => {
      const resp = {
        id: entrance.id,
        amount: entrance.amount,
        available: entrance.available,
        serial: entrance.product.serial,
        productId: entrance.product.id,
        name: entrance.product.name,
        category: entrance.product.category,
        minimumStock: entrance.product.minimumStock,
        manufacturer: entrance.product.mark.mark,
        stockBase: entrance.stockBase.stockBase
      };
      return resp;
    });

    const entrancesList = formatData(rows);

    let show = limit;
    if (entrances.count < show) {
      show = entrances.count;
    }

    const response = {
      page: pageResponse,
      show,
      count: entrances.count,
      rows: entrancesList
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
};
