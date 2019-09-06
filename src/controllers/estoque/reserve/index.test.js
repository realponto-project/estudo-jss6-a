const request = require('../../../helpers/request')

const database = require('../../../database')

const KitParts = database.model('kitParts')
const ProductBase = database.model('productBase')
const StockBase = database.model('stockBase')
// const { FieldValidationError } = require('../../../helpers/errors')


describe('reserveController', () => {
  let headers = null
  let product = null
  let technician = null
  let productBase = null

  beforeAll(async () => {
    const loginBody = {
      username: 'modrp',
      password: 'modrp',
      typeAccount: { labTec: true },
    }

    const login = await request().post('/oapi/login', loginBody)

    const { token, username } = login.body

    headers = {
      token,
      username,
    }

    const mark = {
      manufacturer: 'MI',
      mark: 'MI',
      responsibleUser: 'modrp',
    }

    await request().post('/api/mark', mark, { headers })

    const productMock = {
      category: 'peca',
      SKU: 'PC-00048',
      description: '',
      minimumStock: '12',
      mark: 'MI',
      name: 'BLOCO',
      serial: false,
      responsibleUser: 'modrp',
    }

    product = await request().post('/api/product', productMock, { headers })

    const companyMock = {
      razaoSocial: 'teste reserva contoller LTDA',
      cnpj: '92735515000158',
      street: 'jadaisom rodrigues',
      number: '6969',
      city: 'São Paulo',
      state: 'UF',
      neighborhood: 'JD. Avelino',
      zipCode: '09930210',
      telphone: '09654568',
      nameContact: 'joseildom',
      email: 'clebinho@joazinho.com',
      responsibleUser: 'modrp',
      relation: 'fornecedor',
    }

    const company = await request().post('/api/company', companyMock, { headers })

    const entranceMock = {
      amountAdded: '50',
      stockBase: 'REALPONTO',
      productId: product.body.id,
      companyId: company.body.id,
      responsibleUser: 'modrp',
    }

    await request().post('/api/entrance', entranceMock, { headers })

    const carMock = {
      model: 'GOL',
      year: '2007',
      plate: 'XYZ-1998',
    }

    await request().post('/api/car', carMock, { headers })

    const technicianMock = {
      name: 'EU MESMO',
      CNH: '01/01/2000',
      plate: 'XYZ-1998',
      external: true,
    }

    technician = await request().post('/api/technician', technicianMock, { headers })

    productBase = await ProductBase.findOne({
      where: {
        productId: product.body.id,
      },
      include: [{ model: StockBase, where: { stockBase: 'REALPONTO' } }],
      transacition: null,
    })
  })

  test('create reserva Os', async () => {
    const reserveMock = {
      os: '6941652',
      razaoSocial: 'test Company',
      cnpj: '47629199000185',
      date: new Date(2019, 10, 23),
      technicianId: technician.body.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: '5',
        },
      ],
    }

    const response = await request().post('/api/reserve/OS', reserveMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.razaoSocial).toBe(reserveMock.razaoSocial)
    expect(body.cnpj).toBe(reserveMock.cnpj)
    expect(body.technician.name).toBe(technician.body.name)
    expect(body.technician.CNH).toBe(technician.body.CNH)
  })

  test('output', async () => {
    const reserveMock = {
      os: '64636556',
      razaoSocial: 'test Company',
      cnpj: '47629199000185',
      date: new Date(2019, 10, 23),
      technicianId: technician.body.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: '6',
        },
      ],
    }

    const reserveCreated = await request().post('/api/reserve/OS', reserveMock, { headers })

    const outputmock = {
      osPartsId: reserveCreated.body.productBases[0].osParts.id,
      add: {
        output: '2',
      },
    }

    const response = await request().put('/api/reserve/output', outputmock, { headers })

    // console.log(response)


    const { statusCode } = response

    expect(statusCode).toBe(200)
  })

  test('create delete Os', async () => {
    const reserveMock = {
      os: '366484',
      razaoSocial: 'test Company',
      cnpj: '47629199000185',
      date: new Date(2019, 10, 23),
      technicianId: technician.body.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: '9',
        },
      ],
    }

    const Os = await request().post('/api/reserve/OS', reserveMock, { headers })

    const response = await request().delete('/api/reserve/OS', { params: { osId: Os.body.id }, headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body).toBe('sucesso')
  })

  test('getallOs', async () => {
    const response = await request().get('/api/reserve/Os', { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.count).toBeTruthy()
    expect(body.page).toBeTruthy()
    expect(body.show).toBeTruthy()
    expect(body.rows).toBeTruthy()
  })

  test('getAllKit', async () => {
    const response = await request().get('/api/reserve/Kit', { headers })

    const { statusCode } = response

    expect(statusCode).toBe(200)
    // expect(body.count).toBeTruthy()
    // expect(body.page).toBeTruthy()
    // expect(body.show).toBeTruthy()
    // expect(body.rows).toBeTruthy()
  })

  test('getOsByOs', async () => {
    const reserveMock = {
      os: '6846384867',
      razaoSocial: 'test Company',
      cnpj: '47629199000185',
      date: new Date(2019, 10, 23),
      technicianId: technician.body.id,
      osParts: [
        {
          productBaseId: productBase.id,
          amount: '3',
        },
      ],
    }

    const reserveOsCreated = await request().post('/api/reserve/OS', reserveMock, { headers })

    const response = await request().get('/api/reserve/getOsByOs', { headers, params: { os: reserveOsCreated.body.id } })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.razaoSocial).toBe(reserveMock.razaoSocial)
    expect(body.cnpj).toBe(reserveMock.cnpj)
  })

  test('create reserva kit', async () => {
    const reserveMock = {
      kitParts: [{
        productBaseId: productBase.id,
        amount: '2',
      }],
    }

    const response = await request().post('/api/reserve/kit', reserveMock, { headers })

    const { body, statusCode } = response

    // console.log(body)

    expect(statusCode).toBe(200)
    expect(body.length > 0).toBe(true)
  })

  test('getKitDefaultValue', async () => {
    const response = await request().get('/api/reserve/kitDefaultValue', { headers })

    const { statusCode } = response

    expect(statusCode).toBe(200)
  })

  test('create reserva kitOut', async () => {
    const kitParts = await KitParts.findOne()

    const reserveMock = {
      reposicao: '3',
      expedicao: '2',
      perda: '1',
      os: '945682',
      kitPartId: kitParts.id,
    }

    const response = await request().post('/api/reserve/kitOut', reserveMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body).toBeTruthy()
  })

  test('getAllKitOut', async () => {
    const response = await request().get('/api/reserve/kitOut', { headers })

    const { statusCode } = response

    expect(statusCode).toBe(200)
    // expect(body.count).toBeTruthy()
    // expect(body.page).toBeTruthy()
    // expect(body.show).toBeTruthy()
    // expect(body.rows).toBeTruthy()
  })

  test('create reserva mercado livre', async () => {
    const reserveMock = {
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
        },
      ],
    }

    const response = await request().post('/api/reserve/freeMarket', reserveMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.trackingCode).toBe(reserveMock.trackingCode)
    expect(body.zipCode).toBe(reserveMock.zipCode)
  })

  test('getAllKit', async () => {
    const response = await request().get('/api/reserve/freeMarket', { headers })

    const { statusCode } = response

    expect(statusCode).toBe(200)
    // expect(body.count).toBeTruthy()
    // expect(body.page).toBeTruthy()
    // expect(body.show).toBeTruthy()
    // expect(body.rows).toBeTruthy()
  })
})
