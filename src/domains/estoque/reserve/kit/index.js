/* eslint-disable max-len */
const R = require('ramda')
// const moment = require('moment')
// const axios = require('axios')

const formatQuery = require('../../../../helpers/lazyLoad')
const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const Kit = database.model('kit')
const Technician = database.model('technician')
const KitParts = database.model('kitParts')
const Product = database.model('product')
const StockBase = database.model('stockBase')
const ProductBase = database.model('productBase')
const Part = database.model('part')
const EquipModel = database.model('equipModel')

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

    const technicial = await Technician.findAll({ transaction })

    // console.log(JSON.parse(JSON.stringify(technicial)))

    const oldKit = await Kit.findAll({ transaction })

    // console.log(JSON.parse(JSON.stringify(oldKit)))

    if (oldKit) {
      const oldKitDelete = oldKit.map(async (itemOldKit) => {
        const oldKitParts = await KitParts.findAll({
          where: { kitId: itemOldKit.id },
          attributes: ['id', 'amount', 'productBaseId'],
          transaction,
        })

        const kitPartsDeletePromises = oldKitParts.map(async (item) => {
          const productBase = await ProductBase.findByPk(item.productBaseId, { transaction })

          const productBaseUpdate = {
            ...productBase,
            available: (parseInt(productBase.available, 10) + parseInt(item.amount, 10)).toString(),
            reserved: (parseInt(productBase.reserved, 10) - parseInt(item.amount, 10)).toString(),
          }

          await productBase.update(productBaseUpdate, { transaction })
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

        // const technicial = await Technician.findAll({ transaction })

        const kitPartsCreattedPromises = kitParts.map(async (item) => {
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

          const kitPartsCreatted = {
            amount: item.amount,
            kitId: kitCreated.id,
            productBaseId: productBase.id,
          }

          await KitParts.create(kitPartsCreatted, { transaction })

          const productBaseUpdate = {
            ...productBase,
            available: (parseInt(productBase.available, 10) - parseInt(item.amount, 10)).toString(),
            reserved: (parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)).toString(),
          }

          await productBase.update(productBaseUpdate, { transaction })
        })
        await Promise.all(kitPartsCreattedPromises)
      }
    })

    await Promise.all(kitCreatedPromise)

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

    // console.log(query)
    // console.log(getWhere('entrance'))

    const entrances = await KitParts.findAndCountAll({
      // where: getWhere('kit'),
      include: [
        {
          model: ProductBase,
          include: [
            {
              model: Product,
              include: [
                {
                  model: Part,
                },
                {
                  model: EquipModel,
                },
              ],
            },
          ],
        },
        {
          model: Kit,
          include: [
            {
              model: Technician,
              where: getWhere('technician'),
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

    // console.log(JSON.parse(JSON.stringify(entrances)))

    const { rows } = entrances

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: entrances.count,
        rows: [],
      }
    }

    // const formatDateFunct = (date) => {
    //   moment.locale('pt-br')
    //   const formatDate = moment(date).format('L')
    //   const formatHours = moment(date).format('LT')
    //   const dateformated = `${formatDate} ${formatHours}`
    //   return dateformated
    // }

    const formatData = await R.map((entrance) => {
      const resp = {
        id: entrance.id,
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
        name: entrance.productBase.product.partId ? entrance.productBase.product.part.name : entrance.productBase.product.equipModel.name,
        // createdAt: formatDateFunct(entrance.createdAt),
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
}
