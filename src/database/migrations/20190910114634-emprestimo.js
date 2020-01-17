module.exports = {
  up: (queryInterface, Sequelize) => {
    const emprestimo = queryInterface.createTable("emprestimo", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },

      dateExpedition: {
        type: Sequelize.DATE,
        allowNull: false
      },

      razaoSocial: {
        type: Sequelize.STRING
      },

      cnpj: {
        type: Sequelize.STRING,
        set(oldValue) {
          const newValue = oldValue.replace(/\.|-|\//gi, "");
          this.setDataValue("cnpj", newValue);
        }
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

      equipId: {
        type: Sequelize.UUID,
        references: {
          model: "equip",
          key: "id"
        },
        allowNull: true
      },

      technicianId: {
        type: Sequelize.UUID,
        references: {
          model: "technician",
          key: "id"
        },
        allowNull: true
      }
    });

    emprestimo.associate = models => {
      emprestimo.belongsTo(models.equip, {
        foreignKey: {
          allowNull: false
        }
      });
      emprestimo.belongsTo(models.technician, {
        foreignKey: {
          allowNull: false
        }
      });
    };
    return emprestimo;
  },

  down: queryInterface => queryInterface.dropTable("emprestimo")
};
