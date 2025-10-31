const express = require('express') // CJS
const { body, validationResult } = require('express-validator')
const router = express.Router()
const { registro, login, crearUsuario } = require('../controllers/auth.controller')
const { verificarToken, soloSuperadmin } = require('../middlewares/auth.middleware')

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    })
  }
  next()
}

// Validaciones para registro
const registroValidation = [
  body('nombre')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
  body('telefono')
    .optional()
    .isMobilePhone('es-MX')
    .withMessage('Debe proporcionar un número de teléfono válido'),
  handleValidationErrors
]

// Validaciones para login
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 2, max: 6 })
    .withMessage('El password debe tener entre 2 y 6 caracteres')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  handleValidationErrors
]

// Validaciones para crear usuario (admin)
const crearUsuarioValidation = [
  body('nombre')
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('El nombre solo puede contener letras y espacios'),
  body('email')
    .isEmail()
    .withMessage('Debe proporcionar un email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .isIn(['cliente', 'administrador', 'superadmin'])
    .withMessage('El rol debe ser cliente, administrador o superadmin'),
  body('telefono')
    .optional()
    .isMobilePhone('es-MX')
    .withMessage('Debe proporcionar un número de teléfono válido'),
  handleValidationErrors
]

// Rutas públicas
router.post('/registro', registroValidation, registro)
router.post('/login', loginValidation, login)

// Rutas protegidas
router.post('/crear-usuario', verificarToken, soloSuperadmin, crearUsuarioValidation, crearUsuario)

module.exports = router
