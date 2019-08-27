// const R = require('ramda')

const CompanyDomain = require('.')

const { FieldValidationError } = require('../../../helpers/errors')

const companyDomain = new CompanyDomain()

describe('companyDomain', () => {
  let companyMock = null

  beforeAll(() => {
    companyMock = {
      razaoSocial: 'teste 123 LTDA',
      cnpj: '40190041000102',
      street: 'jadaisom rodrigues',
      number: '6969',
      city: 'São Paulo',
      state: 'UF',
      neighborhood: 'JD. Avelino',
      zipCode: '09930-210',
      telphone: '(11)0965-4568',
      nameContact: 'joseildom',
      email: 'josealdo@gmasi.com',
      responsibleUser: 'modrp',
      relation: 'cliente',
    }
  })

  test('create company client', async () => {
    const companyCreated = await companyDomain.add(companyMock)

    expect(companyCreated.razaoSocial).toBe(companyMock.razaoSocial)
    expect(companyCreated.cnpj).toBe(companyMock.cnpj)
    expect(companyCreated.street).toBe(companyMock.street)
    expect(companyCreated.number).toBe(companyMock.number)
    expect(companyCreated.city).toBe(companyMock.city)
    expect(companyCreated.state).toBe(companyMock.state)
    expect(companyCreated.neighborhood).toBe(companyMock.neighborhood)
    expect(companyCreated.zipCode).toBe('09930210')
    expect(companyCreated.telphone).toBe('1109654568')
    expect(companyCreated.nameContact).toBe(companyMock.nameContact)
    expect(companyCreated.email).toBe(companyMock.email)
    expect(companyCreated.relation).toBe(companyMock.relation)

    await expect(companyDomain.add(companyMock))
      .rejects.toThrowError(new FieldValidationError())
  })

  test('create company provider', async () => {
    const company = {
      razaoSocial: 'fornecesor 123 LTDA',
      cnpj: '51136141000177',
      street: 'jadaisom rodrigues',
      number: '6969',
      city: 'São Paulo',
      state: 'UF',
      neighborhood: 'JD. Avelino',
      zipCode: '09930-210',
      telphone: '(11)0965-4568',
      nameContact: 'joseildom',
      email: 'fornecedor@gmail.com',
      responsibleUser: 'modrp',
      relation: 'fornecedor',
    }
    const companyCreated = await companyDomain.add(company)

    expect(companyCreated.razaoSocial).toBe(company.razaoSocial)
    expect(companyCreated.cnpj).toBe(company.cnpj)
    expect(companyCreated.street).toBe(company.street)
    expect(companyCreated.number).toBe(company.number)
    expect(companyCreated.city).toBe(company.city)
    expect(companyCreated.state).toBe(company.state)
    expect(companyCreated.neighborhood).toBe(company.neighborhood)
    expect(companyCreated.zipCode).toBe('09930210')
    expect(companyCreated.telphone).toBe('1109654568')
    expect(companyCreated.nameContact).toBe(company.nameContact)
    expect(companyCreated.email).toBe(company.email)
    expect(companyCreated.relation).toBe(company.relation)

    await expect(companyDomain.add(company))
      .rejects.toThrowError(new FieldValidationError())
  })

  test('getAllFornecedor', async () => {
    const fornecedores = await companyDomain.getAllFornecedor()

    expect(fornecedores.length > 0).toBeTruthy()
  })

  // test('update', async () => {
  //   const companyCreated = await companyDomain.update(companyMock)

  //   expect(companyCreated.razaoSocial).toBe(companyMock.razaoSocial)
  //   expect(companyCreated.cnpj).toBe(companyMock.cnpj)
  //   expect(companyCreated.street).toBe(companyMock.street)
  //   expect(companyCreated.number).toBe(companyMock.number)
  //   expect(companyCreated.city).toBe(companyMock.city)
  //   expect(companyCreated.state).toBe(companyMock.state)
  //   expect(companyCreated.neighborhood).toBe(companyMock.neighborhood)
  //   expect(companyCreated.zipCode).toBe('09930210')
  //   expect(companyCreated.telphone).toBe('1109654568')
  //   expect(companyCreated.nameContact).toBe(companyMock.nameContact)
  //   expect(companyCreated.email).toBe(companyMock.email)
  // })

  // test('update', async () => {
  //   const newCompanyMock = {
  //     ...companyMock,
  //     razaoSocial: 'teste Update',
  //   }
  //   const companyCreated = await companyDomain.update(newCompanyMock)

  //   expect(companyCreated.razaoSocial).toBe(newCompanyMock.razaoSocial)
  //   expect(companyCreated.cnpj).toBe(newCompanyMock.cnpj)
  //   expect(companyCreated.street).toBe(newCompanyMock.street)
  //   expect(companyCreated.number).toBe(newCompanyMock.number)
  //   expect(companyCreated.city).toBe(newCompanyMock.city)
  //   expect(companyCreated.state).toBe(newCompanyMock.state)
  //   expect(companyCreated.neighborhood).toBe(newCompanyMock.neighborhood)
  //   expect(companyCreated.zipCode).toBe('09930210')
  //   expect(companyCreated.telphone).toBe('1109654568')
  //   expect(companyCreated.nameContact).toBe(newCompanyMock.nameContact)
  //   expect(companyCreated.email).toBe(newCompanyMock.email)
  // })
  // test('try add company with razaoSocial null', async () => {
  //   const companyCreated = companyMock
  //   companyCreated.razaoSocial = ''

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'razaoSocial',
  //       message: 'razaoSocial cannot be null',
  //     }]))
  // })


  // test('try add company without razaoSocial', async () => {
  //   const companyCreated = R.omit(['razaoSocial'], companyMock)

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'razaoSocial',
  //       message: 'razaoSocial cannot be null',
  //     }]))
  // })

  // test('try add company with cnpj null', async () => {
  //   const companyCreated = companyMock
  //   companyCreated.cnpj = ''

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'cnpj',
  //       message: 'cnpj cannot be null',
  //     }]))
  // })


  // test('try add company without cnpj', async () => {
  //   const companyCreated = R.omit(['cnpj'], companyMock)

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'cnpj',
  //       message: 'cnpj cannot be null',
  //     }]))
  // })

  // test('try add company without cnpj invalid', async () => {
  //   const companyCreated = {
  //     ...companyMock,
  //     cnpj: '1234567',
  //   }

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'cnpj',
  //       message: 'cnpj or cpf is invalid',
  //     }]))
  // })

  // test('try add company with street null', async () => {
  //   const companyCreated = companyMock
  //   companyCreated.street = ''

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'street',
  //       message: 'street cannot be null',
  //     }]))
  // })


  // test('try add company without street', async () => {
  //   const companyCreated = R.omit(['street'], companyMock)

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'street',
  //       message: 'street cannot be null',
  //     }]))
  // })

  // test('try add company with email null', async () => {
  //   const companyCreated = companyMock
  //   companyCreated.email = ''

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'email',
  //       message: 'email cannot be null',
  //     }]))
  // })


  // test('try add company without email', async () => {
  //   const companyCreated = R.omit(['email'], companyMock)

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'email',
  //       message: 'email cannot be null',
  //     }]))
  // })

  // test('try add company without email invalid', async () => {
  //   const companyCreated = {
  //     ...companyMock,
  //     email: 'realponto@hotmail',
  //   }

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'email',
  //       message: 'email is invalid',
  //     }]))
  // })

  // test('try add company with number null', async () => {
  //   const companyCreated = companyMock
  //   companyCreated.number = ''

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'number',
  //       message: 'number cannot be null',
  //     }]))
  // })

  // test('try add company without number', async () => {
  //   const companyCreated = R.omit(['number'], companyMock)

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'number',
  //       message: 'number cannot be null',
  //     }]))
  // })

  // test('try add company without number invalid', async () => {
  //   const companyCreated = {
  //     ...companyMock,
  //     number: '23a23',
  //   }

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'number',
  //       message: 'number is invalid',
  //     }]))
  // })

  // test('try add company with city null', async () => {
  //   const companyCreated = companyMock
  //   companyCreated.city = ''

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'city',
  //       message: 'city cannot be null',
  //     }]))
  // })


  // test('try add company without city', async () => {
  //   const companyCreated = R.omit(['city'], companyMock)

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'city',
  //       message: 'city cannot be null',
  //     }]))
  // })

  // test('try add company with state null', async () => {
  //   const companyCreated = companyMock
  //   companyCreated.state = ''

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'state',
  //       message: 'state cannot be null',
  //     }]))
  // })


  // test('try add company without state', async () => {
  //   const companyCreated = R.omit(['state'], companyMock)

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'state',
  //       message: 'state cannot be null',
  //     }]))
  // })

  // test('try add company with neighborhood null', async () => {
  //   const companyCreated = companyMock
  //   companyCreated.neighborhood = ''

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'neighborhood',
  //       message: 'neighborhood cannot be null',
  //     }]))
  // })


  // test('try add company without neighborhood', async () => {
  //   const companyCreated = R.omit(['neighborhood'], companyMock)

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'neighborhood',
  //       message: 'neighborhood cannot be null',
  //     }]))
  // })

  // test('try add company with zipCode null', async () => {
  //   const companyCreated = companyMock
  //   companyCreated.zipCode = ''

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'zipCode',
  //       message: 'zipCode cannot be null',
  //     }]))
  // })

  // test('try add company without zipCode', async () => {
  //   const companyCreated = R.omit(['zipCode'], companyMock)

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'zipCode',
  //       message: 'zipCode cannot be null',
  //     }]))
  // })

  // test('try add company with telphone null', async () => {
  //   const companyCreated = companyMock
  //   companyCreated.telphone = ''

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'telphone',
  //       message: 'telphone cannot be null',
  //     }]))
  // })

  // test('try add company without telphone', async () => {
  //   const companyCreated = R.omit(['telphone'], companyMock)

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'telphone',
  //       message: 'telphone cannot be null',
  //     }]))
  // })

  // test('try add company with nameContact null', async () => {
  //   const companyCreated = companyMock
  //   companyCreated.nameContact = ''

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'nameContact',
  //       message: 'nameContact cannot be null',
  //     }]))
  // })


  // test('try add company without nameContact', async () => {
  //   const companyCreated = R.omit(['nameContact'], companyMock)

  //   await expect(companyDomain.add(companyCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'nameContact',
  //       message: 'nameContact cannot be null',
  //     }]))
  // })

  // test('getAll', async () => {
  //   const companies = await companyDomain.getAll()
  //   expect(companies.rows.length > 0).toBeTruthy()
  // })

  // test('getOneByCnpj', async () => {
  //   const company = await companyDomain.getOneByCnpj('40190041000102')
  //   expect(company).toBeTruthy()
  // })
})
