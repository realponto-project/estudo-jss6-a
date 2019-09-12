// const request = require('../../helpers/request')

// const CompanyDomain = require('../../domains/company')
// const EquipModelDomain = require('../../domains/estoque/equip/equipModel')

// const companyDomain = new CompanyDomain()
// const equipModelDomain = new EquipModelDomain()

describe('equipController', () => {
  // let equipMock = null
  // let equipMarkMock = null
  // let headers = null
  // let params = null

  // beforeAll(async () => {
  //   const companyMock = {
  //     razaoSocial: 'teste 123456 LTDA',
  //     cnpj: '17727750000162',
  //     street: 'jaime rodrigues',
  //     number: '69',
  //     city: 'São Paulo',
  //     state: 'UF',
  //     neighborhood: 'JD. Avelino',
  //     zipCode: '09930-210',
  //     telphone: '(11)0985-4568',
  //     nameContact: 'jaimeldom',
  //     email: 'jaime@gmasi.com',
  //     responsibleUser: 'modrp',
  //   }

  //   const companyCreated = await companyDomain.add(companyMock)

  //   equipMarkMock = {
  //     type: 'catraca',
  //     mark: 'Hanry',
  //     responsibleUser: 'modrp',
  //   }

  //   const markMock = await equipTypeDomain.addMark(equipMarkMock)

  //   const equipTypeMock = {
  //     equipMarkId: markMock.id,
  //     model: 'Henry 8.0',
  //     description: '',
  //     responsibleUser: 'modrp',
  //   }

  //   const equipModelCreated = await equipTypeDomain.addModel(equipTypeMock)

  //   equipMock = {
  //     equipModelId: equipModelCreated.id,
  //     companyId: companyCreated.id,
  //     serialNumber: '123456789',
  //     proximidade: true,
  //     bio: true,
  //     barras: true,
  //     cartografico: true,
  //     tipoCracha: 'Hid',
  //     corLeitor: 'Verde',
  //     details: '',
  //     responsibleUser: 'modrp',
  //   }

    // const loginBody = {
    //   username: 'modrp',
    //   password: 'modrp',
    // }

  //   const login = await request().post('/oapi/login', loginBody)

  //   const { token, username } = login.body

  //   headers = {
  //     token,
  //     username,
  //   }

  //   params = {
  //     serialNumber: '123456789',
  //     query: {
  //       filters: {
  //         equip: {
  //           global: {
  //             fields: ['serialNumber'],
  //             value: '',
  //           },
  //           specific: {
  //             serialNumber: '',
  //           },
  //         },
  //       },
  //       page: 1,
  //       total: 25,
  //       order: {
  //         field: 'createdAt',
  //         acendent: true,
  //       },
  //     },
  //   }
  // })

  test('true', () => {
    expect(true).toBe(true)
  })

  // test('create', async () => {
  //   const response = await request().post('/api/equip', equipMock, { headers })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.serialNumber).toBe(equipMock.serialNumber)
  //   expect(body.proximidade).toBe(equipMock.proximidade)
  //   expect(body.bio).toBe(equipMock.bio)
  //   expect(body.barras).toBe(equipMock.barras)
  //   expect(body.cartografico).toBe(equipMock.cartografico)
  //   expect(body.tipoCracha).toBe(equipMock.tipoCracha)
  //   expect(body.corLeitor).toBe(equipMock.corLeitor)
  //   expect(body.responsibleUser).toBe(equipMock.responsibleUser)
  //   expect(body.details).toBe(equipMock.details)
  //   expect(body.company.id).toBe(equipMock.companyId)
  //   // expect(body.equipModel.id).toBe(equipMock.equipModelId)
  // })

  // test('getall, query', async () => {
  //   const response = await request().get('/api/equip', { headers, params })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.count).toBeTruthy()
  //   expect(body.page).toBeTruthy()
  //   expect(body.show).toBeTruthy()
  //   expect(body.rows).toBeTruthy()
  // })

  // test('getall', async () => {
  //   const response = await request().get('/api/equip', { headers })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.count).toBeTruthy()
  //   expect(body.page).toBeTruthy()
  //   expect(body.show).toBeTruthy()
  //   expect(body.rows).toBeTruthy()
  // })

  // test('getOneBySerialNumber', async () => {
  // const response = await request().get('/api/equip/serialNumber', { headers, params })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.serialNumber).toBeTruthy()
  //   // expect(body.equipModelId).toBeTruthy()
  //   expect(body.companyId).toBeTruthy()
  // })

  // test('update', async () => {
  //   const equipMockUp = {
  //     ...equipMock,
  //   }
  //   equipMockUp.serialNumber = '787878'

  //   const equipCreated = await request().post('/api/equip', equipMockUp, { headers })

  //   const updateEquipMock = {
  //     id: equipCreated.body.id,
  //     serialNumber: '88778877',
  //     type: 'catraca',
  //     mark: 'Hanry',
  //     model: 'Henry 8.0',
  //   }

  //   const response = await request().put('/api/equip/update', updateEquipMock, { headers })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.serialNumber).toBeTruthy()
  //   expect(body.companyId).toBeTruthy()
  //   // expect(body.equipModelId).toBeTruthy()
  // })
})
