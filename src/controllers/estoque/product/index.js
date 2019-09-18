const R = require('ramda')

const ProductDomain = require('../../../domains/estoque/product')
const database = require('../../../database')

const productDomain = new ProductDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const product = await productDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(product)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const update = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const product = await productDomain.update(req.body, { transaction })

    await transaction.commit()
    res.json(product)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAll = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const products = await productDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(products)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getEquipsByEntrance = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const equipTypes = await productDomain.getEquipsByEntrance({ query, transaction })

    await transaction.commit()
    res.json(equipTypes)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getAllNames = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }
    const products = await productDomain.getAllNames({ query, transaction })

    await transaction.commit()
    res.json(products)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getProductByStockBase = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const products = await productDomain.getProductByStockBase({ query, transaction })

    await transaction.commit()
    res.json(products)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  add,
  update,
  getAll,
  getEquipsByEntrance,
  getAllNames,
  getProductByStockBase,
}
