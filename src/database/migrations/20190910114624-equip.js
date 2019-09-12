
module.exports = {
  up: (queryInterface, Sequelize) => {
    const equip = queryInterface.createTable('equip', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      serialNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      reserved: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
      osPartId: {
        type: Sequelize.UUID,
        references: {
          model: 'osParts',
          key: 'id',
        },
        allowNull: true,
      },
      freeMarketPartId: {
        type: Sequelize.UUID,
        references: {
          model: 'freeMarketParts',
          key: 'id',
        },
        allowNull: true,
      },
    })

    equip.associate = (models) => {
      equip.belongsTo(models.productBase, {
        foreignKey: {
          allowNull: false,
        },
      })
      equip.belongsTo(models.osParts)
    }

    return equip
  },
  down: queryInterface => queryInterface.dropTable('equip'),
}
