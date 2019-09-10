'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('login', [{
    id: 'ed031057-e3b4-4e63-90b8-581307bc4a4a',
    password: 'modrp',
    // password: '$2b$10$ila7N/Foko5RriSM9sACAuF.QZjBl89xKKcZNd/3oCh4UUJeJqPNG',
    createdAt: new Date(),
    updatedAt: new Date(),
  }], {}),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('login', null, {}),
}
