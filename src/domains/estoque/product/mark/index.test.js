// const R = require('ramda')

const MarkDomain = require('./index')
const ProductDomain = require('../')

// const { FieldValidationError } = require('../../../../helpers/errors')

const markDomain = new MarkDomain()
const productDomain = new ProductDomain()


describe('MarkDomain', () => {
  let markMock = null

  beforeAll(async () => {
    markMock = {
      manufacturer: 'HP',
      mark: 'HP',
      responsibleUser: 'modrp',
    }
  })

  test('create', async () => {
    const markCreated = await markDomain.add(markMock)

    expect(markCreated.mark).toBe(markMock.mark)
    expect(markCreated.responsibleUser).toBe(markMock.responsibleUser)
    expect(markCreated.manufacturer.manufacturer).toBe(markMock.manufacturer)

    // await expect(markDomain.add(markMock))
    //   .rejects.toThrowError(new FieldValidationError())
  })


  test('getAll', async () => {
    const productMock = {
      category: 'peca',
      SKU: 'PC-00046',
      description: '',
      minimumStock: '2',
      mark: 'HP',
      name: 'GET',
      serial: true,
      responsibleUser: 'modrp',
    }

    await productDomain.add(productMock)

    const cars = await markDomain.getAll()

    expect(cars.length > 0).toBe(true)
  })
})
