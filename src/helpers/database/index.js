const db = require('../../database')
const TypeAccount = require('../../domains/auth/user/typeAccount')
const UserDomain = require('../../domains/auth/user')

const typeAccount = new TypeAccount()
const userDomain = new UserDomain()

const StockBase = db.model('stockBase')

const dropAllTable = () => db.dropAllSchemas()

const isDatabaseConnected = () => db
  .authenticate()

const forceCreateTables = () => isDatabaseConnected()
  .then(() => db.sync({ force: true }))

const createUserAdmin = async () => {
  // const User = db.model('user')
  // const Login = db.model('login')

  const typeAccountMock = {
    typeName: 'ADM2',
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
  }
  await typeAccount.add(typeAccountMock)

  const userAdmin = {
    username: 'modrp',
    typeName: 'ADM2',
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
    // login: {
    //   password: '102030',
    // },
    responsibleUser: 'modrp',
  }

  // await User.create(userAdmin, { include: [Login] })
  await userDomain.user_Create(userAdmin)

  await StockBase.create({ stockBase: 'REALPONTO' })
  await StockBase.create({ stockBase: 'NOVAREAL' })
  await StockBase.create({ stockBase: 'PONTOREAL' })
}

const dropAndDisconnectDatabase = () => db
  .close()

module.exports = {
  isDatabaseConnected,
  forceCreateTables,
  dropAndDisconnectDatabase,
  createUserAdmin,
  dropAllTable,
}
