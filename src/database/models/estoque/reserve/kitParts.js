const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const kitParts = sequelize.define('kitParts', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    amount: {
      type: Sequelize.STRING,
      allowNull: false,
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
}
