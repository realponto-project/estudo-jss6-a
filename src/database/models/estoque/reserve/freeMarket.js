const Sequelize = require("sequelize");

module.exports = sequelize => {
  const freeMarket = sequelize.define("freeMarket", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    trackingCode: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false
    },

    cnpjOrCpf: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });

  freeMarket.associate = models => {
    freeMarket.belongsToMany(models.productBase, {
      through: "freeMarketParts"
    });
  };

  return freeMarket;
};
