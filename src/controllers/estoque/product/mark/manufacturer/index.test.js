const request = require('../../../../../helpers/request')


describe('manufacturerController', () => {
  let manufacturerMock = null
  let headers = null

  beforeAll(async () => {
    manufacturerMock = {
      manufacturer: 'CONTROL ID',
    }

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
  })

  test('create', async () => {
    const response = await request().post('/api/manufacturer', manufacturerMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.manufacturer).toBe(manufacturerMock.manufacturer)
  })

  test('getAll', async () => {
    const resposta = await request().get('/api/manufacturer', { headers, params: { query: 'DELL' } })

    const { body, statusCode } = resposta

    expect(statusCode).toBe(200)
    expect(body).toBe('DELL')
  })
})
