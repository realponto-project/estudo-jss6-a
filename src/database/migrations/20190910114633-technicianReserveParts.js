
module.exports = {
  up: (queryInterface, Sequelize) => {
    const technicianReserveParts = queryInterface.createTable('technicianReserveParts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      amount: {
        type: Sequelize.STRING,
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

      technicianReserveId: {
        type: Sequelize.UUID,
        references: {
          model: 'os',
          key: 'id',
        },
        allowNull: true,
      },
      productBaseId: {
        type: Sequelize.UUID,
        references: {
          model: 'productBase',
          key: 'id',
        },
        allowNull: false,
      },
      productId: {
        type: Sequelize.UUID,
        references: {
          model: 'product',
          key: 'id',
        },
        allowNull: true,
      },
    })

    technicianReserveParts.associate = (models) => {
      technicianReserveParts.belongsTo(models.product)
      technicianReserveParts.belongsTo(models.technicianReserve)
      technicianReserveParts.belongsTo(models.productBase)
    }
    return technicianReserveParts
  },

  down: queryInterface => queryInterface.dropTable('technicianReserveParts'),
}
