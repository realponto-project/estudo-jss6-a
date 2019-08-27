const request = require('../../helpers/request')

describe('typeAccountController', () => {
  let headers = null
  let typeAccountMock = null
  let params = null

  beforeAll(async () => {
    typeAccountMock = {
      typeName: 'ADM',
      addCompany: true,
      addPart: false,
      addAnalyze: true,
      addEquip: true,
      addEntry: true,
      addEquipType: false,
      tecnico: false,
      addAccessories: false,
      addUser: false,
      addTypeAccount: false,
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

    params = {
      typeName: 'ADM',
    }
  })

  test('create', async () => {
    const response = await request().post('/api/typeAccount', typeAccountMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.typeName).toBe(typeAccountMock.typeName)
    expect(body.resource.addCompany).toBe(typeAccountMock.addCompany)
    expect(body.resource.addPart).toBe(typeAccountMock.addPart)
    expect(body.resource.addAnalyze).toBe(typeAccountMock.addAnalyze)
    expect(body.resource.addEquip).toBe(typeAccountMock.addEquip)
    expect(body.resource.addEntry).toBe(typeAccountMock.addEntry)
  })

  test('getall', async () => {
    const response = await request().get('/api/typeAccount', { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.rows).toBeTruthy()
  })

  test('getResourcesByTypeAccount', async () => {
    const response = await request().get('/api/typeAccount/getResourcesByTypeAccount', { headers, params })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.addCompany).toBe(true)
    expect(body.addPart).toBe(false)
    expect(body.addAnalyze).toBe(true)
    expect(body.addEquip).toBe(true)
    expect(body.addEntry).toBe(true)
  })
})
