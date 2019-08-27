const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const analyze = sequelize.define('analyze', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    budgetStatus: {
      type: Sequelize.ENUM(['recusado', 'aprovado', 'aguardando aprovação']),
      allowNull: false,
      defaultValue: 'aguardando aprovação',
    },

    // humidity: {
    //   type: Sequelize.BOOLEAN,
    //   defaultValue: false,
    // },

    // fall: {
    //   type: Sequelize.BOOLEAN,
    //   defaultValue: false,
    // },

    // misuse: {
    //   type: Sequelize.BOOLEAN,
    //   defaultValue: false,
    // },

    // brokenSeal: {
    //   type: Sequelize.BOOLEAN,
    //   defaultValue: false,
    // },

    observations: {
      // type: Sequelize.STRING,
      type: Sequelize.ARRAY(Sequelize.TEXT),
      allowNull: true,
    },

    init: {
      type: Sequelize.ARRAY(Sequelize.DATE),
      allowNull: true,
    },

    end: {
      type: Sequelize.ARRAY(Sequelize.DATE),
      allowNull: true,
    },

    arrayResponsibleUser: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    },

    responsibleUser: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    // arrayUserId: {
    //   type: Sequelize.ARRAY(Sequelize.UUID),
    //   allowNull: true,
    // },

    // garantia: {
    //   type: Sequelize.ENUM(['externa', 'laboratorio', 'venda', 'semg garantia']),
    //   allowNull: false,
    // },

    // conditionType: {
    //   type: Sequelize.ENUM(['avulso', 'contrato', 'emprestimo']),
    //   allowNull: false,
    // },
  })

  analyze.associate = (models) => {
    analyze.hasMany(models.analysisPart, {
      foreignKey: {
        // allowNull: false,
      },
    })
    analyze.belongsTo(models.process, {
      foreignKey: {
        // allowNull: false,
      },
    })
    analyze.hasMany(models.pause, {
      foreignKey: {
        // allowNull: false,
      },
    })
    // analyze.belongsTo(models.user, {
    //   foreignKey: {
    //     allowNull: false,
    //   },
    // })
  }

  return analyze
}
