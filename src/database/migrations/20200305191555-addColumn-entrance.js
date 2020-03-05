"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.changeColumn(
          "entrance",
          "stockBase",
          {
            type: Sequelize.ENUM([
              "REALPONTO",
              "NOVAREAL",
              "PONTOREAL",
              "EMPRESTIMO",
              "INSUMOS"
            ])
            // type: Sequelize.STRING,
            // allowNull: false
          },
          { transaction: t }
        )
      ]);
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return null;
    });
  }
};
