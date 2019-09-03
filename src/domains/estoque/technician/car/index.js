const R = require('ramda')

const database = require('../../../../database')
// const formatQuery = require('../../../../helpers/lazyLoad')

const { FieldValidationError } = require('../../../../helpers/errors')

// const Mark = database.model('mark')
// const Manufacturer = database.model('manufacturer')
const Car = database.model('car')


module.exports = class CarDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const car = R.omit(['id'], bodyData)

    const carNotHasProp = prop => R.not(R.has(prop, car))
    // const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))

    const field = {
      model: false,
      year: false,
      newPlaca: false,
    }
    const message = {
      model: '',
      year: '',
      newPlaca: '',
    }

    let errors = false

    if (carNotHasProp('model') || !car.model) {
      errors = true
      field.model = true
      message.model = 'Por favor informar modelo do carro.'
    }

    if (carNotHasProp('year') || !car.year || !/^\d{4}/.test(car.year)) {
      errors = true
      field.year = true
      message.year = 'Por favor informar o ano do carro.'
    }

    if (carNotHasProp('plate') || !car.plate) {
      errors = true
      field.newPlaca = true
      message.newPlaca = 'Por favor informar a placa do carro.'
    } else if (!/^[A-Z]{3}-\d{4}/.test(car.plate)) {
      errors = true
      field.plate = true
      message.plate = 'Placa inválida.'
    } else {
      const carHasExist = await Car.findOne({
        where: { plate: car.plate },
        transaction,
      })

      if (carHasExist) {
        errors = true
        field.newPlaca = true
        message.newPlaca = 'Placa já cadastrado.'
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const carCreated = await Car.create(car, { transaction })


    const response = await Car.findByPk(carCreated.id, {
      transaction,
    })

    return response
  }

  async getAll(options = {}) {
    const { transaction = null } = options

    const cars = await Car.findAll({
      attributes: ['model', 'plate'],
      order: [
        ['model', 'ASC'],
      ],
      transaction,
    })

    // const test = await Car.findOne({
    //   model: 'CELTA',
    // })

    // console.log(JSON.parse(JSON.stringify(test)))

    if (cars.length === 0) return []

    return cars
  }
}
