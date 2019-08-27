const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const product = sequelize.define('product', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    category: {
      type: Sequelize.ENUM(['peca', 'equipamento', 'outros']),
      allowNull: false,
    },

    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    SKU: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    // costPrice: {
    //   type: Sequelize.STRING,
    //   allowNull: false,
    // },

    // salePrice: {
    //   type: Sequelize.STRING,
    //   allowNull: false,
    // },

    minimumStock: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })

  product.associate = (models) => {
    product.belongsTo(models.mark, {
      foreignKey: {
        allowNull: false,
      },
    })

    product.belongsTo(models.part, {
      foreignKey: {
        allowNull: true,
      },
    })

    product.belongsTo(models.equipModel, {
      foreignKey: {
        allowNull: true,
      },
    })
    product.belongsToMany(models.stockBase, { through: 'productBase' })
  }

  return product
}
