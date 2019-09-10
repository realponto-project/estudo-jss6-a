'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('user', [{
    id: '5bb177b7-0a9e-4d03-bf03-844d4e05763e',
    username: 'modrp',
    customized: false,
    responsibleUser: 'modrp',
    loginId: 'ed031057-e3b4-4e63-90b8-581307bc4a4a',
    resourceId: null,
    typeAccountId: '123e4567-e89b-12d3-a456-426655440000',
    createdAt: new Date(),
    updatedAt: new Date(),
  }], {}),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('user', null, {}),
}
