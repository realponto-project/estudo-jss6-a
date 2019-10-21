const Sequelize = require("sequelize");

module.exports = sequelize => {
  const analysisPart = sequelize.define("analysisPart", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true
    },

    description: {
      type: Sequelize.STRING,
      allowNull: false
    },

    discount: {
      type: Sequelize.STRING,
      allowNull: true
    },

    effectivePrice: {
      type: Sequelize.STRING,
      allowNull: true
    },

    finalPrice: {
      type: Sequelize.STRING,
      allowNull: true
    },

    approved: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },

    responsibleUser: {
      type: Sequelize.STRING,
      allowNull: false
    }
  });

  // analysisPart.associate = (models) => {
  //   analysisPart.belongsTo(models.part)
  // }

  return analysisPart;
};
