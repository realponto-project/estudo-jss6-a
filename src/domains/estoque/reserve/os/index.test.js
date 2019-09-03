// const R = require('ramda')

const OsDomain = require('.')
const MarkDomain = require('../../product/mark')
const ProductDomain = require('../../product')
const EntranceDomain = require('../../entrance')
const CompanyDomain = require('../../../general/company')
const CarDomain = require('../../technician/car')
const TechnicianDomain = require('../../technician')

const database = require('../../../../database')
// const { FieldValidationError } = require('../../../helpers/errors')

const osDomain = new OsDomain()
const markDomain = new MarkDomain()
const productDomain = new ProductDomain()
const entranceDomain = new EntranceDomain()
const companyDomain = new CompanyDomain()
const carDomain = new CarDomain()
const technicianDomain = new TechnicianDomain()

const OsParts = database.model('osParts')
const ProductBase = database.model('productBase')
const StockBase = database.model('stockBase')

describe('reserveOsDomain', () => {
  let productCreated = null
  let technicianCreated = null
  let productBase = null

  beforeAll(async () => {
    const mark = {
      manufacturer: 'DC',
      mark: 'DC',
      responsibleUser: 'modrp',
    }

    await markDomain.add(mark)

    const productMock = {
      category: 'peca',
      SKU: 'PC-00010',
      description: '',
      minimumStock: '10',
      mark: 'DC',
      name: 'TAMPA',
      serial: false,
      responsibleUser: 'modrp',
    }

    productCreated = await productDomain.add(productMock)

    const companyMock = {
      razaoSocial: 'teste saida',
      cnpj: '14378314000137',
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
      amountAdded: '64',
      stockBase: 'REALPONTO',
      productId: productCreated.id,
      companyId: companyCreated.id,
      responsibleUser: 'modrp',
    }

    await entranceDomain.add(entranceMock)

    const carMock = {
      model: 'GOL',
      year: '2007',
      plate: 'RST-1234',
    }

    await carDomain.add(carMock)

    const technicianMock = {
      name: 'MARCOS BOLADÃO',
      CNH: '01/01/2000',
      plate: 'RST-1234',
      external: false,
    }

    technicianCreated = await technicianDomain.add(technicianMock)

    productBase = await ProductBase.findOne({
      where: {
        productId: productCreated.id,
      },
      include: [{ model: StockBase, where: { stockBase: 'REALPONTO' } }],
      transacition: null,
    })
  })

  test('create reserve OS', async () => {
    const reserveMock = {
      os: '123458942',
      razaoSocial: 'test Company',
      cnpj: '47629199000185',
      date: new Date(2019, 10, 23),
      technicianId: technicianCreated.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: '5',
        },
      ],
    }
    const reserveCreated = await osDomain.add(reserveMock)

    expect(reserveCreated.razaoSocial).toBe(reserveMock.razaoSocial)
    expect(reserveCreated.cnpj).toBe(reserveMock.cnpj)
    // expect(reserveCreated.date).toBe(reserveMock.date)
  })

  test('Delete reserve OS', async () => {
    const reserveMock = {
      os: '16834356',
      razaoSocial: 'test Company',
      cnpj: '47629199000185',
      date: new Date(2019, 10, 23),
      technicianId: technicianCreated.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: '1',
        },
      ],
    }
    const reserveCreated = await osDomain.add(reserveMock)

    expect(await osDomain.delete(reserveCreated.id)).toBe('sucesso')
  })

  test('Update reserve OS', async () => {
    const reserveMock = {
      os: '3146348',
      razaoSocial: 'test Company',
      cnpj: '47629199000185',
      date: new Date(2019, 10, 23),
      technicianId: technicianCreated.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: '4',
        },
      ],
    }
    const reserveCreated = await osDomain.add(reserveMock)

    const osParts = await OsParts.findOne({
      where: {
        oId: reserveCreated.id,
      },
      transacition: null,
    })

    const reserveUpdate = {
      ...JSON.parse(JSON.stringify(reserveCreated)),
      os: '7895465',
      osParts: [{ id: osParts.id, amount: '6' }],
    }

    await osDomain.update(reserveUpdate)

    // expect(await osDomain.delete(reserveCreated.id)).toBe('sucesso')
  })

  test('getAll', async () => {
    const osList = await osDomain.getAll()

    expect(osList.rows.length > 0).toBeTruthy()
  })

  test('getAll', async () => {
    const reserveMock = {
      os: '3463846441',
      razaoSocial: 'test Company',
      cnpj: '47629199000185',
      date: new Date(2019, 10, 23),
      technicianId: technicianCreated.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: '3',
        },
      ],
    }

    const reserveOsCreated = await osDomain.add(reserveMock)

    const os = await osDomain.getOsByOs(reserveOsCreated.id)

    expect(os).toBeTruthy()
  })

  test('output', async () => {
    const reserveMock = {
      os: '400253',
      razaoSocial: 'test Company',
      cnpj: '47629199000185',
      date: new Date(2019, 10, 23),
      technicianId: technicianCreated.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: '6',
        },
      ],
    }
    const reserveCreated = await osDomain.add(reserveMock)

    const output = {
      osPartsId: reserveCreated.productBases[0].osParts.id,
      add: {
        output: '2',
      },
    }

    await osDomain.output(output)
  })
})
