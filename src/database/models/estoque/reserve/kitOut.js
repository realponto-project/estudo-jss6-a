const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const kitOut = sequelize.define('kitOut', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
  })

  kitOut.associate = (models) => {
    kitOut.belongsToMany(models.product, { through: 'kitPartsOut' })

    kitOut.belongsTo(models.technician, {
      foreignKey: {
        allowNull: true,
      },
    })
  }

  return kitOut
}
