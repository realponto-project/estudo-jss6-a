const request = require('../../../../../helpers/request')

// const database = require('../../../database')

// const Manufacturer = database.model('manufacturer')

describe('equipModelController', () => {
  let equipTypeMock = null
  let headers = null

  beforeAll(async () => {
    equipTypeMock = {
      type: 'CATRACA',
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

  test('create equipType', async () => {
    const response = await request().post('/api/equipModel/addType', equipTypeMock, { headers })

    expect(response.statusCode).toBe(200)
    expect(response.body.type).toBe(equipTypeMock.type)
  })

  test('getAllTypes', async () => {
    const resposta = await request().get('/api/equipModel/getAllType', { headers })

    const { body, statusCode } = resposta

    expect(statusCode).toBe(200)
    expect(body.length > 0).toBe(true)
  })
})
