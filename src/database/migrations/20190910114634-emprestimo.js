module.exports = {
  up: (queryInterface, Sequelize) => {
    const emprestimo = queryInterface.createTable("emprestimo", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
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
      }
    });

    emprestimo.associate = models => {
      emprestimo.belongsTo(models.product, {
        foreignKey: {
          allowNull: false
        }
      });
      emprestimo.belongsTo(models.equip, {
        foreignKey: {
          allowNull: false
        }
      });
    };

    return emprestimo;
  },

  down: queryInterface => queryInterface.dropTable("emprestimo")
};
