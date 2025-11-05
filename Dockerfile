# Dockerfile para TecmiApp
FROM node:18-alpine

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 3003

# Comando para iniciar con delay simple
CMD ["sh", "-c", "sleep 5 && npm start"]