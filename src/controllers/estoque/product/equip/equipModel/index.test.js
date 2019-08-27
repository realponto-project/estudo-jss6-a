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

    const equipModelMock = {
      equipTypeId: response.body.id,
      name: 'VEGAS',
      description: '',
      serial: true,
      responsibleUser: 'modrp',
    }

    const resposta = await request().post('/api/equipModel/addModel', equipModelMock, { headers })

    const { body, statusCode } = resposta

    expect(statusCode).toBe(200)
    expect(body.name).toBe(equipModelMock.name)
    expect(body.description).toBe(equipModelMock.description)
    expect(body.responsibleUser).toBe(equipModelMock.responsibleUser)
    expect(body.equipTypeId).toBe(equipModelMock.equipTypeId)
  })

  test('getAllTypes', async () => {
    const resposta = await request().get('/api/equipModel/getAllType', { headers })

    const { body, statusCode } = resposta

    expect(statusCode).toBe(200)
    expect(body.length > 0).toBe(true)
  })
})
