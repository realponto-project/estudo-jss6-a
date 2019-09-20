/* eslint-disable max-len */
const R = require('ramda')
const moment = require('moment')
// const axios = require('axios')

const Cnpj = require('@fnando/cnpj/dist/node')
const Cpf = require('@fnando/cpf/dist/node')

const formatQuery = require('../../../../helpers/lazyLoad')
const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const Equip = database.model('equip')
const Product = database.model('product')
// const StockBase = database.model('stockBase')
const ProductBase = database.model('productBase')
const FreeMarket = database.model('freeMarket')
const FreeMarketParts = database.model('freeMarketParts')
const Notification = database.model('notification')

module.exports = class FreeMarketDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const freeMarket = R.omit(['id'], bodyData)

    const freeMarketNotHasProp = prop => R.not(R.has(prop, freeMarket))
    const bodyHasProp = prop => R.has(prop, bodyData)

    const field = {
      codigo: false,
      razaoSocial: false,
      cep: false,
      estado: false,
      cidade: false,
      bairro: false,
      rua: false,
      numero: false,
      cpfOuCnpj: false,
    }
    const message = {
      codigo: '',
      razaoSocial: '',
      cep: '',
      estado: '',
      cidade: '',
      bairro: '',
      rua: '',
      numero: '',
      cpfOuCnpj: '',
    }

    let errors = false

    if (freeMarketNotHasProp('trackingCode') || !freeMarket.trackingCode) {
      errors = true
      field.codigo = true
      message.codigo = 'Digite o código de rastreio.'
    } else {
      const freeMarketHasExist = await FreeMarket.findOne({
        where: { trackingCode: freeMarket.trackingCode },
        paranoid: false,
        transaction,
      })

      if (freeMarketHasExist) {
        errors = true
        field.codigo = true
        message.codigo = 'Codigo já registrado.'
      }
    }

    if (freeMarketNotHasProp('name') || !freeMarket.name) {
      errors = true
      field.razaoSocial = true
      message.razaoSocial = 'Digite o nome ou razão social.'
    }

    if (freeMarketNotHasProp('zipCode') || !freeMarket.zipCode) {
      errors = true
      field.cep = true
      message.cep = 'Digite o CEP.'
    }

    if (freeMarketNotHasProp('state') || !freeMarket.state) {
      errors = true
      field.estado = true
      message.estado = 'Digite o estado.'
    }

    if (freeMarketNotHasProp('city') || !freeMarket.city) {
      errors = true
      field.cidade = true
      message.cidade = 'Digite a cidade.'
    }

    if (freeMarketNotHasProp('neighborhood') || !freeMarket.neighborhood) {
      errors = true
      field.bairro = true
      message.bairro = 'Digite o bairro.'
    }

    if (freeMarketNotHasProp('street') || !freeMarket.street) {
      errors = true
      field.rua = true
      message.rua = 'Digite a rua.'
    }

    if (freeMarketNotHasProp('number') || !freeMarket.number) {
      errors = true
      field.numero = true
      message.numero = 'Digite a numero.'
    }


    if (!freeMarketNotHasProp('cnpjOrCpf')) {
      const { cnpjOrCpf } = freeMarket

      if (!Cnpj.isValid(cnpjOrCpf) && !Cpf.isValid(cnpjOrCpf)) {
        errors = true
        field.cpfOuCnpj = true
        message.cpfOuCnpj = 'O cnpj ou o cpf informado não é válido.'
      }
    }

    if (!bodyHasProp('freeMarketParts') || bodyData.freeMarketParts.length === 0) {
      errors = true
      field.freeMarketParts = true
      message.freeMarketParts = 'Informe ao menos uma peça para reserva.'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    freeMarket.zipCode = freeMarket.zipCode.replace(/\D/ig, '')
    freeMarket.cnpjOrCpf = freeMarket.cnpjOrCpf.replace(/\D/ig, '')

    const freeMarketCreated = await FreeMarket.create(freeMarket, { transaction })

    if (bodyHasProp('freeMarketParts')) {
      const { freeMarketParts } = bodyData

      const kitPartsCreattedPromises = freeMarketParts.map(async (item) => {
        const freeMarketPartsCreatted = {
          ...item,
          freeMarketId: freeMarketCreated.id,
        }

        const freeMarketPartCreated = await FreeMarketParts.create(freeMarketPartsCreatted, { transaction })

        const productBase = await ProductBase.findByPk(item.productBaseId, {
          include: [{
            model: Product,
          }],
          transaction,
        })

        // console.log(JSON.parse(JSON.stringify(productBase)))

        if (productBase.product.serial) {
          const { serialNumberArray } = item

          if (serialNumberArray.length !== parseInt(item.amount, 10)) {
            errors = true
            field.serialNumbers = true
            message.serialNumbers = 'quantidade adicionada nãop condiz com a quantidade de números de série.'
          }

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
                message.serialNumber = `este equipamento não esta cadastrado nessa base de estoque/ ${serialNumber} ja esta reservado`
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
                transaction,
              })
              await equip.update({
                ...equip,
                freeMarketPartId: freeMarketPartCreated.id,
                reserved: true,
              }, { transaction })
              await equip.destroy({ transaction })
            })
          }
        }

        const productBaseUpdate = {
          ...productBase,
          available: (parseInt(productBase.available, 10) - parseInt(item.amount, 10)).toString(),
          amount: (parseInt(productBase.amount, 10) - parseInt(item.amount, 10)).toString(),
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
      })
      await Promise.all(kitPartsCreattedPromises)
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const response = await FreeMarket.findByPk(freeMarketCreated.id, {
      include: [{
        model: ProductBase,
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

    const freeMarket = await FreeMarket.findAndCountAll({
      where: getWhere('freeMarket'),
      include: [
        // {
        //   model: Technician,
        //   where: getWhere('technician'),
        // },
        {
          model: ProductBase,
          include: [{
            model: Product,
          }],
        },
      ],
      order: [
        [newOrder.field, newOrder.direction],
      ],
      limit,
      offset,
      transaction,
    })

    const { rows } = freeMarket

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: freeMarket.count,
        rows: [],
      }
    }

    const formatProduct = R.map((item) => {
      const resp = {
        name: item.product.name,
        id: item.freeMarketParts.id,
        amount: item.freeMarketParts.amount,
      }
      return resp
    })

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
        trackingCode: item.trackingCode,
        name: item.name,
        zipCode: item.zipCode,
        products: formatProduct(item.productBases),
        createdAt: formatDateFunct(item.createdAt),
      }
      return resp
    })

    const freeMarketList = await Promise.all(formatData(rows))

    let show = limit
    if (freeMarket.count < show) {
      show = freeMarket.count
    }


    const response = {
      page: pageResponse,
      show,
      count: freeMarket.count,
      rows: freeMarketList,
    }

    // console.log(response)

    return response
  }
}
