
module.exports = {
  up: (queryInterface, Sequelize) => {
    const kitOut = queryInterface.createTable('kitOut', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      action: {
        type: Sequelize.ENUM(['reposicao', 'expedicao', 'perda']),
        allowNull: false,
      },

      amount: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      os: {
        type: Sequelize.STRING,
        allowNull: true,
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

      kitPartId: {
        type: Sequelize.UUID,
        references: {
          model: 'kitParts',
          key: 'id',
        },
        allowNull: false,
      },
    })

    kitOut.associate = (models) => {
      kitOut.belongsTo(models.kitParts, {
        foreignKey: {
          allowNull: false,
        },
      })
    }

    return kitOut
  },
  down: queryInterface => queryInterface.dropTable('kitOut'),
}
