
module.exports = {
  up: (queryInterface, Sequelize) => {
    const notification = queryInterface.createTable('notification', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      viewed: {
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

    return notification
  },
  down: queryInterface => queryInterface.dropTable('notification'),
}
