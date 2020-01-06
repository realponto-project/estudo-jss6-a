
module.exports = {
  up: (queryInterface, Sequelize) => {
    const freeMarket = queryInterface.createTable('freeMarket', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      trackingCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      cnpjOrCpf: {
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
    })

    freeMarket.associate = (models) => {
      freeMarket.belongsToMany(models.productBase, { through: 'freeMarketParts' })
    }

    return freeMarket
  },
  down: queryInterface => queryInterface.dropTable('freeMarketParts'),
}
