const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const manufacturer = sequelize.define('manufacturer', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    manufacturer: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  })

  return manufacturer
}
