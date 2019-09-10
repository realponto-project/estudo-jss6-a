
module.exports = {
  up: (queryInterface, Sequelize) => {
    const typeAccount = queryInterface.createTable('typeAccount', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      typeName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      stock: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      labTec: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      responsibleUser: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE,
      },

      updatedAt: {
        defaultValue: Sequelize.NOW,
        type: Sequelize.DATE,
      },

      deletedAt: {
        defaultValue: null,
        type: Sequelize.DATE,
      },
    })

    typeAccount.associate = (models) => {
      typeAccount.hasOne(models.resources, {
        foreignKey: {
          allowNull: true,
        },
      })
    }


    return typeAccount
  },
  down: queryInterface => queryInterface.dropTable('typeAccount'),
}
