/* eslint-disable max-len */
const R = require('ramda')
const moment = require('moment')
// const axios = require('axios')
const Sequelize = require('sequelize')

const { Op: operators } = Sequelize

const formatQuery = require('../../../../helpers/lazyLoad')
const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const Kit = database.model('kit')
const Technician = database.model('technician')
const KitParts = database.model('kitParts')
const Product = database.model('product')
const ProductBase = database.model('productBase')
const Notification = database.model('notification')

module.exports = class KitDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))
    const bodyHasProp = prop => R.has(prop, bodyData)

    const field = {
      kitParts: false,
    }
    const message = {
      kitParts: false,
    }

    let errors = false

    if (bodyDataNotHasProp('kitParts') || !bodyData.kitParts) {
      errors = true
      field.kitParts = true
      message.kitParts = 'Ao menos uma peça deve ser associada.'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const technicial = await Technician.findAll({
      where: { external: true },
      transaction,
    })

    // console.log(bodyData)

    // console.log(JSON.parse(JSON.stringify(technicial)))

    const oldKit = await Kit.findAll({
      include: [{
        model: Technician,
        // required: true,
      }],
      transaction,
    })

    // console.log(JSON.parse(JSON.stringify(oldKit)))

    let count = {}
    let count1 = {}

    if (oldKit.length > 0) {
      const oldKitDelete = oldKit.map(async (itemOldKit) => {
        const oldKitParts = await KitParts.findAll({
          where: { kitId: itemOldKit.id },
          attributes: ['id', 'amount', 'productBaseId'],
          transaction,
        })

        // console.log(JSON.parse(JSON.stringify(oldKitParts)))

        const kitPartsDeletePromises = oldKitParts.map(async (item) => {
          if (itemOldKit.technicianId) {
            const productBase = await ProductBase.findByPk(item.productBaseId, { transaction })

            // console.log(JSON.parse(JSON.stringify(productBase)))

            count = {
              ...count,
              [item.productBaseId]: count[item.productBaseId] ? count[item.productBaseId] : 0,
            }

            count[item.productBaseId] += parseInt(item.amount, 10)

            // console.log(JSON.parse(JSON.stringify(item)))

            // console.log(count)

            const productBaseUpdate = {
              ...productBase,
              available: (parseInt(productBase.available, 10) + count[item.productBaseId]).toString(),
              reserved: (parseInt(productBase.reserved, 10) - count[item.productBaseId]).toString(),
            }

            if (parseInt(productBaseUpdate.available, 10) < 0 || parseInt(productBaseUpdate.reserved, 10) < 0) {
              field.productBaseUpdate = true
              message.productBaseUpdate = 'Número negativo não é valido'
              throw new FieldValidationError([{ field, message }])
            }
            await productBase.update(productBaseUpdate, { transaction })
          }

          await item.destroy({ transaction })
        })

        await Promise.all(kitPartsDeletePromises)

        await itemOldKit.destroy({ transaction })
      })
      await Promise.all(oldKitDelete)
    }

    const kitCreatedPromise = technicial.map(async (itemTec) => {
      const kitCreated = await Kit.create({ technicianId: itemTec.id }, { transaction })

      if (bodyHasProp('kitParts')) {
        const { kitParts } = bodyData

        const kitPartsCreattedPromises = kitParts.map(async (item) => {
          const productBase = await ProductBase.findByPk(item.productBaseId, {
            transaction,
          })

          const kitPartsCreatted = {
            amount: item.amount,
            kitId: kitCreated.id,
            productBaseId: productBase.id,
          }

          await KitParts.create(kitPartsCreatted, { transaction })

          count1 = {
            ...count1,
            [item.productBaseId]: count1[item.productBaseId] ? count1[item.productBaseId] : 0,
          }

          count1[item.productBaseId] += parseInt(item.amount, 10)

          const productBaseUpdate = {
            ...productBase,
            available: (parseInt(productBase.available, 10) - count1[item.productBaseId]).toString(),
            reserved: (parseInt(productBase.reserved, 10) + count1[item.productBaseId]).toString(),
          }

          if (parseInt(productBaseUpdate.available, 10) < 0 || parseInt(productBaseUpdate.available, 10) < 0) {
            field.productBaseUpdate = true
            message.productBaseUpdate = 'Número negativo não é valido'
            throw new FieldValidationError([{ field, message }])
          }

          if (parseInt(productBaseUpdate.available, 10) < parseInt(productBase.product.minimumStock, 10)) {
            const messageNotification = `${productBase.product.name} está abaixo da quantidade mínima disponível no estoque, que é de ${productBase.product.minimumStock} unidades`

            await Notification.create({ message: messageNotification }, { transaction })
          }

          await productBase.update(productBaseUpdate, { transaction })
          count1 = 0
        })
        await Promise.all(kitPartsCreattedPromises)
      }
    })

    await Promise.all(kitCreatedPromise)

    const kitCreatedTecNull = await Kit.create({ transaction })

    if (bodyHasProp('kitParts')) {
      const { kitParts } = bodyData

      const kitPartsCreattedPromises = kitParts.map(async (item) => {
        const productBase = await ProductBase.findByPk(item.productBaseId, {
          transaction,
        })

        const kitPartsCreatted = {
          amount: item.amount,
          kitId: kitCreatedTecNull.id,
          productBaseId: productBase.id,
        }

        await KitParts.create(kitPartsCreatted, { transaction })
      })
      await Promise.all(kitPartsCreattedPromises)
    }

    const response = await Kit.findAll({
      include: [{
        model: Product,
      }],
      transaction,
    })

    return response
  }

  async getAll(options = {}) {
    const inicialOrder = {
      field: 'createdAt',
      acendent: true,
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

    // console.log(newQuery.filters.technician.specific.name)
    // console.log(getWhere('entrance'))

    const entrances = await KitParts.findAndCountAll({
      where: getWhere('kitParts'),
      include: [
        {
          model: ProductBase,
          include: [
            {
              model: Product,
              where: getWhere('product'),
            },
          ],
          required: true,
        },
        {
          model: Kit,
          include: [
            {
              model: Technician,
              where: { name: { [operators.eq]: newQuery.filters.technician.specific.name } },
            },
          ],
          required: true,
        },
      ],
      order: [
        [newOrder.field, newOrder.direction],
      ],
      limit,
      offset,
      transaction,
    })

    // console.log(JSON.parse(JSON.stringify(entrances.rows)))

    const { rows } = entrances

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: entrances.count,
        rows: [],
      }
    }

    const formatDateFunct = (date) => {
      moment.locale('pt-br')
      const formatDate = moment(date).format('L')
      const formatHours = moment(date).format('LT')
      const dateformated = `${formatDate} ${formatHours}`
      return dateformated
    }

    const formatData = await R.map((entrance) => {
      const resp = {
        kitPartId: entrance.id,
        amount: entrance.amount,
        // oldAmount: entrance.oldAmount,
        // stockBase: entrance.stockBase,
        // responsibleUser: entrance.responsibleUser,
        // razaoSocial: entrance.company.razaoSocial,
        // category: entrance.product.category,
        // description: entrance.product.description,
        // SKU: entrance.product.SKU,
        // minimumStock: entrance.product.minimumStock,
        // amount: entrance.product.amount,
        // mark: entrance.product.mark.mark,
        // manufacturer: entrance.product.mark.manufacturer.manufacturer,
        // // eslint-disable-next-line max-len
        name: entrance.productBase ? entrance.productBase.product.name : null,
        quantMax: entrance.productBase ? parseInt(entrance.productBase.available, 10) : null,
        updatedAt: formatDateFunct(entrance.updatedAt),
      }
      return resp
    })

    const entrancesList = formatData(rows)

    // const entrancesList = formatData(rows).filter((item) => {
    //   if (item.name.indexOf(query.filters.name.toUpperCase()) !== -1) return item
    // })

    let show = limit
    if (entrances.count < show) {
      show = entrances.count
    }

    const response = {
      page: pageResponse,
      show,
      count: entrances.count,
      rows: entrancesList,
    }

    // console.log(response)

    return response
  }

  async getKitDefaultValue(options = {}) {
    const inicialOrder = {
      field: 'createdAt',
      acendent: true,
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

    // console.log(query)
    // console.log(getWhere('entrance'))

    const kitParts = await KitParts.findAndCountAll({
      where: getWhere('kitParts'),
      include: [
        {
          model: ProductBase,
          include: [
            {
              model: Product,
              where: getWhere('product'),
            },
          ],
          required: true,
        },
        {
          model: Kit,
          where: { technicianId: null },
          required: true,
        },
      ],
      order: [
        [newOrder.field, newOrder.direction],
      ],
      limit,
      offset,
      transaction,
    })

    // console.log(JSON.parse(JSON.stringify(kitParts)))
    // console.log(JSON.parse(JSON.stringify(kitParts.rows)))

    const { rows } = kitParts

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: kitParts.count,
        rows: [],
      }
    }

    const formatData = await R.map((kitPart) => {
      const resp = {
        amount: parseInt(kitPart.amount, 10),
        itemCarrinho: kitPart.productBase.product.name,
        productBaseId: kitPart.productBase.id,
        // oldAmount: kitPart.oldAmount,
        // stockBase: kitPart.stockBase,
        // responsibleUser: kitPart.responsibleUser,
        // razaoSocial: kitPart.company.razaoSocial,
        // category: kitPart.product.category,
        // description: kitPart.product.description,
        // SKU: kitPart.product.SKU,
        // minimumStock: kitPart.product.minimumStock,
        // amount: kitPart.product.amount,
        // mark: kitPart.product.mark.mark,
        // manufacturer: kitPart.product.mark.manufacturer.manufacturer,
        // // eslint-disable-next-line max-len
        // createdAt: formatDateFunct(kitPart.createdAt),
      }
      return resp
    })

    const kitPartsList = formatData(rows)

    // const kitPartsList = formatData(rows).filter((item) => {
    //   if (item.name.indexOf(query.filters.name.toUpperCase()) !== -1) return item
    // })

    let show = limit
    if (kitParts.count < show) {
      show = kitParts.count
    }

    const response = {
      page: pageResponse,
      show,
      count: kitParts.count,
      rows: kitPartsList,
    }

    // console.log(response)

    return response
  }
}
