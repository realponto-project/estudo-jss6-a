const EmprestimoDomain = require(".");
const ProductDomain = require("../product");
const MarkDomain = require("../product/mark");
const EquipDomain = require("../product/equip");
const EquipModelDomain = require("../product/equip/equipModel");
const EntranceDomain = require("../entrance");
const CompanyDomain = require("../../general/company");
const TechnicianDomain = require("../technician");
const CarDomain = require("../technician/car");

const emprestimoDomain = new EmprestimoDomain();
const productDomain = new ProductDomain();
const equipDomain = new EquipDomain();
const equipModelDomain = new EquipModelDomain();
const markDomain = new MarkDomain();
const companyDomain = new CompanyDomain();
const entranceDomain = new EntranceDomain();
const technicianDomain = new TechnicianDomain();
const carDomain = new CarDomain();

describe("emprestimoDomain", () => {
  let equip = null;
  let technicianCreated = null;
  beforeAll(async () => {
    const mark = {
      mark: "Almost",
      responsibleUser: "modrp"
    };

    await markDomain.add(mark);

    const type = {
      type: "Maple",
      responsibleUser: "modrp"
    };

    await equipModelDomain.addType(type);

    const productMock = {
      name: "Deck",
      category: "equipamento",
      SKU: "PC-00086",
      description: "",
      minimumStock: "5",
      mark: "Almost",
      type: "Maple",
      serial: true,
      responsibleUser: "modrp"
    };
    const productCreated = await productDomain.add(productMock);

    const companyMock = {
      razaoSocial: "teste emprestimo",
      cnpj: "70090636000157",
      street: "jadaisom rodrigues",
      number: "6969",
      city: "São Paulo",
      state: "UF",
      neighborhood: "JD. Avelino",
      zipCode: "09930-210",
      telphone: "(11)0965-4568",
      nameContact: "joseildom",
      email: "josealdo@gmasi.com",
      responsibleUser: "modrp",
      relation: "fornecedor"
    };

    const companyCreated = await companyDomain.add(companyMock);

    const entranceMock = {
      amountAdded: "1",
      stockBase: "EMPRESTIMO",
      productId: productCreated.id,
      companyId: companyCreated.id,
      serialNumbers: ["0001212"],
      responsibleUser: "modrp"
    };

    await entranceDomain.add(entranceMock);

    equip = await equipDomain.getOneBySerialNumber("0001212");

    const carMock = {
      model: "GOL",
      year: "2007",
      plate: "AWR-4484"
    };

    await carDomain.add(carMock);

    const technicianMock = {
      name: "VÉIO OLINTO",
      CNH: "01/01/2000",
      plate: "AWR-4484",
      external: false
    };

    technicianCreated = await technicianDomain.add(technicianMock);
  });

  test("create", async () => {
    const emprestimoMock = {
      cnpj: "37331737000105",
      razaoSocial: "emprestimoDomain",
      dateExpedition: new Date(),
      equipId: equip.id,
      technicianId: technicianCreated.id
    };

    await emprestimoDomain.add(emprestimoMock);
  });
});
