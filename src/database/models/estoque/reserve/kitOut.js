const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const kitOut = sequelize.define('kitOut', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    action: {
      type: Sequelize.ENUM(['reposicao', 'expedicao', 'perda']),
      allowNull: false,
    },

    amount: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    os: {
      type: Sequelize.STRING,
      allowNull: true,
    },
  })

  kitOut.associate = (models) => {
    kitOut.belongsTo(models.kitParts, {
      foreignKey: {
        allowNull: false,
      },
    })
  }

  return kitOut
}
