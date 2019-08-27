const R = require('ramda')

const EntranceDomain = require('../../../domains/estoque/entrance')
const database = require('../../../database')

const entranceDomain = new EntranceDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const entrance = await entranceDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(entrance)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAll = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const entrances = await entranceDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(entrances)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  add,
  getAll,
}
