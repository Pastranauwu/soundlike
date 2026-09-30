# Etapa 1: build (TypeScript + Vite)
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Etapa 2: imagen final, solo estáticos servidos por nginx (sin herramientas de desarrollo)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
