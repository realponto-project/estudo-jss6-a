
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

      zipCode: {
        type: Sequelize.STRING,
        allowNull: false,
        set(oldValue) {
          // eslint-disable-next-line no-useless-escape
          const newValue = oldValue.replace(/\.|-/gi, '')
          this.setDataValue('zipCode', newValue)
        },
      },

      state: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      city: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      neighborhood: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      street: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      number: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      complement: {
        type: Sequelize.STRING,
      },


      referencePoint: {
        type: Sequelize.STRING,
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
