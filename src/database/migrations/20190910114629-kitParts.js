
module.exports = {
  up: (queryInterface, Sequelize) => {
    const kitParts = queryInterface.createTable('kitParts', {
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
      kitId: {
        type: Sequelize.UUID,
        references: {
          model: 'kit',
          key: 'id',
        },
        allowNull: false,
      },
      productBaseId: {
        type: Sequelize.UUID,
        references: {
          model: 'productBase',
          key: 'id',
        },
        allowNull: true,
      },
      productId: {
        type: Sequelize.UUID,
        references: {
          model: 'product',
          key: 'id',
        },
        allowNull: true,
      },
    })

    kitParts.associate = (models) => {
      // kitParts.belongsTo(models.stockBase, {
      //   foreignKey: {
      //     allowNull: true,
      //   },
      // })
      kitParts.belongsTo(models.productBase, {
        foreignKey: {
          allowNull: true,
        },
      })
      kitParts.belongsTo(models.kit, {
        foreignKey: {
          allowNull: true,
        },
      })
    }

    return kitParts
  },
  down: queryInterface => queryInterface.dropTable('kitParts'),
}
