/* eslint-disable array-callback-return */
/* eslint-disable max-len */
const R = require('ramda')
const moment = require('moment')
const Sequelize = require('sequelize')
// const axios = require('axios')

const Cnpj = require('@fnando/cnpj/dist/node')

const formatQuery = require('../../../../helpers/lazyLoad')
const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const Os = database.model('os')
const OsParts = database.model('osParts')
const Product = database.model('product')
const ProductBase = database.model('productBase')
const StockBase = database.model('stockBase')
const Technician = database.model('technician')
const Equip = database.model('equip')
const KitOut = database.model('kitOut')
const KitParts = database.model('kitParts')
const Notification = database.model('notification')

const { Op: operators } = Sequelize

module.exports = class OsDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const reserve = R.omit(['id', 'osParts'], bodyData)

    const reserveNotHasProp = prop => R.not(R.has(prop, reserve))
    const bodyHasProp = prop => R.has(prop, bodyData)

    const field = {
      // Os: false,
      razaoSocial: false,
      data: false,
      cnpj: false,
      date: false,
      osParts: false,
      technician: false,
    }
    const message = {
      // Os: '',
      razaoSocial: '',
      data: '',
      cnpj: '',
      date: '',
      osParts: '',
      technician: '',
    }

    let errors = false

    // if (reserveNotHasProp('os') || !reserve.os) {
    //   errors = true
    //   field.Os = true
    //   message.Os = 'Por favor o numero da OS.'
    // } else if (/\D/ig.test(reserve.os)) {
    //   errors = true
    //   field.Os = true
    //   message.Os = 'OS deve cnter apenas números.'
    // }

    if (reserveNotHasProp('razaoSocial') || !reserve.razaoSocial) {
      errors = true
      field.razaoSocial = true
      message.razaoSocial = 'Por favor a razão social.'
    }

    if (reserveNotHasProp('cnpj') || !reserve.cnpj) {
      errors = true
      field.cnpj = true
      message.cnpj = 'Por favor informar o cnpj.'
    } else {
      const cnpj = reserve.cnpj.replace(/\D/g, '')

      if (!Cnpj.isValid(cnpj)) {
        errors = true
        field.cnpj = true
        message.cnpj = 'O cnpj informado não é válido.'
      }
    }
    if (reserveNotHasProp('date') || !reserve.date) {
      errors = true
      field.data = true
      message.data = 'Por favor a data de atendimento.'
    }

    if (!bodyHasProp('osParts') || !bodyData.osParts) {
      errors = true
      field.osParts = true
      message.osParts = 'Deve haver ao menos um peça associada.'
    }

    if (reserveNotHasProp('technicianId') || !reserve.technicianId) {
      errors = true
      field.technician = true
      message.technician = 'Por favor o ID do tecnico'
    } else {
      const { technicianId } = bodyData
      const technicianExist = await Technician.findByPk(technicianId, { transaction })

      if (!technicianExist) {
        errors = true
        field.technician = true
        message.technician = 'Técnico não encomtrado'
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    // reserve.date = new Date(reserve.date)

    const reserveHasExist = await Os.findOne({
      where: {
        date: {
          [operators.gte]: moment(reserve.date).startOf('day').toString(),
          [operators.lte]: moment(reserve.date).endOf('day').toString(),
        },
        razaoSocial: reserve.razaoSocial,
        cnpj: reserve.cnpj.replace(/\D/g, ''),
      },
      transaction,
    })

    if (reserveHasExist) {
      field.message = true
      message.message = 'Há uma reserva nesta data para esta empresa'
      throw new FieldValidationError([{ field, message }])
    }

    const reserveAll = await Os.findAll({ paranoid: false, transaction })

    reserve.os = (reserveAll.length + 1).toString()
    reserve.cnpj = reserve.cnpj.replace(/\D/g, '')

    // console.log(reserve, 'TEST')

    const reserveCreated = await Os.create(reserve, { transaction })

    // console.log(JSON.parse(JSON.stringify(reserveCreated)))

    // await reserveCreated.update({ ...reserveCreated, os: reserveCreated.id.toString() }, { transaction })

    if (bodyHasProp('osParts')) {
      const { osParts } = bodyData

      const osPartsCreattedPromises = osParts.map(async (item) => {
        const productBase = await ProductBase.findByPk(item.productBaseId, {
          include: [{
            model: Product,
            // attributes: ['serial'],
          }],
          transaction,
        })

        const osPartsCreatted = {
          ...item,
          oId: reserveCreated.id,
        }

        if (!productBase) {
          field.peca = true
          message.peca = 'produto não oconst a na base de dados'
          throw new FieldValidationError([{ field, message }])
        }

        const osPartCreated = await OsParts.create(osPartsCreatted, { transaction })

        if (productBase.product.serial) {
          const { serialNumberArray } = item

          if (serialNumberArray.length !== parseInt(item.amount, 10)) {
            errors = true
            field.serialNumbers = true
            message.serialNumbers = 'quantidade adicionada nãop condiz com a quantidade de números de série.'
          }

          if (serialNumberArray.length > 0) {
            await serialNumberArray.map(async (serialNumber) => {
              const equip = await Equip.findOne({
                where: {
                  serialNumber,
                  reserved: false,
                  productBaseId: productBase.id,
                },
                transaction,
              })

              if (!equip) {
                errors = true
                field.serialNumber = true
                message.serialNumber = `este equipamento não esta cadastrado nessa base de estoque/ ${serialNumber} ja esta reservado`
                throw new FieldValidationError([{ field, message }])
              }
            })
            await serialNumberArray.map(async (serialNumber) => {
              const equip = await Equip.findOne({
                where: {
                  serialNumber,
                  reserved: false,
                  productBaseId: productBase.id,
                },
                transaction,
              })

              // console.log(JSON.parse(JSON.stringify(equip)))
              await equip.update({
                ...equip,
                osPartId: osPartCreated.id,
                reserved: true,
              }, { transaction })

              // const equip1 = await Equip.findOne({
              //   where: {
              //     serialNumber,
              //     reserved: false,
              //     productBaseId: productBase.id,
              //   },
              //   transaction,
              // })

              // console.log(JSON.parse(JSON.stringify(equip1)))
            })
          }
        }

        const productBaseUpdate = {
          ...productBase,
          available: (parseInt(productBase.available, 10) - parseInt(item.amount, 10)).toString(),
          reserved: (parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)).toString(),
        }

        if (parseInt(productBaseUpdate.available, 10) < 0 || parseInt(productBaseUpdate.available, 10) < 0) {
          field.productBaseUpdate = true
          message.productBaseUpdate = 'Número negativo não é valido'
          throw new FieldValidationError([{ field, message }])
        }

        if (parseInt(productBaseUpdate.available, 10) < parseInt(productBase.product.minimumStock, 10)) {
          const messageNotification = `${productBase.product.name} está abaixo da quantidade mínima disponível no estoque, que é de ${productBase.product.minimumStock} unidades`

          await Notification.create({ message: messageNotification }, { transaction })
        }

        await productBase.update(productBaseUpdate, { transaction })
      })
      await Promise.all(osPartsCreattedPromises)
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }
    // console.log('teste 2')

    // const teste = await Os.findByPk(reserveCreated.id, {
    //   include: [
    //     {
    //       model: ProductBase,
    //       // include: [{
    //       //   model: Product,
    //       // }],
    //     },
    //     {
    //       model: Technician,
    //     },
    //   ],
    //   transaction,
    // })

    // console.log(JSON.parse(JSON.stringify(teste)))

    const response = await Os.findByPk(reserveCreated.id, {
      include: [
        {
          model: ProductBase,
          // include: [{
          //   model: Product,
          // }],
        },
        {
          model: Technician,
        },
      ],
      transaction,
    })

    // console.log(JSON.parse(JSON.stringify(response)))

    return response
  }

  async delete(osId, options = {}) {
    const { transaction = null } = options

    const field = {
      os: false,
    }
    const message = {
      os: '',
    }

    const os = await Os.findByPk(osId, { transaction })

    if (os) {
      const osParts = await OsParts.findAll({
        where: { oId: osId },
        transaction,
      })

      const osPartsPromise = osParts.map(async (item) => {
        const productBase = await ProductBase.findByPk(item.productBaseId, { transaction })

        const equips = await Equip.findAll({
          where: { osPartId: item.id },
          transaction,
        })

        const equipUpdatePromise = equips.map(async (equip) => {
          await equip.update({
            ...equip,
            reserved: false,
          }, { transaction })
        })

        await Promise.all(equipUpdatePromise)

        const productBaseUpdate = {
          ...productBase,
          available: (parseInt(productBase.available, 10) + parseInt(item.amount, 10)).toString(),
          reserved: (parseInt(productBase.reserved, 10) - parseInt(item.amount, 10)).toString(),
        }

        if (parseInt(productBaseUpdate.available, 10) < 0 || parseInt(productBaseUpdate.available, 10) < 0) {
          field.productBaseUpdate = true
          message.productBaseUpdate = 'Número negativo não é valido'
          throw new FieldValidationError([{ field, message }])
        }

        if (parseInt(productBaseUpdate.available, 10) < parseInt(productBase.product.minimumStock, 10)) {
          const messageNotification = `${productBase.product.name} está abaixo da quantidade mínima disponível no estoque, que é de ${productBase.product.minimumStock} unidades`

          await Notification.create({ message: messageNotification }, { transaction })
        }

        await productBase.update(productBaseUpdate, { transaction })

        await item.destroy()
      })

      await Promise.all(osPartsPromise)

      await os.destroy()
    } else {
      field.os = true
      message.os = 'Os não encontrada'

      throw new FieldValidationError([{ field, message }])
    }

    const osDeleted = await Os.findByPk(osId, { transaction })

    if (!osDeleted) {
      return 'sucesso'
    }
    return 'erro'
  }

  async update(bodyData, options = {}) {
    const { transaction = null } = options

    const reserve = R.omit(['id'], bodyData)
    const oldReserve = await Os.findByPk(bodyData.id, { transaction })

    const reserveOs = { ...oldReserve }

    const reserveHasProp = prop => R.has(prop, reserve)

    const field = {
      date: false,
    }
    const message = {
      date: '',
    }

    // console.log(bodyData)

    let errors = false

    if (reserveHasProp('date')) {
      if (!reserve.date) {
        errors = true
        field.date = true
        message.date = 'date não pode ser nula.'
      } else {
        reserveOs.date = reserve.date
      }
    }

    const reserveHasExist = await Os.findOne({
      where: {
        date: {
          [operators.gte]: moment(reserve.date).startOf('day').toString(),
          [operators.lte]: moment(reserve.date).endOf('day').toString(),
        },
        razaoSocial: oldReserve.razaoSocial,
        cnpj: oldReserve.cnpj.replace(/\D/g, ''),
      },
      transaction,
    })

    if (reserveHasExist && reserveHasExist.id !== bodyData.id) {
      field.message = true
      message.message = 'Há uma reserva nesta data para esta empresa'
      throw new FieldValidationError([{ field, message }])
    }

    if (reserveHasProp('technicianId')) {
      const technician = await Technician.findByPk(reserve.technicianId, { transaction })
      if (!technician) {
        errors = true
        field.technicianId = true
        message.technicianId = 'Técnico não foi encontrado.'
      } else reserveOs.technicianId = reserve.technicianId
    }

    if (reserveHasProp('osParts')) {
      const { osParts } = reserve

      let osPartsAll = await OsParts.findAll({
        where: { oId: bodyData.id },
        attributes: ['id', 'productBaseId'],
        transaction,
      })

      // console.log(JSON.parse(JSON.stringify(osPartsAll)))

      const osPartsUpdatePromises = osParts.map(async (item) => {
        if (R.prop('id', item)) {
          const osPartsReturn = await OsParts.findByPk(item.id, { transaction })

          // eslint-disable-next-line consistent-return
          osPartsAll = await osPartsAll.filter((itemOld) => {
            if (itemOld.id !== item.id) {
              return itemOld.id
            }
          })

          const productBase = await ProductBase.findByPk(osPartsReturn.productBaseId, { transaction })

          const productBaseUpdate = {
            ...productBase,
            available: (parseInt(productBase.available, 10) + parseInt(osPartsReturn.amount, 10) - parseInt(item.amount, 10)).toString(),
            reserved: (parseInt(productBase.reserved, 10) - parseInt(osPartsReturn.amount, 10) + parseInt(item.amount, 10)).toString(),
          }

          if (parseInt(productBaseUpdate.available, 10) < 0 || parseInt(productBaseUpdate.available, 10) < 0) {
            field.productBaseUpdate = true
            message.productBaseUpdate = 'Número negativo não é valido'
            throw new FieldValidationError([{ field, message }])
          }

          if (parseInt(productBaseUpdate.available, 10) < parseInt(productBase.product.minimumStock, 10)) {
            const messageNotification = `${productBase.product.name} está abaixo da quantidade mínima disponível no estoque, que é de ${productBase.product.minimumStock} unidades`

            await Notification.create({ message: messageNotification }, { transaction })
          }
          // console.log('osPartsReturn')
          const osPartsUpdate = {
            ...osPartsReturn,
            amount: item.amount,
          }


          await osPartsReturn.update(osPartsUpdate, { transaction })
          await productBase.update(productBaseUpdate, { transaction })
        } else {
          const osPartsCreatted = {
            ...item,
            oId: bodyData.id,
          }

          const osPartCreated = await OsParts.create(osPartsCreatted, { transaction })

          const productBase = await ProductBase.findByPk(item.productBaseId, {
            include: [{
              model: Product,
              attributes: ['serial'],
            }],
            transaction,
          })

          if (!productBase) {
            field.peca = true
            message.peca = 'produto não oconst a na base de dados'
            throw new FieldValidationError([{ field, message }])
          }

          if (productBase.product.serial) {
            const { serialNumberArray } = item

            if (serialNumberArray.length !== parseInt(item.amount, 10)) {
              errors = true
              field.serialNumbers = true
              message.serialNumbers = 'quantidade adicionada nãop condiz com a quantidade de números de série.'
            }

            if (serialNumberArray.length > 0) {
              await serialNumberArray.map(async (serialNumber) => {
                const equip = await Equip.findOne({
                  where: {
                    serialNumber,
                    reserved: false,
                    productBaseId: productBase.id,
                  },
                  transaction,
                })

                if (!equip) {
                  errors = true
                  field.serialNumber = true
                  message.serialNumber = `este equipamento não esta cadastrado nessa base de estoque/ ${serialNumber} ja esta reservado`
                  throw new FieldValidationError([{ field, message }])
                }
              })

              await serialNumberArray.map(async (serialNumber) => {
                const equip = await Equip.findOne({
                  where: {
                    serialNumber,
                    reserved: false,
                    productBaseId: productBase.id,
                  },
                  transaction,
                })

                await equip.update({
                  ...equip,
                  osPartId: osPartCreated.id,
                  reserved: true,
                }, { transaction })
              })
            }
          }

          const productBaseUpdate = {
            ...productBase,
            available: (parseInt(productBase.available, 10) - parseInt(item.amount, 10)).toString(),
            reserved: (parseInt(productBase.reserved, 10) + parseInt(item.amount, 10)).toString(),
          }

          if (parseInt(productBaseUpdate.available, 10) < 0 || parseInt(productBaseUpdate.available, 10) < 0) {
            field.productBaseUpdate = true
            message.productBaseUpdate = 'Número negativo não é valido'
            throw new FieldValidationError([{ field, message }])
          }

          if (parseInt(productBaseUpdate.available, 10) < parseInt(productBase.product.minimumStock, 10)) {
            const messageNotification = `${productBase.product.name} está abaixo da quantidade mínima disponível no estoque, que é de ${productBase.product.minimumStock} unidades`

            await Notification.create({ message: messageNotification }, { transaction })
          }

          await productBase.update(productBaseUpdate, { transaction })
        }
      })
      await Promise.all(osPartsUpdatePromises)

      // console.log(JSON.parse(JSON.stringify(osPartsAll)))

      if (osPartsAll.length > 0) {
        const osPartsdeletePromises = osPartsAll.map(async (item) => {
          const osPartDelete = await OsParts.findByPk(item.id, { transaction })

          const equips = await Equip.findAll({
            where: { osPartId: item.id },
            transaction,
          })

          const equipUpdatePromise = equips.map(async (equip) => {
            await equip.update({
              ...equip,
              reserved: false,
              osPartId: null,
            }, { transaction })
          })

          // console.log(JSON.parse(JSON.stringify(item)))

          await Promise.all(equipUpdatePromise)

          const productBase = await ProductBase.findByPk(item.productBaseId, { transaction })

          const productBaseUpdate = {
            ...productBase,
            available: (parseInt(productBase.available, 10) + parseInt(osPartDelete.amount, 10)).toString(),
            reserved: (parseInt(productBase.reserved, 10) - parseInt(osPartDelete.amount, 10)).toString(),
          }

          if (parseInt(productBaseUpdate.available, 10) < 0 || parseInt(productBaseUpdate.available, 10) < 0) {
            field.productBaseUpdate = true
            message.productBaseUpdate = 'Número negativo não é valido'
            throw new FieldValidationError([{ field, message }])
          }

          if (parseInt(productBaseUpdate.available, 10) < parseInt(productBase.product.minimumStock, 10)) {
            const messageNotification = `${productBase.product.name} está abaixo da quantidade mínima disponível no estoque, que é de ${productBase.product.minimumStock} unidades`

            await Notification.create({ message: messageNotification }, { transaction })
          }

          await productBase.update(productBaseUpdate, { transaction })

          osPartDelete.destroy({ transaction })
        })

        await Promise.all(osPartsdeletePromises)
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    // console.log(JSON.parse(JSON.stringify(oldReserve)))

    await oldReserve.update(reserveOs, { transaction })

    const response = await Os.findByPk(oldReserve.id, { transaction })

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

    const required = R.prop('required', query) === undefined ? true : R.prop('required', query)
    const paranoid = R.prop('paranoid', query) === undefined ? false : R.prop('paranoid', query)

    const {
      getWhere,
      limit,
      offset,
      pageResponse,
    } = formatQuery(newQuery)

    // console.log('tests')

    const os = await Os.findAndCountAll({
      where: getWhere('os'),
      include: [
        {
          model: Technician,
          where: getWhere('technician'),
        },
        {
          model: ProductBase,
          include: [{
            model: Product,
          }],
          required,
        },
        // {
        //   model: Product,
        //   required,
        // },
      ],
      order: [
        [newOrder.field, newOrder.direction],
      ],
      limit,
      offset,
      paranoid,
      transaction,
    })

    // console.log('tests')
    // console.log(paranoid)

    // console.log(JSON.parse(JSON.stringify(os)))
    // console.log(JSON.parse(JSON.stringify(os.rows[0].productBases)))

    const { rows } = os

    if (rows.length === 0) {
      return {
        page: null,
        show: 0,
        count: os.count,
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

    const formatProductDelete = R.map((item) => {
      const resp = {
        name: item.productBase.product.name,
        osPartsId: item.id,
        amount: item.amount,
        output: item.output,
        missOut: item.missOut,
        return: item.return,
        quantMax: (parseInt(item.amount, 10)) - (parseInt(item.return, 10)) - (parseInt(item.output, 10)) - (parseInt(item.missOut, 10)),
      }
      return resp
    })

    const formatKitOut = R.map((item) => {
      const resp = {
        name: `#${item.kitPart.productBase.product.name}`,
        amount: '-',
        output: item.amount,
        missOut: '-',
        return: '-',
      }
      return resp
    })

    const formatProductNull = async (id) => {
      const osParts = await OsParts.findAll({
        where: {
          oId: id,
        },
        include: [
          {
            model: ProductBase,
            include: [{
              model: Product,
            }],
          },
          {
            model: Os,
            paranoid: false,
          },
        ],
        paranoid: false,
        transaction,
      })

      // console.log(JSON.parse(JSON.stringify(osParts[0].o.os)))

      const kitOuts = await KitOut.findAll({
        // where: { os: id.toString() },
        where: { os: osParts[0].o.os },
        include: [{
          model: KitParts,
          include: [{
            model: ProductBase,
            include: [{
              model: Product,
            }],
          }],
        }],
        transaction,
      })

      // console.log(JSON.parse(JSON.stringify(kitOuts)))

      // console.log(formatKitOut(kitOuts))
      const resp = formatProductDelete(osParts)

      Array.prototype.push.apply(resp, formatKitOut(kitOuts))

      return resp
    }

    let notDelet = false

    const formatProduct = R.map(async (item) => {
      notDelet = (item.osParts.output !== '0' || item.osParts.missOut !== '0' || item.osParts.return !== '0')

      // console.log(notDelet)
      // console.log(JSON.parse(JSON.stringify(item.osParts)))
      // console.log(JSON.parse(JSON.stringify(item)))

      // console.log(item.osParts.return !== '0')

      let equips = []

      if (item.product.serial) {
        equips = await Equip.findAll({
          attributes: ['serialNumber'],
          where: { osPartId: item.osParts.id },
          transaction,
        })
        notDelet = parseInt(item.osParts.amount, 10) !== equips.length
      }

      const quantMax = (parseInt(item.osParts.amount, 10)) - (parseInt(item.osParts.return, 10)) - (parseInt(item.osParts.output, 10)) - (parseInt(item.osParts.missOut, 10))

      const resp = {
        serialNumbers: equips,
        name: item.product.name,
        serial: item.product.serial,
        id: item.osParts.id,
        amount: item.osParts.amount,
        output: item.osParts.output,
        missOut: item.osParts.missOut,
        return: item.osParts.return,
        quantMax,
      }
      return resp
    })

    const formatData = R.map(async (item) => {
      const osParts = await OsParts.findAll({
        where: {
          oId: item.id,
        },
        attributes: [],
        paranoid: false,
        transaction,
      })

      const resp = {
        id: item.id,
        razaoSocial: item.razaoSocial,
        cnpj: item.cnpj,
        date: item.date,
        formatedDate: moment(item.date).format('L'),
        technician: item.technician.name,
        technicianId: item.technicianId,
        os: item.os,
        createdAt: formatDateFunct(item.createdAt),
        // products: formatProduct(item.productBases),
        products: item.productBases.length !== 0 ? await Promise.all(formatProduct(item.productBases)) : await formatProductNull(item.id),
        notDelet: (osParts.length !== item.productBases.length) || notDelet,
      }
      // console.log(formatProduct(item.productBases))
      // console.log(resp.os, resp.notDelet)
      return resp
    })

    const osList = await Promise.all(formatData(rows))

    let show = limit
    if (os.count < show) {
      show = os.count
    }


    const response = {
      page: pageResponse,
      show,
      count: os.count,
      rows: osList,
    }

    // console.log(response.rows[0].products)
    // console.log(response.rows)

    return response
  }

  async getOsByOs(os, options = {}) {
    const { transaction = null } = options

    const formatDateFunct = (date) => {
      moment.locale('pt-br')
      const formatDate = moment(date)
      return formatDate
    }

    const osReturn = await Os.findOne({
      where: { os },
      include: [
        {
          model: Technician,
        },
        {
          model: ProductBase,
          include: [
            {
              model: Product,
            },
            {
              model: StockBase,
            },
          ],
        },
      ],
      transaction,
    })

    if (!osReturn) {
      return {
        razaoSocial: '',
        cnpj: '',
        // data: formatDateFunct(new Date()),
        technician: '',
        reserve: [],
      }
    }

    const formatedReserve = R.map((item) => {
      const resp = {
        stockBase: item.stockBase.stockBase,
        amount: item.osParts.amount,
        nomeProdutoCarrinho: item.product.name,
        productId: item.productId,
      }
      return resp
    })

    // console.log(JSON.parse(JSON.stringify(osReturn.productBases)))

    const response = {
      razaoSocial: osReturn.razaoSocial,
      cnpj: osReturn.cnpj,
      data: formatDateFunct(osReturn.date),
      technician: osReturn.technician.name,
      reserve: formatedReserve(osReturn.productBases),
    }

    // console.log(JSON.parse(JSON.stringify(response)))
    // console.log(response)

    return response
  }

  async output(bodyData, options = {}) {
    const { transaction = null } = options
    const bodyDataNotHasProp = prop => R.not(R.has(prop, bodyData))
    // const bodyHasProp = prop => R.has(prop, bodyData)

    const field = {
      osPartsId: false,
      add: false,
    }
    const message = {
      osPartsId: '',
      add: '',
    }

    let errors = false

    if (bodyDataNotHasProp('osPartsId') || !bodyData.osPartsId) {
      errors = true
      field.osPartsId = true
      message.osPartsId = 'Informe o id do produto.'
    } else {
      const osPart = await OsParts.findByPk(bodyData.osPartsId, { transaction })

      if (!osPart) {
        errors = true
        field.osPartsId = true
        message.osPartsId = 'produto não foi encontrada.'
      }
    }

    if (bodyDataNotHasProp('add') || !bodyData.add) {
      errors = true
      field.add = true
      message.add = 'Por favor a quantidade'
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const osPart = await OsParts.findByPk(bodyData.osPartsId, { transaction })

    const { add } = bodyData

    const key = R.keys(add)[0]

    const value = R.prop([key], add)

    const total = (parseInt(osPart.amount, 10) - parseInt(osPart.output, 10) - parseInt(osPart.missOut, 10) - parseInt(osPart.return, 10))

    if (parseInt(value, 10) > total) {
      errors = true
      field.add = true
      message.add = 'quantidade adicionada exede o limite'
      throw new FieldValidationError([{ field, message }])
    }

    const productBase = await ProductBase.findByPk(osPart.productBaseId, {
      include: [{
        model: Product,
        attributes: ['serial'],
      }],
      transaction,
    })

    let productBaseUpdate = {}

    if (productBase.product.serial) {
      const { serialNumberArray } = bodyData

      if (serialNumberArray.length !== parseInt(value, 10)) {
        errors = true
        field.serialNumbers = true
        message.serialNumbers = 'quantidade adicionada nãop condiz com a quantidade de números de série.'
      }

      if (serialNumberArray.length > 0) {
        await serialNumberArray.map(async (serialNumber) => {
          const equip = await Equip.findOne({
            where: {
              serialNumber,
              reserved: true,
              productBaseId: productBase.id,
            },
            transaction,
          })

          if (!equip) {
            errors = true
            field.serialNumber = true
            message.serialNumber = 'este equipamento não esta cadastrado nessa base de estoque'
            throw new FieldValidationError([{ field, message }])
          }
        })
        await serialNumberArray.map(async (serialNumber) => {
          const equip = await Equip.findOne({
            where: {
              serialNumber,
              reserved: true,
              productBaseId: productBase.id,
            },
            transaction,
          })

          if (key !== 'output') {
            await equip.update({
              ...equip,
              osPartId: null,
            }, { transaction })
          }

          if (key !== 'return') {
            await equip.destroy({ transaction })
          } else {
            await equip.update({
              ...equip,
              reserved: false,
            }, { transaction })
          }
        })
      }
    }

    if (key === 'return') {
      productBaseUpdate = {
        ...productBase,
        available: (parseInt(productBase.available, 10) + parseInt(value, 10)).toString(),
        reserved: (parseInt(productBase.reserved, 10) - parseInt(value, 10)).toString(),
      }
    } else {
      productBaseUpdate = {
        ...productBase,
        amount: (parseInt(productBase.amount, 10) - parseInt(value, 10)).toString(),
        reserved: (parseInt(productBase.reserved, 10) - parseInt(value, 10)).toString(),
      }
    }

    if (parseInt(productBaseUpdate.available, 10) < 0 || parseInt(productBaseUpdate.available, 10) < 0) {
      field.productBaseUpdate = true
      message.productBaseUpdate = 'Número negativo não é valido'
      throw new FieldValidationError([{ field, message }])
    }

    if (parseInt(productBaseUpdate.available, 10) < parseInt(productBase.product.minimumStock, 10)) {
      const messageNotification = `${productBase.product.name} está abaixo da quantidade mínima disponível no estoque, que é de ${productBase.product.minimumStock} unidades`

      await Notification.create({ message: messageNotification }, { transaction })
    }

    await productBase.update(productBaseUpdate, { transaction })

    const osPartUpdate = {
      ...osPart,
      [key]: (parseInt(value, 10) + parseInt(osPart[key], 10)).toString(),
    }

    await osPart.update(osPartUpdate, { transaction })

    const osPartsUpdate = await OsParts.findByPk(bodyData.osPartsId, { transaction })

    if (total - parseInt(value, 10) === 0) {
      await osPartsUpdate.destroy({ transaction })
    }

    const os = await Os.findByPk(osPart.oId, {
      include: [{
        model: ProductBase,
      }],
      transaction,
    })

    if (os.productBases.length === 0) {
      await os.destroy({ transaction })
    }

    const response = await OsParts.findByPk(bodyData.osPartsId, { transaction })

    return response
  }
}
