const CarDomain = require('../../../../domains/estoque/technician/car')
const database = require('../../../../database')

const carDomain = new CarDomain()

const add = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const car = await carDomain.add(req.body, { transaction })

    await transaction.commit()
    res.json(car)
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
}

const getAll = async (req, res, next) => {
  const transaction = await database.transaction()
  try {
    const cars = await carDomain.getAll({ transaction })

    await transaction.commit()
    res.json(cars)
  } catch (error) {
    await transaction.rollback()
    next()
  }
}

module.exports = {
  add,
  getAll,
}
