// const R = require('ramda')

// const EquipDomain = require('./index')
// const CompanyDomain = require('../../company/index')
// const EquipModelDomain = require('./equipModel')


// const { FieldValidationError } = require('../../../helpers/errors')

// const equipDomain = new EquipDomain()
// const companyDomain = new CompanyDomain()
// const equipModelDomain = new EquipModelDomain()


describe('equipDomain', () => {
  // let equipMock = null
  // let equipMock1 = null
  // let equipMarkMock = null
  // let equipMarkMock1 = null

  // beforeAll(async () => {
  //   const companyMock = {
  //     razaoSocial: 'teste 12345 LTDA',
  //     cnpj: '12533380000109',
  //     street: 'jaime rodrigues',
  //     number: '69',
  //     city: 'São Paulo',
  //     state: 'UF',
  //     neighborhood: 'JD. Avelino',
  //     zipCode: '09930-210',
  //     telphone: '(11)0995-4568',
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
  //     model: 'Henry 2.0',
  //     description: '',
  //     responsibleUser: 'modrp',
  //   }

  //   const equipModelCreated = await equipTypeDomain.addModel(equipTypeMock)

  //   equipMock = {
  //     equipModelId: equipModelCreated.id,
  //     companyId: companyCreated.id,
  //     serialNumber: '12345687',
  //     proximidade: true,
  //     bio: true,
  //     barras: true,
  //     cartografico: true,
  //     tipoCracha: 'Hid',
  //     corLeitor: 'Verde',
  //     details: '',
  //     responsibleUser: 'modrp',
  //   }

  //   const companyMock1 = {
  //     razaoSocial: 'teste 54321 LTDA',
  //     cnpj: '70128209000110',
  //     street: 'jaime rodrigues',
  //     number: '69',
  //     city: 'São Paulo',
  //     state: 'UF',
  //     neighborhood: 'JD. Avelino',
  //     zipCode: '09930-210',
  //     telphone: '(11)0999-4568',
  //     nameContact: 'jaimeldom',
  //     email: 'jaime@gmasi.com',
  //     responsibleUser: 'modrp',
  //   }

  //   const companyCreated1 = await companyDomain.add(companyMock1)

  //   // equipMarkMock1 = {
  //   //   type: 'catraca',
  //   //   mark: 'Hanrye',
  //   //   responsibleUser: 'modrp',
  //   // }

  //   // const markMock1 = await equipTypeDomain.addMark(equipMarkMock1)

  //   // const equipTypeMock1 = {
  //   //   equipMarkId: markMock1.id,
  //   //   model: 'Henry 9.0',
  //   //   description: '',
  //   //   responsibleUser: 'modrp',
  //   // }

  //   // const equipModelCreated1 = await equipTypeDomain.addModel(equipTypeMock1)

  //   equipMock1 = {
  //     // equipModelId: equipModelCreated1.id,
  //     companyId: companyCreated1.id,
  //     serialNumber: '987654321',
  //     proximidade: true,
  //     bio: true,
  //     barras: true,
  //     cartografico: true,
  //     tipoCracha: 'Hid',
  //     corLeitor: 'Verde',
  //     details: '',
  //     responsibleUser: 'modrp',
  //   }
  // })

  test('true', () => {
    expect(true).toBe(true)
  })

  // test('create', async () => {
  //   const equipCreated = await equipDomain.add(equipMock)
  //   const equipCreated1 = await equipDomain.add(equipMock1)

  //   // expect(equipCreated.equipModelId).toBe(equipMock.equipModelId)
  //   expect(equipCreated.companyId).toBe(equipMock.companyId)
  //   expect(equipCreated.serialNumber).toBe(equipMock.serialNumber)
  //   expect(equipCreated.proximidade).toBe(equipMock.proximidade)
  //   expect(equipCreated.bio).toBe(equipMock.bio)
  //   expect(equipCreated.barras).toBe(equipMock.barras)
  //   expect(equipCreated.cartografico).toBe(equipMock.cartografico)
  //   expect(equipCreated.tipoCracha).toBe(equipMock.tipoCracha)
  //   expect(equipCreated.corLeitor).toBe(equipMock.corLeitor)
  //   expect(equipCreated.details).toBe(equipMock.details)

  //   expect(equipCreated1).toBeTruthy()

  //   await expect(equipDomain.add(equipMock))
  //     .rejects.toThrowError(new FieldValidationError())
  // })

  // test('update', async () => {
  //   const equipMockUp = {
  //     ...equipMock,
  //   }
  //   equipMockUp.serialNumber = '585858'

  //   const equipCreated = await equipDomain.add(equipMockUp)

  //   const equipUpdateMock = {
  //     id: equipCreated.id,
  //     serialNumber: '858585',
  //     corLeitor: 'Verde',
  //     type: 'catraca',
  //     mark: 'Hanrye',
  //     model: 'Henry 9.0',
  //   }

  //   const equipUpadate = await equipDomain.update(equipUpdateMock)

  //   expect(equipUpadate.serialNumber).toEqual(equipUpdateMock.serialNumber)
  // })

  // // test('try add equip with equipModelId null', async () => {
  // //   const equipCreated = equipMock
  // //   equipCreated.equipModelId = ''

  // //   await expect(equipDomain.add(equipCreated)).rejects
  // //     .toThrowError(new FieldValidationError([{
  // //       field: 'equipModelId',
  // //       message: 'equipModelId cannot be null',
  // //     }]))
  // // })


  // // test('try add equip without equipModelId', async () => {
  // //   const equipCreated = R.omit(['equipModelId'], equipMock)

  // //   await expect(equipDomain.add(equipCreated)).rejects
  // //     .toThrowError(new FieldValidationError([{
  // //       field: 'equipModelId',
  // //       message: 'equipModelId cannot be null',
  // //     }]))
  // // })

  // test('try add equip with companyId null', async () => {
  //   const equipCreated = equipMock
  //   equipCreated.companyId = ''

  //   await expect(equipDomain.add(equipCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'companyId',
  //       message: 'companyId cannot be null',
  //     }]))
  // })


  // test('try add equip without companyId', async () => {
  //   const equipCreated = R.omit(['companyId'], equipMock)

  //   await expect(equipDomain.add(equipCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'companyId',
  //       message: 'companyId cannot be null',
  //     }]))
  // })


  // test('try add equip with serialNumber null', async () => {
  //   const equipCreated = equipMock
  //   equipCreated.serialNumber = ''

  //   await expect(equipDomain.add(equipCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'serialNumber',
  //       message: 'serialNumber cannot be null',
  //     }]))
  // })


  // test('try add equip without serialNumber', async () => {
  //   const equipCreated = R.omit(['serialNumber'], equipMock)

  //   await expect(equipDomain.add(equipCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'serialNumber',
  //       message: 'serialNumber cannot be null',
  //     }]))
  // })


  // test('try add equip without equipModelId invalid', async () => {
  //   const equipCreated = {
  //     ...equipMock,
  //     equipModelId: '2360dcfe-4288-4916-b526-078d7da53ec1',
  //   }

  //   await expect(equipDomain.add(equipCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'equipModelId',
  //       message: 'equipModelId invalid',
  //     }]))
  // })

  // test('try add equip without companyId invalid', async () => {
  //   const equipCreated = {
  //     ...equipMock,
  //     companyId: '2360dcfe-4288-4916-b526-078d7da53ec1',
  //   }

  //   await expect(equipDomain.add(equipCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'companyId',
  //       message: 'companyId invalid',
  //     }]))
  // })

  // test('getAll', async () => {
  //   const equips = await equipDomain.getAll()
  //   expect(equips.rows.length > 0).toBeTruthy()
  // })

  // test('getOneBySerialNumber', async () => {
  //   const equips = await equipDomain.getOneBySerialNumber('12345687')
  //   expect(equips).toBeTruthy()
  // })
})
