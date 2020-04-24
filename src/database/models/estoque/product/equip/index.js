const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const equip = sequelize.define("equip", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    serialNumber: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },

    reserved: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },

    inClient: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },

    loan: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  });

  equip.associate = (models) => {
    equip.belongsTo(models.product, {
      foreignKey: {
        allowNull: false,
      },
    });
    equip.belongsTo(models.osParts);
    equip.belongsTo(models.freeMarketParts);
    // equip.hasMany(models.emprestimo);
    equip.belongsTo(models.entrance);
  };

  return equip;
};
