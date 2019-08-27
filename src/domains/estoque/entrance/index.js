const R = require('ramda')
const moment = require('moment')
const Sequelize = require('sequelize')

const { Op: operators } = Sequelize

const formatQuery = require('../../../helpers/lazyLoad')
const database = require('../../../database')

const { FieldValidationError } = require('../../../helpers/errors')

// const Mark = database.model('mark')
const Company = database.model('company')
const Entrance = database.model('entrance')
const Product = database.model('product')
const User = database.model('user')
const Mark = database.model('mark')
const Manufacturer = database.model('manufacturer')
const Part = database.model('part')
const EquipModel = database.model('equipModel')
const StockBase = database.model('stockBase')
const ProductBase = database.model('productBase')
const Equip = database.model('equip')

module.exports = class TechnicianDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const entrance = R.omit(['id'], bodyData)

    const entranceNotHasProp = prop => R.not(R.has(prop, entrance))
    // const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))

    const field = {
      amountAdded: false,
      stockBase: false,
      productId: false,
      companyId: false,
      responsibleUser: false,
    }
    const message = {
      amountAdded: '',
      stockBase: '',
      productId: '',
      companyId: '',
      responsibleUser: '',
    }

    let errors = false

    if (entranceNotHasProp('amountAdded') || !entrance.amountAdded) {
      errors = true
      field.amountAdded = true
      message.amountAdded = 'Por favor informar a quantidade adicionada.'
    } else if (/\D/gi.test(entrance.amountAdded)) {
      errors = true
      field.amountAdded = true
      message.amountAdded = 'Não é permitido letras.'
    }

    const stockBaseArray = ['REALPONTO', 'NOVAREAL', 'PONTOREAL']

    if (entranceNotHasProp('stockBase') || !entrance.stockBase) {
      errors = true
      field.stockBase = true
      message.stockBase = 'Por favor informar a base de estoque.'
    } else if (!stockBaseArray.filter(value => value === entrance.stockBase)) {
      errors = true
      field.stockBase = true
      message.stockBase = 'Base de estoque inválida.'
    }

    if (entranceNotHasProp('responsibleUser')) {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = 'username não está sendo passado.'
    } else if (bodyData.responsibleUser) {
      const { responsibleUser } = bodyData

      const user = await User.findOne({
        where: { username: responsibleUser },
        transaction,
      })

      if (!user) {
        errors = true
        field.responsibleUser = true
        message.responsibleUser = 'username inválido.'
      }
    } else {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = 'username não pode ser nulo.'
    }

    if (entranceNotHasProp('productId') || !entrance.productId) {
      errors = true
      field.productId = true
      message.productId = 'Por favor o produto.'
    }

    if (entranceNotHasProp('companyId') || !entrance.companyId) {
      errors = true
      field.companyId = true
      message.companyId = 'Por favor informar o fornecedor.'
    } else {
      const fornecedor = await Company.findByPk(entrance.companyId, {
        where: { relation: 'fornecedor' },
        transaction,
      })

      if (!fornecedor) {
        errors = true
        field.companyId = true
        message.companyId = 'Fornecedor não encontrado'
      }
    }

    const product = await Product.findByPk(entrance.productId, {
      include: [{ model: EquipModel }],
      transaction,
    })

    if (!product) {
      errors = true
      field.productId = true
      message.productId = 'Produto não encontrado'
    }

    if (product.equipModel && product.equipModel.serial) {
      if (entranceNotHasProp('serialNumbers') || entrance.serialNumbers.length === 0) {
        errors = true
        field.serialNumbers = true
        message.serialNumbers = 'Por favor ao menos um numero de série.'
      // eslint-disable-next-line eqeqeq
      } else if (entrance.serialNumbers.length != entrance.amountAdded) {
        errors = true
        field.serialNumbers = true
        message.serialNumbers = 'quantidade adicionada nãop condiz com a quantidade de números de série.'
      } else {
        const { serialNumbers } = entrance

        // eslint-disable-next-line max-len
        const filterSerialNumber = serialNumbers.filter((este, i) => serialNumbers.indexOf(este) === i)

        if (serialNumbers.length !== filterSerialNumber.length) {
          errors = true
          field.serialNumbers = true
          message.serialNumbers = 'Há números de série repetido.'
        }
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const stockBase = await StockBase.findOne({
      where: { stockBase: entrance.stockBase },
      transaction,
    })

    let productBase = await ProductBase.findOne({
      where: {
        productId: entrance.productId,
        stockBaseId: stockBase.id,
      },
      transaction,
    })

    if (!productBase) {
      await ProductBase.create({
        productId: entrance.productId,
        stockBaseId: stockBase.id,
        amount: entrance.amountAdded,
        available: entrance.amountAdded,
        reserved: '0',
      }, { transaction })

      entrance.oldAmount = '0'
    } else {
      entrance.oldAmount = productBase.amount

      // eslint-disable-next-line max-len
      const amount = (parseInt(productBase.amount, 10) + parseInt(entrance.amountAdded, 10)).toString()
      // eslint-disable-next-line max-len
      const available = (parseInt(productBase.available, 10) + parseInt(entrance.amountAdded, 10)).toString()

      const productBaseUpdate = {
        ...productBase,
        amount,
        available,
      }
      await productBase.update(productBaseUpdate, { transaction })
    }

    productBase = await ProductBase.findOne({
      where: {
        productId: entrance.productId,
        stockBaseId: stockBase.id,
      },
      transaction,
    })

    if (product.equipModel && product.equipModel.serial) {
      const { serialNumbers } = entrance

      const serialNumbersFindPromises = serialNumbers.map(async (item) => {
        const serialNumberHasExist = await Equip.findOne({
          where: { serialNumber: item },
          attributes: [],
          include: [{
            model: ProductBase,
            where: { id: productBase.id },
            attributes: [],
          }],
          transaction,
        })

        if (serialNumberHasExist) {
          field.serialNumbers = true
          message.serialNumbers = `${item} já está registrado`
          throw new FieldValidationError([{ field, message }])
        }
      })
      await Promise.all(serialNumbersFindPromises)

      const serialNumbersCreatePromises = serialNumbers.map(async (item) => {
        const equipCreate = {
          productBaseId: productBase.id,
          serialNumber: item,
        }

        await Equip.create(equipCreate, { transaction })
      })
      await Promise.all(serialNumbersCreatePromises)
    }

    const entranceCreated = await Entrance.create(entrance, { transaction })

    const response = await Entrance.findByPk(entranceCreated.id, {
      include: [
        {
          model: Company,
        },
        {
          model: Product,
        },
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

    // console.log(getWhere('part'))
    // console.log(getWhere('entrance'))

    const entrances = await Entrance.findAndCountAll({
      where: getWhere('entrance'),
      include: [
        { model: Company },
        {
          model: Product,
          // where: { include: [{ model: Part, where: { name: 'FONT 3 V' } }] },
          // where: getWhere('product'),
          include: [
            {
              model: Mark,
              include: [{
                model: Manufacturer,
              }],
            },
            {
              // model: Part || EquipModel,
              model: Part,
              // where: { name: 'FONT 3 V' },
              // where: getWhere('part'),
              // where: { [operators.or]: [getWhere('part')] },
              // having: {
              //   required: true,
              // },
              // on: {
              // },
              // required: false,
            },
            {
              model: EquipModel,
              // where: {},
              // where: getWhere('equipModel'),
              // having: {
              //   required: true,
              // },
              // where: getWhere('equipModel'),
              // or: false,
              // required: false,
            },
          ],
          // or: true,
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

    const formatDateFunct = (date) => {
      moment.locale('pt-br')
      const formatDate = moment(date).format('L')
      const formatHours = moment(date).format('LT')
      const dateformated = `${formatDate} ${formatHours}`
      return dateformated
    }

    const formatData = await R.map((entrance) => {
      if (entrance.product) {
        const resp = {
          id: entrance.id,
          amountAdded: entrance.amountAdded,
          oldAmount: entrance.oldAmount,
          stockBase: entrance.stockBase,
          responsibleUser: entrance.responsibleUser,
          razaoSocial: entrance.company.razaoSocial,
          category: entrance.product.category,
          description: entrance.product.description,
          SKU: entrance.product.SKU,
          minimumStock: entrance.product.minimumStock,
          amount: entrance.product.amount,
          mark: entrance.product.mark.mark,
          manufacturer: entrance.product.mark.manufacturer.manufacturer,
          // eslint-disable-next-line max-len
          name: entrance.product.partId ? entrance.product.part.name : entrance.product.equipModel.name,
          createdAt: formatDateFunct(entrance.createdAt),
        }
        // console.log(JSON.parse(JSON.stringify(entrance.product)))
        return resp
      }
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

    // console.log(response.count)
    // console.log(entrancesList.length)

    return response
  }
}
