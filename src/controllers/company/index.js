const R = require('ramda')

const CompanyDomain = require('../../domains/general/company')
const database = require('../../database')

const companyDomain = new CompanyDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const company = await companyDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(company)
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

    const company = await companyDomain.getAll({ query, transaction })

    await transaction.commit()
    res.json(company)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getAllFornecedor = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const fornecedores = await companyDomain.getAllFornecedor({ transaction })

    await transaction.commit()
    res.json(fornecedores)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getOneByCnpj = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { cnpj } = req.query
    const company = await companyDomain.getOneByCnpj(cnpj)

    await transaction.commit()
    res.json(company)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const update = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const company = await companyDomain.update(req.body,
      { transaction })

    await transaction.commit()
    res.json(company)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

module.exports = {
  add,
  getAll,
  getAllFornecedor,
  getOneByCnpj,
  update,
}
