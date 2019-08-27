const database = require('../../../database')

const SessionDomain = require('./session')

const { UnauthorizedError } = require('../../../helpers/errors')
// const { FieldValidationError } = require('../../helpers/errors')

const User = database.model('user')
const Login = database.model('login')
const Resources = database.model('resources')
const TypeAccount = database.model('typeAccount')

const sessionDomain = new SessionDomain()

class LoginDomain {
  async login({ username, password }, options = {}) {
    const { transaction = null } = options

    const login = await Login.findOne({
      include: [{
        model: User,
        where: { username },
      }],
      transaction,
    })

    if (!login) {
      throw new UnauthorizedError()
    }

    const checkPwd = await login.checkPassword(password)

    if (!checkPwd) {
      throw new UnauthorizedError()
    }

    const session = await sessionDomain.createSession(
      login.id,
      { transaction },
    )

    const user = await User.findByPk(
      login.user.id,
      {
        transaction,
        attributes: [
          'id',
          'username',
          'customized',
          'resourceId',
          'typeAccountId',
        ],
      },
    )

    let resource = {}

    if (user.customized) {
      const { resourceId } = user

      const resourceReturn = await Resources.findByPk(resourceId, { transaction })

      resource = {
        addCompany: resourceReturn.addCompany,
        addPart: resourceReturn.addPart,
        addAnalyze: resourceReturn.addAnalyze,
        addEquip: resourceReturn.addEquip,
        addEntry: resourceReturn.addEntry,
        addEquipType: resourceReturn.addEquipType,
        tecnico: resourceReturn.tecnico,
        addAccessories: resourceReturn.addAccessories,
        addUser: resourceReturn.addUser,
        addTypeAccount: resourceReturn.addTypeAccount,
      }
    } else {
      const { typeAccountId } = user

      const typeAccountReturn = await TypeAccount.findByPk(typeAccountId, {
        include: [{
          model: Resources,
        }],
        transaction,
      })

      resource = {
        addCompany: typeAccountReturn.resource.addCompany,
        addPart: typeAccountReturn.resource.addPart,
        addAnalyze: typeAccountReturn.resource.addAnalyze,
        addEquip: typeAccountReturn.resource.addEquip,
        addEntry: typeAccountReturn.resource.addEntry,
        addEquipType: typeAccountReturn.resource.addEquipType,
        tecnico: typeAccountReturn.resource.tecnico,
        addAccessories: typeAccountReturn.resource.addAccessories,
        addUser: typeAccountReturn.resource.addUser,
        addTypeAccount: typeAccountReturn.resource.addTypeAccount,
      }
    }

    const response = {
      ...resource,
      token: session.id,
      userId: user.id,
      username: user.username,
      active: session.active,
    }
    return response
  }

  async logout(token, options = {}) {
    const { transaction = null } = options
    await sessionDomain.turnInvalidSession(token, { transaction })

    // const isValid = await sessionDomain.checkSessionIsValid(sessionId)

    // if (isValid) {
    //   throw new FieldValidationError([{
    //     field: 'logout',
    //     message: 'logout failed',
    //   }])
    // }

    const sucess = {
      logout: true,
    }
    return sucess
  }
}

module.exports = LoginDomain
