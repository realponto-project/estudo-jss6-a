/* eslint-disable max-len */
const R = require('ramda')
const moment = require('moment')
// const axios = require('axios')

const Cnpj = require('@fnando/cnpj/dist/node')

const formatQuery = require('../../../../helpers/lazyLoad')
const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const Os = database.model('os')
const OsParts = database.model('osParts')
const Product = database.model('product')
const ProductBase = database.model('productBase')
const StockBase = database.model('stockBase')
const Technician = database.model('technician')
const EquipModel = database.model('equipModel')
const Part = database.model('part')
// const Equip = database.model('equip')

module.exports = class OsDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const reserve = R.omit(['id', 'osParts'], bodyData)

    const reserveNotHasProp = prop => R.not(R.has(prop, reserve))
    const bodyHasProp = prop => R.has(prop, bodyData)

    const field = {
      Os: false,
      razaoSocial: false,
      data: false,
      cnpj: false,
      date: false,
      osParts: false,
      technician: false,
    }
    const message = {
      Os: '',
      razaoSocial: '',
      data: '',
      cnpj: '',
      date: '',
      osParts: '',
      technician: '',
    }

    let errors = false

    if (reserveNotHasProp('os') || !reserve.os) {
      errors = true
      field.Os = true
      message.Os = 'Por favor o numero da OS.'
    } else if (/\D/ig.test(reserve.os)) {
      errors = true
      field.Os = true
      message.Os = 'OS deve cnter apenas números.'
    }

    if (reserveNotHasProp('razaoSocial') || !reserve.razaoSocial) {
      errors = true
      field.razaoSocial = true
      message.razaoSocial = 'Por favor a razão social.'
    }

    if (reserveNotHasProp('cnpj') || !reserve.cnpj) {
      errors = true
      field.cnpj = true
      message.cnpj = 'Por favor informar o cnpj.'
    } else {
      const cnpj = reserve.cnpj.replace(/\D/g, '')

      if (!Cnpj.isValid(cnpj)) {
        errors = true
        field.cnpj = true
        message.cnpj = 'O cnpj informado não é válido.'
      }
    }
    if (reserveNotHasProp('date') || !reserve.date) {
      errors = true
      field.data = true
      message.data = 'Por favor a data de atendimento.'
    }

    if (!bodyHasProp('osParts') || !bodyData.osParts) {
      errors = true
      field.osParts = true
      message.osParts = 'Deve haver ao menos um peça associada.'
    }

    if (reserveNotHasProp('technicianId') || !reserve.technicianId) {
      errors = true
      field.technician = true
      message.technician = 'Por favor o ID do tecnico'
    } else {
      const { technicianId } = bodyData
      const technicianExist = await Technician.findByPk(technicianId, { transaction })

      if (!technicianExist) {
        errors = true
        field.technician = true
        message.technician = 'Técnico não encomtrado'
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const reserveCreated = await Os.create(reserve, { transaction })

    if (bodyHasProp('osParts')) {
      const { osParts } = bodyData

      const osPartsCreattedPromises = osParts.map(async (item) => {
        const osPartsCreatted = {
          ...item,
          oId: reserveCreated.id,
        }

        await OsParts.create(osPartsCreatted, { transaction })

        const stockBase = await StockBase.findOne({
          where: { stockBase: item.stockBase },
          transaction,
        })

        const productBase = await ProductBase.findOne({
          where: {
            productId: item.productId,
            stockBaseId: stockBase.id,
          },
          transaction,
        })

        // const productBase = await ProductBase.findOne({
        //   where: {
        //     productId: item.productId,
        //     stockBaseId: stockBase.id,
        //   },
        //   include: [{
        //     model: Product,
        //     attributes: ['equipModelId'],
        //     include: [{
        //       model: EquipModel,
        //       attributes: ['serial'],
        //     }],
        //   }],
        //   transaction,
        // })

        // if (productBase.product.equipModelId && productBase.product.equipModel.serial) {
        //   const { serialNumberArray } = item

        //   if (serialNumberArray.length > 0) {
        //     serialNumberArray.map(async (serialNumber) => {
        //       const equip = await Equip.findOne({
        //         where: {
        //           serialNumber,
        //           productBaseId: productBase.id,
        //         },
        //       })

        //       if (!equip) {
        //         field.serialNumber = true
        //         message.serialNumber = 'este equipamento não esta cadastrado nessa base de estoque'
        //         throw new FieldValidationError([{ field, message }])
        //       }

        //       await equip.destroy({ transaction })
        //     })
        //   }
        // }

        const productBaseUpdate = {
          ...productBase,
          available: (parseInt(productBase.available, 10) - parseInt(item.amount, 10)).toString(),
          reserved: (parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)).toString(),
        }

        await productBase.update(productBaseUpdate, { transaction })
      })
      await Promise.all(osPartsCreattedPromises)
    }

    const response = await Os.findByPk(reserveCreated.id, {
      include: [
        {
          model: Product,
        },
        {
          model: Technician,
        },
      ],
      transaction,
    })

    return response
  }

  async delete(osId, options = {}) {
    const { transaction = null } = options

    const field = {
      os: false,
    }
    const message = {
      os: '',
    }

    const osListInit = await Os.findAll({ transaction })

    const os = await Os.findByPk(osId, { transaction })

    if (os) {
      const osParts = await OsParts.findAll({
        where: { oId: osId },
        transaction,
      })

      const osPartsPromise = osParts.map(async (item) => {
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
          available: (parseInt(productBase.available, 10) + parseInt(item.amount, 10)).toString(),
          reserved: (parseInt(productBase.reserved, 10) - parseInt(item.amount, 10)).toString(),
        }

        await productBase.update(productBaseUpdate, { transaction })

        await item.destroy()
      })

      await Promise.all(osPartsPromise)

      await os.destroy()
    } else {
      field.os = true
      message.os = 'Os não encontrada'

      throw new FieldValidationError([{ field, message }])
    }

    const osListfinal = await Os.findAll({ transaction })

    if (osListInit.length - osListfinal.length > 0) {
      return 'sucesso'
    }
    return 'erro'
  }

  async update(bodyData, options = {}) {
    const { transaction = null } = options

    const reserve = R.omit(['id'], bodyData)
    const oldReserve = await Os.findByPk(bodyData.id, { transaction })

    const reserveOs = { ...oldReserve }

    const reserveHasProp = prop => R.has(prop, reserve)

    const field = {
      Os: false,
      razaoSocial: false,
      cnpj: false,
      street: false,
    }
    const message = {
      Os: '',
      razaoSocial: '',
      cnpj: '',
      date: '',
    }

    let errors = false

    if (reserveHasProp('os')) {
      if (!reserve.os || /\D/ig.test(reserve.os)) {
        errors = true
        field.Os = true
        message.Os = 'OS inválida.'
      } else reserveOs.os = reserve.os
    }

    if (reserveHasProp('cnpj')) {
      const cnpj = reserve.cnpj.replace(/\D/g, '')

      if (!Cnpj.isValid(cnpj)) {
        errors = true
        field.cnpj = true
        message.cnpj = 'O cnpj informado não é válido.'
      } else reserveOs.cnpj = cnpj
    }

    if (reserveHasProp('razaoSocial')) {
      if (!reserve.razaoSocial) {
        errors = true
        field.razaoSocial = true
        message.razaoSocial = 'Razao social não pode ser nula.'
      } else {
        reserveOs.razaoSocial = reserve.razaoSocial
      }
    }

    if (reserveHasProp('date')) {
      if (!reserve.date) {
        errors = true
        field.date = true
        message.date = 'Razao social não pode ser nula.'
      } else {
        reserveOs.date = reserve.date
      }
    }

    if (reserveHasProp('technicianId')) {
      const technician = await Technician.findByPk(reserve.technicianId, { transaction })
      if (!technician) {
        errors = true
        field.technicianId = true
        message.technicianId = 'Técnico não foi encontrado.'
      } else reserveOs.technicianId = reserve.technicianId
    }

    // osParts = {
    //   Id: 44444444
    // }

    if (reserveHasProp('osParts')) {
      const { osParts } = reserve

      const osPartsDeletePromises = osParts.map(async (item) => {
        const osPartsReturn = await OsParts.findByPk(item.id, { transaction })

        const stockBase = await StockBase.findOne({
          where: { stockBase: osPartsReturn.stockBase },
          transaction,
        })

        const productBase = await ProductBase.findOne({
          where: {
            productId: osPartsReturn.productId,
            stockBaseId: stockBase.id,
          },
        })

        const productBaseUpdate = {
          ...productBase,
          available: (parseInt(productBase.available, 10) + parseInt(osPartsReturn.amount, 10) - parseInt(item.amount, 10)).toString(),
          reserved: (parseInt(productBase.reserved, 10) - parseInt(osPartsReturn.amount, 10) + parseInt(item.amount, 10)).toString(),
        }

        const osPartsUpdate = {
          ...osPartsReturn,
          amount: item.amount,
        }

        await osPartsReturn.update(osPartsUpdate, { transaction })
        await productBase.update(productBaseUpdate, { transaction })
      })
      await Promise.all(osPartsDeletePromises)
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    await oldReserve.update(reserveOs, { transaction })

    const response = await Os.findByPk(oldReserve.id, { transaction })

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

    const os = await Os.findAndCountAll({
      where: getWhere('os'),
      include: [
        {
          model: Technician,
          where: getWhere('technician'),
        },
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
          where: getWhere('product'),
        },
      ],
      order: [
        [newOrder.field, newOrder.direction],
      ],
      limit,
      offset,
      transaction,
    })

    // console.log(JSON.parse(JSON.stringify(os.rows[0].products)))
    // console.log(JSON.parse(JSON.stringify(os.rows[0])))

    const { rows } = os

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: os.count,
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

    const formatProduct = R.map((item) => {
      const resp = {
        name: item.equipModel ? item.equipModel.name : item.part.name,
        osPartsId: item.osParts.id,
        amount: item.osParts.amount,
        output: item.osParts.output,
        missOut: item.osParts.missOut,
        return: item.osParts.return,
        quantMax: (parseInt(item.osParts.amount, 10)) - (parseInt(item.osParts.return, 10)) - (parseInt(item.osParts.output, 10)) - (parseInt(item.osParts.missOut, 10)),
      }
      return resp
    })

    const formatData = R.map((item) => {
      const resp = {
        id: item.id,
        razaoSocial: item.razaoSocial,
        cnpj: item.cnpj,
        os: item.os,
        createdAt: formatDateFunct(item.createdAt),
        products: formatProduct(item.products),
      }
      return resp
    })

    const osList = formatData(rows)

    let show = limit
    if (os.count < show) {
      show = os.count
    }


    const response = {
      page: pageResponse,
      show,
      count: os.count,
      rows: osList,
    }

    return response
  }

  async getOsByOs(os, options = {}) {
    const { transaction = null } = options

    const formatDateFunct = (date) => {
      moment.locale('pt-br')
      const formatDate = moment(date)
      return formatDate
    }

    const osReturn = await Os.findOne({
      where: { os },
      include: [
        {
          model: Technician,
        },
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
      transaction,
    })

    if (!osReturn) {
      return {
        razaoSocial: '',
        cnpj: '',
        // data: formatDateFunct(new Date()),
        technician: '',
        reserve: [],
      }
    }

    const formatedReserve = R.map((item) => {
      const resp = {
        stockBase: item.osParts.stockBase,
        amount: item.osParts.amount,
        nomeProdutoCarrinho: item.equipModel ? item.equipModel.name : item.part.name,
        productId: item.id,
      }
      return resp
    })

    const response = {
      razaoSocial: osReturn.razaoSocial,
      cnpj: osReturn.cnpj,
      data: formatDateFunct(osReturn.date),
      technician: osReturn.technician.name,
      reserve: formatedReserve(osReturn.products),
    }

    return response
  }

  async output(bodyData, options = {}) {
    const { transaction = null } = options
    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))
    // const bodyHasProp = prop => R.has(prop, bodyData)

    const field = {
      osPartsId: false,
      add: false,
    }
    const message = {
      osPartsId: '',
      add: '',
    }

    let errors = false

    if (bodyDataNotHasProp('osPartsId') || !bodyData.osPartsId) {
      errors = true
      field.osPartsId = true
      message.osPartsId = 'Informe o id do produto.'
    } else {
      const osPart = await OsParts.findByPk(bodyData.osPartsId, { transaction })

      if (!osPart) {
        errors = true
        field.osPartsId = true
        message.osPartsId = 'produto não foi encontrada.'
      }
    }

    if (bodyDataNotHasProp('add') || !bodyData.add) {
      errors = true
      field.add = true
      message.add = 'Por favor a quantidade'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const osPart = await OsParts.findByPk(bodyData.osPartsId, { transaction })

    const { add } = bodyData

    const key = R.keys(add)[0]

    const value = R.prop([key], add)

    const total = (parseInt(osPart.amount, 10) - parseInt(osPart.output, 10) - parseInt(osPart.missOut, 10) - parseInt(osPart.return, 10))

    if (parseInt(value, 10) > total) {
      errors = true
      field.add = true
      message.add = 'quantidade adicionada exede o limite'
      throw new FieldValidationError([{ field, message }])
    }

    const osPartUpdate = {
      ...osPart,
      [key]: value + parseInt(osPart[key], 10),
    }

    await osPart.update(osPartUpdate, { transaction })

    const osPartsUpdate = await OsParts.findByPk(bodyData.osPartsId, { transaction })

    if (total - parseInt(value, 10) === 0) {
      await osPartsUpdate.destroy({ transaction })
    }

    const response = await OsParts.findByPk(bodyData.osPartsId, { transaction })

    return response
  }
}
