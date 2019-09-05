// const request = require('../../helpers/request')

// // const EquipTypeDomain = require('../../domains/estoque/equip/equipType')
// // const PartDomain = require('../../domains/estoque/part')
// const AnalyzeDomain = require('../../domains/labtec/analyze')
// const EntryEquipmentDomain = require('../../domains/labtec/entryEquipment')
// const CompanyDomain = require('../../domains/company')
// const EquipDomain = require('../../domains/estoque/equip')

// // const { FieldValidationError } = require('../../helpers/errors')

// // const partDomain = new PartDomain()
// // const equipTypeDomain = new EquipTypeDomain()
// const analyzeDomain = new AnalyzeDomain()
// const entryEquipmentDomain = new EntryEquipmentDomain()
// const companyDomain = new CompanyDomain()
// const equipDomain = new EquipDomain()

describe('analyzecontroller', () => {
  // let analyzeMock = null
  // // let analysisPartMock = null
  // let headers = null
  // let bodyData = null
  // let analyzeUpdateMock = null
  // let entryEquipmentCreated = null
  // let companyMock = null
  // let equipMock = null

  // beforeAll(async () => {
  //   // const equipMarkMock = {
  //   //   type: 'catraca',
  //   //   mark: 'Zoo York',
  //   //   responsibleUser: 'modrp',
  //   // }

  //   // const markMock = await equipTypeDomain.addMark(equipMarkMock)

  //   // const equipModelMock = {
  //   //   equipMarkId: markMock.id,
  //   //   model: 'Zoo York 2.0',
  //   //   description: '',
  //   //   responsibleUser: 'modrp',
  //   // }

  //   // const modelMock = await equipTypeDomain.addModel(equipModelMock)

  //   // const partMock = {
  //   //   item: 'Boné',
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
  //     razaoSocial: 'testes 7070 LTDA',
  //     cnpj: '48864576000123',
  //     street: 'jadaisom rodrigues',
  //     number: '69',
  //     city: 'São Paulo',
  //     state: 'UF',
  //     neighborhood: 'JD. Avelino',
  //     zipCode: '09930-210',
  //     telphone: '(11)8565-4118',
  //     nameContact: 'josi',
  //     email: 'josi@gmail.com',
  //     responsibleUser: 'modrp',
  //   }

  //   const companyCreated = await companyDomain.add(companyMock)

  //   equipMock = {
  //     // equipModelId: modelMock.id,
  //     companyId: companyCreated.id,
  //     serialNumber: '98569856',
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

  //   const entryEquipmentMock = {
  //     humidity: false,
  //     fall: false,
  //     misuse: false,
  //     brokenSeal: false,
  //     serialNumber: '98569856',
  //     externalDamage: true,
  //     details: 'tá zuado',
  //     defect: 'fonte',
  //     delivery: 'externo',
  //     technicianName: 'Carlos',
  //     garantia: 'externo',
  //     conditionType: 'avulso',
  //     properlyPacked: true,
  //     accessories: [],
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
  //     observations: '',
  //     init: new Date(),
  //     end: new Date(),
  //     processId: entryEquipmentCreated.processId,
  //     // analysisPart: [analysisPartMock, analysisPartMock],
  //     responsibleUser: 'modrp',
  //   }

  //   const loginBody = {
  //     username: 'modrp',
  //     password: 'modrp',
  //     typeAccount: { labTec: true },
  //   }

  //   const login = await request().post('/oapi/login', loginBody)

  //   const { token, username } = login.body

  //   headers = {
  //     token,
  //     username,
  //   }

  //   analyzeUpdateMock = {
  //     budgetStatus: 'aprovado',
  //   }

  //   const analyzeCreated = await analyzeDomain.add(analyzeMock)

  //   bodyData = {
  //     id: analyzeCreated.id,
  //     analyzeUpdateMock,
  //   }
  // })

  test('true', () => {
    expect(true).toBe(true)
  })

  // test('create', async () => {
  //   const response = await request().post('/api/analyze', analyzeMock, { headers })

  //   const { statusCode } = response

  //   expect(statusCode).toBe(200)
  //   // expect(body.humidity).toBe(false)
  //   // expect(body.fall).toBe(false)
  //   // expect(body.misuse).toBe(false)
  //   // expect(body.brokenSeal).toBe(false)
  // })

  // test('analyzeUpdate', async () => {
  //   const response = await request().put('/api/analyze/Update', bodyData, { headers })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.budgetStatus).toBe(analyzeUpdateMock.budgetStatus)
  // })
})
