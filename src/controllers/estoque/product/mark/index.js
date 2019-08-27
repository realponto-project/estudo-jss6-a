const R = require('ramda')

const MarkDomain = require('../../../../domains/estoque/product/mark')
const database = require('../../../../database')

const markDomain = new MarkDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const mark = await markDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(mark)
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
        // eslint-disable-next-line prefer-destructuring
        query = req.query.query
      }
    }

    const marks = await markDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(marks)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}


module.exports = {
  add,
  getAll,
}
