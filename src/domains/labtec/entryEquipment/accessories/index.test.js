const R = require('ramda')

const AccessoriesDomain = require('./index')

const { FieldValidationError } = require('../../../../helpers/errors')

const accessoriesDomain = new AccessoriesDomain()

describe('accessoriesDomain', () => {
  let accessoriesMock = null

  beforeAll(async () => {
    accessoriesMock = {
      accessories: 'Caaaaabo',
      responsibleUser: 'modrp',
    }
  })


  test('create', async () => {
    const accessoriesCreated = await accessoriesDomain.add(accessoriesMock)

    expect(accessoriesCreated.accessories).toBe(accessoriesMock.accessories)

    await expect(accessoriesDomain.add(accessoriesMock))
      .rejects.toThrowError(new FieldValidationError())
  })

  test('try add accessory with accessories null', async () => {
    const accessoriesCreated = accessoriesMock
    accessoriesCreated.accessories = ''

    await expect(accessoriesDomain.add(accessoriesCreated)).rejects
      .toThrowError(new FieldValidationError([{
        field: 'accessories',
        message: 'accessories cannot be null',
      }]))
  })


  test('try add accessory without accessories', async () => {
    const accessoriesCreated = R.omit(['accessories'], accessoriesMock)

    await expect(accessoriesDomain.add(accessoriesCreated)).rejects
      .toThrowError(new FieldValidationError([{
        field: 'accessories',
        message: 'accessories cannot be null',
      }]))
  })

  test('getAll', async () => {
    const accessories = await accessoriesDomain.getAll()
    expect(accessories.rows.length > 0).toBeTruthy()
  })
})
