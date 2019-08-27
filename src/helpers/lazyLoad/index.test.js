require('./fakeDatabase')
const Sequelize = require('sequelize')
const moment = require('moment')

const { MaliciousError } = require('../errors')

const { Op: operators } = Sequelize

const formatQuery = require('./')

describe('Test about lazyLoad, total and pages', () => {
  test('Test total and page case 1', () => {
    const query = {
      page: 2,
      total: 20,
    }

    const { getWhere, limit, offset } = formatQuery(query)

    const expectedWhere = { }

    const where = getWhere('table1')

    expect(where).toEqual(expectedWhere)
    expect(limit).toBe(20)
    expect(offset).toBe(20)
  })

  test('Test total and page case 2', () => {
    const query = {
      page: 3,
      total: 150,
    }

    const { limit, offset } = formatQuery(query)

    expect(limit).toBe(100)
    expect(offset).toBe(200)
  })

  test('Test total and page case 3', () => {
    const query = {
      page: 3,
      total: -150,
    }

    const { limit, offset } = formatQuery(query)

    expect(limit).toBe(25)
    expect(offset).toBe(50)
  })

  test('Test total and page case 4', () => {
    const query = {
      page: 0,
      total: 0,
    }

    const { limit, offset } = formatQuery(query)

    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  test('Test total and page case 5', () => {
    const query = {
      page: -5,
      total: -150,
    }

    const { limit, offset } = formatQuery(query)

    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  test('Test total miss', () => {
    const query = {
      page: -5,
    }

    const { limit, offset } = formatQuery(query)

    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  test('Test page miss', () => {
    const query = {
      total: 0,
    }

    const { limit, offset } = formatQuery(query)

    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })
})


describe('Test about lazyLoad, global search', () => {
  test('Test fields in global', () => {
    const query = {
      filters: {
        table1: {
          global: {
            fields: ['name', 'motherName', 'fatherName'],
            value: 'string',
          },
        },
      },
    }

    const { getWhere, limit, offset } = formatQuery(query)

    const expectedWhere = {
      [operators.or]: [{
        name: {
          [operators.iRegexp]: 'string',
        },
      },
      {
        motherName: {
          [operators.iRegexp]: 'string',
        },
      },
      {
        fatherName: {
          [operators.iRegexp]: 'string',
        },
      }],
    }

    const where = getWhere('table1')

    expect(where).toEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })
})

describe('Test about lazyLoad, specific search', () => {
  test('Test fields in specific with string', () => {
    const query = {
      filters: {
        table1: {
          specific: {
            name: 'maria',
            motherName: 'abrey',
          },
        },
      },
    }

    const { getWhere, limit, offset } = formatQuery(query)

    const expectedWhere = {
      name: {
        [operators.iRegexp]: 'maria',
      },
      motherName: {
        [operators.iRegexp]: 'abrey',
      },
    }

    const where = getWhere('table1')

    expect(where).toEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  test('Test fields in specific with date', () => {
    const query = {
      filters: {
        table1: {
          specific: {
            name: 'Vitor',
            birthday: {
              start: new Date('05-29-1944'),
              end: new Date('02-28-1989'),
            },
          },
        },
      },
    }

    const { getWhere, limit, offset } = formatQuery(query)

    const expectedWhere = {
      name: {
        [operators.iRegexp]: 'Vitor',
      },
      birthday: {
        [operators.gte]: moment('05-29-1944', 'MM-DD-YYYY').startOf('day').toString(),
        [operators.lte]: moment('02-28-1989', 'MM-DD-YYYY').endOf('day').toString(),
      },
    }

    const where = getWhere('table1')

    expect(where).toEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })
})

describe('Test about empty query', () => {
  test('Test pass empty query, should be returned default lazyload and no search filters', () => {
    const { getWhere, limit, offset } = formatQuery()

    const expectedWhere = { }
    const where = getWhere('table1')

    expect(where).toEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  test('Test pass null query, should be returned default lazyload and no search filters', () => {
    const { getWhere, limit, offset } = formatQuery(null)

    const expectedWhere = { }
    const where = getWhere('table1')

    expect(where).toEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  test('Test pass emmpyObject query, should be returned default lazyload and no search filters', () => {
    const { getWhere, limit, offset } = formatQuery({})

    const expectedWhere = { }
    const where = getWhere('table1')

    expect(where).toEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  test('Test pass emmpyArray query, should be returned default lazyload and no search filters', () => {
    const { getWhere, limit, offset } = formatQuery([])

    const expectedWhere = { }
    const where = getWhere('table1')

    expect(where).toEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  test('Test pass undefined query, should be returned default lazyload and no search filters', () => {
    const { getWhere, limit, offset } = formatQuery(undefined)

    const expectedWhere = { }
    const where = getWhere('table1')

    expect(where).toEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })
})


describe('Test about lazyLoad, errors', () => {
  test('Test malicius search in specific', () => {
    const query = {
      filters: {
        table1: {
          specific: {
            password: 'maria',
            motherName: 'abrey',
          },
        },
      },
    }
    const { getWhere } = formatQuery(query)

    const testFormatter = () => getWhere('table1')
    expect(testFormatter).toThrow(new MaliciousError())
  })

  test('Test malicius search in global', () => {
    const query = {
      filters: {
        table1: {
          global: {
            fields: ['name', 'motherName', 'password'],
            value: 'string',
          },
        },
      },
    }
    const { getWhere } = formatQuery(query)

    const testFormatter = () => getWhere('table1')
    expect(testFormatter).toThrow(new MaliciousError())
  })

  test('Test fields global in that are not part of the table', async () => {
    const query = {
      filters: {
        table1: {
          global: {
            fields: ['name1', 'motherName2', 'fatherName3'],
            value: 'string',
          },
        },
      },
    }

    const { getWhere, limit, offset } = formatQuery(query)

    const expectedWhere = { }

    const where = getWhere('table1')

    expect(where).toEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })

  test('Test fields especific in that are not part of the table', async () => {
    const query = {
      filters: {
        table1: {
          specific: {
            motherName2: 'maria',
            fatherName3: 'abrey',
          },
        },
      },
    }

    const { getWhere, limit, offset } = formatQuery(query)

    const expectedWhere = { }

    const where = getWhere('table1')

    expect(where).toEqual(expectedWhere)
    expect(limit).toBe(25)
    expect(offset).toBe(0)
  })
})
