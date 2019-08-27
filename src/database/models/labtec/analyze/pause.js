const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const pause = sequelize.define('pause', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    motivoPausa: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    inicio: {
      type: Sequelize.DATE,
      allowNull: false,
    },

    final: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  })

  // pause.associate = (models) => {
  //   pause.belongsTo(models.analyze, {
  //     foreignKey: {
  //       // allowNull: false,
  //     },
  //   })
  //   // analyze.hasMany(models.pause, {
  //   //   foreignKey: {
  //   //     // allowNull: false,
  //   //   },
  //   // })
  // }

  return pause
}
