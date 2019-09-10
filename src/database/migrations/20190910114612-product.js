
module.exports = {
  up: (queryInterface, Sequelize) => {
    const product = queryInterface.createTable('product', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      category: {
        type: Sequelize.ENUM(['peca', 'equipamento', 'outros']),
        allowNull: false,
      },

      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      SKU: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      serial: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },

      minimumStock: {
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
      markId: {
        type: Sequelize.UUID,
        references: {
          model: 'mark',
          key: 'id',
        },
        allowNull: false,
      },
      equipTypeId: {
        type: Sequelize.UUID,
        references: {
          model: 'equipType',
          key: 'id',
        },
        allowNull: true,
      },
    })

    product.associate = (models) => {
      product.belongsTo(models.mark, {
        foreignKey: {
          allowNull: false,
        },
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

      product.belongsTo(models.equipType)

      product.belongsToMany(models.product, {
        as: 'productToMany',
        through: 'productProduct',
      })

      product.belongsToMany(models.stockBase, { through: 'productBase' })
    }

    return product
  },

  down: queryInterface => queryInterface.dropTable('product'),
}
