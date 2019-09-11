const R = require('ramda')
// const bcrypt = require('bcrypt')

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
  async login({ username, password, typeAccount }, options = {}) {
    const { transaction = null } = options

    const login = await Login.findOne({
      include: [{
        model: User,
        where: { username },
        include: [{
          model: TypeAccount,
        }],
      }],
      transaction,
    })

    if (!login) {
      throw new UnauthorizedError()
    }

    const authorizedStock = R.filter(R.propEq('stock', true), [typeAccount, login.user.typeAccount])
    const authorizedLabTec = R.filter(R.propEq('labTec', true), [typeAccount, login.user.typeAccount])

    if (authorizedStock.length !== 2 && authorizedLabTec.length !== 2) {
      throw new UnauthorizedError()
    }

    const checkPwd = await login.checkPassword(password)

    // console.log(checkPwd)

    // const checkPwd = await bcrypt.compare(password, login.password)

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
        include: [{
          model: TypeAccount,
        }],
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
        addTec: resourceReturn.addTec,
        addCar: resourceReturn.addCar,
        addMark: resourceReturn.addMark,
        addType: resourceReturn.addType,
        addProd: resourceReturn.addProd,
        addFonr: resourceReturn.addFonr,
        addEntr: resourceReturn.addEntr,
        addKit: resourceReturn.addKit,
        addKitOut: resourceReturn.addKitOut,
        addOutPut: resourceReturn.addOutPut,
        addROs: resourceReturn.addROs,
        addRML: resourceReturn.addRML,
        gerROs: resourceReturn.gerROs,
        delROs: resourceReturn.delROs,
        updateRos: resourceReturn.updateRos,
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
        addTec: typeAccountReturn.resource.addTec,
        addCar: typeAccountReturn.resource.addCar,
        addMark: typeAccountReturn.resource.addMark,
        addType: typeAccountReturn.resource.addType,
        addProd: typeAccountReturn.resource.addProd,
        addFonr: typeAccountReturn.resource.addFonr,
        addEntr: typeAccountReturn.resource.addEntr,
        addKit: typeAccountReturn.resource.addKit,
        addKitOut: typeAccountReturn.resource.addKitOut,
        addOutPut: typeAccountReturn.resource.addOutPut,
        addROs: typeAccountReturn.resource.addROs,
        addRML: typeAccountReturn.resource.addRML,
        gerROs: typeAccountReturn.resource.gerROs,
        delROs: typeAccountReturn.resource.delROs,
        updateRos: typeAccountReturn.resource.updateRos,
      }
    }

    const response = {
      ...resource,
      token: session.id,
      userId: user.id,
      username: user.username,
      typeAccount: user.typeAccount.typeName,
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
