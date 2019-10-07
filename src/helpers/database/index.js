const db = require("../../database");

const dropAllTable = () => db.dropAllSchemas();

const isDatabaseConnected = () => db.authenticate();

const forceCreateTables = () =>
  isDatabaseConnected().then(() => db.sync({ force: true }));

const dropAndDisconnectDatabase = () => db.close();

module.exports = {
  isDatabaseConnected,
  forceCreateTables,
  dropAndDisconnectDatabase,
  dropAllTable
};
