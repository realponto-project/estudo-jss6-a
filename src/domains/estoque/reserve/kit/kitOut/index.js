/* eslint-disable max-len */
const R = require('ramda')
// const moment = require('moment')
// const axios = require('axios')

// const formatQuery = require('../../../../helpers/lazyLoad')
const database = require('../../../../../database')

const { FieldValidationError } = require('../../../../../helpers/errors')

const KitOut = database.model('kitOut')
const Technician = database.model('technician')
const KitPartsOut = database.model('kitPartsOut')
const Product = database.model('product')
const StockBase = database.model('stockBase')
const ProductBase = database.model('productBase')

module.exports = class KitOutDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))
    const bodyHasProp = prop => R.has(prop, bodyData)

    const field = {
      technicianId: false,
      kitPartsOut: false,
    }
    const message = {
      technicianId: false,
      kitPartsOut: false,
    }


    let errors = false

    if (bodyDataNotHasProp('technicianId') || !bodyData.technicianId) {
      errors = true
      field.technicianId = true
      message.technicianId = 'Por favor o ID do tecnico'
    } else {
      const { technicianId } = bodyData
      const technicianExist = await Technician.findByPk(technicianId, { transaction })

      if (!technicianExist) {
        errors = true
        field.technicianId = true
        message.technicianId = 'Técnico não encomtrado'
      }
    }

    if (bodyDataNotHasProp('kitPartsOut') || !bodyData.kitPartsOut) {
      errors = true
      field.kitPartsOut = true
      message.kitPartsOut = 'Ao menos uma peça deve ser associada.'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }


    const kitOutCreated = await KitOut.create({ technicianId: bodyData.technicianId }, { transaction })

    if (bodyHasProp('kitPartsOut')) {
      const { kitPartsOut } = bodyData

      const kitPartsOutCreattedPromises = kitPartsOut.map(async (item) => {
        const kitPartsOutCreatted = {
          ...item,
          kitOutId: kitOutCreated.id,
        }

        await KitPartsOut.create(kitPartsOutCreatted, { transaction })

        const stockBase = await StockBase.findOne({
          where: { stockBase: item.stockBase },
          transaction,
        })

        const productBase = await ProductBase.findOne({
          where: {
            productId: item.productId,
            stockBaseId: stockBase.id,
          },
        })

        const productBaseUpdate = {
          ...productBase,
          available: (parseInt(productBase.available, 10) - parseInt(item.amount, 10)).toString(),
          reserved: (parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)).toString(),
        }

        await productBase.update(productBaseUpdate, { transaction })
      })
      await Promise.all(kitPartsOutCreattedPromises)
    }

    const response = await KitOut.findByPk(kitOutCreated.id, {
      include: [{
        model: Product,
      }],
      transaction,
    })

    return response
  }

  // async getAll(options = {}) {
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

  //   console.log('rows')


  //   const kits = await Kit.findAndCountAll({
  //     where: getWhere('kit'),
  //     include: [
  //       {
  //         model: Technician,
  //       },
  //       {
  //         model: Product,
  //       },
  //     ],
  //     order: [
  //       [newOrder.field, newOrder.direction],
  //     ],
  //     limit,
  //     offset,
  //     transaction,
  //   })

  //   const { rows } = kits

  //   console.log(JSON.parse(JSON.stringify(rows[0].products)))

  //   if (rows.length === 0) {
  //     return {
  //       page: null,
  //       show: 0,
  //       count: kits.count,
  //       rows: [],
  //     }
  //   }

  //   // const formatDateFunct = (date) => {
  //   //   moment.locale('pt-br')
  //   //   const formatDate = moment(date).format('L')
  //   //   const formatHours = moment(date).format('LT')
  //   //   const dateformated = `${formatDate} ${formatHours}`
  //   //   return dateformated
  //   // }

  //   const formatData = R.map((kit) => {
  //     const resp = {
  //       id: kit.id,
  //       // cnpj: kit.cnpj,
  //       // razaoSocial: kit.razaoSocial,
  //       // createdAt: formatDateFunct(kit.createdAt),
  //       // updatedAt: formatDateFunct(kit.updatedAt),
  //       // nameContact: kit.nameContact,
  //       // telphone: kit.telphone,
  //       // street: kit.street,
  //       // number: kit.number,
  //       // city: kit.city,
  //       // state: kit.state,
  //       // neighborhood: kit.neighborhood,
  //     }
  //     return resp
  //   })

  //   const kitsList = formatData(rows)

  //   let show = limit
  //   if (kits.count < show) {
  //     show = kits.count
  //   }


  //   const response = {
  //     page: pageResponse,
  //     show,
  //     count: kits.count,
  //     rows: kitsList,
  //   }
  //   return response
  // }

  // async create(bodyData, options = {}) {
  //   const { transaction = null } = options

  //   const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))
  //   const bodyHasProp = prop => R.has(prop, bodyData)

  //   const field = {
  //     kitPartsOut: false,
  //   }
  //   const message = {
  //     kitPartsOut: false,
  //   }


  //   let errors = false

  //   if (bodyDataNotHasProp('technicianId') || !bodyData.technicianId) {
  //     errors = true
  //     field.technicianId = true
  //     message.technicianId = 'Por favor o ID do tecnico'
  //   } else {
  //     const { technicianId } = bodyData
  //     const technicianExist = await Technician.findByPk(technicianId, { transaction })

  //     if (!technicianExist) {
  //       errors = true
  //       field.technicianId = true
  //       message.technicianId = 'Técnico não encomtrado'
  //     }
  //   }

  //   if (bodyDataNotHasProp('kitPartsOut') || !bodyData.kitPartsOut) {
  //     errors = true
  //     field.kitPartsOut = true
  //     message.kitPartsOut = 'Ao menos uma peça deve ser associada.'
  //   }

  //   if (errors) {
  //     throw new FieldValidationError([{ field, message }])
  //   }


  //   const kitCreated = await Kit.create({ technicianId: bodyData.technicianId }, { transaction })

  //   if (bodyHasProp('kitPartsOut')) {
  //     const { kitPartsOut } = bodyData

  //     const kitPartsOutCreattedPromises = kitPartsOut.map(async (item) => {
  //       const kitPartsOutCreatted = {
  //         ...item,
  //         kitId: kitCreated.id,
  //       }

  //       await KitPartsOut.create(kitPartsOutCreatted, { transaction })

  //       const stockBase = await StockBase.findOne({
  //         where: { stockBase: item.stockBase },
  //         transaction,
  //       })

  //       const productBase = await ProductBase.findOne({
  //         where: {
  //           productId: item.productId,
  //           stockBaseId: stockBase.id,
  //         },
  //       })

  //       const productBaseUpdate = {
  //         ...productBase,
  //         available: (parseInt(productBase.available, 10) - parseInt(item.amount, 10)).toString(),
  //         reserved: (parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)).toString(),
  //       }

  //       await productBase.update(productBaseUpdate, { transaction })
  //     })
  //     await Promise.all(kitPartsOutCreattedPromises)
  //   }

  //   const response = await Kit.findByPk(kitCreated.id, {
  //     include: [{
  //       model: Product,
  //     }],
  //     transaction,
  //   })

  //   return response
  // }
}
