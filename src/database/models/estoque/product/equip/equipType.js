const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const equipType = sequelize.define('equipType', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    type: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },

    responsibleUser: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })

  return equipType
}
