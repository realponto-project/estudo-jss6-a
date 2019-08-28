const R = require('ramda')
// const moment = require('moment')

// const formatQuery = require('../../../helpers/lazyLoad')
const database = require('../../../database')

const { FieldValidationError } = require('../../../helpers/errors')

// const Mark = database.model('mark')
// const Manufacturer = database.model('manufacturer')
const Car = database.model('car')
const Technician = database.model('technician')

module.exports = class TechnicianDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const technician = R.omit(['id', 'plate'], bodyData)

    const technicianNotHasProp = prop => R.not(R.has(prop, technician))
    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))

    const field = {
      name: false,
      CNH: false,
      plate: false,
    }
    const message = {
      name: false,
      CNH: false,
      plate: false,
    }

    let errors = false

    if (technicianNotHasProp('name') || !technician.name) {
      errors = true
      field.nome = true
      message.nome = 'Por favor informar nome do técinico.'
    } else if (!/^[A-Za-zà-ù]/gi.test(technician.name)) {
      errors = true
      field.nome = true
      message.nome = 'Nome inválido.'
    } else {
      const nameHasExist = await Technician.findOne({
        where: { name: technician.name },
        transaction,
      })

      if (nameHasExist) {
        errors = true
        field.nome = true
        message.nome = 'Há um técnico cadastrado com esse nome'
      }
    }

    if (technicianNotHasProp('CNH') || !technician.CNH) {
      errors = true
      field.cnh = true
      message.cnh = 'Por favor a CNH.'
    } else if (/\D\/-./gi.test(technician.CNH) || technician.CNH.replace(/\D/gi, '').length !== 8) {
      errors = true
      field.cnh = true
      message.cnh = 'Por favor 8 números.'
    }

    if (bodyDataNotHasProp('plate') || !bodyData.plate) {
      errors = true
      field.car = true
      message.car = 'Por favor informar a placa do carro.'
    } else if (!/^[A-Z]{3}-\d{4}/.test(bodyData.plate)) {
      errors = true
      field.car = true
      message.car = 'Placa inválida.'
    } else {
      const car = await Car.findOne({
        where: { plate: bodyData.plate },
        transaction,
      })

      if (!car) {
        errors = true
        field.plate = true
        message.plate = 'Não há nenhum carro cadastrado com essa placa.'
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const car = await Car.findOne({
      where: { plate: bodyData.plate },
      transaction,
    })

    technician.CNH = technician.CNH.replace(/\D/gi, '')

    const technicianCreated = await Technician.create(technician, { transaction })

    await car.addTechnician(technicianCreated, { transaction })
    // await technicianCreated.addCar(car, { transaction })

    const response = await Technician.findByPk(technicianCreated.id, {
      include: [{
        model: Car,
      }],
      transaction,
    })

    return response
  }

  // async getAll(options = {}) {
  //   const inicialOrder = {
  //     field: 'createdAt',
  //     acendent: true,
  //     direction: 'DESC',
  //   }

  //   const { query = null, transaction = null } = options

  //   const newQuery = Object.assign({}, query)
  //   const newOrder = (query && query.order) ? query.order : inicialOrder

  //   if (newOrder.acendent) {
  //     newOrder.direction = 'DESC'
  //   } else {
  //     newOrder.direction = 'ASC'
  //   }

  //   const {
  //     getWhere,
  //     limit,
  //     offset,
  //     pageResponse,
  //   } = formatQuery(newQuery)

  //   const technical = await Technician.findAndCountAll({
  //     where: getWhere('technician'),
  //     order: [
  //       [newOrder.field, newOrder.direction],
  //     ],
  //     limit,
  //     offset,
  //     transaction,
  //   })

  //   const { rows } = technical

  //   if (rows.length === 0) {
  //     return {
  //       page: null,
  //       show: 0,
  //       count: technical.count,
  //       rows: [],
  //     }
  //   }

  //   const formatDateFunct = (date) => {
  //     moment.locale('pt-br')
  //     const formatDate = moment(date).format('L')
  //     const formatHours = moment(date).format('LT')
  //     const dateformated = `${formatDate} ${formatHours}`
  //     return dateformated
  //   }

  //   const formatData = R.map((technician) => {
  //     const resp = {
  //       id: technician.id,
  //       name: technician.name,
  //       CNH: technician.CNH,
  //       createdAt: formatDateFunct(technician.createdAt),
  //       updatedAt: formatDateFunct(technician.updatedAt),
  //     }
  //     return resp
  //   })

  //   const technicianList = formatData(rows)

  //   let show = limit
  //   if (technical.count < show) {
  //     show = technical.count
  //   }


  //   const response = {
  //     page: pageResponse,
  //     show,
  //     count: technical.count,
  //     rows: technicianList,
  //   }
  //   return response
  // }

  async getAll(options = {}) {
    const { transaction = null } = options

    const technician = await Technician.findAll({
      attributes: ['id', 'name'],
      order: [
        ['name', 'ASC'],
      ],
      transaction,
    })


    // const formatData = R.map((technician) => {
    //   const resp = {
    //     name: technician.name,
    //   }
    //   return resp
    // })

    // const technicianList = technician.map(tec => ({
    //   name: tec.name,
    // }))

    return technician
  }
}
