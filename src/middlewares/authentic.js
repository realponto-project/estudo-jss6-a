const SessionDomain = require('../domains/auth/login/session')

const { UnauthorizedError } = require('../helpers/errors')

const sessionDomain = new SessionDomain()

const auth = async (req, res, next) => {
  try {
    const token = req.get('token')
    const username = req.get('username')

    const valid = await sessionDomain.checkSessionIsValid(token, username)

    if (!valid) {
      next(new UnauthorizedError())
    }

    next()
  } catch (error) {
    next(new UnauthorizedError())
  }
}

module.exports = {
  auth,
}
