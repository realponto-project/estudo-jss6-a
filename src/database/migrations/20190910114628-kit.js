
module.exports = {
  up: (queryInterface, Sequelize) => {
    const kit = queryInterface.createTable('kit', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
        allowNull: true,
      },
    })

    kit.associate = (models) => {
      kit.belongsToMany(models.product, { through: 'kitParts' })
      kit.belongsTo(models.technician, {
        foreignKey: {
          allowNull: true,
        },
      })
    }

    return kit
  },
  down: queryInterface => queryInterface.dropTable('kit'),
}
