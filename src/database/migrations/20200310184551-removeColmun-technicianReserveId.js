"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn(
        "technicianReserveParts",
        "technicianReserveId",
        { transaction }
      );
      await queryInterface.addColumn(
        "technicianReserveParts",
        "technicianReserveId",
        {
          type: Sequelize.UUID,
          references: {
            model: "technicianReserve",
            key: "id"
          },
          allowNull: true
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
