const R = require('ramda')
// const moment = require('moment')

// const formatQuery = require('../../../../helpers/lazyLoad')
const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const EquipModel = database.model('equipModel')
// const EquipMark = database.model('equipMark')
// const EquipType = database.model('equipType')
const Part = database.model('part')
const User = database.model('user')


module.exports = class PartDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const part = R.omit(['id', 'equipModels'], bodyData)

    const partNotHasProp = prop => R.not(R.has(prop, part))
    const partHasProp = prop => R.has(prop, part)

    const field = {
      item: false,
      responsibleUser: false,
    }
    const message = {
      item: '',
      responsibleUser: '',
    }

    let errors = false

    if (partNotHasProp('name') || !part.name) {
      errors = true
      field.item = true
      message.item = 'Informe o nome.'

      const partReturned = await Part.findOne({
        where: {
          name: part.name,
        },
        transaction,
      })

      if (partReturned) {
        errors = true
        field.item = true
        message.item = 'Peça já existe.'
      }
    }

    if (partHasProp('description') && partHasProp('name')) {
      const partReturned = await Part.findOne({
        where: {
          name: part.name,
          description: part.description,
        },
        transaction,
      })

      if (partReturned) {
        errors = true
        field.item = true
        message.item = 'Peça já existe.'
      }
    }

    if (partNotHasProp('responsibleUser')) {
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

    const partCreated = await Part.create(part, { transaction })

    if (R.has('equipModels', bodyData) && bodyData.equipModels) {
      const { equipModels } = bodyData

      const equipModelsIds = equipModels.map(item => item.id)

      await partCreated.addEquipModels(equipModelsIds, { transaction })
    }


    const response = await Part.findByPk(partCreated.id, {
      include: [
        {
          model: EquipModel,
        },
      ],
      transaction,
    })

    return response
  }

  // async updateByCostPrince(partId, options = {}) {
  //   const { transaction, newCostPrince } = options

  //   const partUpdating = await Part.findByPk(partId, { transaction })

  //   const newCostPrinceFormatted = newCostPrince.replace(/\D/g, '')

  //   const partUpdated = {
  //     ...partUpdating,
  //     costPrice: newCostPrinceFormatted,
  //   }

  //   partUpdating.costPrice = newCostPrince

  //   await partUpdating.update(partUpdated, { transaction })

  //   const response = await Part.findByPk(partId, {
  //     include: [
  //       {
  //         model: EquipModel,
  //       },
  //     ],
  //     transaction,
  //   })

  //   return response
  // }

  // async updateBySalePrice(partId, options = {}) {
  //   const { transaction, newSalePrice } = options

  //   const partUpdating = await Part.findByPk(partId, { transaction })

  //   const newSalePriceFormatted = newSalePrice.replace(/\D/g, '')

  //   const partUpdated = {
  //     ...partUpdating,
  //     salePrice: newSalePriceFormatted,
  //   }

  //   partUpdating.salePrice = newSalePrice

  //   await partUpdating.update(partUpdated, { transaction })

  //   const response = await Part.findByPk(partId, {
  //     include: [
  //       {
  //         model: EquipModel,
  //       },
  //     ],
  //     transaction,
  //   })

  //   return response
  // }

  // async getAllParts(options = {}) {
  //   const inicialOrder = {
  //     field: 'createdAt',
  //     acendent: true,
  //     direction: 'DESC',
  //   }

  //   const { query = null, transaction = null } = options

  //   const newQuery = Object.assign({}, query)
  //   const newOrder = (query && query.order) ? query.order : inicialOrder

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


  //   const parts = await Part.findAndCountAll({
  //     where: getWhere('part'),
  //     include: [{
  //       model: EquipModel,
  //       where: getWhere('equipModel'),
  //       // where: { model: 'Samsung 2.0' },
  //       // include: [{
  //       //   model: EquipMark,
  //       //   // where: getWhere('equipMark'),
  //       //   // where: { mark: 'Samsung' },
  //       //   include: [{
  //       //     model: EquipType,
  //       //     // where: { type: 'catraca' },
  //       //     // where: getWhere('equipType'),
  //       //   }],
  //       // }],
  //     }],
  //     order: [
  //       [newOrder.field, newOrder.direction],
  //     ],
  //     limit,
  //     offset,
  //     transaction,
  //   })

  //   const { rows } = parts

  //   if (rows.length === 0) {
  //     return {
  //       page: null,
  //       show: 0,
  //       count: parts.count,
  //       rows: [],
  //     }
  //   }

  //   const formatDateFunct = (date) => {
  //     moment.locale('pt-br')
  //     const formatDate = moment(date).format('L')
  //     const formatHours = moment(date).format('LT')
  //     const dateformated = `${formatDate} ${formatHours}`
  //     return dateformated
  //   }

  //   const formatData = R.map((comp) => {
  //     const resp = {
  //       id: comp.id,
  //       item: comp.item,
  //       description: comp.description,
  //       costPrice: comp.costPrice,
  //       salePrice: comp.salePrice,
  //       equipModels: comp.equipModels,
  //       createdAt: formatDateFunct(comp.createdAt),
  //       updatedAt: formatDateFunct(comp.updatedAt),
  //     }
  //     return resp
  //   })

  //   const partsList = formatData(rows)

  //   let show = limit
  //   if (parts.count < show) {
  //     show = parts.count
  //   }

  //   const response = {
  //     page: pageResponse,
  //     show,
  //     count: parts.count,
  //     rows: partsList,
  //   }
  //   return response
  // }
}
