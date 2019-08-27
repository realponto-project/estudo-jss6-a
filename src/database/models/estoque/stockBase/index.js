const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const stockBase = sequelize.define('stockBase', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    stockBase: {
      type: Sequelize.ENUM(['REALPONTO', 'NOVAREAL', 'PONTOREAL']),
      allowNull: false,
    },
  })

  stockBase.associate = (models) => {
    stockBase.belongsToMany(models.product, { through: 'productBase' })
  }

  return stockBase
}
