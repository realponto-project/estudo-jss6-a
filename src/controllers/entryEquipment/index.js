const R = require('ramda')

const EntryEquipmentDomain = require('../../domains/labtec/entryEquipment')
const database = require('../../database')

const entryEquipmentDomain = new EntryEquipmentDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const equip = await entryEquipmentDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(equip)
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
    const entry = await entryEquipmentDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(entry)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  add,
  getAll,
}
