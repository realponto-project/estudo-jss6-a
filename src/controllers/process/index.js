const R = require('ramda')

const ProcessDomain = require('../../domains/labtec/process')
const database = require('../../database')

const processDomain = new ProcessDomain()

const update = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { id = null } = req.body
    const { updateProcessMock = null } = req.body

    const process = await processDomain.update(id,
      updateProcessMock,
      { transaction })

    await transaction.commit()
    res.json(process)
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
    const process = await processDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(process)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getProcessToControl = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query = null
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }
    const process = await processDomain.getProcessToControl({ query, transaction })

    await transaction.commit()
    res.json(process)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  update,
  getAll,
  getProcessToControl,
}
