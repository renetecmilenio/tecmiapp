// tests/unit/user.model.test.js - Tests unitarios para el modelo User
const bcrypt = require('bcryptjs')

// Mock del modelo User para tests unitarios
const mockUser = {
  password: '$2a$10$hashedPasswordExample',
  verificarPassword: async function (password) {
    if (!password) return false // Manejar casos undefined/null/empty
    return await bcrypt.compare(password, this.password)
  },
  toJSON: function () {
    const user = {
      id: 1,
      nombre: 'Test User',
      email: 'test@example.com',
      rol: 'cliente',
      activo: true,
      password: this.password // Esto se eliminará
    }
    delete user.password
    return user
  }
}

describe('Modelo User - Funciones unitarias', () => {
  describe('Método verificarPassword', () => {
    test('debe verificar contraseña correcta', async () => {
      // Crear una contraseña hasheada real para el test
      const passwordOriginal = 'password123'
      const hashedPassword = await bcrypt.hash(passwordOriginal, 10)

      const usuario = {
        ...mockUser,
        password: hashedPassword
      }

      const esValida = await usuario.verificarPassword(passwordOriginal)
      expect(esValida).toBe(true)
    })

    test('debe rechazar contraseña incorrecta', async () => {
      const passwordOriginal = 'password123'
      const passwordIncorrecta = 'wrongpassword'
      const hashedPassword = await bcrypt.hash(passwordOriginal, 10)

      const usuario = {
        ...mockUser,
        password: hashedPassword
      }

      const esValida = await usuario.verificarPassword(passwordIncorrecta)
      expect(esValida).toBe(false)
    })

    test('debe manejar contraseñas vacías', async () => {
      const passwordOriginal = 'password123'
      const hashedPassword = await bcrypt.hash(passwordOriginal, 10)

      const usuario = {
        ...mockUser,
        password: hashedPassword
      }

      const esValida = await usuario.verificarPassword('')
      expect(esValida).toBe(false)
    })

    test('debe manejar contraseñas undefined', async () => {
      const passwordOriginal = 'password123'
      const hashedPassword = await bcrypt.hash(passwordOriginal, 10)

      const usuario = {
        ...mockUser,
        password: hashedPassword
      }

      const esValida = await usuario.verificarPassword(undefined)
      expect(esValida).toBe(false)
    })
  })

  describe('Método toJSON', () => {
    test('debe excluir password de la respuesta JSON', () => {
      const datosUsuario = mockUser.toJSON()

      expect(datosUsuario).toHaveProperty('id')
      expect(datosUsuario).toHaveProperty('nombre')
      expect(datosUsuario).toHaveProperty('email')
      expect(datosUsuario).toHaveProperty('rol')
      expect(datosUsuario).toHaveProperty('activo')
      expect(datosUsuario).not.toHaveProperty('password')
    })

    test('debe mantener todos los demás campos', () => {
      const datosUsuario = mockUser.toJSON()

      expect(datosUsuario.id).toBe(1)
      expect(datosUsuario.nombre).toBe('Test User')
      expect(datosUsuario.email).toBe('test@example.com')
      expect(datosUsuario.rol).toBe('cliente')
      expect(datosUsuario.activo).toBe(true)
    })
  })

  describe('Validaciones de hash de contraseñas', () => {
    test('debe generar hash diferente cada vez', async () => {
      const password = 'password123'

      const hash1 = await bcrypt.hash(password, 10)
      const hash2 = await bcrypt.hash(password, 10)

      expect(hash1).not.toBe(hash2)
      expect(hash1).not.toBe(password)
      expect(hash2).not.toBe(password)

      // Pero ambos hashes deben verificar la misma contraseña
      const valida1 = await bcrypt.compare(password, hash1)
      const valida2 = await bcrypt.compare(password, hash2)

      expect(valida1).toBe(true)
      expect(valida2).toBe(true)
    })

    test('debe crear hash con longitud mínima esperada', async () => {
      const password = 'test'
      const hash = await bcrypt.hash(password, 10)

      expect(hash.length).toBeGreaterThan(50) // Los hashes bcrypt son largos
      expect(hash).toMatch(/^\$2[ab]\$/) // Formato bcrypt
    })
  })
})
