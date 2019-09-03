/* eslint-disable max-len */
const R = require('ramda')
const moment = require('moment')
// const axios = require('axios')

const formatQuery = require('../../../../../helpers/lazyLoad')
const database = require('../../../../../database')

const { FieldValidationError } = require('../../../../../helpers/errors')

const KitOut = database.model('kitOut')
const Kit = database.model('kit')
const KitParts = database.model('kitParts')
const ProductBase = database.model('productBase')
const Product = database.model('product')
const Technician = database.model('technician')

module.exports = class KitOutDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    // const kitOut = R.omit(['id'], bodyData)

    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))

    const field = {
      reposicao: false,
      expedicao: false,
      perda: false,
      os: false,
      kitPartId: false,
    }
    const message = {
      reposicao: '',
      expedicao: '',
      perda: '',
      action: '',
      amount: '',
      os: '',
      kitPartId: '',
    }

    let errors = false

    if (bodyDataNotHasProp('reposicao') || !bodyData.reposicao || /\D/.test(bodyData.reposicao)) {
      errors = true
      field.reposicao = true
      message.reposicao = 'Ação inválida'
    }

    if (bodyDataNotHasProp('expedicao') || !bodyData.expedicao || /\D/.test(bodyData.expedicao)) {
      errors = true
      field.expedicao = true
      message.expedicao = 'Ação inválida'
    }

    if (bodyDataNotHasProp('perda') || !bodyData.perda || /\D/.test(bodyData.perda)) {
      errors = true
      field.perda = true
      message.perda = 'Ação inválida'
    }

    // if (bodyDataNotHasProp('amount') || !bodyData.amount || /\D/.test(bodyData.amount) || parseInt(bodyData.amount, 10) < 1) {
    //   errors = true
    //   field.amount = true
    //   message.amount = 'não é numero'
    // }

    if (bodyDataNotHasProp('kitPartId') || !bodyData.kitPartId) {
      errors = true
      field.kitPartId = true
      message.kitPartId = 'Por favor o ID do tecnico'
    } else {
      const { kitPartId } = bodyData
      const technicianExist = await KitParts.findByPk(kitPartId, { transaction })

      if (!technicianExist) {
        errors = true
        field.kitPartId = true
        message.kitPartId = 'Técnico não encomtrado'
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const perdaNumber = parseInt(bodyData.perda, 10)
    const reposicaoNumber = parseInt(bodyData.reposicao, 10)
    const expedicaoNumber = parseInt(bodyData.expedicao, 10)
    const { kitPartId } = bodyData

    const kitPart = await KitParts.findByPk(kitPartId, { transaction })

    const amount = parseInt(kitPart.amount, 10) + reposicaoNumber - expedicaoNumber - perdaNumber

    if (amount <= 0) {
      field.amount = true
      message.amount = 'quantidade inválida'
      throw new FieldValidationError([{ field, message }])
    }

    const kitPartUpdate = {
      ...kitPart,
      amount,
    }

    await kitPart.update(kitPartUpdate, { transaction })

    if (perdaNumber > 0) {
      const { perda } = bodyData

      const kitOut = {
        action: 'perda',
        amount: perda,
        kitPartId,
      }

      await KitOut.create(kitOut, { transaction })
    }

    if (reposicaoNumber > 0) {
      const { reposicao } = bodyData

      const kitOut = {
        action: 'reposicao',
        amount: reposicao,
        kitPartId,
      }

      await KitOut.create(kitOut, { transaction })
    }

    if (expedicaoNumber > 0) {
      const { expedicao } = bodyData

      if (bodyDataNotHasProp('os') || !bodyData.os || /\D/.test(bodyData.os)) {
        field.os = true
        message.os = 'Ação inválida'
        throw new FieldValidationError([{ field, message }])
      }

      const { os } = bodyData

      const kitOutReturn = await KitOut.findOne({
        where: { os },
        transaction,
      })

      if (kitOutReturn) {
        const kitOutUpdate = {
          ...kitOutReturn,
          amount: (parseInt(kitOutReturn.amount, 10) + parseInt(expedicao, 10)).toString(),
        }

        kitOutReturn.update(kitOutUpdate, { transaction })
      } else {
        const kitOut = {
          action: 'expedicao',
          amount: expedicao,
          kitPartId,
          os,
        }
        await KitOut.create(kitOut, { transaction })
      }
    }

    return 'sucesso'

    // if (expedicaoNumber > 0 && !bodyDataNotHasProp('os') || !bodyData.os) {
    //   const { expedicao } = bodyData

    //   const kitOut = {
    //     action: 'expedicao',
    //     amount: expedicao,
    //     kitPartId,
    //   }

    //   await KitOut.create(kitOut, { transaction })
    // }

    // const kitOutCreated = await KitOut.create(kitOut, { transaction })

    // if (bodyHasProp('kitPartsOut')) {
    //   const { kitPartsOut } = bodyData

    //   const kitPartsOutCreattedPromises = kitPartsOut.map(async (item) => {
    //     const kitPartsOutCreatted = {
    //       ...item,
    //       kitOutId: kitOutCreated.id,
    //     }

    //     await KitPartsOut.create(kitPartsOutCreatted, { transaction })

    //     const stockBase = await StockBase.findOne({
    //       where: { stockBase: item.stockBase },
    //       transaction,
    //     })

    //     const productBase = await ProductBase.findOne({
    //       where: {
    //         productId: item.productId,
    //         stockBaseId: stockBase.id,
    //       },
    //     })

    //     const productBaseUpdate = {
    //       ...productBase,
    //       available: (parseInt(productBase.available, 10) - parseInt(item.amount, 10)).toString(),
    //       reserved: (parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)).toString(),
    //     }

    //     await productBase.update(productBaseUpdate, { transaction })
    //   })
    //   await Promise.all(kitPartsOutCreattedPromises)
    // }

    // const response = await KitOut.findByPk(kitOutCreated.id, {
    //   // include: [{
    //   //   model: Product,
    //   // }],
    //   transaction,
    // })

    // return response
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

    const kitOut = await KitOut.findAndCountAll({
      where: getWhere('kitOut'),
      include: [
        {
          model: KitParts,
          paranoid: false,
          include: [
            {
              model: ProductBase,
              include: [{
                model: Product,
              }],
            },
            {
              model: Kit,
              paranoid: false,
              include: [{
                model: Technician,
              }],
            },
          ],
        },
        // {
        //   model: ProductBase,
        //   include: [{
        //     model: Product,
        //   }],
        // },
        // // {
        // //   model: Product,
        // //   required,
        // // },
      ],
      order: [
        [newOrder.field, newOrder.direction],
      ],
      limit,
      offset,
      transaction,
    })

    // console.log(paranoid)

    // console.log(JSON.parse(JSON.stringify(kitOut.rows[0].kitPart)))
    // console.log(JSON.parse(JSON.stringify(os.rows[0].productBases)))

    const { rows } = kitOut

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: kitOut.count,
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

    const formatData = R.map(async (item) => {
      const resp = {
        id: item.id,
        amount: item.amount,
        name: item.kitPart.productBase.product.name,
        technician: item.kitPart.kit.technician.name,
        createdAt: formatDateFunct(item.createdAt),
        // razaoSocial: item.razaoSocial,
        // cnpj: item.cnpj,
        // date: item.date,
        // formatedDate: moment(item.date).format('L'),
        // technician: item.technician.name,
        // technicianId: item.technicianId,
        // os: item.os,
        // products: formatProduct(item.productBases),
        // products: item.productBases.products.length !== 0 ? formatProduct(item.productBases.products) : await formatProductNull(item.id),
      }
      return resp
    })

    const kitOutList = await Promise.all(formatData(rows))

    let show = limit
    if (kitOut.count < show) {
      show = kitOut.count
    }


    const response = {
      page: pageResponse,
      show,
      count: kitOut.count,
      rows: kitOutList,
    }

    // console.log(response)

    return response
  }
}
