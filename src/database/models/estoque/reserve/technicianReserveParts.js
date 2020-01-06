const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const technicianReserveParts = sequelize.define('technicianReserveParts', {
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

  technicianReserveParts.associate = (models) => {
    technicianReserveParts.belongsTo(models.product)
    technicianReserveParts.belongsTo(models.technicianReserve)
    technicianReserveParts.belongsTo(models.productBase)
  }

  return technicianReserveParts
}
