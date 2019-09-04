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
      typeAccount: { labTec: true },
    }

    const login = await request().post('/oapi/login', loginBody)

    const { token, username } = login.body

    headers = {
      token,
      username,
    }

    const markMock = {
      manufacturer: 'FESTO',
      mark: 'FESTO',
      responsibleUser: 'modrp',
    }

    await request().post('/api/mark', markMock, { headers })
  })

  test('create', async () => {
    const response = await request().post('/api/manufacturer', manufacturerMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.manufacturer).toBe(manufacturerMock.manufacturer)
  })

  test('getAll', async () => {
    const resposta = await request().get('/api/manufacturer', { headers, params: { query: 'FESTO' } })

    const { body, statusCode } = resposta

    expect(statusCode).toBe(200)
    expect(body).toBe('FESTO')
  })
})
