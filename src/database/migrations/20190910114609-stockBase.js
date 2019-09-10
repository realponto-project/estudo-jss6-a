
module.exports = {
  up: (queryInterface, Sequelize) => {
    const stockBase = queryInterface.createTable('stockBase', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      stockBase: {
        type: Sequelize.ENUM(['REALPONTO', 'NOVAREAL', 'PONTOREAL']),
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

    stockBase.associate = (models) => {
      stockBase.belongsToMany(models.product, { through: 'productBase' })
    }

    return stockBase
  },

  down: queryInterface => queryInterface.dropTable('stockBase'),
}
