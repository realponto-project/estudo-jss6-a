
module.exports = {
  up: (queryInterface, Sequelize) => {
    const technicianCar = queryInterface.createTable('technicianCar', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      technicianId: {
        type: Sequelize.UUID,
        references: {
          model: 'technician',
          key: 'id',
        },
        allowNull: false,
      },

      carId: {
        type: Sequelize.UUID,
        references: {
          model: 'car',
          key: 'id',
        },
        allowNull: false,
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
    return technicianCar
  },

  down: queryInterface => queryInterface.dropTable('technicianCar'),
}
