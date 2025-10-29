// Script para crear el superadmin inicial - Sesión 4
require('dotenv').config()
const { sequelize } = require('../src/config/db')
const User = require('../src/models/User')

async function crearSuperAdmin () {
  try {
    console.log('🔄 Conectando a la base de datos...')
    await sequelize.authenticate()
    console.log('✅ Conexión establecida')

    console.log('🔄 Sincronizando modelos...')
    await sequelize.sync({ force: false })
    console.log('✅ Modelos sincronizados')

    // Verificar si ya existe un superadmin
    const superadminExistente = await User.findOne({
      where: { rol: 'superadmin' }
    })

    if (superadminExistente) {
      console.log('⚠️  Ya existe un superadmin:')
      console.log(`   Email: ${superadminExistente.email}`)
      console.log(`   Nombre: ${superadminExistente.nombre}`)
      return
    }

    // Crear superadmin
    const superadmin = await User.create({
      nombre: 'Super Administrador',
      email: 'superadmin@empresa.com',
      password: 'superadmin123',
      rol: 'superadmin'
    })

    console.log('🎉 Superadmin creado exitosamente:')
    console.log(`   ID: ${superadmin.id}`)
    console.log(`   Email: ${superadmin.email}`)
    console.log(`   Nombre: ${superadmin.nombre}`)
    console.log(`   Rol: ${superadmin.rol}`)
    console.log('')
    console.log('📧 Credenciales de acceso:')
    console.log('   Email: superadmin@empresa.com')
    console.log('   Password: superadmin123')
  } catch (error) {
    console.error('❌ Error al crear superadmin:', error)
  } finally {
    await sequelize.close()
    console.log('🔒 Conexión cerrada')
  }
}

crearSuperAdmin()
