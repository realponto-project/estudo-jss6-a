const Sequelize = require("sequelize");

module.exports = sequelize => {
  const conserto = sequelize.define("conserto", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    serialNumber: {
      type: Sequelize.STRING,
      allowNull: false
    },

    serialNumbers: {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true
    },

    observation: {
      type: Sequelize.TEXT,
      allowNull: true
    }
  });

  conserto.associate = models => {
    conserto.belongsTo(models.product, {
      foreignKey: {
        allowNull: false
      }
    });
    conserto.belongsToMany(models.os, { through: "osParts" });
  };

  return conserto;
};
