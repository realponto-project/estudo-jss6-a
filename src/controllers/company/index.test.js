const request = require('../../helpers/request')

describe('companyController', () => {
  test('true', () => {
    expect(true).toBe(true)
  })


  let companyMock = null
  let headers = null
  let params = null
  // let updateCompanyMock = null

  beforeAll(async () => {
    companyMock = {
      razaoSocial: 'teste 12sa3 LTDA',
      cnpj: '32478461000160',
      street: 'jadaisom rodrigues',
      number: '6969',
      city: 'São Paulo',
      state: 'UF',
      neighborhood: 'JD. Avelino',
      zipCode: '09930210',
      telphone: '09654568',
      nameContact: 'joseildom',
      email: 'clebinho@joazinho.com',
      responsibleUser: 'modrp',
      relation: 'fornecedor',
    }

    // updateCompanyMock = {
    //   razaoSocial: 'teste 12sa3 LTDA',
    //   cnpj: '32478461000160',
    //   street: 'jadaisom rodrigues',
    //   number: '6969',
    //   city: 'São Paulo',
    //   state: 'UF',
    //   neighborhood: 'JD. Avelino',
    //   zipCode: '09930210',
    //   telphone: '09654568',
    //   nameContact: 'joseildom',
    //   email: 'clebinho@joazinho.com',
    //   responsibleUser: 'modrp',
    // }

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

    params = {
      query: {
        filters: {
          company: {
            global: {
              fields: [
                'cnpj',
                'razaoSocial',
                'nameContact',
                'telphone',
              ],
              value: '',
            },
            specific: {
              cnpj: '',
              razaoSocial: '',
              nameContact: '',
              telphone: '',
              relation: 'fornecedor',
            },
          },
        },
        page: 1,
        total: 25,
        order: {
          field: 'createdAt',
          acendent: true,
        },
      },
    }
  })

  test('create', async () => {
    const response = await request().post('/api/company', companyMock, { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.razaoSocial).toBe(companyMock.razaoSocial)
    expect(body.cnpj).toBe(companyMock.cnpj)
    expect(body.street).toBe(companyMock.street)
    expect(body.number).toBe(companyMock.number)
    expect(body.city).toBe(companyMock.city)
    expect(body.state).toBe(companyMock.state)
    expect(body.neighborhood).toBe(companyMock.neighborhood)
    expect(body.zipCode).toBe(companyMock.zipCode)
    expect(body.telphone).toBe(companyMock.telphone)
  })

  test('getall, query', async () => {
    const response = await request().get('/api/company', { headers, params })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.count).toBeTruthy()
    expect(body.page).toBeTruthy()
    expect(body.show).toBeTruthy()
    expect(body.rows).toBeTruthy()
  })

  test('getallFornecedor', async () => {
    const response = await request().get('/api/company/getallFornecedor', { headers })

    const { body, statusCode } = response

    expect(statusCode).toBe(200)
    expect(body.length > 0).toBeTruthy()
  })

  // test('getall', async () => {
  //   const response = await request().get('/api/company', { headers })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.count).toBeTruthy()
  //   expect(body.page).toBeTruthy()
  //   expect(body.show).toBeTruthy()
  //   expect(body.rows).toBeTruthy()
  // })

  // test('getOneByCnpj', async () => {
  //   const response = await request().get('/api/company/getOneByCnpj', { headers, params })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.razaoSocial).toBeTruthy()
  //   expect(body.cnpj).toBeTruthy()
  //   expect(body.street).toBeTruthy()
  //   expect(body.number).toBeTruthy()
  //   expect(body.city).toBeTruthy()
  //   expect(body.state).toBeTruthy()
  //   expect(body.neighborhood).toBeTruthy()
  //   expect(body.zipCode).toBeTruthy()
  //   expect(body.telphone).toBeTruthy()
  // })

  // test('update', async () => {
  //   const response = await request().put('/api/company/update', updateCompanyMock, { headers })

  //   const { body, statusCode } = response

  //   expect(statusCode).toBe(200)
  //   expect(body.razaoSocial).toBeTruthy()
  //   expect(body.cnpj).toBeTruthy()
  //   expect(body.street).toBeTruthy()
  //   expect(body.number).toBeTruthy()
  //   expect(body.city).toBeTruthy()
  //   expect(body.state).toBeTruthy()
  //   expect(body.neighborhood).toBeTruthy()
  //   expect(body.zipCode).toBeTruthy()
  //   expect(body.telphone).toBeTruthy()
  // })
})
