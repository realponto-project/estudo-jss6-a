const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const entrance = sequelize.define("entrance", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    amountAdded: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    responsibleUser: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    analysis: {
      type: Sequelize.BOOLEAN,
      defautValue: false,
    },
  });

  entrance.associate = (models) => {
    entrance.belongsTo(models.product, {
      foreignKey: {
        allowNull: false,
      },
    });

    entrance.belongsTo(models.company, {
      foreignKey: {
        allowNull: true,
      },
    });
  };

  return entrance;
};
