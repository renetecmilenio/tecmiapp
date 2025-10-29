// tests/setup.js - Configuración global para los tests
const { sequelize, connectTestDB } = require('../src/config/db.test')

// SOLO configurar para tests
if (process.env.NODE_ENV === 'test') {
  // Configurar base de datos de test
  beforeAll(async () => {
    // Usar SQLite en memoria para tests
    try {
      await connectTestDB()
      console.log('✅ Base de datos de test configurada (SQLite en memoria)')
    } catch (error) {
      console.error('❌ Error setting up test database:', error)
      throw error
    }
  })

  // Limpiar después de todos los tests
  afterAll(async () => {
    try {
      await sequelize.close()
    } catch (error) {
      console.error('Error closing test database:', error)
    }
  })

  // Limpiar base de datos antes de cada test
  beforeEach(async () => {
    try {
      // Truncar todas las tablas SOLO en tests
      await sequelize.sync({ force: true })
    } catch (error) {
      console.error('Error cleaning database:', error)
    }
  })
} else {
  console.warn('⚠️ Setup de tests no ejecutado - NODE_ENV no es "test"')
}
