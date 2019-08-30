const R = require('ramda')

// const formatQuery = require('../../../../helpers/lazyLoad')
const database = require('../../../../../database')

const { FieldValidationError } = require('../../../../../helpers/errors')

const EquipType = database.model('equipType')
// const EquipMark = database.model('mark')
// const EquipModel = database.model('equipModel')
const User = database.model('user')

module.exports = class EquipModelDomain {
  async addType(bodyData, options = {}) {
    const { transaction = null } = options

    const equipType = R.omit(['id'], bodyData)

    const equipTypeNotHasProp = prop => R.not(R.has(prop, bodyData))

    const field = {
      type: false,
      responsibleUser: false,
    }
    const message = {
      type: '',
      responsibleUser: '',
    }

    let errors = false

    // const equipTypeHasExist = await EquipType.findOne({
    //   where: { type: equipType.type },
    // })

    // if (equipTypeHasExist) return equipTypeHasExist

    if (equipTypeNotHasProp('type') || !equipType.type) {
      errors = true
      field.type = true
      message.type = 'Por favor informar o "tipo de equipamento".'
    } else {
      const typeHasExist = await EquipType.findOne({
        where: { type: equipType.type },
      })

      if (typeHasExist) {
        errors = true
        field.type = true
        message.type = 'esse tipo de equipamento já esta cadastrado.'
      }
    }

    if (equipTypeNotHasProp('responsibleUser')) {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = 'username não está sendo passado.'
    } else if (bodyData.responsibleUser) {
      const { responsibleUser } = bodyData

      const user = await User.findOne({
        where: { username: responsibleUser },
        transaction,
      })

      if (!user) {
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

    const typeCreated = await EquipType.create(equipType, { transaction })

    const response = await EquipType.findByPk(typeCreated.id, {
      transaction,
    })

    return response
  }

  async getAllType(options = {}) {
    const { transaction = null } = options

    const equipTypes = await EquipType.findAll({
      attributes: ['type'],
      order: [
        ['type', 'ASC'],
      ],
      transaction,
    })

    if (equipTypes.length === 0) return []

    return equipTypes
  }


  // async addModel(bodyData, options = {}) {
  //   const { transaction = null } = options

  //   const equipModel = R.omit(['id'], bodyData)

  //   const equipModelNotHasProp = prop => R.not(R.has(prop, bodyData))

  //   const field = {
  //     equipTypeId: false,
  //     item: false,
  //     description: false,
  //     serial: true,
  //     responsibleUser: false,
  //   }
  //   const message = {
  //     equipTypeId: '',
  //     item: '',
  //     description: '',
  //     serial: '',
  //     responsibleUser: '',
  //   }

  //   let errors = false


  //   if (equipModelNotHasProp('equipTypeId') || !equipModel.equipTypeId) {
  //     errors = true
  //     field.equipTypeId = true
  //     message.equipTypeId = 'Por favor informar a marca do equipamento.'
  //   } else {
  //    const equipModelHasExist = await EquipType.findByPk(equipModel.equipTypeId, { transaction })

  //     if (!equipModelHasExist) {
  //       errors = true
  //       field.equipTypeId = true
  //       message.equipTypeId = 'este tipo de equipamento não consta em nosso sistema.'
  //     }
  //   }

  //   if (equipModelNotHasProp('name') || !equipModel.name) {
  //     errors = true
  //     field.item = true
  //     message.item = 'Por favor informar o modelo do equipamento.'
  //   }

  //   if (equipModelNotHasProp('responsibleUser')) {
  //     errors = true
  //     field.responsibleUser = true
  //     message.responsibleUser = 'username não está sendo passado.'
  //   } else if (bodyData.responsibleUser) {
  //     const { responsibleUser } = bodyData

  //     const user = await User.findOne({
  //       where: { username: responsibleUser },
  //       transaction,
  //     })

  //     if (!user) {
  //       errors = true
  //       field.responsibleUser = true
  //       message.responsibleUser = 'username inválido.'
  //     }
  //   } else {
  //     errors = true
  //     field.responsibleUser = true
  //     message.responsibleUser = 'username não pode ser nulo.'
  //   }

  //   if (equipModelNotHasProp('serial') || typeof equipModel.serial !== 'boolean') {
  //     errors = true
  //     field.serial = true
  //     message.serial = 'Necessário informar se tem numero de serie.'
  //   }

  //   if (errors) {
  //     throw new FieldValidationError([{ field, message }])
  //   }

  //   const equipModelCreated = await EquipModel.create(equipModel, { transaction })

  //   const response = await EquipModel.findByPk(equipModelCreated.id, {
  //     include: [{
  //       model: EquipType,
  //     }],
  //     transaction,
  //   })

  //   return response
  // }

  // async getAll(options = {}) {
  //   const inicialOrder = {
  //     field: 'createdAt',
  //     acendent: true,
  //     direction: 'DESC',
  //   }

  //   const { query = null, order = null, transaction = null } = options

  //   const newQuery = Object.assign({}, query)
  //   const newOrder = Object.assign(inicialOrder, order)

  //   if (newOrder.acendent) {
  //     newOrder.direction = 'DESC'
  //   } else {
  //     newOrder.direction = 'ASC'
  //   }

  //   const {
  //     getWhere,
  //     limit,
  //     offset,
  //     pageResponse,
  //   } = formatQuery(newQuery)

  //   const equipModels = await EquipModel.findAndCountAll({
  //     where: getWhere('equipModel'),
  //     include: [{
  //       model: EquipMark,
  //       include: [{
  //         model: EquipType,
  //       }],
  //     }],
  //     order: [
  //       [newOrder.field, newOrder.direction],
  //     ],
  //     limit,
  //     offset,
  //     transaction,
  //   })

  //   const { rows } = equipModels

  //   if (rows.length === 0) {
  //     return {
  //       page: null,
  //       show: 0,
  //       count: equipModels.count,
  //       rows: [],
  //     }
  //   }

  //   const formatData = R.map((equip) => {
  //     const resp = {
  //       type: equip.equipMark.equipType.type,
  //       mark: equip.equipMark.mark,
  //       model: equip.model,
  //       description: equip.description,
  //     }
  //     return resp
  //   })

  //   const equipModelsList = formatData(rows)


  //   const response = {
  //     page: pageResponse,
  //     show: limit,
  //     count: equipModels.count,
  //     rows: equipModelsList,
  //   }
  //   return response
  // }

  // async getAllMarkByType(type, options = {}) {
  //   const { transaction = null } = options

  //   const arrayMarks = await EquipMark.findAll({
  //     include: [{
  //       model: EquipType,
  //       where: { type },
  //     }],
  //     transaction,
  //   })

  //   const response = arrayMarks.map(item => ({ mark: item.mark, id: item.id }))

  //   return response
  // }

  // async getAllModelByMark(bodyData, options = {}) {
  //   const { transaction = null } = options

  //   const { mark } = bodyData
  //   const { type } = bodyData

  //   const arrayModel = await EquipModel.findAll({
  //     include: [{
  //       model: EquipMark,
  //       where: { mark },
  //       include: [{
  //         model: EquipType,
  //         where: { type },
  //       }],
  //     }],
  //     transaction,
  //   })

  //   const response = arrayModel.map(item => ({
  //     model: item.model,
  //     id: item.id,
  //   }))
  //   return response
  // }
}
