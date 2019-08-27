const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const company = sequelize.define('company', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    razaoSocial: {
      type: Sequelize.STRING,
    },

    cnpj: {
      type: Sequelize.STRING,
      set(oldValue) {
        // eslint-disable-next-line no-useless-escape
        const newValue = oldValue.replace(/\.|-|\//gi, '')
        this.setDataValue('cnpj', newValue)
      },
    },

    street: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    number: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    complement: {
      type: Sequelize.STRING,
    },

    city: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    state: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    neighborhood: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    referencePoint: {
      type: Sequelize.STRING,
    },

    zipCode: {
      type: Sequelize.STRING,
      allowNull: false,
      set(oldValue) {
        // eslint-disable-next-line no-useless-escape
        const newValue = oldValue.replace(/\.|-/gi, '')
        this.setDataValue('zipCode', newValue)
      },
    },

    telphone: {
      type: Sequelize.STRING,
      allowNull: false,
      set(oldValue) {
        // eslint-disable-next-line no-useless-escape
        const newValue = oldValue.replace(/\.|-/gi, '')
        this.setDataValue('telphone', newValue)
      },
    },

    email: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    nameContact: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    responsibleUser: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    relation: {
      type: Sequelize.ENUM(['cliente', 'fornecedor']),
      allowNull: false,
    },
  })

  company.associate = (models) => {
    company.belongsToMany(models.entrance, {
      through: 'entranceCompany',
    })

    // product.belongsTo(models.part, {
    //   foreignKey: {
    //     allowNull: true,
    //   },
    // })

    // product.belongsTo(models.equipModel, {
    //   foreignKey: {
    //     allowNull: true,
    //   },
    // })
  }

  return company
}
