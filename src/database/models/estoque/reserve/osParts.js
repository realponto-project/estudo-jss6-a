const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const osParts = sequelize.define("osParts", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    amount: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    return: {
      type: Sequelize.STRING,
      defaultValue: "0",
    },

    output: {
      type: Sequelize.STRING,
      defaultValue: "0",
    },

    missOut: {
      type: Sequelize.STRING,
      defaultValue: "0",
    },
  });

  osParts.associate = (models) => {
    // osParts.belongsToMany(models.product, { through: 'osParts' })
    // osParts.belongsTo(models.product);
    osParts.belongsTo(models.conserto);
    osParts.belongsTo(models.os);
    osParts.belongsTo(models.product);
    osParts.belongsTo(models.statusExpedition, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return osParts;
};
