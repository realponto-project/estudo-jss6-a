// const Sequelize = require('sequelize')

// module.exports = (sequelize) => {
//   const equip = sequelize.define('equip', {
//     id: {
//       type: Sequelize.UUID,
//       defaultValue: Sequelize.UUIDV4,
//       primaryKey: true,
//     },

//     serialNumber: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },

//     corLeitor: {
//       type: Sequelize.ENUM(['Branco', 'Vermelho', 'Azul', 'Verde', 'NaoSeAplica']),
//       allowNull: false,
//     },

//     tipoCracha: {
//       type: Sequelize.ENUM(['Hid', 'Mifare', 'Wiegand', 'Abatrack', 'Sarial', 'NaoSeAplica']),
//       allowNull: false,
//     },

//     proximidade: {
//       type: Sequelize.BOOLEAN,
//       allowNull: false,
//     },
//     bio: {
//       type: Sequelize.BOOLEAN,
//       allowNull: false,
//     },
//     barras: {
//       type: Sequelize.BOOLEAN,
//       allowNull: false,
//     },
//     cartografico: {
//       type: Sequelize.BOOLEAN,
//       allowNull: false,
//     },


//     details: {
//       type: Sequelize.STRING,
//       allowNull: true,
//     },

//     responsibleUser: {
//       type: Sequelize.STRING,
//       allowNull: false,
//     },
//   })

//   // equip.associate = (models) => {
//   //   equip.belongsTo(models.company, {
//   //     foreignKey: {
//   //       allowNull: false,
//   //     },
//   //   })
//   //   // equip.belongsTo(models.equipModel, {
//   //   //   foreignKey: {
//   //   //     allowNull: false,
//   //   //   },
//   //   // })
//   // }

//   return equip
// }


const Sequelize = require('sequelize')

module.exports = (sequelize) => {
  const equip = sequelize.define('equip', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },

    serialNumber: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },

    reserved: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  })

  equip.associate = (models) => {
    equip.belongsTo(models.productBase, {
      foreignKey: {
        allowNull: false,
      },
    })
    equip.belongsTo(models.osParts)
    equip.belongsTo(models.freeMarketParts)
  }

  return equip
}
