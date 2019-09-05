const request = require('../../../helpers/request')

// const database = require('../../../database')
// const { FieldValidationError } = require('../../../helpers/errors')


describe('etraceController', () => {
  let headers = null
  let entranceMock = null
  let company = null
  let product = null

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
      manufacturer: 'LG',
      mark: 'LG',
      responsibleUser: 'modrp',
    }

    await request().post('/api/mark', mark, { headers })

    const productMock = {
      category: 'peca',
      SKU: 'PC-00007',
      description: '',
      minimumStock: '12',
      mark: 'LG',
      name: 'MONITOR',
      serial: false,
      responsibleUser: 'modrp',
    }

    product = await request().post('/api/product', productMock, { headers })

    const companyMock = {
      razaoSocial: 'teste entrada contoller LTDA',
      cnpj: '70965210000108',
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

    company = await request().post('/api/company', companyMock, { headers })

    entranceMock = {
      amountAdded: '10',
      stockBase: 'REALPONTO',
      productId: product.body.id,
      companyId: company.body.id,
      responsibleUser: 'modrp',
    }
  })


  test('create entrada', async () => {
    const response = await request().post('/api/entrance', entranceMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.amountAdded).toBe(entranceMock.amountAdded)
    expect(body.responsibleUser).toBe(entranceMock.responsibleUser)
    expect(body.stockBase).toBe(entranceMock.stockBase)
    expect(body.company.cnpj).toBe(company.body.cnpj)
    expect(body.product.SKU).toBe(product.body.SKU)
  })

  test('getall, query', async () => {
    const response = await request().get('/api/entrance', { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.count).toBeTruthy()
    expect(body.page).toBeTruthy()
    expect(body.show).toBeTruthy()
    expect(body.rows).toBeTruthy()
  })
})
