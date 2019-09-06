// const R = require('ramda')

const KitDomain = require('.')
const TechnicianDomain = require('../../technician')
const CarDomain = require('../../technician/car')
const MarkDomain = require('../../product/mark')
const ProductDomain = require('../../product')
const CompanyDomain = require('../../../general/company')
const EntranceDomain = require('../../entrance')

const database = require('../../../../database')
// const { FieldValidationError } = require('../../../helpers/errors')

const kitDomain = new KitDomain()
const technicianDomain = new TechnicianDomain()
const carDomain = new CarDomain()
const markDomain = new MarkDomain()
const productDomain = new ProductDomain()
const companyDomain = new CompanyDomain()
const entranceDomain = new EntranceDomain()

const ProductBase = database.model('productBase')
const StockBase = database.model('stockBase')

describe('kitDomain', () => {
  let productCreated = null
  let productBase = null

  beforeAll(async () => {
    const carMock = {
      model: 'GOL',
      year: '2007',
      plate: 'RST-8888',
    }

    await carDomain.add(carMock)

    const technicianMock = {
      name: 'KLEITINHO DA MEIOTA',
      CNH: '01/01/2020',
      plate: 'RST-8888',
      external: true,
    }

    await technicianDomain.add(technicianMock)

    const mark = {
      manufacturer: 'HONDA',
      mark: 'HONDA',
      responsibleUser: 'modrp',
    }

    await markDomain.add(mark)

    const productMock = {
      name: 'PLACA',
      category: 'peca',
      SKU: 'PC-00018',
      description: '',
      minimumStock: '10',
      mark: 'HONDA',
      serial: false,
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
      stockBase: 'REALPONTO',
      productId: productCreated.id,
      companyId: companyCreated.id,
      responsibleUser: 'modrp',
    }

    await entranceDomain.add(entranceMock)

    productBase = await ProductBase.findOne({
      where: {
        productId: productCreated.id,
      },
      include: [{ model: StockBase, where: { stockBase: 'REALPONTO' } }],
      transacition: null,
    })
  })

  test('reserva kit', async () => {
    const reserveMock = {
      kitParts: [
        {
          productBaseId: productBase.id,
          amount: '5',
        },
      ],
    }

    await kitDomain.add(reserveMock)
  })

  test('getAll', async () => {
    const kitList = await kitDomain.getAll()

    expect(kitList.rows.length > 0).toBeTruthy()
  })

  test('getKitDefaultValue', async () => {
    const kitList = await kitDomain.getKitDefaultValue()

    expect(kitList.rows.length > 0).toBeTruthy()
  })
})
