## Sistema de Reserva de Canchas Deportivas

# Sistema web basado en microservicios para la gestión y reserva de canchas deportivas. Desarrollado con Go, React, MongoDB, MySQL, RabbitMQ y Solr.

📋 Tabla de Contenidos

Descripción
Arquitectura
Tecnologías
Requisitos Previos
Instalación y Ejecución
Estructura del Proyecto
APIs y Endpoints
Ejemplos de Uso
Testing
Troubleshooting


# Descripción
Sistema que permite a los usuarios:

- Registrarse y hacer login con autenticación JWT
- Buscar canchas deportivas por deporte, ubicación y precio
- Reservar canchas en fechas y horarios específicos
- Ver reservas activas

El sistema está compuesto por 3 microservicios backend independientes que se comunican entre sí mediante HTTP y RabbitMQ, y un frontend React.

# Arquitectura
┌─────────────┐
│   Frontend  │ (React)
│   :3000     │
└──────┬──────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
       ▼              ▼              ▼              ▼
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ users-api│   │fields-api│   │search-api│   │ RabbitMQ │
│   :8080  │◄──┤   :8081  │──►│   :8082  │◄──┤  :5672   │
└────┬─────┘   └────┬─────┘   └────┬─────┘   └──────────┘
     │              │              │
     ▼              ▼              ▼
┌─────────┐   ┌──────────┐   ┌─────────┐
│  MySQL  │   │ MongoDB  │   │  Solr   │
│  :3307  │   │  :27017  │   │  :8983  │
└─────────┘   └──────────┘   └────┬────┘
                                   │
                              ┌────▼────┐
                              │Memcached│
                              │ :11211  │
                              └─────────┘

# Microservicios
users-api (Puerto 8080)

Gestión de usuarios (registro, login)
Autenticación con JWT
Almacenamiento en MySQL con GORM
Hashing de contraseñas con bcrypt

fields-api (Puerto 8081)

CRUD de canchas deportivas
Creación de reservas (bookings)
Validación de usuarios vía HTTP
Publicación de eventos a RabbitMQ
Almacenamiento en MongoDB

search-api (Puerto 8082)

Búsqueda paginada y filtrada
Indexación con Solr
Consumo de eventos de RabbitMQ
Doble caché (CCache local + Memcached distribuida)


# Tecnologías
Backend

Lenguaje: Go 1.21
Framework Web: Gin
Bases de Datos:

MySQL 8.0 (usuarios)
MongoDB 6.0 (canchas y reservas)


Motor de Búsqueda: Apache Solr 9.3
Mensajería: RabbitMQ 3
Caché: CCache (local) + Memcached (distribuida)
ORM: GORM (para MySQL)
Autenticación: JWT (JSON Web Tokens)

Frontend

Framework: React
HTTP Client: Fetch API / Axios

# Infraestructura

Contenedores: Docker
Orquestación: Docker Compose


# Instalación y Ejecución
Clonar el repositorio
bashgit clone https://github.com/catalinarubies/Proyecto-ASII-2025.git
cd proyecto-arquitectura

Levantar todos los servicios
bashdocker-compose up -d

Este comando:
Descarga las imágenes necesarias
Construye los microservicios
Levanta todos los contenedores
Configura las redes y volúmenes

Verificar que todo está corriendo
bashdocker-compose ps
Que todos los servicios esten en estado "Up":
NAME          STATUS          PORTS
frontend      Up              0.0.0.0:3000->3000/tcp
users-api     Up              0.0.0.0:8080->8080/tcp
fields-api    Up              0.0.0.0:8081->8081/tcp
search-api    Up              0.0.0.0:8082->8082/tcp
mysql         Up              0.0.0.0:3307->3306/tcp
mongodb       Up              0.0.0.0:27017->27017/tcp
rabbitmq      Up              0.0.0.0:5672->5672/tcp, 0.0.0.0:15672->15672/tcp
solr          Up              0.0.0.0:8983->8983/tcp
memcached     Up              0.0.0.0:11211->11211/tcp

Acceder a la aplicación

Frontend: http://localhost:3000
RabbitMQ Management: http://localhost:15672 (guest/guest)
Solr Admin: http://localhost:8983


# APIs y Endpoints

users-api (http://localhost:8080)

Método | Endpoint | Descripción | Body 
POST | /users | Crear usuario | {name, email, password}
GET | /users/:id | Obtener usuario | - 
POST | /login | Login | {email, password}
GET | /health | Health check | -

Respuesta de Login:
json{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Juan Perez",
    "email": "juan@test.com"
  }
}

fields-api (http://localhost:8081)

Método | Endpoint | Descripción | Body 
POST | /fields | Crear cancha | {name, sport, location, price_per_hour, owner_id}
GET | /fields/:id | Obtener cancha | -
PUT | /fields/:id | Actualizar cancha | {name?, sport?, ...}
DELETE | /fields/:id | Eliminar cancha | -
POST | /bookings | Crear reserva | {field_id, user_id, date, start_time, end_time}
GET | /bookings/:id | Obtener reserva | -
GET | /bookings/user/:userId | Reservas de usuario | -
GET | /health | Health check | -

Ejemplo de Cancha:
json{
  "id": "674d5e8f9c1234567890abcd",
  "name": "Cancha Fútbol 5",
  "sport": "Fútbol",
  "location": "Centro, Córdoba",
  "price_per_hour": 5000,
  "image": "https://example.com/image.jpg",
  "description": "Cancha con césped sintético",
  "owner_id": 1,
  "available": true
}

search-api (http://localhost:8082)

Método | Endpoint | Descripción | Query Params
GET | /search | Buscar canchas | query, sport, location, min_price, max_price, sort_by, sort_desc, page, size
GET | /health | Health check | -

Ejemplo de búsqueda:
GET /search?query=futbol&location=cordoba&sort_by=price_per_hour&page=1&size=10

Respuesta:
json{
  "fields": [
    {
      "id": "674d5e8f...",
      "name": "Cancha Fútbol 5",
      "sport": "Fútbol",
      "location": "Centro, Córdoba",
      "price_per_hour": 5000,
      "available": true
    }
  ],
  "total_count": 15,
  "page": 1,
  "size": 10,
  "total_pages": 2
}