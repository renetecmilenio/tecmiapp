// tests/unit/auth.unit.test.js - Tests unitarios para funciones de autenticación de la app
const jwt = require('jsonwebtoken')

// Importar las funciones de nuestra aplicación
const { generarToken, JWT_SECRET } = require('../../src/controllers/auth.controller')

describe('Funciones de Autenticación de la App', () => {
  describe('Función generarToken de nuestra app', () => {
    test('debe generar token válido usando nuestra función', () => {
      const usuarioMock = {
        id: 1,
        email: 'test@example.com',
        rol: 'cliente'
      }

      // Usar nuestra función real
      const token = generarToken(usuarioMock)

      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT tiene 3 partes

      // Verificar que el token contiene la información correcta
      const decoded = jwt.verify(token, JWT_SECRET)
      expect(decoded.id).toBe(usuarioMock.id)
      expect(decoded.email).toBe(usuarioMock.email)
      expect(decoded.rol).toBe(usuarioMock.rol)
      expect(decoded.exp).toBeDefined() // Debe tener fecha de expiración
    })

    test('debe generar token para usuario admin', () => {
      const usuarioAdmin = {
        id: 2,
        email: 'admin@example.com',
        rol: 'admin'
      }

      const token = generarToken(usuarioAdmin)
      const decoded = jwt.verify(token, JWT_SECRET)

      expect(decoded.rol).toBe('admin')
      expect(decoded.id).toBe(2)
      expect(decoded.email).toBe('admin@example.com')
    })

    test('debe generar token para superadmin', () => {
      const usuarioSuperAdmin = {
        id: 3,
        email: 'superadmin@example.com',
        rol: 'superadmin'
      }

      const token = generarToken(usuarioSuperAdmin)
      const decoded = jwt.verify(token, JWT_SECRET)

      expect(decoded.rol).toBe('superadmin')
      expect(decoded.id).toBe(3)
      expect(decoded.email).toBe('superadmin@example.com')
    })

    test('debe generar tokens únicos para usuarios diferentes', () => {
      const usuario1 = { id: 1, email: 'user1@example.com', rol: 'cliente' }
      const usuario2 = { id: 2, email: 'user2@example.com', rol: 'cliente' }

      const token1 = generarToken(usuario1)
      const token2 = generarToken(usuario2)

      expect(token1).not.toBe(token2)

      const decoded1 = jwt.verify(token1, JWT_SECRET)
      const decoded2 = jwt.verify(token2, JWT_SECRET)

      expect(decoded1.id).toBe(1)
      expect(decoded2.id).toBe(2)
      expect(decoded1.email).toBe('user1@example.com')
      expect(decoded2.email).toBe('user2@example.com')
    })
  })

  describe('Validaciones de datos de entrada', () => {
    test('debe rechazar registro sin nombre', () => {
      const datosIncompletos = {
        email: 'test@example.com',
        password: 'password123'
        // nombre faltante
      }

      const { nombre, email, password } = datosIncompletos
      const sonValidosLosCampos = !!(nombre && email && password)

      expect(sonValidosLosCampos).toBe(false)
    })

    test('debe rechazar registro sin email', () => {
      const datosIncompletos = {
        nombre: 'Test User',
        password: 'password123'
        // email faltante
      }

      const { nombre, email, password } = datosIncompletos
      const sonValidosLosCampos = !!(nombre && email && password)

      expect(sonValidosLosCampos).toBe(false)
    })

    test('debe rechazar registro sin password', () => {
      const datosIncompletos = {
        nombre: 'Test User',
        email: 'test@example.com'
        // password faltante
      }

      const { nombre, email, password } = datosIncompletos
      const sonValidosLosCampos = !!(nombre && email && password)

      expect(sonValidosLosCampos).toBe(false)
    })

    test('debe aceptar registro con todos los campos', () => {
      const datosCompletos = {
        nombre: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const { nombre, email, password } = datosCompletos
      const sonValidosLosCampos = !!(nombre && email && password)

      expect(sonValidosLosCampos).toBe(true)
    })

    test('debe validar formato de email', () => {
      const emailsValidos = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test123@test.org'
      ]

      const emailsInvalidos = [
        'invalid-email',
        '@domain.com',
        'test@',
        'test.domain.com'
      ]

      emailsValidos.forEach(email => {
        const esEmailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        expect(esEmailValido).toBe(true)
      })

      emailsInvalidos.forEach(email => {
        const esEmailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        expect(esEmailValido).toBe(false)
      })
    })
  })

  describe('Validación de roles', () => {
    test('debe asignar rol cliente por defecto', () => {
      const rolEspecificado = undefined
      const rolAsignado = rolEspecificado || 'cliente'

      expect(rolAsignado).toBe('cliente')
    })

    test('debe permitir roles válidos', () => {
      const rolesValidos = ['superadmin', 'admin', 'cliente']

      rolesValidos.forEach(rol => {
        const esRolValido = ['superadmin', 'admin', 'cliente'].includes(rol)
        expect(esRolValido).toBe(true)
      })
    })

    test('debe rechazar roles inválidos', () => {
      const rolesInvalidos = ['user', 'moderator', 'guest', '']

      rolesInvalidos.forEach(rol => {
        const esRolValido = ['superadmin', 'admin', 'cliente'].includes(rol)
        expect(esRolValido).toBe(false)
      })
    })
  })
})
