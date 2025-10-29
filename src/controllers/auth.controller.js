const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Clave secreta para JWT (en producción debería estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_por_defecto'

// Generar token JWT
const generarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      rol: usuario.rol
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

// Registro de usuarios
const registro = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body

    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: true,
        mensaje: 'Nombre, email y contraseña son obligatorios'
      })
    }

    // Verificar si el email ya existe
    const usuarioExistente = await User.findOne({ where: { email } })
    if (usuarioExistente) {
      return res.status(400).json({
        error: true,
        mensaje: 'El email ya está registrado'
      })
    }

    // Solo superadmin puede crear admins
    const rolAsignado = rol === 'admin' || rol === 'superadmin' ? 'cliente' : (rol || 'cliente')

    // Crear usuario
    const nuevoUsuario = await User.create({
      nombre,
      email,
      password,
      rol: rolAsignado
    })

    // Generar token
    const token = generarToken(nuevoUsuario)

    res.status(201).json({
      error: false,
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario,
      token
    })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({
      error: true,
      mensaje: 'Error interno del servidor',
      detalles: error.message
    })
  }
}

// Login de usuarios
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        mensaje: 'Email y contraseña son obligatorios'
      })
    }

    // Buscar usuario por email
    const usuario = await User.findOne({ where: { email, activo: true } })
    if (!usuario) {
      return res.status(401).json({
        error: true,
        mensaje: 'Credenciales inválidas'
      })
    }

    // Verificar contraseña
    const passwordValida = await usuario.verificarPassword(password)
    if (!passwordValida) {
      return res.status(401).json({
        error: true,
        mensaje: 'Credenciales inválidas'
      })
    }

    // Generar token
    const token = generarToken(usuario)

    res.json({
      error: false,
      mensaje: 'Login exitoso',
      usuario,
      token
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({
      error: true,
      mensaje: 'Error interno del servidor',
      detalles: error.message
    })
  }
}

// Crear usuario (solo para superadmin)
const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body
    const usuarioActual = req.usuario // Viene del middleware de autenticación

    // Solo superadmin puede crear usuarios
    if (usuarioActual.rol !== 'superadmin') {
      return res.status(403).json({
        error: true,
        mensaje: 'No tienes permisos para crear usuarios'
      })
    }

    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: true,
        mensaje: 'Nombre, email y contraseña son obligatorios'
      })
    }

    // Verificar si el email ya existe
    const usuarioExistente = await User.findOne({ where: { email } })
    if (usuarioExistente) {
      return res.status(400).json({
        error: true,
        mensaje: 'El email ya está registrado'
      })
    }

    // Crear usuario con el rol especificado
    const nuevoUsuario = await User.create({
      nombre,
      email,
      password,
      rol: rol || 'cliente'
    })

    res.status(201).json({
      error: false,
      mensaje: `Usuario ${rol || 'cliente'} creado exitosamente`,
      usuario: nuevoUsuario
    })
  } catch (error) {
    console.error('Error al crear usuario:', error)
    res.status(500).json({
      error: true,
      mensaje: 'Error interno del servidor',
      detalles: error.message
    })
  }
}

module.exports = {
  registro,
  login,
  crearUsuario,
  generarToken, // Exportamos esta función para poder probarla
  JWT_SECRET
}
