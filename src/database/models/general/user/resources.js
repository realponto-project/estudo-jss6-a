const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const resources = sequelize.define('resources', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    addCompany: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    addPart: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    addAnalyze: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    addEquip: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    addEntry: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    addEquipType: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    tecnico: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    addAccessories: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    addUser: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
    addTypeAccount: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  })

  return resources
}
