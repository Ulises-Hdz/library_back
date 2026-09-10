# Library Back API

API Backend para el sistema de biblioteca desarrollada con **NestJS** y **MongoDB (Mongoose)**.

---

## 📋 Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 20 o superior recomendada)
- [Docker](https://www.docker.com/) y [Docker Compose](https://docs.docker.com/compose/)
- npm / yarn / pnpm

---

## ⚙️ Configuración Inicial

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd library
   ```

2. **Configurar las variables de entorno:**
   Copia el archivo de plantilla `.env.template` a `.env`:
   ```bash
   cp .env.template .env
   ```

   Variables contenidas en `.env`:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/database
   ```

---

## 🚀 Cómo Levantar la API

Tienes dos alternativas para ejecutar el proyecto según tus necesidades de desarrollo:

### Opción 1: Con Docker Compose (Recomendada)
Esta opción levanta automáticamente tanto la **base de datos (MongoDB)** como el **contenedor de la API** en modo desarrollo con recarga en caliente (*hot-reload*).

1. **Iniciar los contenedores:**
   ```bash
   docker compose -f dev/docker-compose.yml up -d
   ```

2. **Ver los logs en tiempo real:**
   ```bash
   docker logs -f library
   ```

3. **Reconstruir la imagen (necesario si instalas nuevos paquetes npm):**
   ```bash
   docker compose -f dev/docker-compose.yml up -d --build
   ```

4. **Detener los servicios:**
   ```bash
   docker compose -f dev/docker-compose.yml down
   ```

---

### Opción 2: Ejecución Local (Solo BD en Docker)
Si prefieres correr `npm run start:dev` directamente en tu máquina física y usar Docker solo para MongoDB:

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Levantar únicamente el contenedor de MongoDB:**
   ```bash
   docker compose -f dev/docker-compose.yml up mongo -d
   ```

3. **Verificar tu archivo `.env`:**
   Asegúrate de que `MONGO_URI` apunte a `localhost`:
   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/database
   ```

4. **Iniciar la aplicación en modo desarrollo:**
   ```bash
   npm run start:dev
   ```

---

## 🌐 Endpoints y Rutas

- **URL base:** `http://localhost:3000/api`
- Todas las rutas están bajo el prefijo global `/api`.
- Se cuenta con validación global (`ValidationPipe`) que sanitiza automáticamente payloads entrantes (`whitelist` y transformación automática de tipos).

---

## 🛠️ Scripts Disponibles

```bash
# Desarrollo con recarga automática
npm run start:dev

# Compilar para producción
npm run build

# Iniciar en producción
npm run start:prod

# Ejecutar linter con auto-fix
npm run lint

# Formatear código con Prettier
npm run format

# Ejecutar pruebas unitarias
npm run test
```

---

## 📁 Estructura del Proyecto

```text
src/
├── common/             # Elementos transversales compartidos
│   ├── dto/            # DTOs globales (ej. PaginationDto)
│   ├── filters/        # Filtros de excepciones globales
│   ├── guards/         # Guards de seguridad y autenticación
│   ├── interceptors/   # Interceptores de respuesta y logging
│   └── pipes/          # Pipes personalizados (ej. ParseMongoIdPipe)
├── config/             # Configuración del entorno y validación Joi
│   ├── env.config.ts
│   └── joi.validation.ts
├── modules/            # Módulos de dominio de la biblioteca (books, users, etc.)
├── app.module.ts       # Módulo raíz
└── main.ts             # Punto de entrada y configuración global de la app
```
