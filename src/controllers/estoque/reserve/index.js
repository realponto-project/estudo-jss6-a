const R = require('ramda')

const OsDomain = require('../../../domains/estoque/reserve/os')
const KitDomain = require('../../../domains/estoque/reserve/kit')
const KitOutDomain = require('../../../domains/estoque/reserve/kit/kitOut')
const FreeMarketDomain = require('../../../domains/estoque/reserve/freeMarket')
const database = require('../../../database')

const osDomain = new OsDomain()
const kitDomain = new KitDomain()
const kitOutDomain = new KitOutDomain()
const freeMarketDomain = new FreeMarketDomain()

const addOs = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const Os = await osDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(Os)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const updateOs = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    // console.log(req.body)
    const Os = await osDomain.update(req.body, { transaction })

    await transaction.commit()
    res.json(Os)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const output = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    // console.log(req.body)
    const Os = await osDomain.output(req.body, { transaction })

    await transaction.commit()
    res.json(Os)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const deleteOs = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const Os = await osDomain.delete(req.query.osId, { transaction })

    await transaction.commit()
    res.json(Os)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const addKit = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const kitOut = await kitDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(kitOut)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAllKit = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const kits = await kitDomain.getAll({ query, transaction })

    // console.log(kits)

    await transaction.commit()
    res.json(kits)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getKitDefaultValue = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const kitDefault = await kitDomain.getKitDefaultValue({ query, transaction })

    // console.log(kitDefault)

    await transaction.commit()
    res.json(kitDefault)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const addKitOut = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const kitOut = await kitOutDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(kitOut)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAllKitOut = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const kitsOut = await kitOutDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(kitsOut)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const addFreeMarket = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const freeMarket = await freeMarketDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(freeMarket)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAllFreeMarket = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const FreeMarket = await freeMarketDomain.getAll({ query, transaction })

    // console.log(kits)

    await transaction.commit()
    res.json(FreeMarket)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getAllOs = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    let query
    if (R.has('query', req)) {
      if (R.has('query', req.query)) {
        query = JSON.parse(req.query.query)
      }
    }

    const entrances = await osDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(entrances)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getOsByOs = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { os } = req.query
    const company = await osDomain.getOsByOs(os)

    await transaction.commit()
    res.json(company)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  addOs,
  output,
  updateOs,
  deleteOs,
  addKit,
  getAllKit,
  getKitDefaultValue,
  addKitOut,
  getAllKitOut,
  addFreeMarket,
  getAllFreeMarket,
  getAllOs,
  getOsByOs,
//   getAll,
}
