const EquipTypeDomain = require('../../../domains/estoque/product/equip/equipModel')
const database = require('../../../database')

const equipTypeDomain = new EquipTypeDomain()

const addModel = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const equipType = await equipTypeDomain.addModel(req.body, { transaction })

    await transaction.commit()
    res.json(equipType)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}
const addMark = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const equipType = await equipTypeDomain.addMark(req.body, { transaction })

    await transaction.commit()
    res.json(equipType)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAll = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const equipType = await equipTypeDomain.getAll()

    await transaction.commit()
    res.json(equipType)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getAllMarkByType = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { type = null } = req.query

    const marksArray = await equipTypeDomain.getAllMarkByType(type)

    await transaction.commit()
    res.json(marksArray)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getAllModelByMark = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { mark = null } = req.query
    const { type = null } = req.query

    const obj = {
      mark,
      type,
    }

    const modelArray = await equipTypeDomain.getAllModelByMark(obj)

    await transaction.commit()
    res.json(modelArray)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  addModel,
  addMark,
  getAll,
  getAllMarkByType,
  getAllModelByMark,
}
