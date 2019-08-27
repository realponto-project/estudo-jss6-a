// const R = require('ramda')

// const database = require('../../database')
// const EquipTypeDomain = require('../../estoque/equip/equipType')
// const PartDomain = require('../../estoque/part')
// const AnalyzeDomain = require('.')
// const CompanyDomain = require('../../company')
// const EquipDomain = require('../../estoque/equip')
// const EntryEquipmentDomain = require('../entryEquipment')
// const AccessoriesDomain = require('../entryEquipment/accessories')

// const { FieldValidationError } = require('../../helpers/errors')

// const partDomain = new PartDomain()
// const equipTypeDomain = new EquipTypeDomain()
// const analyzeDomain = new AnalyzeDomain()
// const companyDomain = new CompanyDomain()
// const equipDomain = new EquipDomain()
// const accessoriesDomain = new AccessoriesDomain()
// const entryEquipmentDomain = new EntryEquipmentDomain()

// const Accessories = database.model('accessories')

describe('analyzeDomain', () => {
  // let analyzeMock = null
  // // let analysisPartMock = null
  // let companyMock = null
  // let equipMock = null
  // let accessoriesMock1 = null
  // let accessoriesMock2 = null
  // let entryEquipmentCreated = null

  // beforeAll(async () => {
  //   // const equipMarkMock = {
  //   //   type: 'catraca',
  //   //   mark: 'Lindóya',
  //   //   responsibleUser: 'modrp',
  //   // }

  //   // const markMock = await equipTypeDomain.addMark(equipMarkMock)

  //   // const equipModelMock = {
  //   //   equipMarkId: markMock.id,
  //   //   model: 'Lindóya 2.0',
  //   //   description: '',
  //   //   responsibleUser: 'modrp',
  //   // }

  //   // const modelMock = await equipTypeDomain.addModel(equipModelMock)

  //   // const partMock = {
  //   //   item: 'garrafa',
  //   //   description: '',
  //   //   costPrice: '100,00',
  //   //   salePrice: '150,00',
  //   //   equipModels: [{ id: modelMock.id }],
  //   //   responsibleUser: 'modrp',
  //   // }

  //   // const partCreated = await partDomain.add(partMock)

  //   // analysisPartMock = {
  //   //   partId: partCreated.id,
  //   //   description: 'garrafa furada.',
  //   //   responsibleUser: 'modrp',
  //   // }

  //   companyMock = {
  //     razaoSocial: 'analisee LTDA',
  //     cnpj: '58383275000131',
  //     street: 'jadaisom rodrigues',
  //     number: '69',
  //     city: 'São Paulo',
  //     state: 'UF',
  //     neighborhood: 'JD. Avelino',
  //     zipCode: '09930-210',
  //     telphone: '(11)8565-4118',
  //     nameContact: 'josi',
  //     email: 'analise@gmail.com',
  //     responsibleUser: 'modrp',
  //   }

  //   const companyCreated = await companyDomain.add(companyMock)

  //   equipMock = {
  //     // equipModelId: modelMock.id,
  //     companyId: companyCreated.id,
  //     serialNumber: '321654987',
  //     proximidade: true,
  //     bio: true,
  //     barras: true,
  //     cartografico: true,
  //     tipoCracha: 'Hid',
  //     corLeitor: 'Verde',
  //     details: '',
  //     responsibleUser: 'modrp',
  //   }

  //   await equipDomain.add(equipMock)

  //   accessoriesMock1 = {
  //     accessories: 'fonte',
  //     responsibleUser: 'modrp',
  //   }
  //   accessoriesMock2 = {
  //     accessories: 'teclado',
  //     responsibleUser: 'modrp',
  //   }

  //   const accessory1 = await accessoriesDomain.add(accessoriesMock1)
  //   const accessory2 = await accessoriesDomain.add(accessoriesMock2)

  //   const entryEquipmentMock = {
  //     humidity: false,
  //     fall: false,
  //     misuse: false,
  //     brokenSeal: false,
  //     serialNumber: '321654987',
  //     externalDamage: true,
  //     details: 'tá zuado',
  //     defect: 'fonte',
  //     delivery: 'externo',
  //     technicianName: 'Carlos',
  //     garantia: 'externo',
  //     conditionType: 'avulso',
  //     properlyPacked: true,
  //     accessories: [accessory1, accessory2],
  //     responsibleUser: 'modrp',
  //   }

  //   entryEquipmentCreated = await entryEquipmentDomain.add(entryEquipmentMock)

  //   analyzeMock = {
  //     // garantia: 'externa',
  //     // conditionType: 'avulso',
  //     // humidity: false,
  //     // fall: false,
  //     // misuse: false,
  //     // brokenSeal: false,
  //     observations: 'test1',
  //     init: new Date(),
  //     end: new Date(),
  //     // analysisPart: [analysisPartMock, analysisPartMock],
  //     processId: entryEquipmentCreated.processId,
  //     pause: [{
  //       inicio: new Date(),
  //       final: new Date(),
  //       motivoPausa: 'sdbiasdaiu',
  //     }],
  //     responsibleUser: 'modrp',
  //   }
  // })


  test('true', () => {
    expect(true).toBe(true)
  })

  // test('create', async () => {
  //   const analyzeCreated = await analyzeDomain.add(analyzeMock)
  //   const analyzeCreated1 = await analyzeDomain.add(analyzeMock)

  //   expect(analyzeCreated).toBeTruthy()
  //   expect(analyzeCreated1).toBeTruthy()
  //   // expect(analyzeCreated.garantia).toBe(analyzeMock.garantia)
  //   // expect(analyzeCreated.conditionType).toBe(analyzeMock.conditionType)
  //   // expect(analyzeCreated.processId).toBe(entryEquipmentCreated.processId)
  // })


  // test('analyzeUpdate', async () => {
  //   const analyzeUpdateMock = {
  //     status: 'aprovado',
  //   }

  //   const analyzeCreated = await analyzeDomain.add(analyzeMock)

  //   const analyzeUpdate = await analyzeDomain.analyzeUpdate(analyzeCreated.id,
  //     analyzeUpdateMock)

  //   expect(analyzeCreated).toBeTruthy()
  //   expect(analyzeUpdate).toBeTruthy()
  // })
})
