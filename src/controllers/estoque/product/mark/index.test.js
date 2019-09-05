const request = require('../../../../helpers/request')


describe('markController', () => {
  let markMock = null
  let headers = null

  beforeAll(async () => {
    markMock = {
      manufacturer: 'TESTE6',
      mark: 'TESTE6',
      responsibleUser: 'modrp',
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
  })

  test('create', async () => {
    const response = await request().post('/api/mark', markMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.mark).toBe(markMock.mark)
    expect(body.responsibleUser).toBe(markMock.responsibleUser)
    expect(body.manufacturer.manufacturer).toBe(markMock.manufacturer)
  })

  test('getAll', async () => {
    const resposta = await request().get('/api/mark', { headers })

    const { body, statusCode } = resposta

    expect(statusCode).toBe(200)
    expect(body.length > 0).toBe(true)
  })
})
