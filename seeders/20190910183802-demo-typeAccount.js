'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('typeAccount', [{
    id: '123e4567-e89b-12d3-a456-426655440000',
    typeName: 'MOD',
    responsibleUser: 'modrp',
    stock: true,
    labTec: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }], {}),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('typeAccount', null, {}),
}
