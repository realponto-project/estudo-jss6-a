const UserDomain = require('.')
const TypeAccount = require('./typeAccount')

const userDomain = new UserDomain()
const typeAccount = new TypeAccount()


describe('create user', () => {
  let typeAccountMock = null

  beforeAll(async () => {
    typeAccountMock = {
      typeName: 'TECNICO',
      addCompany: true,
      addPart: true,
      addAnalyze: true,
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
  })

  test('create', async () => {
    const userMock = {
      username: 'teste1',
      typeName: 'TECNICO',
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
    const userCreated = await userDomain.user_Create(userMock)

    expect(userCreated.username).toEqual(userMock.username)
    expect(userCreated.typeAccount.typeName).toEqual(userMock.typeName)

    expect(userCreated).not.toHaveProperty('login')
    expect(userCreated).not.toHaveProperty('password')
  })

  test('getResourceByUsername', async () => {
    const userMock = {
      username: 'teste98',
      typeName: 'TECNICO',
      customized: true,
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
    await userDomain.user_Create(userMock)

    const username = 'teste98'

    const userReturn = await userDomain.getResourceByUsername(username)

    expect(userReturn.addCompany).toEqual(userMock.addCompany)
    expect(userReturn.addPart).toEqual(userMock.addPart)
    expect(userReturn.addAnalyze).toEqual(userMock.addAnalyze)
    expect(userReturn.addEquip).toEqual(false)
    expect(userReturn.addEntry).toEqual(false)
  })
  test('getResourceByUsername customized', async () => {
    const userMock = {
      username: 'teste99',
      typeName: 'TECNICO',
      customized: true,
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
    await userDomain.user_Create(userMock)

    const username = 'teste99'

    const userReturn = await userDomain.getResourceByUsername(username)

    expect(userReturn.addCompany).toEqual(userMock.addCompany)
    expect(userReturn.addPart).toEqual(userMock.addPart)
    expect(userReturn.addAnalyze).toEqual(userMock.addAnalyze)
    expect(userReturn.addEquip).toEqual(userMock.addEquip)
    expect(userReturn.addEntry).toEqual(userMock.addEntry)
  })

  test('criar usuario sem premissões', async () => {
    const typeAccountTeste = {
      typeName: 'NADINHA',
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
    await typeAccount.add(typeAccountTeste)

    const userMock = {
      username: 'nadinha',
      typeName: 'NADINHA',
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
    const userReturn = await userDomain.user_Create(userMock)

    expect(userReturn.username).toEqual(userMock.username)
    // expect(await userDomain.findUsernameByPK(userReturn.id)).toBeTruthy()
  })

  test('getAll', async () => {
    const users = await userDomain.getAll()
    expect(users.length > 0).toBeTruthy()
  })
})

// describe('update password', () => {
//   let userMockGenerated = {}
//   let counter = 1
//   let userCreated = {}

//   beforeEach(async () => {
//     userMockGenerated = generateUser(`updatepassword_user_domain_${counter.toString()}`)
//     counter += 1
//     userCreated = await userDomain.user_Create(userMockGenerated)
//   })

//   test('update password', async () => {
//     const login = await Login.findOne({
//       include: [{
//         model: User,
//         where: { username: userCreated.username },
//       }],
//     })

//     const checkPwd1 = await login.checkPassword(userCreated.username)
//     const checkPwd2 = await login.checkPassword('senha')

//     expect(checkPwd1).toBeTruthy()
//     expect(checkPwd2).toBeFalsy()

//     const body = {
//       username: userCreated.username,
//       oldPassword: userCreated.username,
//       newPassword: 'senha',
//     }

//     await userDomain.user_PasswordUpdate(body)

//     const login2 = await Login.findOne({
//       include: [{
//         model: User,
//         where: { username: userCreated.username },
//       }],
//     })

//     const checkPwd3 = await login2.checkPassword(userCreated.username)
//     const checkPwd4 = await login2.checkPassword('senha')

//     expect(checkPwd4).toBeTruthy()
//     expect(checkPwd3).toBeFalsy()
//   })
// })

//   describe('update user', () => {
//     let userCreated = {}
//     let counter = 1

//     beforeEach(async () => {
//       const userMock = generateUser(`update_user_domain_${counter.toString()}`)
//       counter += 1
//       userCreated = await userDomain.user_Create(userMock)
//     })

//     test('update name by id', async () => {
//       const userMock = R.omit(['id', 'email', 'username'], userCreated)
//       userMock.name = 'guiga lherme'

//       const userUpdate = await userDomain.user_UpdateById(userCreated.id, userMock)

//       expect(userUpdate.name).toEqual(userMock.name)
//       expect(userUpdate.email).toEqual(userCreated.email)
//       expect(userUpdate.username).toEqual(userCreated.username)
//     })

//     test('update email by id', async () => {
//       const userMock = R.omit(['id', 'name', 'username'], userCreated)
//       userMock.email = 'lindo@gmail.com'

//       const userUpdate = await userDomain.user_UpdateById(userCreated.id, userMock)

//       expect(userUpdate.name).toEqual(userCreated.name)
//       expect(userUpdate.email).toEqual(userMock.email)
//       expect(userUpdate.username).toEqual(userCreated.username)
//     })

//     test('update name and email by id', async () => {
//       const userMock = R.omit(['id', 'username'], userCreated)
//       userMock.email = 'lindaobonitoegostosao@gmail.com'
//       userMock.name = 'lindo'

//       const userUpdate = await userDomain.user_UpdateById(userCreated.id, userMock)

//       expect(userUpdate.name).toEqual(userMock.name)
//       expect(userUpdate.email).toEqual(userMock.email)
//       expect(userUpdate.username).toEqual(userCreated.username)
//     })
//   })

//   describe('checkPassword', () => {
//     let userCreated = {}
//     let counter = 1

//     beforeEach(async () => {
//       const userMock = generateUser(`checkpasssword_user_domain_${counter.toString()}`)
//       counter += 1
//       userCreated = await userDomain.user_Create(userMock)
//     })

//     test('checkPassword', async () => {
//       // eslint-disable-next-line max-len
//       const checkPwdValid = await userDomain.user_C
// heckPassword(userCreated.id, userCreated.username)
//       const checkPwdInvalid = await userDomain.user_CheckPassword(userCreated.id, '13132')

//       expect(checkPwdValid).toBeTruthy()
//       expect(checkPwdInvalid).toBeFalsy()
//     })
//   })
// })
