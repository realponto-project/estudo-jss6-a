const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const os = sequelize.define('os', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    os: {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
    },

    razaoSocial: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    cnpj: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date(),
      timestamps: false,
    },
  })

  os.associate = (models) => {
    os.belongsToMany(models.productBase, { through: 'osParts' })
    os.belongsTo(models.technician, {
      foreignKey: {
        allowNull: true,
      },
    })
  }

  return os
}
