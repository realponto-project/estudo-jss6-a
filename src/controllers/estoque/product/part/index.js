const PartDomain = require('../../../../domains/estoque/product/part')
const database = require('../../../../database')

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

module.exports = {
  add,
}
