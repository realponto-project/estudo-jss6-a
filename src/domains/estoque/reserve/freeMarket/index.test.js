const FreeMarketDomain = require(".");
// const TechnicianDomain = require('../../technician')
// const CarDomain = require('../../technician/car')
const MarkDomain = require("../../product/mark");
const ProductDomain = require("../../product");
const CompanyDomain = require("../../../general/company");
const EntranceDomain = require("../../entrance");
const EquipModelDomain = require("../../product/equip/equipModel");

const database = require("../../../../database");
// // const { FieldValidationError } = require('../../../helpers/errors')

// const kitDomain = new KitDomain()
// const technicianDomain = new TechnicianDomain()
// const carDomain = new CarDomain()
const markDomain = new MarkDomain();
const productDomain = new ProductDomain();
const companyDomain = new CompanyDomain();
const entranceDomain = new EntranceDomain();
const freeMarketDomain = new FreeMarketDomain();
const equipModelDomain = new EquipModelDomain();

describe("freeMarketDomain", () => {
  let productCreated = null;
  let productBase = null;

  beforeAll(async () => {
    const mark = {
      mark: "FLIP",
      responsibleUser: "modrp",
    };

    await markDomain.add(mark);

    const type = {
      type: "TESTE TYPE 45",
      responsibleUser: "modrp",
    };

    await equipModelDomain.addType(type);

    const productMock = {
      category: "equipamento",
      SKU: "EQ-00545",
      description: "",
      minimumStock: "8",
      mark: "FLIP",
      name: "PREMIUM",
      serial: true,
      type: "TESTE TYPE 45",
      responsibleUser: "modrp",
    };

    productCreated = await productDomain.add(productMock);

    const companyMock = {
      razaoSocial: "teste saida MERCADO LIVRE",
      cnpj: "13892378000199",
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
      relation: "fornecedor",
    };

    const companyCreated = await companyDomain.add(companyMock);

    const entranceMock = {
      amountAdded: "2",
      stockBase: "REALPONTO",
      productId: productCreated.id,
      companyId: companyCreated.id,
      responsibleUser: "modrp",
      serialNumbers: ["123456789", "987654321"],
    };

    await entranceDomain.add(entranceMock);

    productBase = await ProductBase.findOne({
      where: {
        productId: productCreated.id,
      },
      include: [{ model: StockBase, where: { stockBase: "REALPONTO" } }],
      transacition: null,
    });
  });

  test("create", async () => {
    const freeMarketMock = {
      trackingCode: "AA123454889BR",
      name: "TEST",
      cnpjOrCpf: "46700988888",
      freeMarketParts: [
        {
          productBaseId: productBase.id,
          amount: "1",
          serialNumberArray: ["123456789"],
        },
      ],
    };

    const response = await freeMarketDomain.add(freeMarketMock);

    expect(response.trackingCode).toBe(freeMarketMock.trackingCode);
    expect(response.name).toBe(freeMarketMock.name);
    expect(response.zipCode).toBe(freeMarketMock.zipCode);
    expect(response.state).toBe(freeMarketMock.state);
    expect(response.city).toBe(freeMarketMock.city);
    expect(response.street).toBe(freeMarketMock.street);
    expect(response.number).toBe(freeMarketMock.number);
    expect(response.cnpjOrCpf).toBe(freeMarketMock.cnpjOrCpf);
  });

  test("getAll", async () => {
    const freeMarketList = await freeMarketDomain.getAll();
    expect(freeMarketList.rows.length > 0).toBeTruthy();
  });
});
