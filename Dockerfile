# Dockerfile para TecmiApp
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3002

# Retrasa el inicio para esperar a MySQL
CMD ["sh", "-c", "sleep 10 && npm start"]
