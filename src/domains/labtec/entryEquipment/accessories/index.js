const R = require('ramda')
const moment = require('moment')

const formatQuery = require('../../../../helpers/lazyLoad')

const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const Accessories = database.model('accessories')
const User = database.model('user')


module.exports = class AccessoriesDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const accessory = R.omit(['id'], bodyData)

    const accessoryNotHasProp = prop => R.not(R.has(prop, accessory))

    const field = {
      accessories: false,
      responsibleUser: false,
    }
    const message = {
      accessories: '',
      responsibleUser: '',
    }

    let errors = false

    if (accessoryNotHasProp('accessories') || !accessory.accessories) {
      errors = true
      field.accessories = true
      message.accessories = 'Por favor digite o nome do acessório.'
    } else {
      const accessoryReturned = await Accessories.findOne({
        where: { accessories: accessory.accessories },
        transaction,
      })

      if (accessoryReturned) {
        errors = true
        field.accessories = true
        message.accessories = 'Esse tipo acessório já está cadastrado.'
      }
    }

    if (accessoryNotHasProp('responsibleUser')) {
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

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const accessoryCreated = await Accessories.create(accessory, { transaction })

    const response = await Accessories.findByPk(accessoryCreated.id, { transaction })

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

    const accessories = await Accessories.findAndCountAll({
      where: getWhere('accessories'),
      order: [
        [newOrder.field, newOrder.direction],
      ],
      limit,
      offset,
      transaction,
    })

    const { rows } = accessories

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: accessories.count,
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

    const formatData = R.map((accessory) => {
      const resp = {
        accessories: accessory.accessories,
        createdAt: formatDateFunct(accessory.createdAt),
        updatedAt: formatDateFunct(accessory.updatedAt),
      }
      return resp
    })

    const accessoriesList = formatData(rows)


    const response = {
      page: pageResponse,
      show: limit,
      count: accessories.count,
      rows: accessoriesList,
    }
    return response
  }
}
