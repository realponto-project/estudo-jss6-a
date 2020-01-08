/* eslint-disable max-len */
const R = require('ramda')
// const moment = require('moment')
// const axios = require('axios')

// const Cnpj = require('@fnando/cnpj/dist/node')
// const Cpf = require('@fnando/cpf/dist/node')

// const formatQuery = require('../../../../helpers/lazyLoad')
const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const Equip = database.model('equip')
const Product = database.model('product')
const ProductBase = database.model('productBase')
// const Notification = database.model('notification')
const Technician = database.model('technician')
const TechnicianReserveParts = database.model('technicianReserveParts')
const TechnicianReserve = database.model('technicianReserve')

module.exports = class TechnicianReserveDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const technicianReserve = R.omit(
      ['id', 'technicianReserveParts'],
      bodyData,
    )

    const technicianReserveNotHasProp = prop => R.not(R.has(prop, technicianReserve))
    const bodyHasProp = prop => R.has(prop, bodyData)

    const field = {
      razaoSocial: false,
      data: false,
      technicianReserveParts: false,
      technicianId: false,
    }
    const message = {
      razaoSocial: '',
      data: '',
      technicianReserveParts: '',
      technicianId: '',
    }

    let errors = false

    if (
      technicianReserveNotHasProp('razaoSocial')
      || !technicianReserve.razaoSocial
    ) {
      errors = true
      field.razaoSocial = true
      message.razaoSocial = 'Digite o nome ou razão social.'
    }

    if (technicianReserveNotHasProp('date') || !technicianReserve.date) {
      errors = true
      field.data = true
      message.data = 'Por favor a data de atendimento.'
    }

    if (
      !bodyHasProp('technicianReserveParts')
      || !bodyData.technicianReserveParts
    ) {
      errors = true
      field.technicianReserveParts = true
      message.technicianReserveParts = 'Deve haver ao menos um peça associada.'
    }

    if (technicianReserveNotHasProp('technicianId') || !technicianReserve.technicianId) {
      errors = true
      field.technician = true
      message.technician = 'Por favor o ID do tecnico'
    } else {
      const { technicianId } = bodyData
      const technicianExist = await Technician.findByPk(technicianId, {
        transaction,
      })

      if (!technicianExist) {
        errors = true
        field.technician = true
        message.technician = 'Técnico não encomtrado'
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const technicianReserveCreated = await TechnicianReserve.create(
      technicianReserve,
      {
        transaction,
      },
    )

    if (bodyHasProp('technicianReserveParts')) {
      const { technicianReserveParts } = bodyData

      const technicianReservePartsCreattedPromises = technicianReserveParts.map(
        async (item) => {
          const productBase = await ProductBase.findByPk(item.productBaseId, {
            include: [
              {
                model: Product,
              },
            ],
            transaction,
          })

          const technicianReservePartsCreatted = {
            ...item,
            technicianReserveCreatedId: technicianReserveCreated.id,
          }

          if (!productBase) {
            field.peca = true
            message.peca = 'produto não consta na base de dados'
            throw new FieldValidationError([{ field, message }])
          }

          const technicianReservePartCreated = await TechnicianReserveParts.create(
            technicianReservePartsCreatted,
            {
              transaction,
            },
          )

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

                await equip.update(
                  {
                    ...equip,
                    technicianReservePartCreatedId: technicianReservePartCreated.id,
                    reserved: true,
                  },
                  { transaction },
                )
                await equip.destroy({ transaction })
              })
            }
          }

          const productBaseUpdate = {
            ...productBase,
            available: (
              parseInt(productBase.available, 10) - parseInt(item.amount, 10)
            ).toString(),
            amount: (parseInt(productBase.amount, 10) - parseInt(item.amount, 10)).toString(),
          }

          if (
            parseInt(productBaseUpdate.available, 10) < 0
            || parseInt(productBaseUpdate.available, 10) < 0
          ) {
            field.productBaseUpdate = true
            message.productBaseUpdate = 'Número negativo não é valido'
            throw new FieldValidationError([{ field, message }])
          }

          // if (
          //   parseInt(productBaseUpdate.available, 10)
          //   < parseInt(productBase.product.minimumStock, 10)
          // ) {
          //   const messageNotification = `${productBase.product.name} está abaixo da quantidade mínima disponível no estoque, que é de ${productBase.product.minimumStock} unidades`

          //   await Notification.create(
          //     { message: messageNotification },
          //     { transaction },
          //   )
          // }

          await productBase.update(productBaseUpdate, { transaction })
        },
      )
      await Promise.all(technicianReservePartsCreattedPromises)
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }

    const response = await TechnicianReserve.findByPk(
      technicianReserveCreated.id,
      {
        include: [
          {
            model: ProductBase,
          },
        ],
        transaction,
      },
    )

    return response
  }
}
