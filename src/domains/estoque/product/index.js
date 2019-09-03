const R = require('ramda')
const moment = require('moment')
const Sequelize = require('sequelize')

const formatQuery = require('../../../helpers/lazyLoad')
const database = require('../../../database')

const { FieldValidationError } = require('../../../helpers/errors')

// // const EquipMark = database.model('equipMark')
// const Type = database.model('type')
const EquipType = database.model('equipType')
const Mark = database.model('mark')
const Product = database.model('product')
const Manufacturer = database.model('manufacturer')
const ProductBase = database.model('productBase')
const StockBase = database.model('stockBase')

const { Op: operators } = Sequelize

module.exports = class ProductDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const product = R.omit(['id', 'type', 'mark'], bodyData)

    const productNotHasProp = prop => R.not(R.has(prop, product))
    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))
    // const productHasProp = prop => R.has(prop, product)

    const field = {
      name: false,
      category: false,
      SKU: false,
      serial: false,
      minimumStock: false,
      mark: false,
      type: false,
    }
    const message = {
      name: '',
      category: '',
      SKU: '',
      serial: '',
      minimumStock: '',
      mark: '',
      type: '',
    }

    let errors = false

    if (productNotHasProp('name') || !product.name) {
      errors = true
      field.name = true
      message.name = 'Informe o nome.'
    } else {
      const { name } = product

      const productHasExist = await Product.findOne({
        where: { name },
        transaction,
      })

      if (productHasExist) {
        errors = true
        field.name = true
        message.name = 'Nome já cadastrado.'
      }
    }

    if (productNotHasProp('category')) {
      errors = true
      field.category = true
      message.category = 'categoria não foi passada'
    } else if (product.category !== 'peca' && product.category !== 'equipamento' && product.category !== 'outros') {
      errors = true
      field.category = true
      message.category = 'categoria inválida'

      throw new FieldValidationError([{ field, message }])
    }

    if (productNotHasProp('SKU') || !product.SKU) {
      errors = true
      field.codigo = true
      message.codigo = 'Informe o código.'
    } else {
      const { SKU } = product

      const productHasExist = await Product.findOne({
        where: { SKU },
        transaction,
      })

      if (productHasExist) {
        errors = true
        field.name = true
        message.name = 'Nome já cadastrado.'
      }
    }

    if (productNotHasProp('minimumStock') || !product.minimumStock) {
      errors = true
      field.quantMin = true
      message.quantMin = 'Por favor informe a quantidade'
    } else if (product.minimumStock !== product.minimumStock.replace(/\D/gi, '')) {
      errors = true
      field.quantMin = true
      message.quantMin = 'número invalido.'
    }

    if (bodyDataNotHasProp('mark') || !bodyData.mark) {
      errors = true
      field.mark = true
      message.mark = 'Por favor digite a marca do produto.'
    } else {
      const markHasExist = await Mark.findOne({
        where: { mark: bodyData.mark },
        transaction,
      })

      if (!markHasExist) {
        errors = true
        field.mark = true
        message.mark = 'Selecione uma marca'
      } else {
        product.markId = markHasExist.id
      }
    }

    if (bodyData.category === 'equipamento') {
      if (productNotHasProp('serial') || typeof product.serial !== 'boolean') {
        errors = true
        field.quantMin = true
        message.quantMin = 'Informe se tem numero de série'
      }

      if (bodyDataNotHasProp('type') || !bodyData.type) {
        errors = true
        field.type = true
        message.type = 'Informe o tipo.'
      } else {
        const equipTypeHasExist = await EquipType.findOne({
          where: { type: bodyData.type },
          transaction,
        })

        if (!equipTypeHasExist) {
          errors = true
          field.type = true
          message.type = 'Selecione uma marca'
        } else {
          product.equipTypeId = equipTypeHasExist.id
        }
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const productCreated = await Product.create(product, { transaction })

    const response = await Product.findByPk(productCreated.id, {
      include: [
        { model: Mark },
        { model: EquipType },
      ],
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

    console.log(getWhere('product'))

    const products = await Product.findAndCountAll({
      where: getWhere('product'),
      include: [
        {
          model: Mark,
          include: [{
            model: Manufacturer,
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

    const { rows } = products

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: products.count,
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

    const formatData = R.map((product) => {
      const resp = {
        id: product.id,
        category: product.category,
        description: product.description,
        SKU: product.SKU,
        minimumStock: product.minimumStock,
        amount: product.amount,
        mark: product.mark.mark,
        manufacturer: product.mark.manufacturer.manufacturer,
        name: product.name,
        createdAt: formatDateFunct(product.createdAt),
        updatedAt: formatDateFunct(product.updatedAt),
      }
      return resp
    })

    const productsList = formatData(rows)

    let show = limit
    if (products.count < show) {
      show = products.count
    }


    const response = {
      page: pageResponse,
      show,
      count: products.count,
      rows: productsList,
    }

    return response
  }

  async getAllNames(options = {}) {
    const { transaction = null } = options

    const products = await Product.findAll({
      attributes: ['id', 'name', 'serial'],
      order: [
        ['name', 'ASC'],
      ],
      transaction,
    })

    const response = products.map(item => ({
      id: item.id,
      name: item.name,
      serial: item.serial,
    }))

    return response
  }

  async getProductByStockBase(options = {}) {
    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)

    const { stockBase } = newQuery

    const kit = R.prop('kit', query) === undefined ? false : R.prop('kit', query)

    let getWhere = {}

    if (kit) {
      getWhere = {
        [operators.or]: [
          {
            category: { [operators.eq]: 'peca' },
          },
          {
            category: { [operators.eq]: 'outros' },
          },
        ],
      }
    }

    const productBase = await ProductBase.findAll({
      attributes: ['id', 'stockBaseId', 'productId', 'available'],
      include: [
        {
          model: StockBase,
          where: { stockBase },
          attributes: [],
        },
        {
          model: Product,
          attributes: ['name', 'serial'],
          where: getWhere,
        },
      ],
      transaction,
    })

    const response = productBase.map(item => ({
      id: item.id,
      available: item.available,
      name: item.product.name,
      serial: item.product.serial,
    }))

    return response
  }
}
