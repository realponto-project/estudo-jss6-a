const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const kit = sequelize.define('kit', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
  })

  kit.associate = (models) => {
    kit.belongsToMany(models.product, { through: 'kitParts' })
    kit.belongsTo(models.technician, {
      foreignKey: {
        allowNull: true,
      },
    })
  }

  return kit
}
