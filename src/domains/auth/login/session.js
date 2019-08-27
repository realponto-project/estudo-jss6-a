const moment = require('moment')

const database = require('../../../database')

const { UnauthorizedError } = require('../../../helpers/errors')

const Session = database.model('session')
const User = database.model('user')
const Login = database.model('login')

class SessionDomain {
  async createSession(loginId, options = {}) {
    const { transaction = null } = options

    const session = await Session.create(
      { loginId },
      { transaction },
    )

    return session
  }

  async updateLastActivity(id, options = {}) {
    const { transaction = null } = options

    const sessionInstance = await Session.findByPk(
      id,
      { transaction },
    )

    if (!sessionInstance) {
      throw new UnauthorizedError()
    }

    const lastActivity = moment()

    await sessionInstance.update({ lastActivity })

    const sessionUpdated = await Session.findByPk(
      sessionInstance.id,
      { transaction },
    )

    return sessionUpdated
  }

  async turnInvalidSession(id, options = {}) {
    const { transaction = null } = options

    const sessionInstance = await Session.findByPk(
      id,
      { transaction },
    )

    if (!sessionInstance) {
      throw new Error('session not found')
    }

    await sessionInstance.update({ active: false })

    await sessionInstance.destroy({ force: true })

    const sessionUpdated = await Session.findByPk(
      sessionInstance.id,
      { transaction },
    )

    return sessionUpdated
  }

  async checkSessionIsValid(id, username, options = {}) {
    const { transaction = null } = options

    if (!username) {
      return false
    }

    const login = await Login.findOne({
      include: [{
        model: User,
        where: { username },
      }],
      transaction,
    })

    if (!login) {
      return false
    }

    if (!login.id) {
      return false
    }

    const session = await Session.findOne({
      where: {
        id,
        loginId: login.id,
      },
      transaction,
    })

    if (!session) {
      return false
    }

    return session.active
  }
}

module.exports = SessionDomain
