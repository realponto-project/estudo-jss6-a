// const request = require('../../../helpers/request')

// const EquipModelDomain = require('../../../domains/estoque/equip/equipModel')

// const equipModelDomain = new EquipModelDomain()

describe('equipTypeController', () => {
  // let equipTypeMock = null
  // let equipMarkMock = null
  // let headers = null
  // let params = null

  // beforeAll(async () => {
  //   equipMarkMock = {
  //     type: 'relogio',
  //     mark: 'Henry',
  //     responsibleUser: 'modrp',
  //   }

  //   const markMock = await equipTypeDomain.addMark(equipMarkMock)

  //   equipTypeMock = {
  //     equipMarkId: markMock.id,
  //     model: 'Henry facil',
  //     description: '',
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

  //   params = {
  //     type: 'relogio',
  //     mark: 'Henry',
  //   }
  // })

  test('true', () => {
    expect(true).toBe(true)
  })

  // test('create', async () => {
  //   const response = await request().post('/api/equip/equipType/addModel', equipTypeMock, { headers })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.equipMark.equipType.type).toBe(equipMarkMock.type)
  //   expect(body.equipMark.mark).toBe(equipMarkMock.mark)
  //   expect(body.model).toBe(equipTypeMock.model)
  //   expect(body.description).toBe(equipTypeMock.description)
  // })

  // test('create', async () => {
  //   equipMarkMock = {
  //     type: 'relogio',
  //     mark: 'Dell',
  //     responsibleUser: 'modrp',
  //   }

  //   const response = await request().post('/api/equip/equipType/addMark', equipMarkMock, { headers })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.equipType.type).toBe(equipMarkMock.type)
  //   expect(body.mark).toBe(equipMarkMock.mark)
  // })

  // test('getall', async () => {
  //   const response = await request().get('/api/equip/equipType', { headers })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.count).toBeTruthy()
  //   expect(body.page).toBeTruthy()
  //   expect(body.show).toBeTruthy()
  //   expect(body.rows).toBeTruthy()
  // })

  // test('getAllMarkByType', async () => {
  //   const response = await request().get('/api/equip/equipType/getAllMarkByType', { headers, params })

  //   const { statusCode } = response

  //   expect(statusCode).toBe(200)
  // })

  // test('getAllModelByMark', async () => {
  //   const response = await request().get('/api/equip/equipType/getAllModelByMark', { headers, params })

  //   const { statusCode } = response

  //   expect(statusCode).toBe(200)
  // })
})
