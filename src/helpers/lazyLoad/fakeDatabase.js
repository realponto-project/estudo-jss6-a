const Sequelize = require('sequelize')

const moment = require('moment')

const database = require('../../database')

const table1 = database.define('table1', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },

  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  motherName: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  fatherName: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },

  birthday: {
    type: Sequelize.DATE,
    allowNull: false,
    set(birthday) {
      const formattedBirthday = moment(birthday)
        .startOf('day')
        .toDate()

      this.setDataValue('birthday', formattedBirthday)
    },
  },
})

const FakeTableNestedHasOne = database.define('nestedOne', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
})

const FakeTableNestedHasMany = database.define('nestedHasManyTable', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
})

const FakeTableNestedBelongsToMany = database.define('nestedBelongs', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
})

table1.hasOne(FakeTableNestedHasOne)
table1.hasMany(FakeTableNestedHasMany)
table1.belongsToMany(FakeTableNestedBelongsToMany, { through: 'belongThrough' })


module.exports = { database }
