const db = require("../../database");

const TypeAccount = require("../../domains/auth/user/typeAccount");
const UserDomain = require("../../domains/auth/user");
const StatusExpeditionDomain = require("../../domains/estoque/reserve/os/statusExpedition");

const typeAccount = new TypeAccount();
const userDomain = new UserDomain();
const statusExpeditionDomain = new StatusExpeditionDomain();

const StockBase = db.model("stockBase");

const dropAllTable = () => db.dropAllSchemas();

const isDatabaseConnected = () => db.authenticate();

const forceCreateTables = () =>
  isDatabaseConnected().then(() => db.sync({ force: true }));

const dropAndDisconnectDatabase = () => db.close();

const createUserAdmin = async () => {
  // const User = db.model('user')
  // const Login = db.model('login')

  const typeAccountMock = {
    typeName: "ADM2",
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
    responsibleUser: "modrp",
    stock: true,
    labTec: true,
    addTec: true,
    addCar: true,
    addMark: true,
    addType: true,
    addProd: true,
    addFonr: true,
    addEntr: true,
    addKit: true,
    addKitOut: true,
    addOutPut: true,
    addROs: true,
    addRML: true,
    gerROs: true,
    delROs: true,
    updateRos: true,
    addStatus: true
  };

  await typeAccount.add(typeAccountMock);

  const userAdmin = {
    username: "modrp",
    typeName: "ADM2",
    customized: true,
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
    responsibleUser: "modrp",
    addTec: true,
    addCar: true,
    addMark: true,
    addType: true,
    addProd: true,
    addFonr: true,
    addEntr: true,
    addKit: true,
    addKitOut: true,
    addOutPut: true,
    addROs: true,
    addRML: true,
    gerROs: true,
    delROs: true,
    updateRos: true,
    addStatus: true
  };
  await userDomain.user_Create(userAdmin);

  await StockBase.create({ stockBase: "EMPRESTIMO" });
  await StockBase.create({ stockBase: "REALPONTO" });
  await StockBase.create({ stockBase: "NOVAREAL" });
  await StockBase.create({ stockBase: "PONTOREAL" });

  await statusExpeditionDomain.add({ status: "venda" });
};

module.exports = {
  isDatabaseConnected,
  forceCreateTables,
  dropAndDisconnectDatabase,
  dropAllTable,
  createUserAdmin
};
