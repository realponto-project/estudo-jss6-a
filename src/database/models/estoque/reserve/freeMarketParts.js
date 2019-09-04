const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const freeMarketParts = sequelize.define('freeMarketParts', {
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

  freeMarketParts.associate = (models) => {
    freeMarketParts.belongsTo(models.freeMarket)
    freeMarketParts.belongsTo(models.productBase)
  }

  return freeMarketParts
}
