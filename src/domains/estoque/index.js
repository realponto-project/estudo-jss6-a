const R = require('ramda')
// const moment = require('moment')

const formatQuery = require('../../helpers/lazyLoad')
const database = require('../../database')

// const { FieldValidationError } = require('../../helpers/errors')

// const Mark = database.model('mark')
// const Company = database.model('company')
// const Entrance = database.model('entrance')
const Product = database.model('product')
// const User = database.model('user')
const Mark = database.model('mark')
const Manufacturer = database.model('manufacturer')
const Part = database.model('part')
const EquipModel = database.model('equipModel')
const StockBase = database.model('stockBase')
const ProductBase = database.model('productBase')
// const Equip = database.model('equip')

module.exports = class StockDomain {
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

    const entrances = await ProductBase.findAndCountAll({
      // where: getWhere('productBase'),
      attributes: ['id', 'amount'],
      include: [
        {
          model: Product,
          attributes: ['partId', 'equipModelId'],
          include: [
            {
              model: EquipModel,
              attributes: ['name'],
              // where: { name: 'DEDO BOM' },
              // required: true,
            },
            {
              model: Part,
              attributes: ['name'],
              // where: { name: 'FONT 3 V' },
              // required: true,
            },
            {
              model: Mark,
              attributes: ['manufacturerId'],
              include: [{
                model: Manufacturer,
                attributes: ['manufacturer'],
              }],
            },
          ],
          required: true,
        },
        {
          model: StockBase,
          attributes: ['stockBase'],
        },
      ],
      order: [
        [newOrder.field, newOrder.direction],
      ],
      // required: false,
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

    const formatData = R.map((entrance) => {
      const resp = {
        id: entrance.id,
        amount: entrance.amount,
        name: entrance.product.equipModel
          ? entrance.product.equipModel.name
          : entrance.product.part.name,
        // name: entrance.product.part ? entrance.product.part.name : 'teste',
        manufacturer: entrance.product.mark.manufacturer.manufacturer,
        stockBase: entrance.stockBase.stockBase,
      // oldAmount: entrance.oldAmount,
      }
      return resp
    })

    const entrancesList = formatData(rows)

    // console.log(JSON.parse(JSON.stringify(entrances.rows[0].product.part)))

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

    return response
  }
}
