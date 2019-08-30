const R = require('ramda')

const database = require('../../../../../database')

const { FieldValidationError } = require('../../../../../helpers/errors')

const Mark = database.model('mark')
const Manufacturer = database.model('manufacturer')
// const User = database.model('user')


module.exports = class ManufacturerDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const manufacturer = R.omit(['id'], bodyData)

    const manufacturerNotHasProp = prop => R.not(R.has(prop, bodyData))

    const field = {
      manufacturer: false,
    }
    const message = {
      manufacturer: '',
    }

    let errors = false

    if (manufacturerNotHasProp('manufacturer') || !manufacturer.manufacturer) {
      errors = true
      field.manufacturer = true
      message.manufacturer = 'Por favor informar o cabricante.'
    }

    const manufacturerHasExist = await Manufacturer.findOne({
      where: {
        manufacturer: manufacturer.manufacturer,
      },
      transaction,
    })

    if (manufacturerHasExist) {
      errors = true
      field.mark = true
      message.mark = 'fabricanet já está cadastrada.'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const manufacturerCreated = await Manufacturer.create(manufacturer, { transaction })


    const response = await Manufacturer.findByPk(manufacturerCreated.id, {
      transaction,
    })

    return response
  }

  async getManufacturerByMark(options = {}) {
    const { query = null, transaction = null } = options

    const manufacturer = await Mark.findOne({
      where: { mark: query },
      attributes: [],
      include: [
        {
          model: Manufacturer,
          attributes: ['manufacturer'],
        },
      ],
      transaction,
    })

    return manufacturer.manufacturer.manufacturer
  }
}
