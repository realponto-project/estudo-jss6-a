
module.exports = {
  up: (queryInterface, Sequelize) => {
    const technician = queryInterface.createTable('technician', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      CNH: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      external: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    technician.associate = (models) => {
      technician.belongsToMany(models.car, {
        through: 'technicianCar',
      })
    }
    return technician
  },

  down: queryInterface => queryInterface.dropTable('technician'),
}
