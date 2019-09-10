
module.exports = {
  up: (queryInterface, Sequelize) => {
    const car = queryInterface.createTable('car', {
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
      createdAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE,
      },

      updatedAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE,
      },

      deletedAt: {
        defaultValue: null,
        type: Sequelize.DATE,
      },
    })

    car.associate = (models) => {
      car.belongsToMany(models.technician, {
        through: 'technicianCar',
      })
    }
    return car
  },

  down: queryInterface => queryInterface.dropTable('car'),
}
