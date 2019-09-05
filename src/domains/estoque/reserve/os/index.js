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
const Equip = database.model('equip')

module.exports = class OsDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const reserve = R.omit(['id', 'osParts'], bodyData)

    const reserveNotHasProp = prop => R.not(R.has(prop, reserve))
    const bodyHasProp = prop => R.has(prop, bodyData)

    const field = {
      // Os: false,
      razaoSocial: false,
      data: false,
      cnpj: false,
      date: false,
      osParts: false,
      technician: false,
    }
    const message = {
      // Os: '',
      razaoSocial: '',
      data: '',
      cnpj: '',
      date: '',
      osParts: '',
      technician: '',
    }

    let errors = false

    // if (reserveNotHasProp('os') || !reserve.os) {
    //   errors = true
    //   field.Os = true
    //   message.Os = 'Por favor o numero da OS.'
    // } else if (/\D/ig.test(reserve.os)) {
    //   errors = true
    //   field.Os = true
    //   message.Os = 'OS deve cnter apenas números.'
    // }

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

    reserve.cnpj = reserve.cnpj.replace(/\D/g, '')

    const reserveCreated = await Os.create(reserve, { transaction })

    await reserveCreated.update({ ...reserveCreated, os: reserveCreated.id.toString() }, { transaction })

    // console.log(bodyData)

    if (bodyHasProp('osParts')) {
      const { osParts } = bodyData

      const osPartsCreattedPromises = osParts.map(async (item) => {
        const productBase = await ProductBase.findByPk(item.productBaseId, {
          include: [{
            model: Product,
            attributes: ['serial'],
          }],
          transaction,
        })

        const osPartsCreatted = {
          ...item,
          oId: reserveCreated.id,
        }

        if (!productBase) {
          field.peca = true
          message.peca = 'produto não oconst a na base de dados'
          throw new FieldValidationError([{ field, message }])
        }
        // console.log(JSON.parse(JSON.stringify(productBase)))

        const osPartCreated = await OsParts.create(osPartsCreatted, { transaction })

        if (productBase.product.serial) {
          const { serialNumberArray } = item

          if (serialNumberArray.length > 0) {
            await serialNumberArray.map(async (serialNumber) => {
              const equip = await Equip.findOne({
                where: {
                  serialNumber,
                  reserved: false,
                  productBaseId: productBase.id,
                },
                transaction,
              })

              if (!equip) {
                errors = true
                field.serialNumber = true
                message.serialNumber = 'este equipamento não esta cadastrado nessa base de estoque'
                throw new FieldValidationError([{ field, message }])
              }
            })
            await serialNumberArray.map(async (serialNumber) => {
              const equip = await Equip.findOne({
                where: {
                  serialNumber,
                  reserved: false,
                  productBaseId: productBase.id,
                },
              })
              await equip.update({
                ...equip,
                // osPartId: osPartCreated.id,
                reserved: true,
              }, { transaction })
            })
          }
        }

        const productBaseUpdate = {
          ...productBase,
          available: (parseInt(productBase.available, 10) - parseInt(item.amount, 10)).toString(),
          reserved: (parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)).toString(),
        }

        await productBase.update(productBaseUpdate, { transaction })
      })
      // await Promise.all(osPartsCreattedPromises).then(() => {
      //   console.log('sucesso')
      // })
      //   .catch(() => {
      //     errors = true
      //     console.log('erro')
      //     return { erro: 'errorrr' }
      //   })
      await Promise.all(osPartsCreattedPromises)
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const response = await Os.findByPk(reserveCreated.id, {
      include: [
        {
          model: ProductBase,
          include: [{
            model: Product,
          }],
        },
        {
          model: Technician,
        },
      ],
      transaction,
    })

    // console.log(JSON.parse(JSON.stringify(response)))

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

    const os = await Os.findByPk(osId, { transaction })

    if (os) {
      const osParts = await OsParts.findAll({
        where: { oId: osId },
        transaction,
      })

      const osPartsPromise = osParts.map(async (item) => {
        const productBase = await ProductBase.findByPk(item.productBaseId, { transaction })

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

    const osDeleted = await Os.findByPk(osId, { transaction })

    if (!osDeleted) {
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
      date: false,
    }
    const message = {
      date: '',
    }

    let errors = false

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

    if (reserveHasProp('osParts')) {
      const { osParts } = reserve

      let osPartsAll = await OsParts.findAll({
        where: { oId: bodyData.id },
        attributes: ['id'],
        transaction,
      })

      // console.log(JSON.parse(JSON.stringify(osPartsAll)))

      const osPartsUpdatePromises = osParts.map(async (item) => {
        if (R.prop('id', item)) {
          const osPartsReturn = await OsParts.findByPk(item.id, { transaction })

          osPartsAll = await osPartsAll.filter((itemOld) => {
            if (itemOld.id !== item.id) {
              // console.log(itemOld.id)
              return itemOld.id
            }
          })
          // console.log(osParts)
          // console.log(JSON.parse(JSON.stringify(osPartsReturn)))

          // osPartsReturn.filter((id) => id === )
          const productBase = await ProductBase.findByPk(osPartsReturn.productBaseId, { transaction })

          // console.log(JSON.parse(JSON.stringify(productBase)))

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
        } else {
          const osPartsCreatted = {
            ...item,
            oId: bodyData.id,
          }

          // console.log(osPartsCreatted)

          await OsParts.create(osPartsCreatted, { transaction })

          const productBase = await ProductBase.findByPk(item.productBaseId, { transaction })

          const productBaseUpdate = {
            ...productBase,
            available: (parseInt(productBase.available, 10) - parseInt(item.amount, 10)).toString(),
            reserved: (parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)).toString(),
          }

          await productBase.update(productBaseUpdate, { transaction })
        }
      })
      await Promise.all(osPartsUpdatePromises)

      // console.log(JSON.parse(JSON.stringify(osPartsAll)))

      if (osPartsAll.length > 0) {
        const osPartsdeletePromises = osPartsAll.map(async (item) => {
          const osPartDelete = await OsParts.findByPk(item.id, { transaction })

          const productBase = await ProductBase.findByPk(item.productBaseId, { transaction })

          const productBaseUpdate = {
            ...productBase,
            available: (parseInt(productBase.available, 10) + parseInt(osPartDelete.amount, 10)).toString(),
            reserved: (parseInt(productBase.reserved, 10) - parseInt(osPartDelete.amount, 10)).toString(),
          }

          await productBase.update(productBaseUpdate, { transaction })

          osPartDelete.destroy({ transaction })
        })

        await Promise.all(osPartsdeletePromises)
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    // console.log(JSON.parse(JSON.stringify(oldReserve)))

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

    const required = R.prop('required', query) === undefined ? true : R.prop('required', query)
    const paranoid = R.prop('paranoid', query) === undefined ? false : R.prop('paranoid', query)

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
          model: ProductBase,
          include: [{
            model: Product,
          }],
          required,
        },
        // {
        //   model: Product,
        //   required,
        // },
      ],
      order: [
        [newOrder.field, newOrder.direction],
      ],
      limit,
      offset,
      paranoid,
      transaction,
    })

    // console.log(paranoid)

    // console.log(JSON.parse(JSON.stringify(os.rows[0].productBases)))
    // console.log(JSON.parse(JSON.stringify(os.rows[0].productBases)))

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
        name: item.product.name,
        id: item.osParts.id,
        amount: item.osParts.amount,
        output: item.osParts.output,
        missOut: item.osParts.missOut,
        return: item.osParts.return,
        quantMax: (parseInt(item.osParts.amount, 10)) - (parseInt(item.osParts.return, 10)) - (parseInt(item.osParts.output, 10)) - (parseInt(item.osParts.missOut, 10)),
      }
      return resp
    })

    const formatProductDelete = R.map((item) => {
      const resp = {
        name: item.productBase.product.name,
        osPartsId: item.id,
        amount: item.amount,
        output: item.output,
        missOut: item.missOut,
        return: item.return,
        quantMax: (parseInt(item.amount, 10)) - (parseInt(item.return, 10)) - (parseInt(item.output, 10)) - (parseInt(item.missOut, 10)),
      }
      return resp
    })

    const formatProductNull = async (id) => {
      const osParts = await OsParts.findAll({
        where: {
          oId: id,
        },
        include: [{
          model: ProductBase,
          include: [{
            model: Product,
          }],
        }],
        paranoid: false,
        transaction,
      })

      // console.log(JSON.parse(JSON.stringify(osParts)))

      return formatProductDelete(osParts)
    }

    const formatData = R.map(async (item) => {
      const resp = {
        id: item.id,
        razaoSocial: item.razaoSocial,
        cnpj: item.cnpj,
        date: item.date,
        formatedDate: moment(item.date).format('L'),
        technician: item.technician.name,
        technicianId: item.technicianId,
        os: item.os,
        createdAt: formatDateFunct(item.createdAt),
        // products: formatProduct(item.productBases),
        products: item.productBases.length !== 0 ? formatProduct(item.productBases) : await formatProductNull(item.id),
      }
      return resp
    })

    const osList = await Promise.all(formatData(rows))

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

    // console.log(response)

    return response
  }

  async getOsByOs(id, options = {}) {
    const { transaction = null } = options

    const formatDateFunct = (date) => {
      moment.locale('pt-br')
      const formatDate = moment(date)
      return formatDate
    }

    const osReturn = await Os.findOne({
      where: { id },
      include: [
        {
          model: Technician,
        },
        {
          model: ProductBase,
          include: [
            {
              model: Product,
            },
            {
              model: StockBase,
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
        stockBase: item.stockBase.stockBase,
        amount: item.osParts.amount,
        nomeProdutoCarrinho: item.product.name,
        productId: item.productId,
      }
      return resp
    })

    // console.log(JSON.parse(JSON.stringify(osReturn.productBases)))

    const response = {
      razaoSocial: osReturn.razaoSocial,
      cnpj: osReturn.cnpj,
      data: formatDateFunct(osReturn.date),
      technician: osReturn.technician.name,
      reserve: formatedReserve(osReturn.productBases),
    }

    // console.log(JSON.parse(JSON.stringify(response)))

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

    const productBase = await ProductBase.findByPk(osPart.productBaseId, { transaction })

    let productBaseUpdate = {}

    if (key === 'return') {
      productBaseUpdate = {
        ...productBase,
        available: (parseInt(productBase.available, 10) + parseInt(value, 10)).toString(),
        reserved: (parseInt(productBase.reserved, 10) - parseInt(value, 10)).toString(),
      }
    } else {
      productBaseUpdate = {
        ...productBase,
        amount: (parseInt(productBase.amount, 10) - parseInt(value, 10)).toString(),
        reserved: (parseInt(productBase.reserved, 10) - parseInt(value, 10)).toString(),
      }
    }

    await productBase.update(productBaseUpdate, { transaction })

    const osPartUpdate = {
      ...osPart,
      [key]: value + parseInt(osPart[key], 10),
    }

    await osPart.update(osPartUpdate, { transaction })

    const osPartsUpdate = await OsParts.findByPk(bodyData.osPartsId, { transaction })

    if (total - parseInt(value, 10) === 0) {
      await osPartsUpdate.destroy({ transaction })
    }

    const os = await Os.findByPk(osPart.oId, {
      include: [{
        model: ProductBase,
      }],
      transaction,
    })

    if (os.productBases.length === 0) {
      await os.destroy({ transaction })
    }

    const response = await OsParts.findByPk(bodyData.osPartsId, { transaction })

    return response
  }
}
