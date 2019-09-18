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
// const Part = database.model('part')
// const EquipModel = database.model('equipModel')
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
      message: false,
      responsibleUser: false,
    }
    const message = {
      amountAdded: '',
      stockBase: '',
      productId: '',
      companyId: '',
      message: '',
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
      transaction,
    })

    if (!product) {
      errors = true
      field.productId = true
      message.productId = 'Produto não encontrado'
    }

    if (product.serial) {
      if (entranceNotHasProp('serialNumbers') || entrance.serialNumbers.length === 0) {
        errors = true
        field.message = true
        message.message = 'Por favor ao menos um numero de série.'
      // eslint-disable-next-line eqeqeq
      } else if (entrance.serialNumbers.length != entrance.amountAdded) {
        errors = true
        field.message = true
        message.message = 'Quantidade adicionada não condiz com a quantidade de números de série.'
      } else {
        const { serialNumbers } = entrance

        // eslint-disable-next-line max-len
        const filterSerialNumber = serialNumbers.filter((este, i) => serialNumbers.indexOf(este) === i)

        if (serialNumbers.length !== filterSerialNumber.length) {
          errors = true
          field.message = true
          message.message = 'Há números de série repetido.'
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

    if (product.serial) {
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
          paranoid: false,
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

  async update(bodyData, options = {}) {
    const { transaction = null } = options

    const entrance = R.omit(['id'], bodyData)

    const oldEntrance = await Entrance.findByPk(bodyData.id, { transaction })

    const entranceNotHasProp = prop => R.not(R.has(prop, entrance))
    // const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))

    const field = {
      amountAdded: false,
      stockBase: false,
      productId: false,
      companyId: false,
      message: false,
      responsibleUser: false,
    }
    const message = {
      amountAdded: '',
      stockBase: '',
      productId: '',
      companyId: '',
      message: '',
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
      transaction,
    })

    if (!product) {
      errors = true
      field.productId = true
      message.productId = 'Produto não encontrado'
    }

    if (product.serial) {
      if (entranceNotHasProp('serialNumbers') || entrance.serialNumbers.length === 0) {
        errors = true
        field.message = true
        message.message = 'Por favor ao menos um numero de série.'
      // eslint-disable-next-line eqeqeq
      } else if (entrance.serialNumbers.length != entrance.amountAdded) {
        errors = true
        field.message = true
        message.message = 'Quantidade adicionada não condiz com a quantidade de números de série.'
      } else {
        const { serialNumbers } = entrance

        // eslint-disable-next-line max-len
        const filterSerialNumber = serialNumbers.filter((este, i) => serialNumbers.indexOf(este) === i)

        if (serialNumbers.length !== filterSerialNumber.length) {
          errors = true
          field.message = true
          message.message = 'Há números de série repetido.'
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

    const oldStockBase = await StockBase.findOne({
      where: { stockBase: oldEntrance.stockBase },
      transaction,
    })

    let productBase = await ProductBase.findOne({
      where: {
        productId: entrance.productId,
        stockBaseId: stockBase.id,
      },
      transaction,
    })

    const oldProductBase = await ProductBase.findOne({
      where: {
        productId: oldEntrance.productId,
        stockBaseId: oldStockBase.id,
      },
      transaction,
    })

    if (!oldProductBase) {
      field.message = true
      message.message = 'ProductBase não encontrada.'
      throw new FieldValidationError([{ field, message }])
    } else {
      // eslint-disable-next-line max-len
      const amount = (parseInt(oldProductBase.amount, 10) - parseInt(oldEntrance.amountAdded, 10)).toString()
      // eslint-disable-next-line max-len
      const available = (parseInt(oldProductBase.available, 10) - parseInt(oldEntrance.amountAdded, 10)).toString()

      const oldProductBaseUpdate = {
        ...oldProductBase,
        amount,
        available,
      }

      if (parseInt(oldProductBaseUpdate.amount, 10) < 0
      || parseInt(oldProductBaseUpdate.available, 10) < 0) {
        field.oldProductBaseUpdate = true
        message.oldProductBaseUpdate = 'Número negativo não é valido'
        throw new FieldValidationError([{ field, message }])
      }
      await oldProductBase.update(oldProductBaseUpdate, { transaction })
    }


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
      entrance.oldAmount = (parseInt(productBase.amount, 10)
      - parseInt(oldEntrance.amountAdded, 10)).toString()

      // eslint-disable-next-line max-len
      const amount = (parseInt(productBase.amount, 10) + parseInt(entrance.amountAdded, 10)).toString()
      // eslint-disable-next-line max-len
      const available = (parseInt(productBase.available, 10) + parseInt(entrance.amountAdded, 10)).toString()

      const productBaseUpdate = {
        ...productBase,
        amount,
        available,
      }

      if (parseInt(productBaseUpdate.amount, 10) < 0
      || parseInt(productBaseUpdate.available, 10) < 0) {
        field.productBaseUpdate = true
        message.productBaseUpdate = 'Número negativo não é valido'
        throw new FieldValidationError([{ field, message }])
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

    if (product.serial) {
      const { serialNumbers } = entrance

      const serialNumbersFindPromises = serialNumbers.map(async (item) => {
        const equip = await Equip.findOne({
          where: {
            serialNumber: item,
            reserved: false,
          },
          include: [{
            model: ProductBase,
            where: { id: oldProductBase.id },
            attributes: [],
          }],
          transaction,
        })

        if (!equip) {
          field.serialNumbers = true
          message.serialNumbers = `${item} não está registrado`
          throw new FieldValidationError([{ field, message }])
        }

        const equipUpdate = {
          ...equip,
          productBaseId: productBase.id,
        }

        await equip.update(equipUpdate, { transaction })
      })
      await Promise.all(serialNumbersFindPromises)
    }

    const newEntrance = {
      ...oldEntrance,
      ...entrance,
    }

    await oldEntrance.update(newEntrance, { transaction })

    const response = await Entrance.findByPk(bodyData.id, {
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

  async delete(id, options = {}) {
    const { transaction = null } = options

    const deletEntrance = await Entrance.findByPk(id, { transaction })

    const field = {
      id: false,
    }
    const message = {
      id: '',
    }

    if (!deletEntrance) {
      field.id = true
      message.id = 'entrada não econtrada'
      throw new FieldValidationError([{ field, message }])
    }

    const equips = await Equip.findAll({
      where: {
        createdAt: {
          [operators.gte]: moment(deletEntrance.createdAt).subtract(5, 'seconds').toString(),
          [operators.lte]: moment(deletEntrance.createdAt).add(5, 'seconds').toString(),
        },
      },
      order: [
        ['serialNumber', 'ASC'],
      ],
      paranoid: false,
      transaction,
    })

    const equipDeletePromise = equips.map(async (item) => {
      if (item.deletedAt !== null || item.reserved === true) {
        field.reserved = true
        message.reserved = 'Há equipamento liberado ou reservado'
        throw new FieldValidationError([{ field, message }])
      }
      await item.destroy({ force: true, transaction })
    })

    await Promise.all(equipDeletePromise)

    const stockBase = await StockBase.findOne({
      where: { stockBase: deletEntrance.stockBase },
      transaction,
    })

    const productBase = await ProductBase.findOne({
      where: {
        productId: deletEntrance.productId,
        stockBaseId: stockBase.id,
      },
      transaction,
    })

    if (!productBase) {
      field.message = true
      message.message = 'ProductBase não encontrada.'
      throw new FieldValidationError([{ field, message }])
    } else {
      // eslint-disable-next-line max-len
      const amount = (parseInt(productBase.amount, 10) - parseInt(deletEntrance.amountAdded, 10)).toString()
      // eslint-disable-next-line max-len
      const available = (parseInt(productBase.available, 10) - parseInt(deletEntrance.amountAdded, 10)).toString()

      const productBaseUpdate = {
        ...productBase,
        amount,
        available,
      }

      if (parseInt(productBaseUpdate.amount, 10) < 0
      || parseInt(productBaseUpdate.available, 10) < 0) {
        field.productBaseUpdate = true
        message.productBaseUpdate = 'Número negativo não é valido'
        throw new FieldValidationError([{ field, message }])
      }
      await productBase.update(productBaseUpdate, { transaction })
    }

    await deletEntrance.destroy({ transaction })

    return 'sucesso'
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

    const entrances = await Entrance.findAndCountAll({
      where: getWhere('entrance'),
      include: [
        { model: Company },
        {
          model: Product,
          where: getWhere('product'),
          // where: { include: [{ model: Part, where: { name: 'FONT 3 V' } }] },
          // where: getWhere('product'),
          include: [
            {
              model: Mark,
              include: [{
                model: Manufacturer,
              }],
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

    // eslint-disable-next-line consistent-return
    const formatData = R.map((entrance) => {
      if (entrance.product) {
        const resp = {
          id: entrance.id,
          amountAdded: entrance.amountAdded,
          oldAmount: entrance.oldAmount,
          stockBase: entrance.stockBase,
          responsibleUser: entrance.responsibleUser,
          companyId: entrance.company.id,
          razaoSocial: entrance.company.razaoSocial,
          productId: entrance.product.id,
          serial: entrance.product.serial,
          category: entrance.product.category,
          description: entrance.product.description,
          SKU: entrance.product.SKU,
          minimumStock: entrance.product.minimumStock,
          amount: entrance.product.amount,
          mark: entrance.product.mark.mark,
          manufacturer: entrance.product.mark.manufacturer.manufacturer,
          // eslint-disable-next-line max-len
          name: entrance.product.name,
          createdAtNotFormatted: entrance.createdAt,
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
