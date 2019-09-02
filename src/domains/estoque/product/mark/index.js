const R = require('ramda')

const database = require('../../../../database')

const ManufacturerDomain = require('./manufacturer')

const { FieldValidationError } = require('../../../../helpers/errors')

const Mark = database.model('mark')
const Manufacturer = database.model('manufacturer')
// const User = database.model('user')

const manufacturerDomain = new ManufacturerDomain()


module.exports = class MarkDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const mark = R.omit(['id', 'manufacturer'], bodyData)

    const markNotHasProp = prop => R.not(R.has(prop, mark))
    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))

    const field = {
      manufacturer: false,
      mark: false,
      responsibleUser: false,
    }
    const message = {
      manufacturer: '',
      mark: '',
      responsibleUser: '',
    }

    let errors = false

    if (markNotHasProp('mark') || !mark.mark) {
      errors = true
      field.newMarca = true
      message.newMarca = 'Por favor informar a marca do markamento.'
    }

    if (bodyDataNotHasProp('manufacturer') || !bodyData.manufacturer) {
      errors = true
      field.manufacturer = true
      message.manufacturer = 'Por favor informar o fabricante.'
    } else {
      const { manufacturer, responsibleUser } = bodyData

      const manufacturerHasExixt = await Manufacturer.findOne({
        where: { manufacturer },
        transaction,
      })

      // console.log('tetssdfsfs')

      if (manufacturerHasExixt) {
        mark.manufacturerId = manufacturerHasExixt.id
      } else {
        const manufacturerCreated = await manufacturerDomain.add({ manufacturer, responsibleUser })

        // console.log(manufacturerCreated)
        mark.manufacturerId = manufacturerCreated.id
      }
    }

    // if (markNotHasProp('responsibleUser')) {
    //   errors = true
    //   field.responsibleUser = true
    //   message.responsibleUser = 'username não está sendo passado.'
    // } else if (bodyData.responsibleUser) {
    //   const { responsibleUser } = bodyData

    //   const user = await User.findOne({
    //     where: { username: responsibleUser },
    //     transaction,
    //   })

    //   if (!user) {
    //     errors = true
    //     field.responsibleUser = true
    //     message.responsibleUser = 'username inválido.'
    //   }
    // } else {
    //   errors = true
    //   field.responsibleUser = true
    //   message.responsibleUser = 'username não pode ser nulo.'
    // }

    const markHasExist = await Mark.findOne({
      where: {
        mark: mark.mark,
      },
      include: [{
        model: Manufacturer,
        where: { manufacturer: bodyData.manufacturer },
      }],
      transaction,
    })

    if (markHasExist) {
      errors = true
      field.newMarca = true
      message.newMarca = 'Marca já está cadastrada.'
    }

    // console.log(field)
    // console.log(message)

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }


    const markCreated = await Mark.create(mark, { transaction })


    const response = await Mark.findByPk(markCreated.id, {
      include: [{
        model: Manufacturer,
      }],
      transaction,
    })

    return response
  }

  async getAll(options = {}) {
    const { transaction = null } = options

    const marks = await Mark.findAll({
      attributes: ['mark'],
      order: [
        ['mark', 'ASC'],
      ],
      include: [
        {
          model: Manufacturer,
          attributes: ['manufacturer'],
        },
      ],
      transaction,
    })

    if (marks.length === 0) return []

    const response = marks.map(item => ({
      mark: item.mark,
      manufacturer: item.manufacturer.manufacturer,
    }))

    return response
  }
}
