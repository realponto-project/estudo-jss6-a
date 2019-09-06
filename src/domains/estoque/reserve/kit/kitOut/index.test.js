// const R = require('ramda')

const KitOutDomain = require('.')
const TechnicianDomain = require('../../../technician')
const CarDomain = require('../../../technician/car')
const MarkDomain = require('../../../product/mark')
const ProductDomain = require('../../../product')
const CompanyDomain = require('../../../../general/company')
const EntranceDomain = require('../../../entrance')
const KitDomain = require('../')

const database = require('../../../../../database')
// const { FieldValidationError } = require('../../../helpers/errors')

const kitOutDomain = new KitOutDomain()
const technicianDomain = new TechnicianDomain()
const carDomain = new CarDomain()
const markDomain = new MarkDomain()
const productDomain = new ProductDomain()
const companyDomain = new CompanyDomain()
const entranceDomain = new EntranceDomain()
const kitDomain = new KitDomain()

const KitParts = database.model('kitParts')
const ProductBase = database.model('productBase')
const StockBase = database.model('stockBase')

describe('kitOutDomain', () => {
  let kitParts = null

  beforeAll(async () => {
    const carMock = {
      model: 'GOL',
      year: '2007',
      plate: 'RST-4444',
    }

    await carDomain.add(carMock)

    const technicianMock = {
      name: 'NARUTO DA SUL',
      CNH: '01/01/2000',
      plate: 'RST-4444',
      external: true,
    }

    await technicianDomain.add(technicianMock)

    const mark = {
      manufacturer: 'KONOHA',
      mark: 'KONOHA',
      responsibleUser: 'modrp',
    }

    await markDomain.add(mark)

    const productMock = {
      category: 'peca',
      SKU: 'PC-00019',
      description: '',
      minimumStock: '10',
      mark: 'KONOHA',
      name: 'LED',
      serial: false,
      responsibleUser: 'modrp',
    }

    const productCreated = await productDomain.add(productMock)

    const companyMock = {
      razaoSocial: 'teste hokage',
      cnpj: '42138577000104',
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

    const productBase = await ProductBase.findOne({
      where: {
        productId: productCreated.id,
      },
      include: [{ model: StockBase, where: { stockBase: 'REALPONTO' } }],
      transacition: null,
    })

    const reserveMock = {
      kitParts: [{
        productBaseId: productBase.id,
        amount: '5',
      }],
    }

    await kitDomain.add(reserveMock)

    kitParts = await KitParts.findOne({ transaction: null })
  })

  test('reserva kitOut', async () => {
    // const reserveMock = {
    //   kitPartsOut: [{
    //     amount: '2',
    //     productId: productCreated.id,
    //     stockBase: 'PONTOREAL',
    //   }],
    //   technicianId: technicianCreated.id,
    // }

    const kitOutMock = {
      reposicao: '3',
      expedicao: '2',
      perda: '1',
      os: '1',
      kitPartId: kitParts.id,
    }

    const kitOutCreated = await kitOutDomain.add(kitOutMock)

    expect(kitOutCreated).toBeTruthy()
  })

  test('getAll', async () => {
    const kitOutList = await kitDomain.getAll()

    expect(kitOutList.rows.length > 0).toBeTruthy()
  })
})
