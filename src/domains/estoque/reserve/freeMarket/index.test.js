// // const R = require('ramda')

const FreeMarketDomain = require('.')
// const TechnicianDomain = require('../../technician')
// const CarDomain = require('../../technician/car')
const MarkDomain = require('../../product/mark')
const ProductDomain = require('../../product')
const CompanyDomain = require('../../../general/company')
const EntranceDomain = require('../../entrance')
const EquipModelDomain = require('../../product/equip/equipModel')

const database = require('../../../../database')
// // const { FieldValidationError } = require('../../../helpers/errors')

// const kitDomain = new KitDomain()
// const technicianDomain = new TechnicianDomain()
// const carDomain = new CarDomain()
const markDomain = new MarkDomain()
const productDomain = new ProductDomain()
const companyDomain = new CompanyDomain()
const entranceDomain = new EntranceDomain()
const freeMarketDomain = new FreeMarketDomain()
const equipModelDomain = new EquipModelDomain()

const ProductBase = database.model('productBase')
const StockBase = database.model('stockBase')

describe('freeMarketDomain', () => {
  let productCreated = null
  let productBase = null

  beforeAll(async () => {
    const mark = {
      manufacturer: 'FLIP',
      mark: 'FLIP',
      responsibleUser: 'modrp',
    }

    await markDomain.add(mark)

    const type = {
      type: 'TESTE TYPE 45',
      responsibleUser: 'modrp',
    }

    await equipModelDomain.addType(type)

    const productMock = {
      category: 'equipamento',
      SKU: 'EQ-00545',
      description: '',
      minimumStock: '8',
      mark: 'FLIP',
      name: 'PREMIUM',
      serial: true,
      type: 'TESTE TYPE 45',
      responsibleUser: 'modrp',
    }

    productCreated = await productDomain.add(productMock)

    const companyMock = {
      razaoSocial: 'teste saida MERCADO LIVRE',
      cnpj: '13892378000199',
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
      amountAdded: '2',
      stockBase: 'REALPONTO',
      productId: productCreated.id,
      companyId: companyCreated.id,
      responsibleUser: 'modrp',
      serialNumbers: ['123456789', '987654321'],
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

  test('test', async () => {
    const freeMarketMock = {
      trackingCode: 'AA123456789BR',
      name: 'TEST',
      zipCode: '09930210',
      state: 'SP',
      city: 'SAO PAULO',
      neighborhood: 'TABOAO',
      street: 'PARAMARIBO',
      number: '215',
      cnpjOrCpf: '46700988888',
      freeMarketParts: [
        {
          productBaseId: productBase.id,
          amount: '1',
          serialNumberArray: ['123456789'],
        },
      ],
    }

    await freeMarketDomain.add(freeMarketMock)
  })

  test('getAll', async () => {
    const freeMarketList = await freeMarketDomain.getAll()
    expect(freeMarketList.rows.length > 0).toBeTruthy()
  })
})
