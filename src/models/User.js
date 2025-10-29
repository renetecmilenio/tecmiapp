const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')
const bcrypt = require('bcryptjs')

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [6, 255]
    }
  },
  rol: {
    type: DataTypes.ENUM('superadmin', 'admin', 'cliente'),
    defaultValue: 'cliente',
    allowNull: false
  },
  activo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    // Encriptar contraseña antes de crear usuario
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
      }
    },
    // Encriptar contraseña antes de actualizar usuario
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(user.password, salt)
      }
    }
  }
})

// Método para verificar contraseña
User.prototype.verificarPassword = async function (password) {
  if (!password) return false // Manejar casos undefined/null/empty
  return await bcrypt.compare(password, this.password)
}

// Método para obtener datos públicos del usuario
User.prototype.toJSON = function () {
  const user = { ...this.get() }
  delete user.password // Nunca devolver la contraseña
  return user
}

module.exports = User
