const AnalyzeDomain = require('../../domains/labtec/analyze')
const database = require('../../database')

const analyzeDomain = new AnalyzeDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const analyze = await analyzeDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(analyze)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}
const analyzeUpdate = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { id = null } = req.body
    const { analyzeUpdateMock = null } = req.body

    const analyze = await analyzeDomain.analyzeUpdate(id,
      analyzeUpdateMock,
      { transaction })

    await transaction.commit()
    res.json(analyze)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

module.exports = {
  add,
  analyzeUpdate,
}
