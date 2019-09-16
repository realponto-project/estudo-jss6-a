
module.exports = {
  up: (queryInterface, Sequelize) => {
    const os = queryInterface.createTable('os', {
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
        defaultValue: new Date(),
        timestamps: false,
        allowNull: false,
      },
      createdAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE,
      },

      updatedAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE,
      },

      deletedAt: {
        defaultValue: null,
        type: Sequelize.DATE,
      },
      technicianId: {
        type: Sequelize.UUID,
        references: {
          model: 'technician',
          key: 'id',
        },
        allowNull: false,
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
  },
  down: queryInterface => queryInterface.dropTable('os'),
}
