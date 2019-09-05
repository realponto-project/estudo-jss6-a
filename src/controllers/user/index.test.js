const request = require('../../helpers/request')

const TypeAccount = require('../../domains/auth/user/typeAccount')

const typeAccount = new TypeAccount()


describe('userController', () => {
  let headers = null
  let typeAccountMock = null
  let userMock = null

  beforeAll(async () => {
    typeAccountMock = {
      typeName: 'TecnicoLab',
      addCompany: false,
      addPart: false,
      addAnalyze: true,
      addEquip: false,
      addEntry: true,
      addEquipType: false,
      tecnico: true,
      addAccessories: false,
      addUser: false,
      addTypeAccount: false,
      responsibleUser: 'modrp',
      stock: false,
      labTec: true,
      addTec: false,
      addCar: false,
      addMark: false,
      addType: false,
      addProd: false,
      addFonr: false,
      addEntr: false,
      addKit: false,
      addKitOut: false,
      addOutPut: false,
      addROs: false,
      addRML: false,
      gerROs: false,
      delROs: false,
      updateRos: false,
    }

    await typeAccount.add(typeAccountMock)

    userMock = {
      username: 'matheus',
      typeName: 'TecnicoLab',
      customized: false,
      addCompany: true,
      addPart: true,
      addAnalyze: true,
      addEquip: true,
      addEntry: true,
      addEquipType: true,
      tecnico: true,
      addAccessories: true,
      addUser: true,
      addTypeAccount: true,
      responsibleUser: 'modrp',
      addTec: false,
      addCar: false,
      addMark: false,
      addType: false,
      addProd: false,
      addFonr: false,
      addEntr: false,
      addKit: false,
      addKitOut: false,
      addOutPut: false,
      addROs: false,
      addRML: false,
      gerROs: false,
      delROs: false,
      updateRos: false,
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
    const response = await request().post('/api/user', userMock, { headers })

    const { statusCode } = response

    expect(statusCode).toBe(200)
    // expect(body.typeName).toBe(typeAccountMock.typeName)
    // expect(body.resource.addCompany).toBe(typeAccountMock.addCompany)
    // expect(body.resource.addPart).toBe(typeAccountMock.addPart)
    // expect(body.resource.addAnalyze).toBe(typeAccountMock.addAnalyze)
    // expect(body.resource.addEquip).toBe(typeAccountMock.addEquip)
    // expect(body.resource.addEntry).toBe(typeAccountMock.addEntry)
  })

  test('getResourceByUsername', async () => {
    userMock = {
      username: 'alvaro',
      typeName: 'TecnicoLab',
      customized: true,
      addCompany: false,
      addPart: false,
      addAnalyze: true,
      addEquip: true,
      addEntry: true,
      addEquipType: true,
      tecnico: true,
      addAccessories: true,
      addUser: false,
      addTypeAccount: false,
      responsibleUser: 'modrp',
      addTec: false,
      addCar: false,
      addMark: false,
      addType: false,
      addProd: false,
      addFonr: false,
      addEntr: false,
      addKit: false,
      addKitOut: false,
      addOutPut: false,
      addROs: false,
      addRML: false,
      gerROs: false,
      delROs: false,
      updateRos: false,
    }

    await request().post('/api/user', userMock, { headers })

    const params = {
      username: 'alvaro',
    }
    const response = await request().get('/api/user/getResourceByUsername', { headers, params })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.addCompany).toBe(userMock.addCompany)
    expect(body.addPart).toBe(userMock.addPart)
    expect(body.addAnalyze).toBe(userMock.addAnalyze)
    expect(body.addEquip).toBe(userMock.addEquip)
    expect(body.addEntry).toBe(userMock.addEntry)
  })

  test('getall, query', async () => {
    const params = {
      query: {
        filters: {
          typeAccount: {
            specific: {
              typeName: 'TecnicoLab',
            },
          },
        },
      },
    }

    const response = await request().get('/api/user/getAll', { headers, params })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body).toBeTruthy()
  })
})
