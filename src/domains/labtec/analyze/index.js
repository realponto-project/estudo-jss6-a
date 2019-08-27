const R = require('ramda')

const database = require('../../../database')

const AnalysisPartDomain = require('./analysisPart')
const PauseDomain = require('./pause')

const { FieldValidationError } = require('../../../helpers/errors')

const analysisPartDomain = new AnalysisPartDomain()
const pauseDomain = new PauseDomain()

// const EquipModel = database.model('equipModel')
// const EquipMark = database.model('equipMark')
// const EquipType = database.model('equipType')
const AnalysisPart = database.model('analysisPart')
// const Part = database.model('part')
const Analyze = database.model('analyze')
const Process = database.model('process')
const Pause = database.model('pause')
const User = database.model('user')


module.exports = class AnalyzeDomain {
  async add(bodyData, options = {}) {
    const { transaction = null } = options

    // console.log(bodyData)

    const analyze = R.omit(['id', 'observations'], bodyData)

    // console.log(JSON.stringify(analyze))

    const analyzeNotHasProp = prop => R.not(R.has(prop, bodyData))
    const analyzeHasProp = prop => R.has(prop, analyze)

    const field = {
      processId: false,
      // humidity: false,
      // misuse: false,
      // brokenSeal: false,
      // fall: false,
      responsibleUser: false,
      observations: false,
      init: false,
      end: false,
    }
    const message = {
      processId: '',
      // humidity: '',
      // misuse: '',
      // brokenSeal: '',
      // fall: '',
      responsibleUser: '',
      observations: '',
      init: '',
      end: '',
    }

    let errors = false

    // if (analyzeNotHasProp('humidity') || typeof analyze.humidity !== 'boolean') {
    //   errors = true
    //   field.humidity = true
    //   message.humidity = 'humidity not is bollean.'
    // }

    // if (analyzeNotHasProp('misuse') || typeof analyze.misuse !== 'boolean') {
    //   errors = true
    //   field.misuse = true
    //   message.misuse = 'misuse not is bollean.'
    // }

    // if (analyzeNotHasProp('brokenSeal') || typeof analyze.brokenSeal !== 'boolean') {
    //   errors = true
    //   field.brokenSeal = true
    //   message.brokenSeal = 'brokenSeal not is bollean.'
    // }

    // if (analyzeNotHasProp('fall') || typeof analyze.fall !== 'boolean') {
    //   errors = true
    //   field.fall = true
    //   message.fall = 'fall not is bollean.'
    // }

    if (analyzeHasProp('processId')) {
      if (!analyze.processId) {
        errors = true
        field.processId = true
        message.processId = 'Id não pode ser nulo.'
      } else {
        const processHasExist = await Process.findByPk(analyze.processId, { transaction })

        if (!processHasExist) {
          errors = true
          field.processId = true
          message.processId = 'Id não existe em processos'
        }
      }
    }

    if (analyzeNotHasProp('observations')) {
      errors = true
      field.observations = true
      message.observations = 'observations .'
    }

    if (analyzeNotHasProp('init')) {
      errors = true
      field.init = true
      message.init = 'init .'
    }

    if (analyzeNotHasProp('end')) {
      errors = true
      field.end = true
      message.end = 'end .'
    }

    if (analyzeNotHasProp('responsibleUser')) {
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

    const getProcess = await Process.findByPk(analyze.processId, {
      include: [{
        model: Analyze,
      }],
      transaction,
    })

    let analyzeCreated = {}

    if (getProcess.analyze !== null) {
      const getAnalize = await Analyze.findOne({
        include: [{
          model: Process,
          where: { id: analyze.processId },
        }],
        transaction,
      })

      getAnalize.observations.push(bodyData.observations)
      getAnalize.init.push(bodyData.init)
      getAnalize.end.push(bodyData.end)
      getAnalize.arrayResponsibleUser.push(bodyData.responsibleUser)

      analyze.observations = getAnalize.observations
      analyze.init = getAnalize.init
      analyze.end = getAnalize.end
      analyze.arrayResponsibleUser = getAnalize.arrayResponsibleUser

      analyzeCreated = await getAnalize.update(analyze, { transaction })
    } else {
      analyze.observations = [bodyData.observations]
      analyze.init = [bodyData.init]
      analyze.end = [bodyData.end]
      analyze.arrayResponsibleUser = [bodyData.responsibleUser]

      analyzeCreated = await Analyze.create(analyze, { transaction })
    }

    if (bodyData) {
      const bodyHasProp = prop => R.has(prop, bodyData)


      if (bodyHasProp('analysisPart')) {
        const { analysisPart } = bodyData


        const analysisPartCreatedPromises = analysisPart.map((item) => {
          const analysisPartBody = {
            ...item,
            // responsibleUser: bodyData.responsibleUser,
            analyzeId: analyzeCreated.id,
          }
          return analysisPartDomain.add(analysisPartBody, { transaction })
        })

        const analysisPartCreatedList = await Promise.all(analysisPartCreatedPromises)

        await analyzeCreated.addAnalysisParts(analysisPartCreatedList, { transaction })
      }

      if (bodyHasProp('pause')) {
        const { pause } = bodyData


        const pauseCreatedPromises = pause.map((item) => {
          const pauseBody = {
            ...item,
            analyzeId: analyzeCreated.id,
          }
          return pauseDomain.add(pauseBody, { transaction })
        })

        const analysisPartCreatedList = await Promise.all(pauseCreatedPromises)

        await analyzeCreated.addPauses(analysisPartCreatedList, { transaction })
      }
    }

    if (errors) {
      throw new FieldValidationError([{ field, message }])
    }


    const response = await Analyze.findByPk(analyzeCreated.id, {
      include: [
        {
          model: AnalysisPart,
          // include: [{
          //   model: Part,
          //   include: [{
          //     model: EquipModel,
          //     include: [{
          //       model: EquipMark,
          //       include: [{
          //         model: EquipType,
          //       }],
          //     }],
          //   }],
          // }],
        },
        {
          model: Process,
        },
        {
          model: Pause,
        },
      ],
      transaction,
    })

    // console.log(JSON.stringify(response))
    return response
  }

  async analyzeUpdate(id, body, options = {}) {
    const { transaction = null } = options

    const updates = R.omit(['id'], body)

    const updatesHasProp = prop => R.has(prop, updates)

    const analyze = await Analyze.findByPk(id, { transaction })

    const updatedAnalyze = {
      ...analyze,
    }

    if (updatesHasProp('budgetStatus') && updates.budgetStatus) {
      updatedAnalyze.budgetStatus = updates.budgetStatus
    }

    await analyze.update(updatedAnalyze, { transaction })

    const response = await Analyze.findByPk(id, {
      include: [
        {
          model: AnalysisPart,
          // include: [{
          //   model: Part,
          //   include: [{
          //     model: EquipModel,
          //     include: [{
          //       model: EquipMark,
          //       include: [{
          //         model: EquipType,
          //       }],
          //     }],
          //   }],
          // }],
        },
      ],
      transaction,
    })

    return response
  }
}
