/* eslint-disable max-len */
const R = require('ramda')
// const moment = require('moment')
// const axios = require('axios')

const Cnpj = require('@fnando/cnpj/dist/node')
const Cpf = require('@fnando/cpf/dist/node')

// const formatQuery = require('../../../../helpers/lazyLoad')
const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const Equip = database.model('equip')
const Product = database.model('product')
const StockBase = database.model('stockBase')
const ProductBase = database.model('productBase')
const FreeMarket = database.model('freeMarket')
const FreeMarketParts = database.model('freeMarketParts')

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


    const freeMarketCreated = await FreeMarket.create(freeMarket, { transaction })

    if (bodyHasProp('freeMarketParts')) {
      const { freeMarketParts } = bodyData

      const kitPartsCreattedPromises = freeMarketParts.map(async (item) => {
        const freeMarketPartsCreatted = {
          ...item,
          freeMarketId: freeMarketCreated.id,
        }

        await FreeMarketParts.create(freeMarketPartsCreatted, { transaction })

        const stockBase = await StockBase.findOne({
          where: { stockBase: item.stockBase },
          transaction,
        })

        const productBase = await ProductBase.findOne({
          where: {
            productId: item.productId,
            stockBaseId: stockBase.id,
          },
          include: [{
            model: Product,
            attributes: ['serial'],
          }],
          transaction,
        })

        if (productBase.product.serial) {
          const { serialNumberArray } = item

          if (serialNumberArray.length > 0) {
            serialNumberArray.map(async (serialNumber) => {
              const equip = await Equip.findOne({
                where: {
                  serialNumber,
                  productBaseId: productBase.id,
                },
              })

              if (!equip) {
                field.serialNumber = true
                message.serialNumber = 'este equipamento não esta cadastrado nessa base de estoque'
                throw new FieldValidationError([{ field, message }])
              }

              await equip.destroy({ transaction })
            })
          }
        }

        const productBaseUpdate = {
          ...productBase,
          available: (parseInt(productBase.available, 10) - parseInt(item.amount, 10)).toString(),
          amount: (parseInt(productBase.amount, 10) - parseInt(item.amount, 10)).toString(),
        }

        await productBase.update(productBaseUpdate, { transaction })
      })
      await Promise.all(kitPartsCreattedPromises)
    }

    const response = await FreeMarket.findByPk(freeMarketCreated.id, {
      include: [{
        model: Product,
      }],
      transaction,
    })

    return response
  }
}
