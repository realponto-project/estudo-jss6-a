const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const technicianReserve = sequelize.define("technicianReserve", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    razaoSocial: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    date: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date(),
      timestamps: false,
    },
  });

  technicianReserve.associate = (models) => {
    technicianReserve.belongsToMany(models.product, {
      through: "technicianReserveParts",
    });
    technicianReserve.belongsTo(models.technician, {
      foreignKey: {
        allowNull: false,
      },
    });
  };

  return technicianReserve;
};
