const R = require('ramda')

const UserDomain = require('../../domains/auth/user')
const database = require('../../database')

const userDomain = new UserDomain()


const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const user = await userDomain.user_Create(req.body, { transaction })

    await transaction.commit()
    res.json(user)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const update = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const user = await userDomain.user_Update(req.body, { transaction })

    await transaction.commit()
    res.json(user)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const updatePassword = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const userUpdate = await userDomain.user_PasswordUpdate(req.body, { transaction })

    await transaction.commit()
    res.json(userUpdate)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getResourceByUsername = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { username } = req.query

    const resources = await userDomain.getResourceByUsername(username)

    await transaction.commit()
    res.json(resources)
  } catch (error) {
    await transaction.rollback()
    next()
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
    const users = await userDomain.getAll({ query, transaction })

    // console.log(users)

    await transaction.commit()
    res.json(users)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  add,
  update,
  getResourceByUsername,
  getAll,
  updatePassword,
}
