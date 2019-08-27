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
      type: 'TESTE TYPE 1',
      responsibleUser: 'modrp',
    }

    await equipModelDomain.addType(type)
  })

  test('create Peça', async () => {
    const productMock = {
      category: 'peca',
      SKU: 'PC-00001',
      description: '',
      minimumStock: '10',
      mark: 'HRD',
      name: 'CHICOTE',
      serial: true,
      responsibleUser: 'modrp',
    }
    const productCreated = await productDomain.add(productMock)

    expect(productCreated.description).toBe(productMock.description)
    expect(productCreated.SKU).toBe(productMock.SKU)
    expect(productCreated.minimumStock).toBe(productMock.minimumStock)
    expect(productCreated.mark.mark).toBe(productMock.mark)

    // await expect(productDomain.add(productMock))
    //   .rejects.toThrowError(new FieldValidationError())
  })

  test('create Equipamento', async () => {
    const productMock = {
      category: 'equipamento',
      SKU: 'EQ-00501',
      description: '',
      minimumStock: '5',
      mark: 'HRD',
      name: 'DEDO VIVO',
      serial: true,
      responsibleUser: 'modrp',
      type: 'TESTE TYPE 1',
      // costPrice: '200,00',
      // salePrice: '300,00',
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
