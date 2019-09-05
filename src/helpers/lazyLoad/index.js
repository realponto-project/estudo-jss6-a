/* eslint-disable no-useless-escape */
const Sequelize = require('sequelize')
const R = require('ramda')
const moment = require('moment')
const database = require('../../database')


const {
  MaliciousError,
} = require('../errors')

const { Op: operators } = Sequelize

// INVALIDS FIELDS, ADD HEAR FIELDS WHICH NEVER SHOULD SEARCHED
const invalidFieldsToSearchList = ['password', 'companyId', 'accountId']

const isKeyInvalid = key => R.contains(key, invalidFieldsToSearchList)

const isEnum = type => type instanceof Sequelize.ENUM
const assocEnum = (inputSearch) => {
  const searchformated = { [operators.eq]: inputSearch }
  return searchformated
}

const isUUID = type => type instanceof Sequelize.UUID

const isBoolean = type => type instanceof Sequelize.BOOLEAN

// string formartter
const isString = type => type instanceof Sequelize.STRING
const assocString = (inputSearch) => {
  const searchformated = { [operators.iRegexp]: inputSearch }
  return searchformated
}

const assocStringGlobal = (inputSearch) => {
  const searchformated = { [operators.iRegexp]: inputSearch }
  return searchformated
}

// date formatter
const getDateStart = R.prop('start')
const getDateEnd = R.prop('end')

const isStartDatePresent = R.has('start')
const isEndDatePresent = R.has('end')

const createDateStart = (inputSearch) => {
  if (isStartDatePresent(inputSearch)) {
    const date = getDateStart(inputSearch)

    const dateSearchFormatter = { [operators.gte]: moment(date).startOf('day').toString() }

    return dateSearchFormatter
  }
  return {}
}

const createDateEnd = (inputSearch) => {
  if (isEndDatePresent(inputSearch)) {
    const date = getDateEnd(inputSearch)

    const dateSearchFormatter = { [operators.lte]: moment(date).endOf('day').toString() }

    return dateSearchFormatter
  }
  return {}
}

const isDate = type => type instanceof Sequelize.DATE

const isNumber = type => type instanceof Sequelize.NUMBER

const assocDate = (inputSearch) => {
  const startDate = createDateStart(inputSearch)
  const endDate = createDateEnd(inputSearch)

  const searchformated = {
    ...startDate,
    ...endDate,
  }
  return searchformated
}

const createStart = (inputSearch) => {
  if (isStartDatePresent(inputSearch)) {
    const number = getDateStart(inputSearch)

    const numberSearchFormatter = { [operators.gte]: number }

    return numberSearchFormatter
  }
  return {}
}

const createEnd = (inputSearch) => {
  if (isEndDatePresent(inputSearch)) {
    const number = getDateEnd(inputSearch)

    const numberSearchFormatter = { [operators.lte]: number }

    return numberSearchFormatter
  }
  return {}
}

const assocNumber = (inputSearch) => {
  const startDate = createStart(inputSearch)
  const endDate = createEnd(inputSearch)

  const searchformated = {
    ...startDate,
    ...endDate,
  }
  return searchformated
}


const isNoNull = R.complement(R.isNil)

const getAttributes = (field, model) => model.rawAttributes[field]


const getLimitAndOffset = (total, page) => {
  let limit = 25
  let offset = 0
  let pageResponse = 1

  // in the next block mount limit and offset, limit in range 1 - 100
  const isTotalHigherThanMaximun = totalRecived => totalRecived > 100
  const isTotalBelowThanMinimun = totalRecived => totalRecived <= 0

  const isPageDown = pageRecived => pageRecived <= 0

  const getLimit = R.cond([
    [isTotalHigherThanMaximun, R.always(100)],
    [isTotalBelowThanMinimun, R.always(25)],
    [R.T, R.identity],
  ])

  const getPage = R.cond([
    [isPageDown, R.always(1)],
    [R.T, R.identity],
  ])

  pageResponse = getPage(page)

  limit = getLimit(total)

  // eslint-disable-next-line no-underscore-dangle
  const decrementOne = R.subtract(R.__, 1)
  const getOffset = R.multiply(decrementOne(getPage(page)))

  offset = getOffset(limit)

  return { limit, offset, pageResponse }
}

const getGlobalSearchFormated = (filter, model) => {
  const getGlobalSearch = R.propOr({}, 'global')
  const getFields = R.propOr([], 'fields')
  const getSearchValue = R.pipe(getGlobalSearch, R.prop('value'))

  const search = getSearchValue(filter)

  const getOperatorsOr = (type) => {
    if (isString(type)) return assocStringGlobal(search)
    return {}
  }

  const mountSearchForGlobal = R.map((field) => {
    if (isKeyInvalid(field)) { throw new MaliciousError() }

    const attribute = getAttributes(field, model)
    if (!attribute) return null
    const { type } = attribute

    if (field === 'createdAt') {
      if ((/\d{1,2}[\/.-]{1}\d{1,2}[\/.-]{1}\d{4}/).test(search)) {
        const searchCreatedAt = search.replace(/\D/ig, '/')

        const arraySearchCreatedAt = R.split('/', searchCreatedAt)

        const diaString = arraySearchCreatedAt[0]
        const mesString = arraySearchCreatedAt[1]
        const anoString = arraySearchCreatedAt[2]

        const stringToNumber = (string) => {
          if (!string) return 0
          const number = parseInt(string, 10)
          return number
        }

        const dia = stringToNumber(diaString)
        const mes = stringToNumber(mesString) - 1
        const ano = stringToNumber(anoString)


        const now = new Date(ano, mes, dia)
        const now1 = new Date(ano, mes, (dia + 1))

        return {
          [field]: {
            [operators.gte]: now,
            [operators.lte]: now1,
          },
        }
      }
    }

    const attributesAndSearch = {
      [field]: getOperatorsOr(type),
    }
    return attributesAndSearch
  })

  const getGlobalSearchFormatted = R.pipe(
    getGlobalSearch,
    getFields,
    mountSearchForGlobal,
  )

  const mountWhereOr = (whereOrFieldsToSearch) => {
    if (whereOrFieldsToSearch.length >= 1) {
      return {
        [operators.or]: whereOrFieldsToSearch,
      }
    }

    return {}
  }

  const whereOrFieldsToSearchWithNull = getGlobalSearchFormatted(filter)

  const whereOrFieldsToSearch = whereOrFieldsToSearchWithNull.filter(isNoNull)

  const whereOrFormatted = mountWhereOr(whereOrFieldsToSearch)

  return whereOrFormatted
}

const getspecificSearchFormated = (filter, model) => {
  const getspecific = R.propOr({}, 'specific')

  const getOperatorsAnd = (type, inputSearch) => {
    if (isString(type)) return assocString(inputSearch)
    if (isDate(type)) return assocDate(inputSearch)
    if (isEnum(type)) return assocEnum(inputSearch)
    if (isUUID(type)) return assocEnum(inputSearch)
    if (isBoolean(type)) return assocEnum(inputSearch)
    if (isNumber(type)) return assocNumber(inputSearch)
    return {}
  }


  const specificFields = getspecific(filter)

  const keysList = R.keys(specificFields)

  // eslint-disable-next-line no-underscore-dangle
  const getPropInspecificFields = R.prop(R.__, specificFields)

  const validatorType = (type, inputSearch, key) => {
    if (isEnum(type) && !inputSearch) return {}
    return { [key]: getOperatorsAnd(type, inputSearch) }
  }

  const makeSearchEspecifField = (key) => {
    if (isKeyInvalid(key)) { throw new MaliciousError() }

    const attribute = getAttributes(key, model)
    if (!attribute) return null
    const { type } = attribute

    const inputSearch = getPropInspecificFields(key)

    const attributesAndSearch = validatorType(type, inputSearch, key)
    return attributesAndSearch
  }

  const whereAndList = R.map(makeSearchEspecifField)(keysList)

  const formatWhereAndList = (accValue, currentValue) => {
    const newValue = {
      ...accValue,
      ...currentValue,
    }
    return newValue
  }

  const destructureList = R.reduce(formatWhereAndList, {})

  const whereAndFormatted = destructureList(whereAndList)

  return whereAndFormatted
}


const formatQuery = (queryPassed = null) => {
  const isQueryEmptyOrNull = (
    queryPassed === null
    || queryPassed === undefined
    || queryPassed === {}
    || queryPassed === []
  )

  let query = queryPassed
  if (isQueryEmptyOrNull) query = { filters: null, total: 25, page: 1 }


  const { filters = null, total = 25, page = 1 } = query

  const getWhere = (modelName, options = {}) => {
    const model = database.model(modelName)

    const getfilter = R.propOr({}, modelName)

    const filter = getfilter(filters)

    const whereOrFormatted = getGlobalSearchFormated(filter, model)

    const whereAndFormatted = getspecificSearchFormated(filter, model)

    const where = {
      ...whereOrFormatted,
      ...whereAndFormatted,
      ...options,
    }

    return where
  }
  const limitAndOffset = getLimitAndOffset(total, page)
  return { getWhere, ...limitAndOffset }
}

module.exports = formatQuery
