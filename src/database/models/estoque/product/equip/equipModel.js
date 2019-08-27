const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const equipModel = sequelize.define('equipModel', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    serial: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },

    responsibleUser: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })

  equipModel.associate = (models) => {
    equipModel.belongsTo(models.equipType, {
      foreignKey: {
        allowNull: false,
      },
    })
    // equipModel.belongsTo(models.prduct, {
    //   // foreignKey: {
    //   //   allowNull: false,
    //   // },
    // })
  }
  return equipModel
}
