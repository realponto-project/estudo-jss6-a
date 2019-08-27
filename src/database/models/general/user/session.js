const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const session = sequelize.define('session', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    lastActivity: {
      allowNull: false,
      defaultValue: Sequelize.NOW,
      type: Sequelize.DATE,
    },

    active: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  })

  session.associate = (models) => {
    session.belongsTo(models.login, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  return session
}
