const request = require('../../../../helpers/request')


describe('carController', () => {
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
  })

  test('create', async () => {
    const carMock = {
      model: 'GOL',
      year: '2007',
      plate: 'ABC-9876',
    }

    const response = await request().post('/api/car', carMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.model).toBe(carMock.model)
    expect(body.year).toBe(carMock.year)
    expect(body.plate).toBe(carMock.plate)
  })

  test('getAll', async () => {
    const resposta = await request().get('/api/car', { headers })

    const { body, statusCode } = resposta

    expect(statusCode).toBe(200)
    expect(body.length > 0).toBe(true)
  })
})
