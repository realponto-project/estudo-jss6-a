const LoginDomain = require('../../domains/auth/login')
const SessionDomain = require('../../domains/auth/login/session')
const database = require('../../database')
const { UnauthorizedError } = require('../../helpers/errors')

const loginDomain = new LoginDomain()
const sessionDomain = new SessionDomain()

const loginController = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const login = await loginDomain.login(req.body, { transaction })

    await transaction.commit()
    res.json(login)
  } catch (error) {
    await transaction.rollback()
    next(new UnauthorizedError())
  }
}

const logoutController = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const logout = await loginDomain.logout(req.query.token, { transaction })

    await transaction.commit()
    res.json(logout)
  } catch (error) {
    await transaction.rollback()
    next(new UnauthorizedError())
  }
}

const checkSessionIsValid = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const { token, username } = req.query

    const valid = await sessionDomain.checkSessionIsValid(token, username)

    await transaction.commit()
    res.json(valid)
  } catch (error) {
    await transaction.rollback()
    next(new UnauthorizedError())
  }
}

module.exports = {
  loginController,
  logoutController,
  checkSessionIsValid,
}
