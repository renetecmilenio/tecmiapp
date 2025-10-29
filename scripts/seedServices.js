// Script semilla para servicios - Genera servicios de ejemplo
require('dotenv').config()
const { sequelize } = require('../src/config/db')

// Manejo mejorado de errores de importación
let User, Service
try {
  User = require('../src/models/User')
  Service = require('../src/models/Service')
} catch (error) {
  console.error('❌ Error al importar modelos:', error.message)
  console.log('💡 Asegúrate de que los modelos estén correctamente definidos')
  process.exit(1)
}

// Datos de servicios de ejemplo
const serviciosData = [
  {
    nombre: 'Desarrollo Web Frontend',
    descripcion: 'Desarrollo de interfaces de usuario modernas y responsivas utilizando React, Vue.js o Angular. Incluye diseño UX/UI y optimización para dispositivos móviles.',
    precio: 1200.00
  },
  {
    nombre: 'Desarrollo Web Backend',
    descripcion: 'Desarrollo de APIs REST y servicios backend utilizando Node.js, Express y bases de datos. Incluye autenticación, seguridad y documentación.',
    precio: 1500.00
  },
  {
    nombre: 'Desarrollo Fullstack',
    descripcion: 'Desarrollo completo de aplicaciones web desde el frontend hasta el backend, incluyendo base de datos, APIs y despliegue.',
    precio: 2500.00
  },
  {
    nombre: 'Desarrollo de Apps Móviles',
    descripcion: 'Desarrollo de aplicaciones móviles nativas para iOS y Android, o aplicaciones híbridas con React Native o Flutter.',
    precio: 2000.00
  },
  {
    nombre: 'Consultoría en DevOps',
    descripcion: 'Configuración de pipelines CI/CD, contenedores Docker, orquestación con Kubernetes y automatización de despliegues.',
    precio: 800.00
  },
  {
    nombre: 'Optimización de Base de Datos',
    descripcion: 'Análisis y optimización de consultas SQL, indexación, particionamiento y mejoras de rendimiento en bases de datos.',
    precio: 600.00
  },
  {
    nombre: 'Desarrollo de E-commerce',
    descripcion: 'Desarrollo de tiendas online completas con carrito de compras, pasarelas de pago, gestión de inventario y panel administrativo.',
    precio: 3000.00
  },
  {
    nombre: 'Migración a la Nube',
    descripcion: 'Migración de aplicaciones y datos a plataformas en la nube como AWS, Azure o Google Cloud. Incluye arquitectura y optimización.',
    precio: 1800.00
  },
  {
    nombre: 'Desarrollo de APIs GraphQL',
    descripcion: 'Desarrollo de APIs GraphQL escalables y eficientes, incluyendo subscripciones en tiempo real y optimización de consultas.',
    precio: 1000.00
  },
  {
    nombre: 'Auditoría de Seguridad Web',
    descripcion: 'Evaluación integral de seguridad en aplicaciones web, identificación de vulnerabilidades y recomendaciones de mejoras.',
    precio: 900.00
  },
  {
    nombre: 'Desarrollo de Microservicios',
    descripcion: 'Arquitectura y desarrollo de sistemas basados en microservicios, incluyendo comunicación entre servicios y gestión de datos.',
    precio: 2200.00
  },
  {
    nombre: 'Integración de Sistemas',
    descripcion: 'Integración de diferentes sistemas empresariales mediante APIs, webhooks y middleware. Sincronización de datos en tiempo real.',
    precio: 1400.00
  },
  {
    nombre: 'Desarrollo de Dashboards',
    descripcion: 'Creación de paneles de control interactivos y reportes en tiempo real con visualizaciones de datos avanzadas.',
    precio: 750.00
  },
  {
    nombre: 'Automatización de Procesos',
    descripcion: 'Desarrollo de scripts y herramientas para automatizar procesos empresariales, reduciendo tiempos y errores manuales.',
    precio: 650.00
  },
  {
    nombre: 'Desarrollo de Chatbots',
    descripcion: 'Creación de chatbots inteligentes para atención al cliente, integrados con IA y procesamiento de lenguaje natural.',
    precio: 1100.00
  }
]

async function crearServiciosSemilla () {
  try {
    console.log('🔄 Conectando a la base de datos...')

    // Verificar conexión con timeout
    const connectionTimeout = setTimeout(() => {
      console.error('❌ Timeout: No se pudo conectar a la base de datos en 10 segundos')
      console.log('💡 Verifica que MySQL esté ejecutándose y la configuración sea correcta')
      process.exit(1)
    }, 10000)

    await sequelize.authenticate()
    clearTimeout(connectionTimeout)
    console.log('✅ Conexión establecida')

    console.log('🔄 Sincronizando modelos...')
    await sequelize.sync({ force: false })
    console.log('✅ Modelos sincronizados')

    // Verificar si ya existen servicios
    const serviciosExistentes = await Service.count()
    if (serviciosExistentes > 0) {
      console.log(`⚠️  Ya existen ${serviciosExistentes} servicios en la base de datos`)
      console.log('💡 Si deseas regenerar los servicios, elimina los existentes primero')

      const respuesta = await new Promise((resolve) => {
        const readline = require('readline').createInterface({
          input: process.stdin,
          output: process.stdout
        })
        readline.question('¿Deseas continuar y agregar más servicios? (s/N): ', (answer) => {
          readline.close()
          resolve(answer.toLowerCase() === 's' || answer.toLowerCase() === 'si')
        })
      })

      if (!respuesta) {
        console.log('❌ Operación cancelada')
        return
      }
    }

    // Obtener usuarios disponibles (excluyendo clientes para asignar servicios a admins/superadmins)
    const usuarios = await User.findAll({
      where: {
        activo: true,
        rol: ['admin', 'superadmin']
      }
    })

    if (usuarios.length === 0) {
      console.log('❌ No se encontraron usuarios admin o superadmin activos')
      console.log('💡 Ejecuta primero el script createSuperAdmin.js o crea usuarios admin')
      return
    }

    console.log(`📋 Encontrados ${usuarios.length} usuarios disponibles para asignar servicios`)
    console.log('🔄 Creando servicios semilla...')

    const serviciosCreados = []

    for (let i = 0; i < serviciosData.length; i++) {
      const servicioData = serviciosData[i]
      // Asignar usuario de forma circular
      const usuarioAsignado = usuarios[i % usuarios.length]

      const servicio = await Service.create({
        nombre: servicioData.nombre,
        descripcion: servicioData.descripcion,
        precio: servicioData.precio,
        usuarioId: usuarioAsignado.id
      })

      serviciosCreados.push({
        id: servicio.id,
        nombre: servicio.nombre,
        precio: servicio.precio,
        usuario: usuarioAsignado.nombre
      })

      console.log(`✅ Creado: ${servicio.nombre} - $${servicio.precio} (${usuarioAsignado.nombre})`)
    }

    console.log('\n🎉 ¡Servicios semilla creados exitosamente!')
    console.log(`📊 Total de servicios creados: ${serviciosCreados.length}`)
    console.log('\n📋 Resumen de servicios creados:')
    console.log('━'.repeat(80))

    serviciosCreados.forEach((servicio, index) => {
      console.log(`${(index + 1).toString().padStart(2, '0')}. ${servicio.nombre}`)
      console.log(`    💰 Precio: $${servicio.precio}`)
      console.log(`    👤 Asignado a: ${servicio.usuario}`)
      console.log(`    🆔 ID: ${servicio.id}`)
      console.log('')
    })

    console.log('✨ Los servicios están listos para ser utilizados en la aplicación')
  } catch (error) {
    console.error('❌ Error al crear servicios semilla:', error.message)

    // Manejo específico de diferentes tipos de errores
    if (error.name === 'SequelizeConnectionError') {
      console.error('🔌 Error de conexión a la base de datos:')
      console.error(`   - ${error.message}`)
      console.log('\n💡 Soluciones posibles:')
      console.log('   1. Verifica que MySQL esté ejecutándose')
      console.log('   2. Confirma las credenciales en src/config/db.js')
      console.log('   3. Asegúrate de que la base de datos "tecmiapp" exista')
      console.log('   4. Verifica el puerto (3306) y host (localhost)')
    } else if (error.name === 'SequelizeValidationError') {
      console.error('📝 Errores de validación:')
      error.errors.forEach(err => {
        console.error(`   - ${err.path}: ${err.message}`)
      })
    } else if (error.name === 'SequelizeForeignKeyConstraintError') {
      console.error('🔗 Error de clave foránea: Verifica que existan usuarios válidos')
      console.log('💡 Ejecuta primero: node scripts/createSuperAdmin.js')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Conexión rechazada: MySQL no está ejecutándose')
      console.log('💡 Inicia MySQL y vuelve a intentar')
    } else {
      console.error('❓ Error desconocido:', error)
    }
  } finally {
    await sequelize.close()
    console.log('🔌 Conexión cerrada')
  }
}

// Función para limpiar servicios (útil para desarrollo)
async function limpiarServicios () {
  try {
    console.log('🔄 Conectando a la base de datos...')
    await sequelize.authenticate()

    console.log('🗑️  Eliminando todos los servicios...')
    const serviciosEliminados = await Service.destroy({
      where: {},
      truncate: true
    })

    console.log(`✅ ${serviciosEliminados} servicios eliminados`)
  } catch (error) {
    console.error('❌ Error al limpiar servicios:', error)
  } finally {
    await sequelize.close()
  }
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2)

if (args.includes('--clean')) {
  console.log('🧹 Modo limpieza activado')
  limpiarServicios()
} else if (args.includes('--help')) {
  console.log('📖 Script semilla para servicios')
  console.log('')
  console.log('Uso:')
  console.log('  node scripts/seedServices.js        # Crear servicios semilla')
  console.log('  node scripts/seedServices.js --clean # Limpiar todos los servicios')
  console.log('  node scripts/seedServices.js --help  # Mostrar esta ayuda')
  console.log('')
  console.log('Nota: Asegúrate de tener usuarios admin o superadmin creados antes de ejecutar este script')
} else {
  crearServiciosSemilla()
}

module.exports = { crearServiciosSemilla, limpiarServicios }
