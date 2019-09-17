const R = require('ramda')
const Sequelize = require('sequelize')

const { FieldValidationError, UnauthorizedError } = require('../../../helpers/errors')

const database = require('../../../database')
const formatQuery = require('../../../helpers/lazyLoad')

const User = database.model('user')
const Login = database.model('login')
const TypeAccount = database.model('typeAccount')
const Resources = database.model('resources')

const { Op: operators } = Sequelize

class UserDomain {
  // eslint-disable-next-line camelcase
  async user_Create(bodyData, options = {}) {
    const { transaction = null } = options

    const omitArray = ['id', 'password', 'addCompany', 'addPart', 'addAnalyze', 'addEquip', 'addEntry', 'addEquipType',
      'tecnico', 'addAccessories', 'addUser', 'addTypeAccount', 'addTec', 'addCar', 'addMark', 'addType',
      'addProd', 'addFonr', 'addEntr', 'addKit', 'addKitOut', 'addOutPut', 'addROs', 'addRML', 'gerROs', 'delROs', 'updateRos']

    const userNotFormatted = R.omit(omitArray, bodyData)

    const notHasProps = props => R.not(R.has(props, userNotFormatted))
    const bodyNotHasProps = props => R.not(R.has(props, bodyData))

    if (notHasProps('username') || !userNotFormatted.username) {
      throw new FieldValidationError([{
        field: 'username',
        message: 'username cannot be null',
      }])
    }


    if (notHasProps('typeName')) {
      throw new FieldValidationError([{
        field: 'typeName',
        message: 'typeName undefined',
      }])
    }

    const { typeName } = userNotFormatted

    const typeAccountRetorned = await TypeAccount.findOne({
      where: { typeName },
      include: [{
        model: Resources,
      }],
      transaction,
    })

    if (!typeAccountRetorned) {
      throw new FieldValidationError([{
        field: 'typeName',
        message: 'typeName invalid',
      }])
    }

    userNotFormatted.typeAccountId = typeAccountRetorned.id

    if (notHasProps('customized')) {
      throw new FieldValidationError([{
        field: 'customized',
        message: 'customized undefined',
      }])
    }

    const field = {
      typeName: false,
      addCompany: false,
      addPart: false,
      addAnalyze: false,
      addEquip: false,
      addEntry: false,
      responsibleUser: false,

      addTec: false,
      addCar: false,
      addMark: false,
      addType: false,
      addProd: false,
      addFonr: false,
      addEntr: false,
      addKit: false,
      addKitOut: false,
      addOutPut: false,
      addROs: false,
      addRML: false,
      gerROs: false,
      delROs: false,
      updateRos: false,
    }
    const message = {
      typeName: '',
      addCompany: '',
      addPart: '',
      addAnalyze: '',
      addEquip: '',
      addEntry: '',
      responsibleUser: '',

      addTec: '',
      addCar: '',
      addMark: '',
      addType: '',
      addProd: '',
      addFonr: '',
      addEntr: '',
      addKit: '',
      addKitOut: '',
      addOutPut: '',
      addROs: '',
      addRML: '',
      gerROs: '',
      delROs: '',
      updateRos: '',
    }

    let errors = null

    if (bodyNotHasProps('addCompany') || typeof bodyData.addCompany !== 'boolean') {
      errors = true
      field.addCompany = true
      message.addCompany = 'addCompany não é um booleano'
    }

    if (bodyNotHasProps('addPart') || typeof bodyData.addPart !== 'boolean') {
      errors = true
      field.addPart = true
      message.addPart = 'addPart não é um booleano'
    }


    if (bodyNotHasProps('addAnalyze') || typeof bodyData.addAnalyze !== 'boolean') {
      errors = true
      field.addAnalyze = true
      message.addAnalyze = 'addAnalyze não é um booleano'
    }


    if (bodyNotHasProps('addEquip') || typeof bodyData.addEquip !== 'boolean') {
      errors = true
      field.addEquip = true
      message.addEquip = 'addEquip não é um booleano'
    }


    if (bodyNotHasProps('addEntry') || typeof bodyData.addEntry !== 'boolean') {
      errors = true
      field.addEntry = true
      message.addEntry = 'addEntry não é um booleano'
    }

    if (bodyNotHasProps('addEquipType') || typeof bodyData.addEquipType !== 'boolean') {
      errors = true
      field.addEquipType = true
      message.addEquipType = 'addEquipType não é um booleano'
    }

    if (bodyNotHasProps('tecnico') || typeof bodyData.tecnico !== 'boolean') {
      errors = true
      field.tecnico = true
      message.tecnico = 'tecnico não é um booleano'
    }

    if (bodyNotHasProps('addAccessories') || typeof bodyData.addAccessories !== 'boolean') {
      errors = true
      field.addAccessories = true
      message.addAccessories = 'addAccessories não é um booleano'
    }

    if (bodyNotHasProps('addUser') || typeof bodyData.addUser !== 'boolean') {
      errors = true
      field.addUser = true
      message.addUser = 'addUser não é um booleano'
    }

    if (bodyNotHasProps('addTypeAccount') || typeof bodyData.addTypeAccount !== 'boolean') {
      errors = true
      field.addTypeAccount = true
      message.addTypeAccount = 'addTypeAccount não é um booleano'
    }

    if (bodyNotHasProps('addTec') || typeof bodyData.addTec !== 'boolean') {
      errors = true
      field.addTec = true
      message.addTec = 'addTec não é um booleano'
    }

    if (bodyNotHasProps('addCar') || typeof bodyData.addCar !== 'boolean') {
      errors = true
      field.addCar = true
      message.addCar = 'addCar não é um booleano'
    }

    if (bodyNotHasProps('addMark') || typeof bodyData.addMark !== 'boolean') {
      errors = true
      field.addMark = true
      message.addMark = 'addMark não é um booleano'
    }

    if (bodyNotHasProps('addType') || typeof bodyData.addType !== 'boolean') {
      errors = true
      field.addType = true
      message.addType = 'addType não é um booleano'
    }

    if (bodyNotHasProps('addProd') || typeof bodyData.addProd !== 'boolean') {
      errors = true
      field.addProd = true
      message.addProd = 'addProd não é um booleano'
    }

    if (bodyNotHasProps('addFonr') || typeof bodyData.addFonr !== 'boolean') {
      errors = true
      field.addFonr = true
      message.addFonr = 'addFonr não é um booleano'
    }

    if (bodyNotHasProps('addEntr') || typeof bodyData.addEntr !== 'boolean') {
      errors = true
      field.addEntr = true
      message.addEntr = 'addEntr não é um booleano'
    }

    if (bodyNotHasProps('addKit') || typeof bodyData.addKit !== 'boolean') {
      errors = true
      field.addKit = true
      message.addKit = 'addKit não é um booleano'
    }

    if (bodyNotHasProps('addKitOut') || typeof bodyData.addKitOut !== 'boolean') {
      errors = true
      field.addKitOut = true
      message.addKitOut = 'addKitOut não é um booleano'
    }

    if (bodyNotHasProps('addOutPut') || typeof bodyData.addOutPut !== 'boolean') {
      errors = true
      field.addOutPut = true
      message.addOutPut = 'addOutPut não é um booleano'
    }

    if (bodyNotHasProps('addROs') || typeof bodyData.addROs !== 'boolean') {
      errors = true
      field.addROs = true
      message.addROs = 'addROs não é um booleano'
    }

    if (bodyNotHasProps('addRML') || typeof bodyData.addRML !== 'boolean') {
      errors = true
      field.addRML = true
      message.addRML = 'addRML não é um booleano'
    }
    if (bodyNotHasProps('gerROs') || typeof bodyData.gerROs !== 'boolean') {
      errors = true
      field.gerROs = true
      message.gerROs = 'gerROs não é um booleano'
    }

    if (bodyNotHasProps('delROs') || typeof bodyData.delROs !== 'boolean') {
      errors = true
      field.delROs = true
      message.delROs = 'delROs não é um booleano'
    }

    if (bodyNotHasProps('updateRos') || typeof bodyData.updateRos !== 'boolean') {
      errors = true
      field.updateRos = true
      message.updateRos = 'updateRos não é um booleano'
    }

    if (notHasProps('responsibleUser')) {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = 'username não está sendo passado.'
    } else if (bodyData.responsibleUser) {
      const { responsibleUser } = bodyData

      const user = await User.findOne({
        where: { username: responsibleUser },
        transaction,
      })

      if (!user && bodyData.responsibleUser !== 'modrp') {
        errors = true
        field.responsibleUser = true
        message.responsibleUser = 'username inválido.'
      }
    } else {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = 'username não pode ser nulo.'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const resources = {
      addCompany: bodyData.addCompany,
      addPart: bodyData.addPart,
      addAnalyze: bodyData.addAnalyze,
      addEquip: bodyData.addEquip,
      addEntry: bodyData.addEntry,
      addEquipType: bodyData.addEquipType,
      tecnico: bodyData.tecnico,
      addAccessories: bodyData.addAccessories,
      addUser: bodyData.addUser,
      addTypeAccount: bodyData.addTypeAccount,
      addTec: bodyData.addTec,
      addCar: bodyData.addCar,
      addMark: bodyData.addMark,
      addType: bodyData.addType,
      addProd: bodyData.addProd,
      addFonr: bodyData.addFonr,
      addEntr: bodyData.addEntr,
      addKit: bodyData.addKit,
      addKitOut: bodyData.addKitOut,
      addOutPut: bodyData.addOutPut,
      addROs: bodyData.addROs,
      addRML: bodyData.addRML,
      gerROs: bodyData.gerROs,
      delROs: bodyData.delROs,
      updateRos: bodyData.updateRos,
    }

    if (userNotFormatted.customized) {
      const resourcesRenorned = await Resources.create(resources)

      userNotFormatted.resourceId = resourcesRenorned.id
    }

    const formatBody = R.evolve({
      username: R.pipe(
        R.toLower(),
        R.trim(),
      ),
    })

    const user = formatBody(userNotFormatted)

    const password = R.prop('username', user)

    const userFormatted = {
      ...user,
      login: {
        password,
      },
    }

    // if (user) {
    //   userFormatted.userId = user.id
    // }

    // console.log(userFormatted)

    const userCreated = await User.create(userFormatted, {
      include: [Login],
      transaction,
    })

    let userReturned = null

    if (userNotFormatted.customized) {
      userReturned = await User.findByPk(userCreated.id, {
        attributes: { exclude: ['loginId'] },
        include: [
          { model: TypeAccount },
          { model: Resources },
        ],
      })
    } else {
      userReturned = await User.findByPk(userCreated.id, {
        attributes: { exclude: ['loginId'] },
        include: [{
          model: TypeAccount,
          include: [{
            model: Resources,
          }],
        }],
      })
    }

    return userReturned
  }

  // eslint-disable-next-line camelcase
  async user_PasswordUpdate(bodyData, options = {}) {
    const { transaction = null } = options

    const hasUsername = R.has('username', bodyData)

    const hasOldPassword = R.has('oldPassword', bodyData)

    const hasNewPassword = R.has('newPassword', bodyData)

    if (!hasUsername || !bodyData.username) {
      throw new FieldValidationError([{
        name: 'username',
        message: 'username cannot to be null',
      }])
    }

    if (!hasOldPassword || !bodyData.oldPassword) {
      throw new FieldValidationError([{
        name: 'oldPassword',
        message: 'oldPassword cannot to be null',
      }])
    }

    if (!hasNewPassword || !bodyData.newPassword) {
      throw new FieldValidationError([{
        name: 'newPassword',
        message: 'newPassword cannot to be null',
      }])
    }

    const getBody = R.applySpec({
      username: R.prop('username'),
      oldPassword: R.prop('oldPassword'),
      newPassword: R.prop('newPassword'),
    })

    const body = getBody(bodyData)

    const login = await Login.findOne({
      include: [{
        model: User,
        where: { username: body.username },
      }],
      transaction,
    })

    if (!login) {
      throw new UnauthorizedError()
    }

    const checkPwd = await login.checkPassword(body.oldPassword)

    if (!checkPwd) {
      throw new UnauthorizedError()
    }

    if (checkPwd) {
      await login.update({
        password: body.newPassword,
      })
      const loginUpdated = await Login.findOne({
        include: [{
          model: User,
          where: { username: body.username },
        }],
        transaction,
      })
      return loginUpdated
    }
    throw new UnauthorizedError()
  }

  // eslint-disable-next-line camelcase
  async user_UpdateById(id, bodyData, options = {}) {
    const { transaction = null } = options

    let newUser = {}

    const user = R.omit(['id', 'username'], bodyData)

    const hasName = R.has('name', user)

    const hasEmail = R.has('email', user)

    if (hasEmail) {
      newUser = {
        ...newUser,
        email: R.prop('email', user),
      }

      if (!user.email) {
        throw new FieldValidationError([{
          name: 'email',
          message: 'email cannot be null',
        }])
      }

      const email = await User.findOne({
        where: {
          email: user.email,
        },
        transaction,
      })

      if (email) {
        throw new FieldValidationError([{
          field: 'email',
          message: 'email already exist',
        }])
      }
    }

    if (hasName) {
      newUser = {
        ...newUser,
        name: R.prop('name', user),
      }

      if (!user.name) {
        throw new FieldValidationError([{
          name: 'name',
          message: 'name cannot be null',
        }])
      }
    }

    const userInstance = await User.findByPk(id, {
      transaction,
    })

    await userInstance.update(newUser)

    const userUpdated = await User.findByPk(id, {
      transaction,
    })

    return userUpdated
  }

  // eslint-disable-next-line camelcase
  async user_CheckPassword(id, password, options = {}) {
    const { transaction = null } = options

    const login = await Login.findOne({
      include: [{
        model: User,
        where: { id },
      }],
      transaction,
    })

    if (!login) {
      throw new UnauthorizedError()
    }

    return login.checkPassword(password)
  }

  async getResourceByUsername(username, options = {}) {
    const { transaction = null } = options

    const user = await User.findOne({
      where: { username },
      transaction,
    })

    let userResources = null
    let response = null

    const { customized } = user

    if (customized) {
      userResources = await User.findByPk(user.id, {
        include: [{
          model: Resources,
        }],
        transaction,
      })

      response = {
        addCompany: userResources.resource.addCompany,
        addPart: userResources.resource.addPart,
        addAnalyze: userResources.resource.addAnalyze,
        addEquip: userResources.resource.addEquip,
        addEntry: userResources.resource.addEntry,
        addEquipType: userResources.resource.addEquipType,
        tecnico: userResources.resource.tecnico,
        addAccessories: userResources.resource.addAccessories,
        addUser: userResources.resource.addUser,
        addTypeAccount: userResources.resource.addTypeAccount,
        addTec: userResources.resource.addTec,
        addCar: userResources.resource.addCar,
        addMark: userResources.resource.addMark,
        addType: userResources.resource.addType,
        addProd: userResources.resource.addProd,
        addFonr: userResources.resource.addFonr,
        addEntr: userResources.resource.addEntr,
        addKit: userResources.resource.addKit,
        addKitOut: userResources.resource.addKitOut,
        addOutPut: userResources.resource.addOutPut,
        addROs: userResources.resource.addROs,
        addRML: userResources.resource.addRML,
        gerROs: userResources.resource.gerROs,
        delROs: userResources.resource.delROs,
        updateRos: userResources.resource.updateRos,
      }
    } else {
      userResources = await User.findByPk(user.id, {
        include: [{
          model: TypeAccount,
          include: [{
            model: Resources,
          }],
        }],
        transaction,
      })

      response = {
        addCompany: userResources.typeAccount.resource.addCompany,
        addPart: userResources.typeAccount.resource.addPart,
        addAnalyze: userResources.typeAccount.resource.addAnalyze,
        addEquip: userResources.typeAccount.resource.addEquip,
        addEntry: userResources.typeAccount.resource.addEntry,
        addEquipType: userResources.typeAccount.resource.addEquipType,
        tecnico: userResources.typeAccount.resource.tecnico,
        addAccessories: userResources.typeAccount.resource.addAccessories,
        addUser: userResources.typeAccount.resource.addUser,
        addTypeAccount: userResources.typeAccount.resource.addTypeAccount,
        addTec: userResources.typeAccount.resource.addTec,
        addCar: userResources.typeAccount.resource.addCar,
        addMark: userResources.typeAccount.resource.addMark,
        addType: userResources.typeAccount.resource.addType,
        addProd: userResources.typeAccount.resource.addProd,
        addFonr: userResources.typeAccount.resource.addFonr,
        addEntr: userResources.typeAccount.resource.addEntr,
        addKit: userResources.typeAccount.resource.addKit,
        addKitOut: userResources.typeAccount.resource.addKitOut,
        addOutPut: userResources.typeAccount.resource.addOutPut,
        addROs: userResources.typeAccount.resource.addROs,
        addRML: userResources.typeAccount.resource.addRML,
        gerROs: userResources.typeAccount.resource.gerROs,
        delROs: userResources.typeAccount.resource.delROs,
        updateRos: userResources.typeAccount.resource.updateRos,
      }
    }

    return response
  }

  // eslint-disable-next-line camelcase
  async user_Update(bodyData, options = {}) {
    const { transaction = null } = options

    const omitArray = ['id', 'username', 'password', 'addCompany', 'addPart', 'addAnalyze', 'addEquip', 'addEntry', 'addEquipType',
      'tecnico', 'addAccessories', 'addUser', 'addTypeAccount', 'addTec', 'addCar', 'addMark', 'addType',
      'addProd', 'addFonr', 'addEntr', 'addKit', 'addKitOut', 'addOutPut', 'addROs', 'addRML', 'gerROs', 'delROs', 'updateRos']

    const userNotFormatted = R.omit(omitArray, bodyData)

    const oldUser = await User.findByPk(bodyData.id, {
      include: [{
        model: Resources,
      }],
      transaction,
    })

    const notHasProps = props => R.not(R.has(props, userNotFormatted))
    const bodyNotHasProps = props => R.not(R.has(props, bodyData))

    if (notHasProps('typeName')) {
      throw new FieldValidationError([{
        field: 'typeName',
        message: 'typeName undefined',
      }])
    }

    const { typeName } = userNotFormatted

    const typeAccountRetorned = await TypeAccount.findOne({
      where: { typeName },
      include: [{
        model: Resources,
      }],
      transaction,
    })

    if (!typeAccountRetorned) {
      throw new FieldValidationError([{
        field: 'typeName',
        message: 'typeName invalid',
      }])
    }

    userNotFormatted.typeAccountId = typeAccountRetorned.id

    if (notHasProps('customized')) {
      throw new FieldValidationError([{
        field: 'customized',
        message: 'customized undefined',
      }])
    }

    const field = {
      typeName: false,
      addCompany: false,
      addPart: false,
      addAnalyze: false,
      addEquip: false,
      addEntry: false,
      responsibleUser: false,

      addTec: false,
      addCar: false,
      addMark: false,
      addType: false,
      addProd: false,
      addFonr: false,
      addEntr: false,
      addKit: false,
      addKitOut: false,
      addOutPut: false,
      addROs: false,
      addRML: false,
      gerROs: false,
      delROs: false,
      updateRos: false,
    }
    const message = {
      typeName: '',
      addCompany: '',
      addPart: '',
      addAnalyze: '',
      addEquip: '',
      addEntry: '',
      responsibleUser: '',

      addTec: '',
      addCar: '',
      addMark: '',
      addType: '',
      addProd: '',
      addFonr: '',
      addEntr: '',
      addKit: '',
      addKitOut: '',
      addOutPut: '',
      addROs: '',
      addRML: '',
      gerROs: '',
      delROs: '',
      updateRos: '',
    }

    let errors = null

    if (bodyNotHasProps('addCompany') || typeof bodyData.addCompany !== 'boolean') {
      errors = true
      field.addCompany = true
      message.addCompany = 'addCompany não é um booleano'
    }

    if (bodyNotHasProps('addPart') || typeof bodyData.addPart !== 'boolean') {
      errors = true
      field.addPart = true
      message.addPart = 'addPart não é um booleano'
    }


    if (bodyNotHasProps('addAnalyze') || typeof bodyData.addAnalyze !== 'boolean') {
      errors = true
      field.addAnalyze = true
      message.addAnalyze = 'addAnalyze não é um booleano'
    }


    if (bodyNotHasProps('addEquip') || typeof bodyData.addEquip !== 'boolean') {
      errors = true
      field.addEquip = true
      message.addEquip = 'addEquip não é um booleano'
    }


    if (bodyNotHasProps('addEntry') || typeof bodyData.addEntry !== 'boolean') {
      errors = true
      field.addEntry = true
      message.addEntry = 'addEntry não é um booleano'
    }

    if (bodyNotHasProps('addEquipType') || typeof bodyData.addEquipType !== 'boolean') {
      errors = true
      field.addEquipType = true
      message.addEquipType = 'addEquipType não é um booleano'
    }

    if (bodyNotHasProps('tecnico') || typeof bodyData.tecnico !== 'boolean') {
      errors = true
      field.tecnico = true
      message.tecnico = 'tecnico não é um booleano'
    }

    if (bodyNotHasProps('addAccessories') || typeof bodyData.addAccessories !== 'boolean') {
      errors = true
      field.addAccessories = true
      message.addAccessories = 'addAccessories não é um booleano'
    }

    if (bodyNotHasProps('addUser') || typeof bodyData.addUser !== 'boolean') {
      errors = true
      field.addUser = true
      message.addUser = 'addUser não é um booleano'
    }

    if (bodyNotHasProps('addTypeAccount') || typeof bodyData.addTypeAccount !== 'boolean') {
      errors = true
      field.addTypeAccount = true
      message.addTypeAccount = 'addTypeAccount não é um booleano'
    }

    if (bodyNotHasProps('addTec') || typeof bodyData.addTec !== 'boolean') {
      errors = true
      field.addTec = true
      message.addTec = 'addTec não é um booleano'
    }

    if (bodyNotHasProps('addCar') || typeof bodyData.addCar !== 'boolean') {
      errors = true
      field.addCar = true
      message.addCar = 'addCar não é um booleano'
    }

    if (bodyNotHasProps('addMark') || typeof bodyData.addMark !== 'boolean') {
      errors = true
      field.addMark = true
      message.addMark = 'addMark não é um booleano'
    }

    if (bodyNotHasProps('addType') || typeof bodyData.addType !== 'boolean') {
      errors = true
      field.addType = true
      message.addType = 'addType não é um booleano'
    }

    if (bodyNotHasProps('addProd') || typeof bodyData.addProd !== 'boolean') {
      errors = true
      field.addProd = true
      message.addProd = 'addProd não é um booleano'
    }

    if (bodyNotHasProps('addFonr') || typeof bodyData.addFonr !== 'boolean') {
      errors = true
      field.addFonr = true
      message.addFonr = 'addFonr não é um booleano'
    }

    if (bodyNotHasProps('addEntr') || typeof bodyData.addEntr !== 'boolean') {
      errors = true
      field.addEntr = true
      message.addEntr = 'addEntr não é um booleano'
    }

    if (bodyNotHasProps('addKit') || typeof bodyData.addKit !== 'boolean') {
      errors = true
      field.addKit = true
      message.addKit = 'addKit não é um booleano'
    }

    if (bodyNotHasProps('addKitOut') || typeof bodyData.addKitOut !== 'boolean') {
      errors = true
      field.addKitOut = true
      message.addKitOut = 'addKitOut não é um booleano'
    }

    if (bodyNotHasProps('addOutPut') || typeof bodyData.addOutPut !== 'boolean') {
      errors = true
      field.addOutPut = true
      message.addOutPut = 'addOutPut não é um booleano'
    }

    if (bodyNotHasProps('addROs') || typeof bodyData.addROs !== 'boolean') {
      errors = true
      field.addROs = true
      message.addROs = 'addROs não é um booleano'
    }

    if (bodyNotHasProps('addRML') || typeof bodyData.addRML !== 'boolean') {
      errors = true
      field.addRML = true
      message.addRML = 'addRML não é um booleano'
    }
    if (bodyNotHasProps('gerROs') || typeof bodyData.gerROs !== 'boolean') {
      errors = true
      field.gerROs = true
      message.gerROs = 'gerROs não é um booleano'
    }

    if (bodyNotHasProps('delROs') || typeof bodyData.delROs !== 'boolean') {
      errors = true
      field.delROs = true
      message.delROs = 'delROs não é um booleano'
    }

    if (bodyNotHasProps('updateRos') || typeof bodyData.updateRos !== 'boolean') {
      errors = true
      field.updateRos = true
      message.updateRos = 'updateRos não é um booleano'
    }

    if (notHasProps('responsibleUser')) {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = 'username não está sendo passado.'
    } else if (bodyData.responsibleUser) {
      const { responsibleUser } = bodyData

      const user = await User.findOne({
        where: { username: responsibleUser },
        transaction,
      })

      if (!user && bodyData.responsibleUser !== 'modrp') {
        errors = true
        field.responsibleUser = true
        message.responsibleUser = 'username inválido.'
      }
    } else {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = 'username não pode ser nulo.'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const resources = {
      addCompany: bodyData.addCompany,
      addPart: bodyData.addPart,
      addAnalyze: bodyData.addAnalyze,
      addEquip: bodyData.addEquip,
      addEntry: bodyData.addEntry,
      addEquipType: bodyData.addEquipType,
      tecnico: bodyData.tecnico,
      addAccessories: bodyData.addAccessories,
      addUser: bodyData.addUser,
      addTypeAccount: bodyData.addTypeAccount,
      addTec: bodyData.addTec,
      addCar: bodyData.addCar,
      addMark: bodyData.addMark,
      addType: bodyData.addType,
      addProd: bodyData.addProd,
      addFonr: bodyData.addFonr,
      addEntr: bodyData.addEntr,
      addKit: bodyData.addKit,
      addKitOut: bodyData.addKitOut,
      addOutPut: bodyData.addOutPut,
      addROs: bodyData.addROs,
      addRML: bodyData.addRML,
      gerROs: bodyData.gerROs,
      delROs: bodyData.delROs,
      updateRos: bodyData.updateRos,
    }

    if (userNotFormatted.customized) {
      if (oldUser.customized) {
        const resourceUpdate = {
          ...oldUser.resource,
          ...resources,
        }
        const resourcesRenorned = await oldUser.resource.update(resourceUpdate, { transaction })

        userNotFormatted.resourceId = resourcesRenorned.id
      } else {
        const resourcesRenorned = await Resources.create(resources, { transaction })

        userNotFormatted.resourceId = resourcesRenorned.id
      }
    } else if (oldUser.customized) {
      await oldUser.resource.destroy({ force: true, transaction })
    }

    const newUser = {
      ...oldUser,
      ...userNotFormatted,
    }

    await oldUser.update(newUser, { transaction })

    // if (user) {
    //   userFormatted.userId = user.id
    // }

    // console.log(userFormatted)


    let userReturned = null

    if (userNotFormatted.customized) {
      userReturned = await User.findByPk(bodyData.id, {
        attributes: { exclude: ['loginId'] },
        include: [
          { model: TypeAccount },
          { model: Resources },
        ],
      })
    } else {
      userReturned = await User.findByPk(bodyData.id, {
        attributes: { exclude: ['loginId'] },
        include: [{
          model: TypeAccount,
          include: [{
            model: Resources,
          }],
        }],
      })
    }

    return userReturned
  }

  // async findUsernameByPK(userId, options = {}) {
  //   const { transaction = null } = options

  //   const user = await User.findByPk(userId, { transaction })

  //   if (!user) {
  //     throw new FieldValidationError([{
  //       name: 'userId',
  //       message: 'userId invalid',
  //     }])
  //   }

  //   return user.username
  // }

  async getAll(options = {}) {
    const inicialOrder = {
      field: 'username',
      acendent: false,
      direction: 'DESC',
    }

    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)
    const newOrder = (query && query.order) ? query.order : inicialOrder

    if (newOrder.acendent) {
      newOrder.direction = 'DESC'
    } else {
      newOrder.direction = 'ASC'
    }

    const {
      getWhere,
      limit,
      offset,
      pageResponse,
    } = formatQuery(newQuery)

    const users = await User.findAndCountAll({
      where: {
        ...getWhere('user'),
        username: { [operators.ne]: 'modrp' },
      },
      include:
      [
        {
          model: TypeAccount,
          where: getWhere('typeAccount'),
          include: { model: Resources },
        },
        { model: Resources },
      ],
      order: [
        [newOrder.field, newOrder.direction],
      ],
      limit,
      offset,
      transaction,
    })

    const { rows } = users

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: users.count,
        rows: [],
      }
    }

    const formatData = R.map((user) => {
      const resp = {
        id: user.id,
        username: user.username,
        customized: user.customized,
        typeName: user.typeAccount.typeName,
        resource: user.customized ? user.resource : user.typeAccount.resource,
      }
      return resp
    })

    const usersList = formatData(rows)

    let show = limit
    if (users.count < show) {
      show = users.count
    }


    const response = {
      page: pageResponse,
      show,
      count: users.count,
      rows: usersList,
    }
    return response
  }
}

module.exports = UserDomain
