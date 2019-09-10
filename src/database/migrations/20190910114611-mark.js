
module.exports = {
  up: (queryInterface, Sequelize) => {
    const mark = queryInterface.createTable('mark', {
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

      manufacturerId: {
        type: Sequelize.UUID,
        references: {
          model: 'manufacturer',
          key: 'id',
        },
        allowNull: false,
      },
    })

    mark.associate = (models) => {
      mark.belongsTo(models.manufacturer, {
        foreignKey: {
          allowNull: false,
        },
      })
      mark.hasMany(models.product, {
        foreignKey: {
          allowNull: false,
        },
      })
    }
    return mark
  },

  down: queryInterface => queryInterface.dropTable('mark'),
}
