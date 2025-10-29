// src/config/db.test.js - Configuración de DB para tests
const { Sequelize } = require('sequelize')

// Configuración de base de datos para tests (SQLite en memoria)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:', // Base de datos en memoria
  logging: false, // Sin logs durante tests
  define: {
    timestamps: true,
    underscored: false
  }
})

// Función para conectar y sincronizar en tests
const connectTestDB = async () => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ force: true }) // Siempre recrea las tablas
    return sequelize
  } catch (error) {
    console.error('Error conectando a base de datos de test:', error)
    throw error
  }
}

module.exports = { sequelize, connectTestDB }
