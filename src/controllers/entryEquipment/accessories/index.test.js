const request = require('../../../helpers/request')

describe('accessoriesControllers', () => {
  let accessoriesMock = null
  let headers = null

  beforeAll(async () => {
    accessoriesMock = {
      accessories: 'fone',
      responsibleUser: 'modrp',
    }

    const loginBody = {
      username: 'modrp',
      password: 'modrp',
      typeAccount: { labTec: true },
    }

    const login = await request().post('/oapi/login', loginBody)

    const { token, username } = login.body

    headers = {
      token,
      username,
    }
  })

  test('create', async () => {
    const response = await request().post('/api/accessories', accessoriesMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.accessories).toBe(accessoriesMock.accessories)
  })

  test('getall', async () => {
    const response = await request().get('/api/accessories', { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.count).toBeTruthy()
    expect(body.page).toBeTruthy()
    expect(body.show).toBeTruthy()
    expect(body.rows).toBeTruthy()
  })
})
