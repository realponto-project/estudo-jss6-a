const PartDomain = require('../../domains/estoque/product/part')
const database = require('../../database')

const partDomain = new PartDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const part = await partDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(part)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const updateByCostPrince = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { partId = null } = req.body
    const { newCostPrince = null } = req.body

    const part = await partDomain.updateByCostPrince(partId, { newCostPrince })

    await transaction.commit()
    res.json(part)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const updateBySalePrice = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { partId = null } = req.body
    const { newSalePrice = null } = req.body

    const part = await partDomain.updateBySalePrice(partId, { newSalePrice })

    await transaction.commit()
    res.json(part)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getAllParts = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const query = JSON.parse(req.query.query)

    // console.log(query)

    const part = await partDomain.getAllParts({ query, transaction })

    await transaction.commit()
    res.json(part)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  add,
  updateByCostPrince,
  updateBySalePrice,
  getAllParts,
}
