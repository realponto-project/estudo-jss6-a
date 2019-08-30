const ProductDomain = require('./index')
const MarkDomain = require('./mark')
// const PartDomain = require('./part')
const EquipModelDomain = require('./equip/equipModel')

// const database = require('../../../database')
const { FieldValidationError } = require('../../../helpers/errors')

const productDomain = new ProductDomain()
const markDomain = new MarkDomain()
// const partDomain = new PartDomain()
const equipModelDomain = new EquipModelDomain()

describe('productDomain', () => {
  beforeAll(async () => {
    const mark = {
      manufacturer: 'HDR',
      mark: 'HRD',
      responsibleUser: 'modrp',
    }

    await markDomain.add(mark)

    const type = {
      type: 'TYPE 1',
      responsibleUser: 'modrp',
    }

    await equipModelDomain.addType(type)
  })

  test('create product', async () => {
    const productMock = {
      name: 'DEDO DEDO',
      category: 'equipamento',
      SKU: 'PC-00001',
      description: '',
      minimumStock: '10',
      mark: 'HRD',
      type: 'TYPE 1',
      serial: true,
      responsibleUser: 'modrp',
    }
    const productCreated = await productDomain.add(productMock)

    expect(productCreated.description).toBe(productMock.description)
    expect(productCreated.SKU).toBe(productMock.SKU)
    expect(productCreated.minimumStock).toBe(productMock.minimumStock)
    expect(productCreated.mark.mark).toBe(productMock.mark)

    await expect(productDomain.add(productMock))
      .rejects.toThrowError(new FieldValidationError())
  })

  test('getAll', async () => {
    const products = await productDomain.getAll()
    expect(products.rows.length > 0).toBeTruthy()
  })

  test('getAllNames', async () => {
    const products = await productDomain.getAllNames()
    expect(products.length > 0).toBeTruthy()
  })
})
