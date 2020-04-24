const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  const product = sequelize.define("product", {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    category: {
      type: Sequelize.ENUM(["peca", "equipamento", "acessorios"]),
      allowNull: false,
    },

    description: {
      type: Sequelize.STRING,
      allowNull: true,
    },

    SKU: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    serial: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },

    minimumStock: {
      type: Sequelize.STRING,
      allowNull: false,
    },

    amount: {
      type: Sequelize.STRING,
      defaultValue: "0",
      allowNull: false,
    },

    available: {
      type: Sequelize.STRING,
      defaultValue: "0",
      allowNull: false,
    },

    reserved: {
      type: Sequelize.STRING,
      defaultValue: "0",
      allowNull: false,
    },

    analysis: {
      type: Sequelize.STRING,
      defaultValue: "0",
      allowNull: false,
    },
  });

  product.associate = (models) => {
    product.belongsTo(models.mark, {
      foreignKey: {
        allowNull: false,
      },
    });

    // product.belongsTo(models.part, {
    //   foreignKey: {
    //     allowNull: true,
    //   },
    // })

    // product.belongsTo(models.equipModel, {
    //   foreignKey: {
    //     allowNull: true,
    //   },
    // })

    product.belongsTo(models.equipType);

    product.belongsToMany(models.product, {
      as: "productToMany",
      through: "productProduct",
    });
  };

  return product;
};
