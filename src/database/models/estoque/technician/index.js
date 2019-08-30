const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const technician = sequelize.define('technician', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    CNH: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    external: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  })

  technician.associate = (models) => {
    technician.belongsToMany(models.car, {
      through: 'technicianCar',
    })
  }
  return technician
}
