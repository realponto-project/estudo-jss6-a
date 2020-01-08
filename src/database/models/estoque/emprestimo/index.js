const Sequelize = require("sequelize");

module.exports = sequelize => {
  const emprestimo = sequelize.define("emprestimo", {
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
};
