const R = require('ramda')

const AccessoriesDomain = require('../../../domains/labtec/entryEquipment/accessories')
const database = require('../../../database')

const accessoriesDomain = new AccessoriesDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const accessories = await accessoriesDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(accessories)
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
    const accessories = await accessoriesDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(accessories)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  add,
  getAll,
}
