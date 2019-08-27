// const R = require('ramda')

const ManufacturerDomain = require('./index')
const MarkDomain = require('../index')

// const database = require('../../../../../database')
const { FieldValidationError } = require('../../../../../helpers/errors')

const manufacturerDomain = new ManufacturerDomain()
const markDomain = new MarkDomain()

// const Manufacturer = database.model('manufacturer')


describe('ManufacturerDomain', () => {
  let manufacturerMock = null

  beforeAll(async () => {
    manufacturerMock = {
      manufacturer: 'EBS',
    }

    const markMock = {
      mark: 'NIKE',
      manufacturer: 'INDIANO',
      responsibleUser: 'modrp',
    }

    await markDomain.add(markMock)
  })

  test('create', async () => {
    const manufacturerCreated = await manufacturerDomain.add(manufacturerMock)

    expect(manufacturerCreated.mark).toBe(manufacturerMock.mark)

    await expect(manufacturerDomain.add(manufacturerMock))
      .rejects.toThrowError(new FieldValidationError())
  })

  test('getManufacturerByMark', async () => {
    const manufacturer = await manufacturerDomain.getManufacturerByMark({ query: 'NIKE' })
    expect(manufacturer).toBe('INDIANO')
  })
})
