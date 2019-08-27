const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const kitPartsOut = sequelize.define('kitPartsOut', {
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

  return kitPartsOut
}
