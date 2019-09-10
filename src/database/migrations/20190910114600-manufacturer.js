module.exports = {
  up: (queryInterface, Sequelize) => {
    const manufacturer = queryInterface.createTable('manufacturer', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      manufacturer: {
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

    return manufacturer
  },

  down: queryInterface => queryInterface.dropTable('manufacturer'),
}
