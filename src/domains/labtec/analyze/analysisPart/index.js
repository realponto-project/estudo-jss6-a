const R = require('ramda')

const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

// const Part = database.model('part')
const AnalysisPart = database.model('analysisPart')
// const EquipModel = database.model('equipModel')
// const EquipMark = database.model('equipMark')
// const EquipType = database.model('equipType')
const User = database.model('user')


module.exports = class AnalysisPartDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const analysisPart = R.omit(['id'], bodyData)

    const analysisPartNotHasProp = prop => R.not(R.has(prop, analysisPart))

    const field = {
      // partId: false,
      analyzeId: false,
      description: false,
      responsibleUser: false,
    }
    const message = {
      // partId: '',
      analyzeId: '',
      description: '',
      responsibleUser: '',
    }

    let errors = false

    // if (analysisPartNotHasProp('partId') || !analysisPart.partId) {
    //   errors = true
    //   field.partId = true
    //   message.partId = 'Por favor selecione uma peça.'
    // } else {
    //   const analysisPartReturned = await Part.findOne({
    //     where: { id: analysisPart.partId },
    //     transaction,
    //   })

    //   if (!analysisPartReturned) {
    //     errors = true
    //     field.partId = true
    //     message.partId = 'Essa peça não existe.'
    //   }
    // }

    if (analysisPartNotHasProp('description') || !analysisPart.description) {
      errors = true
      field.description = true
      message.description = 'Campo descrição obrigatório.'
    }

    if (analysisPartNotHasProp('responsibleUser')) {
      errors = true
      field.responsibleUser = true
      message.responsibleUser = 'username não está sendo passado.'
    } else if (bodyData.responsibleUser !== null) {
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

    const analysisPartCreated = await AnalysisPart.create(analysisPart, { transaction })


    const response = await AnalysisPart.findByPk(analysisPartCreated.id, {
      // include: [
      //   {
      //     model: Part,
      //     include: [{
      //       model: EquipModel,
      //       include: [{
      //         model: EquipMark,
      //         include: [{
      //           model: EquipType,
      //         }],
      //       }],
      //     }],
      //   },
      // ],
      transaction,
    })

    return response
  }

  async analysisPartUpdate(id, body, options = {}) {
    const { transaction = null } = options

    const updates = R.omit(['id'], body)

    const updatesHasProp = prop => R.has(prop, updates)

    const analysisPart = await AnalysisPart.findByPk(id, { transaction })

    const updatedAnalysisPart = {
      ...analysisPart,
    }

    if (updatesHasProp('discount') && updates.discount) {
      // eslint-disable-next-line no-useless-escape
      const updatediscount = parseFloat(updates.discount.replace(/\,/g, '.'))

      updatedAnalysisPart.discount = updatediscount.toString()
    }

    if (updatesHasProp('effectivePrice') && updates.effectivePrice) {
      updatedAnalysisPart.effectivePrice = updates.effectivePrice.replace(/\D/g, '')
    }

    if (updatesHasProp('approved') && updates.approved) {
      updatedAnalysisPart.approved = updates.approved
    }

    if (updates.effectivePrice && updates.discount) {
      const effectivePrice = parseFloat(updates.effectivePrice.replace(/,/g, '.'))
      const discount = parseFloat(updates.discount.replace(/,/g, '.'))

      const finalPriceFloat = (effectivePrice * (1 - (discount / 100))).toFixed(2)

      const finalPrice = (finalPriceFloat.toString()).replace(/\D/g, '')


      updatedAnalysisPart.finalPrice = finalPrice
    }

    await analysisPart.update(updatedAnalysisPart, { transaction })

    const response = await AnalysisPart.findByPk(id, {
      // include: [
      //   {
      //     model: Part,
      //     include: [{
      //       model: EquipModel,
      //       include: [{
      //         model: EquipMark,
      //         include: [{
      //           model: EquipType,
      //         }],
      //       }],
      //     }],
      //   },
      // ],
      transaction,
    })

    return response
  }
}
