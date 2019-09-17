const R = require('ramda')
const moment = require('moment')

const formatQuery = require('../../../helpers/lazyLoad')
const database = require('../../../database')

const { FieldValidationError } = require('../../../helpers/errors')

// const Mark = database.model('mark')
// const Manufacturer = database.model('manufacturer')
const Car = database.model('car')
const Technician = database.model('technician')
const Kit = database.model('kit')
const KitParts = database.model('kitParts')
const ProductBase = database.model('productBase')

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

    if (technicianNotHasProp('external') || typeof technician.external !== 'boolean') {
      errors = true
      field.external = true
      message.external = 'Informar se é externo'
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

    if (technician.external) {
      const kit = await Kit.findOne({
        where: { technicianId: null },
        transaction,
      })

      if (kit) {
        const kitParts = await KitParts.findAll({
          where: { kitId: kit.id },
          transaction,
        })

        const kitCreated = await Kit.create({ technicianId: technicianCreated.id }, { transaction })

        const kitPartsPromise = kitParts.map(async (item) => {
          const kitPart = {
            kitId: kitCreated.id,
            productBaseId: item.productBaseId,
            amount: '0',
          }

          await KitParts.create(kitPart, { transaction })
        })

        await Promise.all(kitPartsPromise)
      }
    }

    const response = await Technician.findByPk(technicianCreated.id, {
      include: [{
        model: Car,
      }],
      transaction,
    })

    return response
  }

  async update(bodyData, options = {}) {
    const { transaction = null } = options

    const technician = R.omit(['id', 'plate'], bodyData)

    const technicianNotHasProp = prop => R.not(R.has(prop, technician))
    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))

    const oldTechnician = await Technician.findByPk(bodyData.id, {
      include: [{ model: Car }],
      transaction,
    })

    console.log(JSON.parse(JSON.stringify(oldTechnician)))

    // throw new FieldValidationError()

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

    if (!oldTechnician) {
      errors = true
      field.id = true
      message.id = 'Não foi encontrado o Tecnico'
    }

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

      if (nameHasExist && nameHasExist.id !== bodyData.id) {
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

    if (technicianNotHasProp('external') || typeof technician.external !== 'boolean') {
      errors = true
      field.external = true
      message.external = 'Informar se é externo'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }
    const car = await Car.findOne({
      where: { plate: bodyData.plate },
      transaction,
    })

    const oldCar = await Car.findByPk(oldTechnician.cars[0].id, { transaction })

    await oldCar.removeTechnician(oldTechnician, { transaction })

    technician.CNH = technician.CNH.replace(/\D/gi, '')

    await car.addTechnician(oldTechnician, { transaction })

    if (!oldTechnician.external && technician.external) {
      const kit = await Kit.findOne({
        where: { technicianId: null },
        transaction,
      })

      if (kit) {
        const kitParts = await KitParts.findAll({
          where: { kitId: kit.id },
          transaction,
        })

        const kitCreated = await Kit.create({ technicianId: oldTechnician.id }, { transaction })

        const kitPartsPromise = kitParts.map(async (item) => {
          const kitPart = {
            kitId: kitCreated.id,
            productBaseId: item.productBaseId,
            amount: '0',
          }

          await KitParts.create(kitPart, { transaction })
        })

        await Promise.all(kitPartsPromise)
      }
    }

    let count = {}

    if (oldTechnician.external && !technician.external) {
      const kit = await Kit.findOne({
        where: { technicianId: bodyData.id },
        transaction,
      })

      const oldKitParts = await KitParts.findAll({
        where: { kitId: kit.id },
        attributes: ['id', 'amount', 'productBaseId'],
        transaction,
      })

      const kitPartsDeletePromises = oldKitParts.map(async (item) => {
        const productBase = await ProductBase.findByPk(item.productBaseId, { transaction })

        count = {
          ...count,
          [item.productBaseId]: count[item.productBaseId] ? count[item.productBaseId] : 0,
        }

        count[item.productBaseId] += parseInt(item.amount, 10)

        const productBaseUpdate = {
          ...productBase,
          available: (parseInt(productBase.available, 10) + count[item.productBaseId]).toString(),
          reserved: (parseInt(productBase.reserved, 10) - count[item.productBaseId]).toString(),
        }

        if (parseInt(productBaseUpdate.available, 10) < 0
          || parseInt(productBaseUpdate.available, 10) < 0) {
          field.productBaseUpdate = true
          message.productBaseUpdate = 'Número negativo não é valido'
          throw new FieldValidationError([{ field, message }])
        }

        await productBase.update(productBaseUpdate, { transaction })

        await item.destroy({ transaction })
      })

      await Promise.all(kitPartsDeletePromises)

      await kit.destroy({ transaction })
    }

    const newTechnician = {
      ...oldTechnician,
      ...technician,
    }

    await oldTechnician.update(newTechnician, { transaction })

    const response = await Technician.findByPk(bodyData.id, {
      include: [{
        model: Car,
      }],
      transaction,
    })

    return response
  }

  async getAllTechnician(options = {}) {
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

    const technical = await Technician.findAndCountAll({
      where: getWhere('technician'),
      include: [{
        model: Car,
        where: getWhere('car'),
      }],
      order: [
        [newOrder.field, newOrder.direction],
      ],
      limit,
      offset,
      transaction,
    })

    const { rows } = technical

    // console.log(JSON.parse(JSON.stringify(rows.cars)))

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: technical.count,
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

    const formatData = R.map((technician) => {
      const resp = {
        id: technician.id,
        name: technician.name,
        CNH: technician.CNH,
        external: technician.external,
        plate: technician.cars[0].plate,
        createdAt: formatDateFunct(technician.createdAt),
        updatedAt: formatDateFunct(technician.updatedAt),
      }
      return resp
    })

    const technicianList = formatData(rows)

    let show = limit
    if (technical.count < show) {
      show = technical.count
    }


    const response = {
      page: pageResponse,
      show,
      count: technical.count,
      rows: technicianList,
    }
    return response
  }

  async getAll(options = {}) {
    const { query = null, transaction = null } = options

    const newQuery = Object.assign({}, query)

    const technician = await Technician.findAll({
      where: newQuery,
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
