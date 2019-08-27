// const R = require('ramda')

const KitDomain = require('.')
const TechnicianDomain = require('../../technician')
const CarDomain = require('../../technician/car')
const MarkDomain = require('../../product/mark')
const ProductDomain = require('../../product')
const CompanyDomain = require('../../../general/company')
const EntranceDomain = require('../../entrance')

// const { FieldValidationError } = require('../../../helpers/errors')

const kitDomain = new KitDomain()
const technicianDomain = new TechnicianDomain()
const carDomain = new CarDomain()
const markDomain = new MarkDomain()
const productDomain = new ProductDomain()
const companyDomain = new CompanyDomain()
const entranceDomain = new EntranceDomain()

describe('kitDomain', () => {
  let productCreated = null

  beforeAll(async () => {
    const carMock = {
      model: 'GOL',
      year: '2007',
      plate: 'RST-4355',
    }

    await carDomain.add(carMock)

    const technicianMock = {
      name: 'KLEITINHO DA MEIOTA',
      CNH: '01/01/2000',
      plate: 'RST-4355',
    }

    await technicianDomain.add(technicianMock)

    const mark = {
      manufacturer: 'HONDA',
      mark: 'HONDA',
      responsibleUser: 'modrp',
    }

    await markDomain.add(mark)

    const productMock = {
      category: 'peca',
      SKU: 'PC-00018',
      description: '',
      minimumStock: '10',
      mark: 'HONDA',
      name: 'PLACA',
      responsibleUser: 'modrp',
    }

    productCreated = await productDomain.add(productMock)

    const companyMock = {
      razaoSocial: 'teste saida kit',
      cnpj: '88508578000102',
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

    const entranceMock = {
      amountAdded: '26',
      stockBase: 'PONTOREAL',
      productId: productCreated.id,
      companyId: companyCreated.id,
      responsibleUser: 'modrp',
    }

    await entranceDomain.add(entranceMock)
  })

  test('reserva kit', async () => {
    const reserveMock = {
      kitParts: [{
        amount: '1',
        productId: productCreated.id,
        stockBase: 'PONTOREAL',
      }],
    }

    await kitDomain.add(reserveMock)
  })

  test('getAll', async () => {
    const kitList = await kitDomain.getAll()

    expect(kitList.rows.length > 0).toBeTruthy()
  })
})
