const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const process = sequelize.define('process', {
    // id: {
    //   type: Sequelize.UUID,
    //   defaultValue: Sequelize.UUIDV4,
    //   primaryKey: true,
    // },

    status: {
      type: Sequelize.ENUM(['preAnalise', 'analise', 'fabricaIda', 'fabricaVolta', 'pendente',
        'revisao1', 'posAnalise', 'revisao2', 'posAnalise2', 'revisao3',
        'orcamento', 'manutencao', 'revisaoFinal', 'estoque', 'semConserto']),
      allowNull: false,
    },
  })


  process.associate = (models) => {
    // process.belongsTo(models.equip, {
    //   foreignKey: {
    //     allowNull: false,
    //   },
    // })
    process.hasOne(models.analyze, {
      foreignKey: {
        // allowNull: false,
      },
    })
    process.hasOne(models.entryEquipment, {
      foreignKey: {
        // allowNull: false,
      },
    })
    process.hasMany(models.time, {
      foreignKey: {
        // allowNull: false,
      },
    })
  }
  return process
}
