const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const statusExpedition = sequelize.define('statusExpedition', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    status: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
  })

  return statusExpedition
}
