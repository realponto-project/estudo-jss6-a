const CarDomain = require('.')

const { FieldValidationError } = require('../../../../helpers/errors')

const carDomain = new CarDomain()

describe('carDomain', () => {
  let carMock = null

  beforeAll(() => {
    carMock = {
      model: 'CELTA',
      year: '2009',
      plate: 'ABC-1234',
    }
  })

  test('create car', async () => {
    const carCreated = await carDomain.add(carMock)

    expect(carCreated.model).toBe(carMock.model)
    expect(carCreated.year).toBe(carMock.year)
    expect(carCreated.plate).toBe(carMock.plate)

    await expect(carDomain.add(carMock))
      .rejects.toThrowError(new FieldValidationError())
  })

  test('getAll', async () => {
    const cars = await carDomain.getAll()

    expect(cars.length > 0).toBe(true)
  })
})
