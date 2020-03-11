"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.changeColumn(
        "stockBase",
        "stockBase",
        {
          type: Sequelize.ENUM([
            "REALPONTO",
            "NOVAREAL",
            "PONTOREAL",
            "EMPRESTIMO",
            "INSUMOS"
          ])
        },
        { transaction }
      );
      await queryInterface.changeColumn(
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
        },
        { transaction }
      );
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.sequelize.transaction(t => {
      return null;
    });
  }
};
