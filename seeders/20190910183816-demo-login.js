// const bcrypt = require('bcrypt')
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.bulkInsert('login', [{
    id: 'ed031057-e3b4-4e63-90b8-581307bc4a4a',
    password: '$2b$10$2hbmGpAGdqDGPbexzRi7v.nJhYs4ud5pz7PO0yMqnGbkAAYqdKidC',
    // password: 'modrp',
    createdAt: new Date(),
    updatedAt: new Date(),
  }], {}),

  down: (queryInterface, Sequelize) => queryInterface.bulkDelete('login', null, {}),
}
