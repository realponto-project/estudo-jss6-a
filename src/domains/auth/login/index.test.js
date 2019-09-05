const LoginDomain = require('./')
const UserDomain = require('../user')
const TypeAccount = require('../user/typeAccount')
const SessionDomain = require('./session')

const { UnauthorizedError } = require('../../../helpers/errors')

const loginDomain = new LoginDomain()
const userDomain = new UserDomain()
const typeAccount = new TypeAccount()
const sessionDomain = new SessionDomain()

describe('loginDomain', () => {
  let userMock = null

  beforeAll(async () => {
    const typeAccountMock = {
      typeName: 'Gerente',
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
      username: 'teste2',
      typeName: 'Gerente',
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
  })


  test('try login with correct account', async () => {
    await userDomain.user_Create(userMock)

    const userLogin = {
      username: 'teste2',
      password: 'teste2',
      typeAccount: { labTec: true },
    }

    const session = await loginDomain.login(userLogin)

    expect(session.id).not.toBeNull()
  })

  test('try login with incorrect password', async () => {
    const userLogin = {
      username: 'teste2',
      password: 'teste5',
      typeAccount: { labTec: true },
    }

    await expect(loginDomain.login(userLogin))
      .rejects.toThrowError(new UnauthorizedError())
  })

  test('try login with user not registered', async () => {
    const userLogin = {
      username: 'userNaoCadastrado',
      password: 'abcs',
      typeAccount: { labTec: true },
    }

    await expect(loginDomain.login(userLogin))
      .rejects.toThrowError(new UnauthorizedError())
  })
})

describe('logoutTest', () => {
  let userMock = null

  beforeAll(async () => {
    const typeAccountMock = {
      typeName: 'TESTE3',
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
      username: 'teste3',
      typeName: 'TESTE3',
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
  })

  test('try logout', async () => {
    await userDomain.user_Create(userMock)

    const userLogin = {
      username: 'teste3',
      password: 'teste3',
      typeAccount: { labTec: true },
    }

    const session = await loginDomain.login(userLogin)

    const logoutSucess = await loginDomain.logout(session.token)

    const sucess = {
      logout: true,
    }

    expect(logoutSucess).toEqual(sucess)
  })
})

describe('sessionDomain', () => {
  let userMock = null

  beforeAll(async () => {
    const typeAccountMock = {
      typeName: 'TESTE78',
      addCompany: false,
      addPart: false,
      addAnalyze: false,
      addEquip: false,
      addEntry: false,
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
      username: 'teste78',
      typeName: 'TESTE78',
      customized: false,
      addCompany: false,
      addPart: false,
      addAnalyze: false,
      addEquip: false,
      addEntry: false,
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
  })

  test('checkSessionIsValid', async () => {
    const user = await userDomain.user_Create(userMock)
    const loginMock = {
      username: user.username,
      password: user.username,
      typeAccount: { labTec: true },
    }
    const login = await loginDomain.login(loginMock)

    const session = await sessionDomain.checkSessionIsValid(login.token, login.username)

    expect(session).toEqual(true)
    expect(await sessionDomain.checkSessionIsValid()).toEqual(false)
  })
})
