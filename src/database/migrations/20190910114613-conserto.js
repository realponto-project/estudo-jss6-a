module.exports = {
  up: (queryInterface, Sequelize) => {
    const conserto = queryInterface.createTable("conserto", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },

      serialNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },

      observation: {
        type: Sequelize.STRING,
        allowNull: true
      },

      createdAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE
      },

      updatedAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE
      },

      deletedAt: {
        defaultValue: null,
        type: Sequelize.DATE
      },
      productId: {
        type: Sequelize.UUID,
        references: {
          model: "product",
          key: "id"
        },
        allowNull: true
      }
    });

    conserto.associate = models => {
      conserto.belongsTo(models.product, {
        foreignKey: {
          allowNull: false
        }
      });
    };

    return conserto;
  },

  down: queryInterface => queryInterface.dropTable("conserto")
};
