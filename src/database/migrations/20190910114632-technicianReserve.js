
module.exports = {
  up: (queryInterface, Sequelize) => {
    const technicianReserve = queryInterface.createTable('technicianReserve', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      razaoSocial: {
        type: Sequelize.STRING,
        allowNull: true,
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

    technicianReserve.associate = (models) => {
      technicianReserve.belongsToMany(models.productBase, {
        through: 'technicianReserveParts',
      })
      technicianReserve.belongsTo(models.technician, {
        foreignKey: {
          allowNull: false,
        },
      })
    }

    return technicianReserve
  },
  down: queryInterface => queryInterface.dropTable('technicianReserve'),
}
