const R = require('ramda')
const Sequelize = require('sequelize')

const database = require('../../../../database')

const formatQuery = require('../../../../helpers/lazyLoad')
const { FieldValidationError } = require('../../../../helpers/errors')

const TypeAccount = database.model('typeAccount')
const Resources = database.model('resources')
const User = database.model('user')

const { Op: operators } = Sequelize

module.exports = class TypeAccountDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const typeAccount = R.omit([
      'id', 'addCompany', 'addPart', 'addAnalyze', 'addEquip', 'addEntry', 'addEquipType', 'tecnico', 'addAccessories',
      'addEntr', 'addKit', 'addKitOut', 'addOutPut', 'addROs', 'addRML', 'gerROs', 'delROs', 'updateRos',
    ], bodyData)

    const resources = R.omit(['id', 'typeName', 'stock', 'labTec'], bodyData)

    const typeAccountNotHasProp = prop => R.not(R.has(prop, typeAccount))
    const resourcesNotHasProp = prop => R.not(R.has(prop, resources))

    const field = {
      typeName: false,
      addCompany: false,
      addPart: false,
      addAnalyze: false,
      addEquip: false,
      addEntry: false,
      responsibleUser: false,
      stock: false,
      labTec: false,
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
      stock: '',
      labTec: '',
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

    let errors = false

    if (typeAccountNotHasProp('typeName') || !typeAccount.typeName) {
      errors = true
      field.typeName = true
      message.typeName = 'Por favor informar o tipo de conta.'
    } else {
      const typeAccountReturned = await TypeAccount.findOne({
        where: { typeName: typeAccount.typeName },
        transaction,
      })

      if (typeAccountReturned) {
        errors = true
        field.typeName = true
        message.typeName = 'Essa tipo de conta já existe em nosso sistema.'
      }
    }

    if (typeAccountNotHasProp('stock') || typeof typeAccount.stock !== 'boolean') {
      errors = true
      field.stock = true
      message.stock = 'stock não é um booleano'
    }

    if (typeAccountNotHasProp('labTec') || typeof typeAccount.labTec !== 'boolean') {
      errors = true
      field.labTec = true
      message.labTec = 'labTec não é um booleano'
    }

    if (resourcesNotHasProp('addCompany') || typeof resources.addCompany !== 'boolean') {
      errors = true
      field.addCompany = true
      message.addCompany = 'addCompany não é um booleano'
    }

    if (resourcesNotHasProp('addPart') || typeof resources.addPart !== 'boolean') {
      errors = true
      field.addPart = true
      message.addPart = 'addPart não é um booleano'
    }


    if (resourcesNotHasProp('addAnalyze') || typeof resources.addAnalyze !== 'boolean') {
      errors = true
      field.addAnalyze = true
      message.addAnalyze = 'addAnalyze não é um booleano'
    }


    if (resourcesNotHasProp('addEquip') || typeof resources.addEquip !== 'boolean') {
      errors = true
      field.addEquip = true
      message.addEquip = 'addEquip não é um booleano'
    }


    if (resourcesNotHasProp('addEntry') || typeof resources.addEntry !== 'boolean') {
      errors = true
      field.addEntry = true
      message.addEntry = 'addEntry não é um booleano'
    }

    if (resourcesNotHasProp('addEquipType') || typeof resources.addEquipType !== 'boolean') {
      errors = true
      field.addEquipType = true
      message.addEquipType = 'addEquipType não é um booleano'
    }

    if (resourcesNotHasProp('tecnico') || typeof resources.tecnico !== 'boolean') {
      errors = true
      field.tecnico = true
      message.tecnico = 'tecnico não é um booleano'
    }

    if (resourcesNotHasProp('addAccessories') || typeof resources.addAccessories !== 'boolean') {
      errors = true
      field.addAccessories = true
      message.addAccessories = 'addAccessories não é um booleano'
    }

    if (resourcesNotHasProp('addUser') || typeof resources.addUser !== 'boolean') {
      errors = true
      field.addUser = true
      message.addUser = 'addUser não é um booleano'
    }

    if (resourcesNotHasProp('addTypeAccount') || typeof resources.addTypeAccount !== 'boolean') {
      errors = true
      field.addTypeAccount = true
      message.addTypeAccount = 'addTypeAccount não é um booleano'
    }

    if (resourcesNotHasProp('addTec') || typeof resources.addTec !== 'boolean') {
      errors = true
      field.addTec = true
      message.addTec = 'addTec não é um booleano'
    }

    if (resourcesNotHasProp('addCar') || typeof resources.addCar !== 'boolean') {
      errors = true
      field.addCar = true
      message.addCar = 'addCar não é um booleano'
    }

    if (resourcesNotHasProp('addMark') || typeof resources.addMark !== 'boolean') {
      errors = true
      field.addMark = true
      message.addMark = 'addMark não é um booleano'
    }

    if (resourcesNotHasProp('addType') || typeof resources.addType !== 'boolean') {
      errors = true
      field.addType = true
      message.addType = 'addType não é um booleano'
    }

    if (resourcesNotHasProp('addProd') || typeof resources.addProd !== 'boolean') {
      errors = true
      field.addProd = true
      message.addProd = 'addProd não é um booleano'
    }

    if (resourcesNotHasProp('addFonr') || typeof resources.addFonr !== 'boolean') {
      errors = true
      field.addFonr = true
      message.addFonr = 'addFonr não é um booleano'
    }

    if (resourcesNotHasProp('addEntr') || typeof resources.addEntr !== 'boolean') {
      errors = true
      field.addEntr = true
      message.addEntr = 'addEntr não é um booleano'
    }

    if (resourcesNotHasProp('addKit') || typeof resources.addKit !== 'boolean') {
      errors = true
      field.addKit = true
      message.addKit = 'addKit não é um booleano'
    }

    if (resourcesNotHasProp('addKitOut') || typeof resources.addKitOut !== 'boolean') {
      errors = true
      field.addKitOut = true
      message.addKitOut = 'addKitOut não é um booleano'
    }

    if (resourcesNotHasProp('addOutPut') || typeof resources.addOutPut !== 'boolean') {
      errors = true
      field.addOutPut = true
      message.addOutPut = 'addOutPut não é um booleano'
    }

    if (resourcesNotHasProp('addROs') || typeof resources.addROs !== 'boolean') {
      errors = true
      field.addROs = true
      message.addROs = 'addROs não é um booleano'
    }

    if (resourcesNotHasProp('addRML') || typeof resources.addRML !== 'boolean') {
      errors = true
      field.addRML = true
      message.addRML = 'addRML não é um booleano'
    }
    if (resourcesNotHasProp('gerROs') || typeof resources.gerROs !== 'boolean') {
      errors = true
      field.gerROs = true
      message.gerROs = 'gerROs não é um booleano'
    }

    if (resourcesNotHasProp('delROs') || typeof resources.delROs !== 'boolean') {
      errors = true
      field.delROs = true
      message.delROs = 'delROs não é um booleano'
    }

    if (resourcesNotHasProp('updateRos') || typeof resources.updateRos !== 'boolean') {
      errors = true
      field.updateRos = true
      message.updateRos = 'updateRos não é um booleano'
    }

    if (typeAccountNotHasProp('responsibleUser')) {
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

    const typeAccountCreated = await TypeAccount.create(typeAccount, { transaction })

    resources.typeAccountId = typeAccountCreated.id

    await Resources.create(resources, { transaction })

    const response = await TypeAccount.findByPk(typeAccountCreated.id, {
      include: [{
        model: Resources,
      }],
      transaction,
    })

    return response
  }

  async getAll(options = {}) {
    const newOrder = {
      field: 'createdAt',
      acendent: true,
      direction: 'ASC',
    }

    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)

    const {
      getWhere,
    } = formatQuery(newQuery)

    const typeAccounts = await TypeAccount.findAndCountAll({
      where: {
        ...getWhere('typeAccount'),
        typeName: { [operators.ne]: 'MOD' },
      },
      include: [{
        model: Resources,
      }],
      order: [
        [newOrder.field, newOrder.direction],
      ],
      transaction,
    })

    const { rows } = typeAccounts

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: typeAccounts.count,
        rows: [],
      }
    }

    const formatData = R.map((comp) => {
      const resp = {
        typeName: comp.typeName,
      }
      return resp
    })

    const companiesList = formatData(rows)

    const response = {
      rows: companiesList,
    }

    return response
  }

  async getResourcesByTypeAccount(options = {}) {
    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)

    const {
      getWhere,
    } = formatQuery(newQuery)

    const typeAccount = await TypeAccount.findOne({
      where: getWhere('typeAccount'),
      include: [{
        model: Resources,
      }],
      transaction,
    })

    const response = {
      typeName: typeAccount.typeName,
      addCompany: typeAccount.resource.addCompany,
      addPart: typeAccount.resource.addPart,
      addAnalyze: typeAccount.resource.addAnalyze,
      addEquip: typeAccount.resource.addEquip,
      addEntry: typeAccount.resource.addEntry,
      addEquipType: typeAccount.resource.addEquipType,
      tecnico: typeAccount.resource.tecnico,
      addAccessories: typeAccount.resource.addAccessories,
      addUser: typeAccount.resource.addUser,
      addTypeAccount: typeAccount.resource.addTypeAccount,
      addTec: typeAccount.resource.addTec,
      addCar: typeAccount.resource.addCar,
      addMark: typeAccount.resource.addMark,
      addType: typeAccount.resource.addType,
      addProd: typeAccount.resource.addProd,
      addFonr: typeAccount.resource.addFonr,
      addEntr: typeAccount.resource.addEntr,
      addKit: typeAccount.resource.addKit,
      addKitOut: typeAccount.resource.addKitOut,
      addOutPut: typeAccount.resource.addOutPut,
      addROs: typeAccount.resource.addROs,
      addRML: typeAccount.resource.addRML,
      gerROs: typeAccount.resource.gerROs,
      delROs: typeAccount.resource.delROs,
      updateRos: typeAccount.resource.updateRos,
    }

    return response
  }
}
