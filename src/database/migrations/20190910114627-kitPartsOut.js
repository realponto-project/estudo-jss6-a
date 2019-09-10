
module.exports = {
  up: (queryInterface, Sequelize) => {
    const kitPartsOut = queryInterface.createTable('kitPartsOut', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      amount: {
        type: Sequelize.STRING,
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

    return kitPartsOut
  },

  down: queryInterface => queryInterface.dropTable('kitPartsOut'),
}
