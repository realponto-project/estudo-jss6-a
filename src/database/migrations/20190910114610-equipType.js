
module.exports = {
  up: (queryInterface, Sequelize) => {
    const equipType = queryInterface.createTable('equipType', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      type: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      responsibleUser: {
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

    return equipType
  },
  down: queryInterface => queryInterface.dropTable('equipType'),
}
