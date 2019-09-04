const request = require('../../helpers/request')
const UserDomain = require('../../domains/auth/user')
const TypeAccount = require('../../domains/auth/user/typeAccount')

const userDomain = new UserDomain()
const typeAccount = new TypeAccount()

describe('logincontroller', () => {
  let user = null
  let userMock = null

  beforeAll(async () => {
    const typeAccountMock = {
      typeName: 'TESTE5',
      addCompany: true,
      addPart: true,
      addAnalyze: true,
      addEquip: true,
      addEntry: true,
      addEquipType: false,
      tecnico: false,
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
      username: 'teste5',
      typeName: 'TESTE5',
      customized: false,
      addCompany: true,
      addPart: true,
      addAnalyze: true,
      addEquip: true,
      addEntry: true,
      addEquipType: false,
      tecnico: false,
      addAccessories: false,
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

    user = await userDomain.user_Create(userMock)
  })

  test('try login with correct data', async () => {
    const loginBody = {
      username: userMock.username,
      password: userMock.username,
      typeAccount: { labTec: true },
    }

    const response = await request().post('/oapi/login', loginBody)

    expect(response.statusCode).toBe(200)
    expect(response.body.username).toBe(loginBody.username)
    expect(response.body.name).toBe(user.name)
    expect(response.body.userId).toBe(user.id)
    expect(response.body.token).toBeTruthy()
    expect(response.body.email).toBe(user.email)
  })

  test('try login with incorrect username', async () => {
    const loginBody = {
      username: 'naocadastrado1322103',
      password: 'baasdfa',
      typeAccount: { labTec: true },
    }

    const response = await request().post('/oapi/login', loginBody)

    expect(response.statusCode).toBe(401)
    expect(response.body.name).toBe('User UNAUTHORIZED')
  })

  test('try login with incorrect password', async () => {
    const loginBody = {
      password: userMock.username,
      username: 'incorrectpass',
      typeAccount: { labTec: true },
    }

    const response = await request().post('/oapi/login', loginBody)

    expect(response.statusCode).toBe(401)
    expect(response.body.name).toBe('User UNAUTHORIZED')
  })

  test('try login with password equal null', async () => {
    const loginBody = {
      password: userMock.username,
      username: '',
      typeAccount: { labTec: true },
    }

    const response = await request().post('/oapi/login', loginBody)

    expect(response.statusCode).toBe(401)
    expect(response.body.name).toBe('User UNAUTHORIZED')
  })

  test('try login with username equal null', async () => {
    const loginBody = {
      username: '',
      password: userMock.username,
      typeAccount: { labTec: true },
    }

    const response = await request().post('/oapi/login', loginBody)

    expect(response.statusCode).toBe(401)
    expect(response.body.name).toBe('User UNAUTHORIZED')
  })

  test('try login with username omited', async () => {
    const loginBody = {
      password: userMock.username,
      typeAccount: { labTec: true },
    }

    const response = await request().post('/oapi/login', loginBody)

    expect(response.statusCode).toBe(401)
    expect(response.body.name).toBe('User UNAUTHORIZED')
  })

  test('try login with password omited', async () => {
    const loginBody = {
      username: userMock.username,
      typeAccount: { labTec: true },
    }

    const response = await request().post('/oapi/login', loginBody)

    expect(response.statusCode).toBe(401)
    expect(response.body.name).toBe('User UNAUTHORIZED')
  })

  test('logout', async () => {
    const loginBody = {
      username: userMock.username,
      password: userMock.username,
      typeAccount: { labTec: true },
    }

    const response = await request().post('/oapi/login', loginBody)

    const params = {
      token: response.body.token,
    }

    const logout = await request().delete('/oapi/logout', { params })

    expect(logout.statusCode).toBe(200)
    expect(logout.body.logout).toBe(true)
  })

  test('auth true', async () => {
    const loginBody = {
      username: userMock.username,
      password: userMock.username,
      typeAccount: { labTec: true },
    }

    const response = await request().post('/oapi/login', loginBody)

    const params = {
      token: response.body.token,
      username: response.body.username,
    }


    const auth = await request().get('/oapi/auth', { params })

    const { body, statusCode } = auth

    expect(statusCode).toBe(200)
    expect(body).toBe(true)
  })

  test('auth false', async () => {
    const params = {
      token: '',
      username: '',
    }

    const auth = await request().get('/oapi/auth', { params })

    const { body, statusCode } = auth

    expect(statusCode).toBe(200)
    expect(body).toBe(false)
  })
})
