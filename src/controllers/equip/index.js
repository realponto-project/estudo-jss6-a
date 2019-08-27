const R = require('ramda')

const EquipDomain = require('../../domains/estoque/product/equip')
const database = require('../../database')

const equipDomain = new EquipDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const equip = await equipDomain.add(req.body, { transaction })

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
    let query = null
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const equip = await equipDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(equip)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getOneBySerialNumber = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { serialNumber = null } = req.query

    const equip = await equipDomain.getOneBySerialNumber(serialNumber)

    await transaction.commit()
    res.json(equip)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const update = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const equip = await equipDomain.update(req.body,
      { transaction })

    await transaction.commit()
    res.json(equip)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

module.exports = {
  add,
  getAll,
  getOneBySerialNumber,
  update,
}
