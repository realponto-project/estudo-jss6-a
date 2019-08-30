// const R = require('ramda')

const EquipModelDomain = require('./index')

const { FieldValidationError } = require('../../../../../helpers/errors')

const equipModelDomain = new EquipModelDomain()

describe('equipModelDomain', () => {
  // let equipTypeMockBefore = null
  // let equipTypeCreatedBefore = null
  // // let equipMarkMock = null

  // beforeAll(async () => {
  //   equipTypeMockBefore = {
  //     type: 'RELOGO DE PONTO',
  //     responsibleUser: 'modrp',
  //   }

  //   equipTypeCreatedBefore = await equipModelDomain.addType(equipTypeMockBefore)
  // })


  test('create equipType', async () => {
    const equipTypeMock = {
      type: 'CONTROLE DE ACESSO',
      responsibleUser: 'modrp',
    }

    const equipTypeCreated = await equipModelDomain.addType(equipTypeMock)

    expect(equipTypeCreated.type).toBe(equipTypeMock.type)
    expect(equipTypeCreated.responsibleUser).toBe(equipTypeMock.responsibleUser)

    await expect(equipModelDomain.addType(equipTypeMock))
      .rejects.toThrowError(new FieldValidationError())
  })

  test('getAllType', async () => {
    const equipTypes = await equipModelDomain.getAllType()

    expect(equipTypes.length > 0).toBe(true)
  })

  // test('create equipModel', async () => {
  //   const equipModelMock = {
  //     equipTypeId: equipTypeCreatedBefore.id,
  //     name: 'PLUS',
  //     description: '',
  //     serial: true,
  //     responsibleUser: 'modrp',
  //   }

  //   const equipModelCreated = await equipModelDomain.addModel(equipModelMock)


  //   expect(equipModelCreated.name).toBe(equipModelMock.name)
  //   expect(equipModelCreated.description).toBe(equipModelMock.description)
  //   expect(equipModelCreated.responsibleUser).toBe(equipModelMock.responsibleUser)
  //   expect(equipModelCreated.equipType.id).toBe(equipModelMock.equipTypeId)
  //   expect(equipModelCreated.serial).toBe(true)

  //   await expect(equipModelDomain.addType(equipModelMock))
  //     .rejects.toThrowError(new FieldValidationError())
  // })


  // test('create', async () => {
  //   const equipTypeCreated = await equipTypeDomain.addModel(equipModelMock)

  //   expect(equipTypeCreated.model).toBe(equipModelMock.model)
  //   expect(equipTypeCreated.description).toBe(equipModelMock.description)
  //   expect(equipTypeCreated.equipMarkId).toBe(equipModelMock.equipMarkId)
  //   expect(equipTypeCreated.equipMark.mark).toBe(equipMarkMock.mark)
  //   expect(equipTypeCreated.equipMark.equipType.type).toBe(equipMarkMock.type)


  //   await expect(equipTypeDomain.addModel(equipModelMock))
  //     .rejects.toThrowError(new FieldValidationError())
  // })

  // test('try addModel equipType with description null', async () => {
  //   equipModelMock.model = 'Ford'
  //   equipModelMock.description = ''
  //   const equipTypeCreated = await equipTypeDomain.addModel(equipModelMock)

  //   expect(equipTypeCreated).toBeTruthy()
  // })

  // test('try addMark equipType with Type null', async () => {
  //   equipMarkMock.type = ''

  //   await expect(equipTypeDomain.addMark(equipMarkMock)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'Type',
  //       message: 'type is required',
  //     }]))
  // })


  // test('try addMark equipType without Type', async () => {
  //   const equipMarkMockCreated = R.omit(['Type'], equipMarkMock)

  //   await expect(equipTypeDomain.addMark(equipMarkMockCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'Type',
  //       message: 'type is required',
  //     }]))
  // })

  // test('try addMark equipType with mark null', async () => {
  //   equipMarkMock.mark = ''

  //   await expect(equipTypeDomain.addMark(equipMarkMock)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'mark',
  //       message: 'mark is required',
  //     }]))
  // })


  // test('try addMark equipType without mark', async () => {
  //   const equipMarkMockCreated = R.omit(['mark'], equipMarkMock)

  //   await expect(equipTypeDomain.addMark(equipMarkMockCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'mark',
  //       message: 'mark is required',
  //     }]))
  // })

  // test('try addModel equipType with model null', async () => {
  //   equipModelMock.model = ''

  //   await expect(equipTypeDomain.addModel(equipModelMock)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'model',
  //       message: 'model is required',
  //     }]))
  // })


  // test('try addModel equipType without model', async () => {
  //   const equipModelMockCreated = R.omit(['model'], equipModelMock)

  //   await expect(equipTypeDomain.addModel(equipModelMockCreated)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'model',
  //       message: 'model is required',
  //     }]))
  // })


  // test('create equipType with same mark and model, but different type', async () => {
  //   const equipMarkMock1 = {
  //     type: 'catraca',
  //     mark: 'GM',
  //     responsibleUser: 'modrp',
  //   }

  //   const equipMarkMock2 = {
  //     type: 'relogio',
  //     mark: 'GM',
  //     responsibleUser: 'modrp',
  //   }

  //   const markMock1 = await equipTypeDomain.addMark(equipMarkMock1)
  //   const markMock2 = await equipTypeDomain.addMark(equipMarkMock2)

  //   const equipModelMock1 = {
  //     equipMarkId: markMock1.id,
  //     model: 'Onix',
  //     description: '',
  //     responsibleUser: 'modrp',
  //   }
  //   const equipModelMock2 = {
  //     equipMarkId: markMock2.id,
  //     model: 'Onix',
  //     description: '',
  //     responsibleUser: 'modrp',
  //   }
  //   const equipModelMock3 = {
  //     equipMarkId: markMock2.id,
  //     model: 'Corsa',
  //     description: '',
  //     responsibleUser: 'modrp',
  //   }

  //   await equipTypeDomain.addModel(equipModelMock1)

  //   const equipTypeCreated2 = await equipTypeDomain.addModel(equipModelMock2)
  //   const equipTypeCreated3 = await equipTypeDomain.addModel(equipModelMock3)

  //   expect(equipTypeCreated2).toBeTruthy()
  //   expect(equipTypeCreated3).toBeTruthy()
  // })


  // test('create quipType of the piece type with the same model and brand', async () => {
  //   const equipMarkMock1 = {
  //     type: 'peca',
  //     mark: 'Ford',
  //     responsibleUser: 'modrp',
  //   }

  //   const markMock1 = await equipTypeDomain.addMark(equipMarkMock1)

  //   const equipModelMock1 = {
  //     equipMarkId: markMock1.id,
  //     model: 'Ka',
  //     description: 'Motor',
  //     responsibleUser: 'modrp',
  //   }
  //   const equipModelMock2 = {
  //     equipMarkId: markMock1.id,
  //     model: 'Ka',
  //     description: 'Volante',
  //     responsibleUser: 'modrp',
  //   }

  //   const equipTypeCreated1 = await equipTypeDomain.addModel(equipModelMock1)

  //   const equipTypeCreated2 = await equipTypeDomain.addModel(equipModelMock2)

  //   expect(equipTypeCreated1).toBeTruthy()
  //   expect(equipTypeCreated2).toBeTruthy()

  //   await expect(equipTypeDomain.addModel(equipModelMock2)).rejects
  //     .toThrowError(new FieldValidationError([{
  //       field: 'description',
  //       message: 'peca alread exist',
  //     }]))
  // })

  // test('getAll', async () => {
  //   const equipTypes = await equipTypeDomain.getAll()
  //   expect(equipTypes.rows.length > 0).toBeTruthy()
  // })

  // test('getAllMarkByType', async () => {
  //   const equips = await equipTypeDomain.getAllMarkByType('catraca')
  //   expect(equips).toBeTruthy()
  // })

  // test('getAllModelByMark', async () => {
  //   const equips = await equipTypeDomain.getAllModelByMark({ mark: 'GM', type: 'catraca' })
  //   expect(equips).toBeTruthy()
  // })
})
