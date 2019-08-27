
const R = require('ramda')

const database = require('../../../../database')

const { FieldValidationError } = require('../../../../helpers/errors')

const Pause = database.model('pause')

module.exports = class PauseDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    const pause = R.omit(['id'], bodyData)

    const pauseNotHasProp = prop => R.not(R.has(prop, bodyData))

    const field = {
      inicio: false,
      final: false,
      motivoPausa: false,
    }
    const message = {
      inicio: '',
      final: '',
      motivoPausa: '',
    }

    let errors = false

    if (pauseNotHasProp('inicio') || typeof Date.parse(pause.inicio) !== 'number') {
      errors = true
      field.inicio = true
      message.inicio = 'humidity not is date.'
    }

    if (pauseNotHasProp('final') || typeof Date.parse(pause.final) !== 'number') {
      errors = true
      field.final = true
      message.final = 'final not is date.'
    }

    if (pauseNotHasProp('motivoPausa') || !pause.motivoPausa) {
      errors = true
      field.motivoPausa = true
      message.motivoPausa = 'É obrigatório.'
    }


    const pauseCreated = await Pause.create(pause, { transaction })

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }


    const response = await Pause.findByPk(pauseCreated.id, { transaction })

    // console.log(JSON.stringify(response))
    return response
  }
}
