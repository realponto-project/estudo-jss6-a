const R = require('ramda')

const NotificationDomain = require('../../../domains/estoque/notifications')
const database = require('../../../database')

const notificationDomain = new NotificationDomain()


const getAll = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const notifications = await notificationDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(notifications)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const hasNotification = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const bool = await notificationDomain.hasNotification({ transaction })

    await transaction.commit()
    res.json(bool)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  getAll,
  hasNotification,
}
