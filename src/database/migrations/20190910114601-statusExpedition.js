
module.exports = {
  up: (queryInterface, Sequelize) => {
    const statusExpedition = queryInterface.createTable('statusExpedition', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      status: {
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


    return statusExpedition
  },

  down: queryInterface => queryInterface.dropTable('statusExpedition'),
}
