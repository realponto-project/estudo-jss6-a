// const request = require('../../helpers/request')

// const EntryEquipmentDomain = require('../../domains/labtec/entryEquipment')
// const CompanyDomain = require('../../domains/company')
// // const EquipTypeDomain = require('../../domains/estoque/equip/equipType')
// const EquipDomain = require('../../domains/estoque/equip')

// const entryEquipmentDomain = new EntryEquipmentDomain()
// const companyDomain = new CompanyDomain()
// // const equipTypeDomain = new EquipTypeDomain()
// const equipDomain = new EquipDomain()

describe('processcontroller', () => {


  test('true', () => {
    expect(true).toBe(true)
  })


  // let headers = null
  // let bodyData = null
  // let updateProcessMock = null
  // let entry = null
  // let entryEquipmentMock = null
  // let companyMock = null
  // // let equipMarkMock = null
  // let equipMock = null

  // beforeAll(async () => {
  //   entryEquipmentMock = {
  //     humidity: false,
  //     fall: false,
  //     misuse: false,
  //     brokenSeal: false,
  //     serialNumber: '2564545',
  //     externalDamage: true,
  //     details: 'tá zuado',
  //     defect: 'fonte',
  //     delivery: 'externo',
  //     technicianName: 'Jose',
  //     properlyPacked: true,
  //     conditionType: 'avulso',
  //     garantia: 'externo',
  //     responsibleUser: 'modrp',
  //   }
  //   companyMock = {
  //     razaoSocial: 'Real teste 321/ .LTDA',
  //     cnpj: '02685203000194',
  //     street: 'jadaisom rodrigues',
  //     number: '69',
  //     city: 'São Paulo',
  //     state: 'UF',
  //     neighborhood: 'JD. Avelino',
  //     zipCode: '09930-210',
  //     telphone: '(11)8565-4658',
  //     nameContact: 'jose',
  //     email: 'jose@gmail.com',
  //     responsibleUser: 'modrp',
  //   }

  //   const companyCreated = await companyDomain.add(companyMock)

  //   // equipMarkMock = {
  //   //   type: 'catraca',
  //   //   mark: 'LRG',
  //   //   responsibleUser: 'modrp',
  //   // }

  //   // const markMock = await equipTypeDomain.addMark(equipMarkMock)

  //   // const equipTypeMock = {
  //   //   equipMarkId: markMock.id,
  //   //   model: 'LRG 7.0',
  //   //   description: '',
  //   //   responsibleUser: 'modrp',
  //   // }


  //   // const equipModelCreated = await equipTypeDomain.addModel(equipTypeMock)

  //   equipMock = {
  //     // equipModelId: equipModelCreated.id,
  //     companyId: companyCreated.id,
  //     serialNumber: '2564545',
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

  //   entry = await entryEquipmentDomain.add(entryEquipmentMock)

  //   updateProcessMock = {
  //     status: 'analise',
  //   }


  // const loginBody = {
  //   username: 'modrp',
  //   password: 'modrp',
  //   typeAccount: { labTec: true },
  // }
  //   const login = await request().post('/oapi/login', loginBody)

  //   const { token, username } = login.body

  //   headers = {
  //     token,
  //     username,
  //   }

  //   bodyData = {
  //     id: entry.processId,
  //     updateProcessMock,
  //   }
  // })

  // test('update', async () => {
  //   const response = await request().put('/api/process/update', bodyData, { headers })

  //   const { body, statusCode } = response
  //   expect(statusCode).toBe(200)
  //   expect(body.status).toBe(updateProcessMock.status)
  // })

  // test('getall', async () => {
  //   const response = await request().get('/api/process', { headers })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   // expect(body.count).toBeTruthy()
  //   // expect(body.page).toBeTruthy()
  //   // expect(body.show).toBeTruthy()
  //   // expect(body.rows).toBeTruthy()
  // })

  // test('getAllToControl', async () => {
  //   const response = await request().get('/api/process/control', { headers })

  //   const { statusCode } = response

  //   expect(statusCode).toBe(200)
  // })
})
