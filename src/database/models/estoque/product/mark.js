const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const mark = sequelize.define('mark', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    mark: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    responsibleUser: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })

  mark.associate = (models) => {
    mark.hasMany(models.product, {
      foreignKey: {
        allowNull: false,
      },
    })
  }
  return mark
}
