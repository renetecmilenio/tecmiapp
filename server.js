require('dotenv').config()
const express = require('express') // CJS
const path = require('node:path')
const { connectDB } = require('./src/config/db')

const cors = require('cors')

const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

// Importar modelos
require('./src/models/index')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware de seguridad
app.use(helmet({
  contentSecurityPolicy: false, // Deshabilitado para permitir estilos inline
  crossOriginEmbedderPolicy: false // Deshabilitado para compatibilidad
}))

// Rate limiting - límite general (deshabilitado en tests)
const limiter = process.env.NODE_ENV === 'test'
  ? (req, res, next) => next() // No-op en tests
  : rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por IP
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
    standardHeaders: true,
    legacyHeaders: false
  })

// Rate limiting específico para auth (más restrictivo, deshabilitado en tests)
const authLimiter = process.env.NODE_ENV === 'test'
  ? (req, res, next) => next() // No-op en tests
  : rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de login por IP
    message: JSON.stringify({
      success: false,
      message: 'Demasiados intentos de autenticación, intenta de nuevo más tarde.',
      error: 'RATE_LIMIT_EXCEEDED'
    }),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        message: 'Demasiados intentos de autenticación, intenta de nuevo más tarde.',
        error: 'RATE_LIMIT_EXCEEDED'
      })
    }
  })

app.use(limiter)

// Middleware básico
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json({ limit: '10mb' })) // Limitar tamaño de body a 10kb
app.use(express.static(path.join(__dirname, 'public')))

// Configurar rutas
async function configureRoutes () {
  try {
    await connectDB()

    const authRoutes = require('./src/routes/auth.routes.js')
    const { obtenerServicios, crearServicio, actualizarServicio, eliminarServicio } = require('./src/controllers/service.controller')
    const { verificarToken, adminOSuperadmin } = require('./src/middlewares/auth.middleware')

    console.log('🌐 Conectado a la base de datos y modelos sincronizados')

    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'))
    })

    app.get('/login', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'login.html'))
    })

    app.get('/registro', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'registro.html'))
    })

    app.get('/dashboard', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'dashboard.html'))
    })

    // Usar rutas de auth
    app.use('/api/auth/', authLimiter, authRoutes)

    app.get('/api/services/publicos', obtenerServicios)
    app.get('/api/services', obtenerServicios)
    app.post('/api/services', verificarToken, adminOSuperadmin, crearServicio)
    app.put('/api/services/:id', verificarToken, adminOSuperadmin, actualizarServicio)
    app.delete('/api/services/:id', verificarToken, adminOSuperadmin, eliminarServicio)
  } catch (error) {
    console.error('❌ Error al configurar rutas:', error)
  }
}

async function startServer () {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error)
  }
}

// Configurar rutas solo cuando no estamos en test
if (process.env.NODE_ENV !== 'test') {
  configureRoutes()
  startServer()
} else {
  // En tests, solo configurar rutas
  configureRoutes()
}

// Exportar app para tests
module.exports = app
