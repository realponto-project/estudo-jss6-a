const ConsertoDomain = require(".");
const ProductDomain = require("../product");
const MarkDomain = require("../product/mark");
const EquipModelDomain = require("../product/equip/equipModel");
// const TechnicianDomain = require("../technician");
// const CarDomain = require("../technician/car");

const consertoDomain = new ConsertoDomain();
const productDomain = new ProductDomain();
const equipModelDomain = new EquipModelDomain();
const markDomain = new MarkDomain();
// const technicianDomain = new TechnicianDomain();
// const carDomain = new CarDomain();

describe("consertoDomain", () => {
  let productCreated = null;
  let technicianCreated = null;
  beforeAll(async () => {
    // const carMock = {
    //   model: "GOL",
    //   year: "2007",
    //   plate: "AWR-4724"
    // };

    // await carDomain.add(carMock);

    // const technicianMock = {
    //   name: "Henrique Careca",
    //   CNH: "01/01/2000",
    //   plate: "AWR-4724",
    //   external: false
    // };

    // technicianCreated = await technicianDomain.add(technicianMock);
    const mark = {
      mark: "Creature",
      responsibleUser: "modrp"
    };

    await markDomain.add(mark);

    const type = {
      type: "shape",
      responsibleUser: "modrp"
    };

    await equipModelDomain.addType(type);

    const productMock = {
      name: "shape Maple",
      category: "equipamento",
      SKU: "PC-00081",
      description: "",
      minimumStock: "5",
      mark: "Creature",
      type: "shape",
      serial: true,
      responsibleUser: "modrp"
    };
    productCreated = await productDomain.add(productMock);
  });

  test("create", async () => {
    const consertoMock = {
      productId: productCreated.id,
      serialNumber: "0001212",
      description: ""
    };
    const consertoCreated = await consertoDomain.add(consertoMock);

    // console.log(JSON.parse(JSON.stringify(consertoCreated)));

    expect(consertoCreated.serialNumber).toBe(consertoMock.serialNumber);
  });
});
