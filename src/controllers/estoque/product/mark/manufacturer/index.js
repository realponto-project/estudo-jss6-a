const R = require('ramda')

const ManufacturerDomain = require('../../../../../domains/estoque/product/mark/manufacturer')
const database = require('../../../../../database')

const manufacturerDomain = new ManufacturerDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const mark = await manufacturerDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(mark)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getManufacturerByMark = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query = null
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        // eslint-disable-next-line prefer-destructuring
        query = req.query.query
      }
    }

    // console.log(query)

    const manufacturer = await manufacturerDomain.getManufacturerByMark({ query, transaction })

    await transaction.commit()
    res.json(manufacturer)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  add,
  getManufacturerByMark,
}
