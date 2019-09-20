const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const notification = sequelize.define('notification', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    message: {
      type: Sequelize.TEXT,
      allowNull: false,
    },

    viewed: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  })

  return notification
}
