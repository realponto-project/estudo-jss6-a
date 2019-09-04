const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const typeAccount = sequelize.define('typeAccount', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    typeName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    stock: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    labTec: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    responsibleUser: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })


  typeAccount.associate = (models) => {
    typeAccount.hasOne(models.resources, {
      foreignKey: {
        allowNull: true,
      },
    })
    // typeAccount.belongsTo(models.user, {
    //   foreignKey: {
    //     allowNull: false,
    //   },
    // })
  }


  return typeAccount
}
