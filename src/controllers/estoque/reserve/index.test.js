const request = require('../../../helpers/request')

// const database = require('../../../database')
// const { FieldValidationError } = require('../../../helpers/errors')


describe('reserveController', () => {
  let headers = null
  let product = null
  let technician = null

  beforeAll(async () => {
    const loginBody = {
      username: 'modrp',
      password: 'modrp',
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
      amountAdded: '10',
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
    }

    technician = await request().post('/api/technician', technicianMock, { headers })
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
          productId: product.body.id,
          amount: '5',
          stockBase: 'REALPONTO',
        },
      ],
    }

    const response = await request().post('/api/reserve/OS', reserveMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.os).toBe(reserveMock.os)
    expect(body.razaoSocial).toBe(reserveMock.razaoSocial)
    expect(body.cnpj).toBe(reserveMock.cnpj)
    expect(body.products[0].category).toBe(product.body.category)
    expect(body.products[0].description).toBe(product.body.description)
    expect(body.products[0].SKU).toBe(product.body.SKU)
    expect(body.products[0].minimumStock).toBe(product.body.minimumStock)
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
          productId: product.body.id,
          amount: '5',
          stockBase: 'REALPONTO',
        },
      ],
    }

    const reserveCreated = await request().post('/api/reserve/OS', reserveMock, { headers })

    const outputmock = {
      osPartsId: reserveCreated.body.products[0].osParts.id,
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
          productId: product.body.id,
          amount: '4',
          stockBase: 'REALPONTO',
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

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.count).toBeTruthy()
    expect(body.page).toBeTruthy()
    expect(body.show).toBeTruthy()
    expect(body.rows).toBeTruthy()
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
          productId: product.body.id,
          amount: '4',
          stockBase: 'REALPONTO',
        },
      ],
    }

    await request().post('/api/reserve/OS', reserveMock, { headers })

    const response = await request().get('/api/reserve/getOsByOs', { headers, params: { os: '6846384867' } })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.razaoSocial).toBe(reserveMock.razaoSocial)
    expect(body.cnpj).toBe(reserveMock.cnpj)
  })

  test('create reserva kit', async () => {
    const reserveMock = {
      kitParts: [{
        amount: '2',
        productId: product.body.id,
        stockBase: 'REALPONTO',
      }],
    }

    const response = await request().post('/api/reserve/kit', reserveMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.products.length > 0).toBe(true)
  })

  test('create reserva kitOut', async () => {
    const reserveMock = {
      kitPartsOut: [{
        amount: '2',
        productId: product.body.id,
        stockBase: 'REALPONTO',
      }],
      technicianId: technician.body.id,
    }

    const response = await request().post('/api/reserve/kitOut', reserveMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.technicianId).toBeTruthy()
    expect(body.products.length > 0).toBe(true)
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
          productId: product.body.id,
          amount: '5',
          stockBase: 'REALPONTO',
        },
      ],
    }

    const response = await request().post('/api/reserve/freeMarket', reserveMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.trackingCode).toBe(reserveMock.trackingCode)
    expect(body.zipCode).toBe(reserveMock.zipCode)
    expect(body.products.length > 0).toBe(true)
  })
})
