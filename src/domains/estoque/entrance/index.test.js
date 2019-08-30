// const R = require('ramda')

const CompanyDomain = require('../../general/company')
const EntranceDomain = require('.')
const ProductDomain = require('../product')
const MarkDomain = require('../product/mark')
const EquipModelDomain = require('../product/equip/equipModel')

const { FieldValidationError } = require('../../../helpers/errors')

// const partDomain = new PartDomain()
const entranceDomain = new EntranceDomain()
const companyDomain = new CompanyDomain()
const productDomain = new ProductDomain()
const markDomain = new MarkDomain()
const equipModelDomain = new EquipModelDomain()

describe('entranceDomain', () => {
  let entranceMock = null
  let productCreated1 = null

  beforeAll(async () => {
    const mark = {
      manufacturer: 'DELL',
      mark: 'DELL',
      responsibleUser: 'modrp',
    }

    await markDomain.add(mark)

    const companyMock = {
      razaoSocial: 'teste entrada',
      cnpj: '08194997000170',
      street: 'jadaisom rodrigues',
      number: '6969',
      city: 'São Paulo',
      state: 'UF',
      neighborhood: 'JD. Avelino',
      zipCode: '09930-210',
      telphone: '(11)0965-4568',
      nameContact: 'joseildom',
      email: 'josealdo@gmasi.com',
      responsibleUser: 'modrp',
      relation: 'fornecedor',
    }

    const companyCreated = await companyDomain.add(companyMock)

    const productMock = {
      category: 'peca',
      SKU: 'PC-00006',
      description: '',
      minimumStock: '10',
      mark: 'DELL',
      name: 'FONT 12 V',
      serial: false,
      responsibleUser: 'modrp',
    }

    const type = {
      type: 'TESTE TYPE 4',
      responsibleUser: 'modrp',
    }

    await equipModelDomain.addType(type)

    const productMock1 = {
      category: 'equipamento',
      SKU: 'EQ-00502',
      description: '',
      minimumStock: '3',
      mark: 'DELL',
      name: 'DEDO BOM',
      serial: true,
      responsibleUser: 'modrp',
      type: 'TESTE TYPE 4',
    }

    const productCreated = await productDomain.add(productMock)
    productCreated1 = await productDomain.add(productMock1)

    entranceMock = {
      amountAdded: '4',
      stockBase: 'PONTOREAL',
      productId: productCreated.id,
      companyId: companyCreated.id,
      responsibleUser: 'modrp',
    }
  })

  test('create entrance part', async () => {
    const entranceCreated = await entranceDomain.add(entranceMock)

    expect(entranceCreated.amountAdded).toBe(entranceMock.amountAdded)
    expect(entranceCreated.stockBase).toBe(entranceMock.stockBase)
    expect(entranceCreated.responsibleUser).toBe(entranceMock.responsibleUser)
    expect(entranceCreated.company.relation).toBe('fornecedor')
    expect(entranceCreated.product.SKU).toBe('PC-00006')

    await entranceDomain.add(entranceMock)

    const entranceMock1 = {
      ...entranceMock,
      stockBase: 'REALPONTO',
    }

    await entranceDomain.add(entranceMock1)

    await expect(entranceDomain.add(entranceMock)).toBeTruthy()
  })

  test('create entrance equipModel', async () => {
    const entranceMock1 = {
      ...entranceMock,
      productId: productCreated1.id,
      serialNumbers: ['1', '2', '3', '4'],
    }

    const entranceCreated = await entranceDomain.add(entranceMock1)

    expect(entranceCreated.amountAdded).toBe(entranceMock.amountAdded)
    expect(entranceCreated.stockBase).toBe(entranceMock.stockBase)
    expect(entranceCreated.responsibleUser).toBe(entranceMock.responsibleUser)
    expect(entranceCreated.company.relation).toBe('fornecedor')
    expect(entranceCreated.product.SKU).toBe('EQ-00502')

    await expect(entranceDomain.add(entranceMock1)).rejects.toThrowError(new FieldValidationError())

    const entranceMock2 = {
      ...entranceMock,
      productId: productCreated1.id,
      serialNumbers: ['5', '6', '1', '1'],
    }

    await expect(entranceDomain.add(entranceMock2)).rejects.toThrowError(new FieldValidationError())
  })

  test('getAll', async () => {
    const entrances = await entranceDomain.getAll()
    expect(entrances.rows.length > 0).toBeTruthy()
  })
})
