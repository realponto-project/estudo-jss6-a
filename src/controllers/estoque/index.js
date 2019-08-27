const R = require('ramda')

const StockDomain = require('../../domains/estoque')
const database = require('../../database')

const stockDomain = new StockDomain()


const getAll = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const stock = await stockDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(stock)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  getAll,
}
