const R = require('ramda')

const formatQuery = require('../../../helpers/lazyLoad')
const database = require('../../../database')

const Notification = database.model('notification')

module.exports = class NotificationDomain {
  async getAll(options = {}) {
    const inicialOrder = {
      field: 'createdAt',
      acendent: true,
      direction: 'DESC',
    }

    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)
    const newOrder = (query && query.order) ? query.order : inicialOrder

    if (newOrder.acendent) {
      newOrder.direction = 'DESC'
    } else {
      newOrder.direction = 'ASC'
    }

    const {
      getWhere,
      limit,
      offset,
      pageResponse,
    } = formatQuery(newQuery)

    const notifications = await Notification.findAndCountAll({
      // attributes: ['id', 'amount', 'available'],
      // order: [
      //   [newOrder.field, newOrder.direction],
      // ],
      // limit,
      // offset,
      transaction,
    })

    const { rows } = notifications

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: notifications.count,
        rows: [],
      }
    }

    const formatData = R.map((notification) => {
      const resp = {
        id: notification.id,
        message: notification.message,
      }
      return resp
    })

    const notificationsList = formatData(rows)

    let show = limit
    if (notifications.count < show) {
      show = notifications.count
    }


    const response = {
      page: pageResponse,
      show,
      count: notifications.count,
      rows: notificationsList,
    }

    return response
  }

  async hasNotification(options = {}) {
    const { transaction = null } = options

    const notifications = await Notification.findOne({
      where: { viewed: true },
      attributes: ['id'],
      transaction,
    })

    return notifications !== null
  }
}
