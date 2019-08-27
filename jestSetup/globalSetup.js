require('../src/helpers/loadenv')
const databaseHelper = require('../src/helpers/database')

const setupJest = async () => {
  await databaseHelper.isDatabaseConnected()
  await databaseHelper.forceCreateTables()
  await databaseHelper.createUserAdmin()
}

module.exports = setupJest
