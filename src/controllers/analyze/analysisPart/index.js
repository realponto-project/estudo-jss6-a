const AnalysisPartDomain = require('../../../domains/labtec/analyze/analysisPart')
const database = require('../../../database')

const analysisPartDomain = new AnalysisPartDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const analysisPart = await analysisPartDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(analysisPart)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}
const analysisPartUpdate = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { id = null } = req.body
    const { analysisPartUpdateMock = null } = req.body

    const analysisPart = await analysisPartDomain.analysisPartUpdate(id,
      analysisPartUpdateMock,
      { transaction })

    await transaction.commit()
    res.json(analysisPart)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}
module.exports = {
  add,
  analysisPartUpdate,
}
