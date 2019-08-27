const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const accessories = sequelize.define('accessories', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    accessories: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    responsibleUser: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })

  // accessories.associate = (models) => {
  //   accessories.belongsTo(models.user, {
  //     foreignKey: {
  //       allowNull: false,
  //     },
  //   })
  // }
  return accessories
}
