const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const entryEquipment = sequelize.define('entryEquipment', {
    // id: {
    //   type: Sequelize.UUID,
    //   defaultValue: Sequelize.UUIDV4,
    //   primaryKey: true,
    // },

    conditionType: {
      type: Sequelize.ENUM(['contrato', 'avulso', 'emprestimo']),
      allowNull: false,
    },

    garantia: {
      type: Sequelize.ENUM(['semGarantia', 'externo', 'venda', 'laboratorio']),
      allowNull: false,
    },

    externalDamage: {
      type: Sequelize.BOOLEAN,
    },

    details: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    defect: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    observation: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    delivery: {
      type: Sequelize.ENUM(
        'cliente',
        'sedex',
        'motoboy',
        'externo',
      ),
      allowNull: false,
    },

    clientName: {
      type: Sequelize.STRING,
    },
    senderName: {
      type: Sequelize.STRING,
    },
    zipCode: {
      type: Sequelize.STRING,
    },
    state: {
      type: Sequelize.STRING,
    },
    city: {
      type: Sequelize.STRING,
    },
    neighborhood: {
      type: Sequelize.STRING,
    },
    street: {
      type: Sequelize.STRING,
    },
    number: {
      type: Sequelize.STRING,
    },
    motoboyName: {
      type: Sequelize.STRING,
    },
    RG: {
      type: Sequelize.STRING,
    },
    Cpf: {
      type: Sequelize.STRING,
    },
    responsibleName: {
      type: Sequelize.STRING,
    },
    technicianName: {
      type: Sequelize.STRING,
    },
    properlyPacked: {
      type: Sequelize.BOOLEAN,
    },
    packingDetails: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    humidity: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },

    fall: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },

    misuse: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },

    brokenSeal: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },

    responsibleUser: {
      type: Sequelize.STRING,
      allowNull: false,
    },

  })

  entryEquipment.associate = (models) => {
    entryEquipment.belongsTo(models.equip, {
      foreignKey: {
        allowNull: false,
      },
    })
    entryEquipment.hasMany(models.accessories)
    // entryEquipment.belongsTo(models.user, {
    //   foreignKey: {
    //     allowNull: false,
    //   },
    // })
  }
  return entryEquipment
}
