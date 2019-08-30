// const R = require('ramda')

const StockDomain = require('.')
const MarkDomain = require('./product/mark')
const CompanyDomain = require('../general/company')
const ProductDomain = require('../estoque/product')
const EntranceDomain = require('../estoque/entrance')

// const { FieldValidationError } = require('../../helpers/errors')

// const partDomain = new PartDomain()
const stockDomain = new StockDomain()
const markDomain = new MarkDomain()
const companyDomain = new CompanyDomain()
const productDomain = new ProductDomain()
const entranceDomain = new EntranceDomain()
describe('stockDomain', () => {
  beforeAll(async () => {
    const mark = {
      manufacturer: 'MARCA X',
      mark: 'MARCA X',
      responsibleUser: 'modrp',
    }

    await markDomain.add(mark)

    const companyMock = {
      razaoSocial: 'teste entrada get',
      cnpj: '01200864000110',
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
      SKU: 'PC-00043',
      description: '',
      minimumStock: '10',
      mark: 'MARCA X',
      name: 'FONT 3 V',
      serial: false,
      responsibleUser: 'modrp',
    }

    const productCreated = await productDomain.add(productMock)

    const entranceMock = {
      amountAdded: '4',
      stockBase: 'PONTOREAL',
      productId: productCreated.id,
      companyId: companyCreated.id,
      responsibleUser: 'modrp',
    }

    await entranceDomain.add(entranceMock)
  })
  test('getAll', async () => {
    const strocks = await stockDomain.getAll()

    // console.log(strocks)
    expect(strocks.rows.length > 0).toBeTruthy()
  })
})
