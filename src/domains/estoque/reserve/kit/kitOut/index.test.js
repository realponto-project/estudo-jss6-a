// const R = require('ramda')

const KitOutDomain = require('.')
const TechnicianDomain = require('../../../technician')
const CarDomain = require('../../../technician/car')
const MarkDomain = require('../../../product/mark')
const ProductDomain = require('../../../product')
const CompanyDomain = require('../../../../general/company')
const EntranceDomain = require('../../../entrance')

// const { FieldValidationError } = require('../../../helpers/errors')

const kitOutDomain = new KitOutDomain()
const technicianDomain = new TechnicianDomain()
const carDomain = new CarDomain()
const markDomain = new MarkDomain()
const productDomain = new ProductDomain()
const companyDomain = new CompanyDomain()
const entranceDomain = new EntranceDomain()

describe('kitOutDomain', () => {
  let technicianCreated = null
  let productCreated = null

  beforeAll(async () => {
    const carMock = {
      model: 'GOL',
      year: '2007',
      plate: 'RST-4321',
    }

    await carDomain.add(carMock)

    const technicianMock = {
      name: 'KLEITINHO OLIVEIRA',
      CNH: '01/01/2000',
      plate: 'RST-4321',
    }

    technicianCreated = await technicianDomain.add(technicianMock)

    const mark = {
      manufacturer: 'ALMOST',
      mark: 'ALMOST',
      responsibleUser: 'modrp',
    }

    await markDomain.add(mark)

    const productMock = {
      category: 'peca',
      SKU: 'PC-00012',
      description: '',
      minimumStock: '10',
      mark: 'ALMOST',
      name: 'ROLO',
      responsibleUser: 'modrp',
    }

    productCreated = await productDomain.add(productMock)

    const companyMock = {
      razaoSocial: 'teste saida kitOut',
      cnpj: '64518073000152',
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
      amountAdded: '12',
      stockBase: 'PONTOREAL',
      productId: productCreated.id,
      companyId: companyCreated.id,
      responsibleUser: 'modrp',
    }

    await entranceDomain.add(entranceMock)
  })

  test('reserva kitOut', async () => {
    const reserveMock = {
      kitPartsOut: [{
        amount: '2',
        productId: productCreated.id,
        stockBase: 'PONTOREAL',
      }],
      technicianId: technicianCreated.id,
    }

    await kitOutDomain.add(reserveMock)
  })

  // test('getAll', async () => {
  //   const kits = await kitOutDomain.getAll()
  //   expect(kits.rows.length > 0).toBeTruthy()
  // })
})
