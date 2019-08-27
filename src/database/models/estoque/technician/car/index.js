const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const car = sequelize.define('car', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    model: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    year: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    plate: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  })

  car.associate = (models) => {
    car.belongsToMany(models.technician, {
      through: 'technicianCar',
    })

    // car.belongsTo(models.part, {
    //   foreignKey: {
    //     allowNull: true,
    //   },
    // })

    // car.belongsTo(models.equipModel, {
    //   foreignKey: {
    //     allowNull: true,
    //   },
    // })
  }
  return car
}
