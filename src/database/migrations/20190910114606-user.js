
module.exports = {
  up: (queryInterface, Sequelize) => {
    const user = queryInterface.createTable('user', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      customized: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        // defaultValue: false,
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

      loginId: {
        type: Sequelize.UUID,
        references: {
          model: 'login',
          key: 'id',
        },
        allowNull: true,
      },

      resourceId: {
        type: Sequelize.UUID,
        references: {
          model: 'resources',
          key: 'id',
        },
        allowNull: true,
      },

      typeAccountId: {
        type: Sequelize.UUID,
        references: {
          model: 'typeAccount',
          key: 'id',
        },
        allowNull: true,
      },
    })

    user.associate = (models) => {
      user.belongsTo(models.login)
      user.belongsTo(models.resources)
      user.belongsTo(models.typeAccount, {
        // foreignKey: {
        //   allowNull: false,
        // },
      })
      // user.belongsTo(models.user, {
      //   foreignKey: {
      //     allowNull: false,
      //   },
      // })
    }

    return user
  },

  down: queryInterface => queryInterface.dropTable('user'),
}
