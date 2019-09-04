const request = require('../../helpers/request')

// const database = require('../../../database')
// const { FieldValidationError } = require('../../../helpers/errors')


describe('stockController', () => {
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

  test('getall, query', async () => {
    const response = await request().get('/api/stock', { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.count).toBeTruthy()
    expect(body.page).toBeTruthy()
    expect(body.show).toBeTruthy()
    expect(body.rows).toBeTruthy()
  })
})
