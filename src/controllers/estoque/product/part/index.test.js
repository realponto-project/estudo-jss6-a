const request = require('../../../../helpers/request')


describe('partController', () => {
  let part = null
  let headers = null

  beforeAll(async () => {
    part = {
      name: 'CAIXA',
      description: 'adsd',
      responsibleUser: 'modrp',
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
    expect(true).toBe(true)
  })

  test('create', async () => {
    const response = await request().post('/api/part', part, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.name).toBe(part.name)
    expect(body.responsibleUser).toBe(part.responsibleUser)
  })
})
