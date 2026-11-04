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
   JWT_SECRET=una_clave_secreta_larga_y_segura
   JWT_EXPIRES_IN=2h
   CORS_ORIGIN=http://localhost:4200,http://localhost:4210
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
   JWT_SECRET=una_clave_secreta_larga_y_segura
   JWT_EXPIRES_IN=2h
   CORS_ORIGIN=http://localhost:4200,http://localhost:4210
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
- **Autenticación y roles:** JWT Bearer token (`Authorization: Bearer <token>`). Los roles disponibles son `STUDENT` y `ADMIN`; el registro público (`POST /auth/register`) siempre crea un `STUDENT`, mientras que un `ADMIN` solo puede ser creado por otro `ADMIN` autenticado (`POST /auth/admin`).
- **Seguridad:** cabeceras HTTP reforzadas con `helmet` y CORS restringido a los orígenes definidos en `CORS_ORIGIN`.
- **Rate limiting:** 300 solicitudes/minuto por cliente de forma global; `POST /auth/register` y `POST /auth/login` están limitados a 10 solicitudes/minuto. Al exceder el límite se responde `429 Too Many Requests`.
- **Documentación interactiva:** disponible en `http://localhost:3000/docs` (Redoc), generada a partir de [doc.yml](./doc.yml).

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
│   ├── decorators/     # Decoradores personalizados (ej. @Roles)
│   ├── dto/            # DTOs globales (ej. PaginationDto)
│   ├── filters/        # Filtros de excepciones globales
│   ├── guards/         # Guards de seguridad y autenticación (JWT, roles)
│   ├── interceptors/   # Interceptores de respuesta y logging
│   ├── interfaces/     # Tipos compartidos (ej. AuthenticatedRequest)
│   ├── middlewares/    # Middlewares (ej. documentación con Redoc)
│   ├── pipes/          # Pipes personalizados (ej. ParseMongoIdPipe)
│   └── utils/          # Utilidades compartidas (ej. manejo de errores de Mongo)
├── config/             # Configuración del entorno y validación Joi
│   ├── env.config.ts
│   └── joi.validation.ts
├── models/             # Esquemas de Mongoose (Book, User, Loan, PhysicalItem, DigitalResource)
├── modules/             # Módulos de dominio de la biblioteca
│   ├── auth/            # Registro, login, perfil y gestión de usuarios (JWT)
│   ├── book/            # CRUD de libros e inventario
│   ├── loans/           # Préstamos y devoluciones
│   ├── physical-item/   # Copias físicas y su disponibilidad
│   └── resource-digital/ # Recursos digitales (PDF/EPUB)
├── app.module.ts       # Módulo raíz
└── main.ts             # Punto de entrada y configuración global de la app
```
