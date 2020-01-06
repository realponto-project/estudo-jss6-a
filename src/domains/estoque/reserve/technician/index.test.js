const TechnicianReserveDomain = require('.')
const MarkDomain = require('../../product/mark')
const ProductDomain = require('../../product')
const CompanyDomain = require('../../../general/company')
const EntranceDomain = require('../../entrance')
const EquipModelDomain = require('../../product/equip/equipModel')
const TechnicianDomain = require('../../technician')
const CarDomain = require('../../technician/car')

const database = require('../../../../database')

const technicianReserveDomain = new TechnicianReserveDomain()
const markDomain = new MarkDomain()
const productDomain = new ProductDomain()
const companyDomain = new CompanyDomain()
const entranceDomain = new EntranceDomain()
const equipModelDomain = new EquipModelDomain()
const technicianDomain = new TechnicianDomain()
const carDomain = new CarDomain()

const ProductBase = database.model('productBase')
const StockBase = database.model('stockBase')

describe('TechnicianReserveDomain', () => {
  let productCreated = null
  let productBase = null
  let technicianCreated = null

  beforeAll(async () => {
    const mark = {
      mark: 'Diamond',
      responsibleUser: 'modrp',
    }

    await markDomain.add(mark)

    const type = {
      type: 'Corta',
      responsibleUser: 'modrp',
    }

    await equipModelDomain.addType(type)

    const productMock = {
      category: 'equipamento',
      SKU: 'EQ-004185',
      description: '',
      minimumStock: '10',
      mark: 'Diamond',
      name: 'Pesado',
      serial: false,
      type: 'Corta',
      responsibleUser: 'modrp',
    }

    productCreated = await productDomain.add(productMock)

    const companyMock = {
      razaoSocial: 'Sida tecnico interno',
      cnpj: '35057074000149',
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
      amountAdded: '20',
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

    const carMock = {
      model: 'Fox',
      year: '2008',
      plate: 'JSX-5184',
    }

    await carDomain.add(carMock)

    const technicianMock = {
      name: 'MARCOS BOLADO MEMO',
      CNH: '01/01/2000',
      plate: 'JSX-5184',
      external: false,
    }

    technicianCreated = await technicianDomain.add(technicianMock)
  })
  test('true', () => {
    expect(true).toBeTruthy()
  })

  test('create', async () => {
    const technicianReserveMock = {
      razaoSocial: 'sdasdlui m j',
      date: Date.now(),
      technicianId: technicianCreated.id,
      technicianReserveParts: [
        {
          productBaseId: productBase.id,
          amount: '1',
        },
      ],
    }

    const response = await technicianReserveDomain.add(technicianReserveMock)

    expect(response.razaoSocial).toBe(technicianReserveMock.razaoSocial)
  })
})
