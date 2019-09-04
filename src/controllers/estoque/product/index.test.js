const request = require('../../../helpers/request')

// const database = require('../../../database')
// const { FieldValidationError } = require('../../../helpers/errors')


describe('productController', () => {
  let headers = null

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
      manufacturer: "LSD's",
      mark: 'LSD',
      responsibleUser: 'modrp',
    }

    await request().post('/api/mark', mark, { headers })

    const type = {
      type: 'TESTE TYPE 2',
      responsibleUser: 'modrp',
    }

    await request().post('/api/equipModel/addType', type, { headers })
  })

  test('create Peça', async () => {
    const productMock = {
      category: 'peca',
      SKU: 'PC-00002',
      description: '',
      minimumStock: '12',
      mark: 'LSD',
      name: 'BALA',
      serial: false,
      responsibleUser: 'modrp',
    }

    const response = await request().post('/api/product', productMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.description).toBe(productMock.description)
    expect(body.SKU).toBe(productMock.SKU)
    expect(body.minimumStock).toBe(productMock.minimumStock)
    expect(body.mark.mark).toBe(productMock.mark)
  })

  test('create Equipamento', async () => {
    const productMock = {
      category: 'equipamento',
      SKU: 'EQ-00002',
      description: '',
      minimumStock: '3',
      mark: 'LSD',
      name: 'LOCK',
      serial: false,
      responsibleUser: 'modrp',
      type: 'TESTE TYPE 2',
    }

    const response = await request().post('/api/product', productMock, { headers })

    const { body, statusCode } = response


    expect(statusCode).toBe(200)
    expect(body.description).toBe(productMock.description)
    expect(body.SKU).toBe(productMock.SKU)
    expect(body.minimumStock).toBe(productMock.minimumStock)
    expect(body.mark.mark).toBe(productMock.mark)
  })

  test('getall, query', async () => {
    const response = await request().get('/api/product', { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.count).toBeTruthy()
    expect(body.page).toBeTruthy()
    expect(body.show).toBeTruthy()
    expect(body.rows).toBeTruthy()
  })

  test('getall, query', async () => {
    const response = await request().get('/api/product/getAllNames', { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.length > 0).toBeTruthy()
  })
})
