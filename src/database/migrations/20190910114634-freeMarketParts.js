
module.exports = {
  up: (queryInterface, Sequelize) => {
    const freeMarketParts = queryInterface.createTable('freeMarketParts', {
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
      productBaseId: {
        type: Sequelize.UUID,
        references: {
          model: 'productBase',
          key: 'id',
        },
        allowNull: false,
      },
      freeMarketId: {
        type: Sequelize.UUID,
        references: {
          model: 'freeMarket',
          key: 'id',
        },
        allowNull: false,
      },
    })

    freeMarketParts.associate = (models) => {
      freeMarketParts.belongsTo(models.freeMarket)
      freeMarketParts.belongsTo(models.productBase)
    }

    return freeMarketParts
  },
  down: queryInterface => queryInterface.dropTable('freeMarketParts'),
}
