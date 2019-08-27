const R = require('ramda')

const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const TypeAccount = database.model('typeAccount')
const Resources = database.model('resources')
const User = database.model('user')

module.exports = class TypeAccountDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const typeAccount = R.omit([
      'id',
      'addCompany',
      'addPart',
      'addAnalyze',
      'addEquip',
      'addEntry',
    ], bodyData)

    const resources = R.omit([
      'id',
      'typeName',
    ], bodyData)

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
    }
    const message = {
      typeName: '',
      addCompany: '',
      addPart: '',
      addAnalyze: '',
      addEquip: '',
      addEntry: '',
      responsibleUser: '',
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

    const { transaction = null } = options

    const typeAccounts = await TypeAccount.findAndCountAll({
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

  async getResourcesByTypeAccount(typeName, options = {}) {
    const { transaction = null } = options

    const typeAccount = await TypeAccount.findOne({
      where: {
        typeName,
      },
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
    }

    return response
  }
}
