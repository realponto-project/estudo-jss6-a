const Sequelize = require('sequelize')
const bcrypt = require('bcrypt')

const getHash = plainPassoword => bcrypt.hash(plainPassoword, 10)

const shouldMakeAHash = login => login.changed('password')

const makeHashPasswordHook = async (login) => {
  if (shouldMakeAHash(login)) {
    // eslint-disable-next-line no-param-reassign
    login.password = await getHash(login.password)
  }
}


module.exports = (sequelize) => {
  const login = sequelize.define('login', {
    id: {
      type: Sequelize.UUID,
      defaultValue: Sequelize.UUIDV4,
      primaryKey: true,
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
    },
  })

  login.associate = (models) => {
    login.hasMany(models.session, {
      foreignKey: {
        allowNull: false,
      },
    })

    login.hasOne(models.user)
  }

  login.prototype.checkPassword = async function compare(plaintext) {
    return bcrypt.compare(plaintext, this.password)
  }

  login.beforeCreate(makeHashPasswordHook)
  login.beforeUpdate(makeHashPasswordHook)
  return login
}
