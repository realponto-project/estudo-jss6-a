// const request = require('../../helpers/request')

// const CompanyDomain = require('../../domains/company')
// // const EquipTypeDomain = require('../../domains/estoque/equip/equipType')
// const EquipDomain = require('../../domains/estoque/equip')

// const companyDomain = new CompanyDomain()
// // const equipTypeDomain = new EquipTypeDomain()
// const equipDomain = new EquipDomain()

describe('entryEquipmentControllers', () => {
  // let companyMock = null
  // let entryEquipmentMock = null
  // let equipMock = null
  // let headers = null
  // let equipMarkMock = null

  // beforeAll(async () => {
  //   companyMock = {
  //     razaoSocial: 'testes 691 LTDA',
  //     cnpj: '50418420000160',
  //     street: 'jadaisom rodrigues',
  //     number: '69',
  //     city: 'São Paulo',
  //     state: 'UF',
  //     neighborhood: 'JD. Avelino',
  //     zipCode: '09930-210',
  //     telphone: '(11)8565-1058',
  //     nameContact: 'josel',
  //     email: 'josel@gmail.com',
  //     responsibleUser: 'modrp',
  //   }

  //   const companyCreated = await companyDomain.add(companyMock)

  //   // equipMarkMock = {
  //   //   type: 'catraca',
  //   //   mark: 'Henry',
  //   //   responsibleUser: 'modrp',
  //   // }

  //   // const markMock = await equipTypeDomain.addMark(equipMarkMock)

  //   // const equipTypeMock = {
  //   //   equipMarkId: markMock.id,
  //   //   model: 'Henry 11.0',
  //   //   description: '',
  //   //   responsibleUser: 'modrp',
  //   // }

  //   // const equipModelCreated = await equipTypeDomain.addModel(equipTypeMock)

  //   equipMock = {
  //     // equipModelId: equipModelCreated.id,
  //     companyId: companyCreated.id,
  //     serialNumber: '696970',
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

  //   entryEquipmentMock = {
  //     humidity: false,
  //     fall: false,
  //     misuse: false,
  //     brokenSeal: false,
  //     serialNumber: '696970',
  //     externalDamage: true,
  //     details: 'tá zuado',
  //     defect: 'fonte',
  //     delivery: 'externo',
  //     technicianName: 'Carlos',
  //     motoboyName: 'vanderlei',
  //     responsibleName: 'cleiton',
  //     clientName: 'Adalto',
  //     RG: '95.546.654-2',
  //     Cpf: '93892472092',
  //     senderName: 'Amorim',
  //     properlyPacked: true,
  //     zipCode: '09930-210',
  //     state: 'Sao Paulo',
  //     city: 'SBC',
  //     neighborhood: 'Pauliceia',
  //     street: 'Rua dos bobo',
  //     number: '0',
  //     conditionType: 'avulso',
  //     garantia: 'externo',
  //     responsibleUser: 'modrp',
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
  // })


  test('true', () => {
    expect(true).toBe(true)
  })

  // test('create', async () => {
  //   const response = await request().post('/api/entryEquipment', entryEquipmentMock, { headers })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.equip.serialNumber).toBe(entryEquipmentMock.serialNumber)
  //   expect(body.externalDamage).toBe(entryEquipmentMock.externalDamage)
  //   expect(body.details).toBe(entryEquipmentMock.details)
  //   expect(body.defect).toBe(entryEquipmentMock.defect)
  //   expect(body.delivery).toBe(entryEquipmentMock.delivery)
  // })

  // test('getall', async () => {
  //   const response = await request().get('/api/entryEquipment', { headers })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.count).toBeTruthy()
  //   expect(body.page).toBeTruthy()
  //   expect(body.show).toBeTruthy()
  //   expect(body.rows).toBeTruthy()
  // })
})
