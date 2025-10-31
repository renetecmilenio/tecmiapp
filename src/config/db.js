// src/config/db.js - Sesión 2: Conexión a MySQL con Sequelize
const { Sequelize } = require('sequelize')

// Configuración de la conexión a MySQL
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false, // Desactivar logs SQL para mantener consola limpia
  define: {
    timestamps: true,
    underscored: false
  }
})

// Función para probar la conexión con diferentes configuraciones
const connectDB = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Conexión a MySQL establecida correctamente')

    // Importar modelos para asegurar que estén cargados
    require('../models')

    // Sincronizar modelos (crear tablas si no existen) con opciones más robustas
    await sequelize.sync({ alter: true })
    console.log('📊 Base de datos sincronizada')

    // Datos de ejemplo insertados automáticamente
    console.log('🔄 Ejecutando insertSampleData...')
    await insertSampleData()
    console.log('✅ insertSampleData completado')
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error.message)
    console.log('💡 Sugerencias:')
    console.log('   - Verifica que MySQL esté ejecutándose')
    console.log('   - Verifica usuario/password de MySQL')
    console.log('   - Crea la base de datos: CREATE DATABASE backend_app;')
  }
}

// Función para insertar datos de ejemplo automáticamente en Docker
const insertSampleData = async () => {
  console.log('🚀 INICIO insertSampleData')
  try {
    // Importar modelos después de que sequelize esté configurado
    const { User } = require('../models')
    const { Service } = require('../models')
    console.log('📦 Modelos importados correctamente')

    // Primero verificar que exista al menos un usuario
    const userCount = await User.count()
    if (userCount === 0) {
      // En Docker, crear automáticamente el super admin
      console.log('📦 Docker: Creando super admin automáticamente...')
      await User.create({
        nombre: 'Super Administrador',
        email: 'superadmin@empresa.com',
        password: 'superadmin123', // Sin hashear - el modelo lo hace automáticamente
        rol: 'superadmin'
      })
      console.log('👑 Super admin creado: superadmin@empresa.com / superadmin123')
    }

    const count = await Service.count()
    if (count === 0) {
      const primerUsuario = await User.findOne()
      if (!primerUsuario) {
        console.log('⚠️ No se encontró ningún usuario.')
        return
      }
      await Service.bulkCreate([
        {
          nombre: 'Desarrollo Web',
          descripcion: 'Creación de sitios web modernos y responsivos',
          precio: 2500.00,
          usuarioId: primerUsuario.id
        },
        {
          nombre: 'Consultoría IT',
          descripcion: 'Asesoría en tecnologías de información',
          precio: 1800.00,
          usuarioId: primerUsuario.id
        },
        {
          nombre: 'Diseño UX/UI',
          descripcion: 'Diseño de experiencias de usuario excepcionales',
          precio: 2200.00,
          usuarioId: primerUsuario.id
        }
      ])
      console.log('📋 Datos de ejemplo insertados')
    }
  } catch (error) {
    console.log('⚠️ No se pudieron insertar datos de ejemplo:', error.message)
  }
}

module.exports = { sequelize, connectDB }
