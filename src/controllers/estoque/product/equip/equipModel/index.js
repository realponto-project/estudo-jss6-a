const EquipModelDomain = require('../../../../../domains/estoque/product/equip/equipModel')
const database = require('../../../../../database')

const equipModelDomain = new EquipModelDomain()

const addType = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const equipType = await equipModelDomain.addType(req.body, { transaction })

    await transaction.commit()
    res.json(equipType)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAllType = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const equipTypes = await equipModelDomain.getAllType({ transaction })

    await transaction.commit()
    res.json(equipTypes)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  addType,
  getAllType,
}
