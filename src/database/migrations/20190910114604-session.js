
module.exports = {
  up: (queryInterface, Sequelize) => {
    const session = queryInterface.createTable('session', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      lastActivity: {
        allowNull: false,
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE,
      },

      active: {
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
      loginId: {
        type: Sequelize.UUID,
        references: {
          model: 'login',
          key: 'id',
        },
        allowNull: false,
      },
    })

    session.associate = (models) => {
      session.belongsTo(models.login, {
        foreignKey: {
          allowNull: false,
        },
      })
    }

    return session
  },

  down: queryInterface => queryInterface.dropTable('session'),
}
