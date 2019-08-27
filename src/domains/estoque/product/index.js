const R = require('ramda')
const moment = require('moment')

const PartDomain = require('./part')
const EquipModelDomain = require('./equip/equipModel')

const formatQuery = require('../../../helpers/lazyLoad')
const database = require('../../../database')

const { FieldValidationError } = require('../../../helpers/errors')

const partDomain = new PartDomain()
const equipModelDomain = new EquipModelDomain()


const EquipModel = database.model('equipModel')
// // const EquipMark = database.model('equipMark')
const EquipType = database.model('equipType')
const Mark = database.model('mark')
const Product = database.model('product')
const Part = database.model('part')
const Manufacturer = database.model('manufacturer')

module.exports = class ProductDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const product = R.omit(['id', 'name', 'mark'], bodyData)

    const productNotHasProp = prop => R.not(R.has(prop, product))
    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))
    // const productHasProp = prop => R.has(prop, product)

    const field = {
      category: false,
      mark: false,
      description: false,
      SKU: false,
      minimumStock: false,
      markId: false,
      equipModelId: false,
      name: false,
      type: false,
      partId: false,
      // costPrice: false,
      // salePrice: false,
    }
    const message = {
      category: '',
      mark: '',
      description: '',
      SKU: '',
      minimumStock: '',
      markId: '',
      equipModelId: '',
      partId: '',
      name: '',
      type: '',
    }

    let errors = false

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

    if (productNotHasProp('SKU') || !product.SKU) {
      errors = true
      field.codigo = true
      message.codigo = 'Informe o código.'
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

    if (bodyDataNotHasProp('name') || !bodyData.name) {
      errors = true
      field.item = true
      message.item = 'Informe o nome.'
    }

    let partCreated = null

    if (product.category === 'peca') {
      const partReturned = await Product.findOne({
        include: [
          {
            model: Mark,
            where: { mark: bodyData.mark },
          },
          {
            model: Part,
            where: { name: bodyData.name },
          },
        ],
        transaction,
      })

      if (partReturned) {
        errors = true
        field.item = true
        message.item = 'Peça já existe.'
      } else {
        const part = {
          name: bodyData.name,
          responsibleUser: bodyData.responsibleUser,
        }

        partCreated = await partDomain.add(part)

        if (!partCreated) {
          errors = true
          field.partId = true
          message.partId = 'erro ao cadastrar peça.'
        }
      }
    }

    let equipModelCreated = null

    if (product.category === 'equipamento') {
      const equipModelReturned = await Product.findOne({
        include: [
          {
            model: Mark,
            where: { mark: bodyData.mark },
          },
          {
            model: EquipModel,
            where: { name: bodyData.name },
            include: [{
              model: EquipType,
              where: { type: product.type },
            }],
          },
        ],
        transaction,
      })

      if (equipModelReturned) {
        errors = true
        field.item = true
        message.name = 'Este equipamento já está cadastrado.'
      } else {
        const { type } = bodyData

        const typeExist = await EquipType.findOne({ where: { type }, transaction })

        if (!typeExist) {
          field.type = true
          message.type = 'tipo de equipamento não esta cadastrado.'
          throw new FieldValidationError([{ field, message }])
        }

        const equipModel = {
          equipTypeId: typeExist.id,
          name: bodyData.name,
          serial: bodyData.serial,
          responsibleUser: bodyData.responsibleUser,
        }

        equipModelCreated = await equipModelDomain.addModel(equipModel)

        if (!equipModelCreated) {
          errors = true
        }
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    product.partId = partCreated ? partCreated.id : null
    product.equipModelId = equipModelCreated ? equipModelCreated.id : null

    const productCreated = await Product.create(product, { transaction })

    const includes = [{ model: Mark }]

    if (product.category === 'peca') {
      includes.push({
        model: Part,
      })
    }

    if (product.category === 'equipamento') {
      includes.push({
        model: EquipModel,
        include: [{ model: EquipType }],
      })
    }

    const response = await Product.findByPk(productCreated.id, {
      include: includes,
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

    const products = await Product.findAndCountAll({
      where: getWhere('product'),
      include: [
        {
          model: Mark,
          include: [{
            model: Manufacturer,
          }],
        },
        {
          model: Part,
        },
        {
          model: EquipModel,
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
        name: product.partId ? product.part.name : product.equipModel.name,
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
      attributes: ['id'],
      include: [
        {
          model: Part,
          attributes: ['name'],
        },
        {
          model: EquipModel,
          attributes: ['name', 'serial'],
        },
      ],
      transaction,
    })

    const response = products.map(item => ({
      id: item.id,
      name: R.prop('name', item.part) ? R.prop('name', item.part) : R.prop('name', item.equipModel),
      serial: item.equipModel ? item.equipModel.serial : false,
    }))

    return response
  }
}
