const TypeAccountDomain = require('../../domains/auth/user/typeAccount')
const database = require('../../database')

const typeAccountDomain = new TypeAccountDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const typeAccount = await typeAccountDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(typeAccount)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAll = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const typeAccounts = await typeAccountDomain.getAll({ transaction })

    await transaction.commit()
    res.json(typeAccounts)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

const getResourcesByTypeAccount = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { typeName } = req.query

    const typeAccount = await typeAccountDomain.getResourcesByTypeAccount(typeName)

    await transaction.commit()
    res.json(typeAccount)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}


module.exports = {
  add,
  getAll,
  getResourcesByTypeAccount,
}
