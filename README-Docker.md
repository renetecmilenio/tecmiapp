# TecmiApp - Docker

## Ejecutar con Docker

1. **Construir y ejecutar:**
   ```bash
   docker-compose up --build
   ```

2. **Detener:**
   ```bash
   docker-compose down
   ```

3. **Ver logs:**
   ```bash
   docker-compose logs app
   ```

## Puertos
- App: http://localhost:3002
- MySQL: localhost:3307

## Crear superadmin
Una vez que la app esté corriendo:
```bash
docker-compose exec app npm run create-superadmin
```