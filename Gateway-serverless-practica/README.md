# Sistema de Microservicios - Médicos y Recetas 🏥

Sistema de microservicios implementado con **NestJS** que gestiona médicos y recetas médicas, utilizando arquitectura de microservicios con comunicación asíncrona vía **RabbitMQ** y patrón **Idempotent Consumer** con **Redis**.

## 📋 Tabla de Contenidos

- [Arquitectura del Sistema](#arquitectura-del-sistema)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Instalación y Configuración](#instalación-y-configuración)
- [Ejecución del Proyecto](#ejecución-del-proyecto)
- [Pruebas de la API](#pruebas-de-la-api)
- [Patrón Idempotent Consumer](#patrón-idempotent-consumer)
- [Pruebas de Resiliencia](#pruebas-de-resiliencia)

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **API Gateway** (Puerto 3000)
   - Punto de entrada REST para clientes
   - Enruta peticiones HTTP a microservicios vía RabbitMQ
   - No contiene lógica de negocio

2. **Microservicio Médico** (Entidad Maestra)
   - Base de datos independiente (PostgreSQL - Puerto 5432)
   - Gestiona CRUD de médicos
   - Valida médicos para emisión de recetas
   - Comunica vía RabbitMQ

3. **Microservicio Receta** (Entidad Transaccional)
   - Base de datos independiente (PostgreSQL - Puerto 5433)
   - Gestiona CRUD de recetas
   - **Implementa patrón Idempotent Consumer con Redis**
   - **Comunicación OBLIGATORIA con Médico vía RabbitMQ** (sin HTTP directo)

4. **RabbitMQ** (Puertos 5672/15672)
   - Message Broker para comunicación asíncrona
   - Garantiza entrega "At-least-once"

5. **Redis** (Puerto 6379)
   - Control de idempotencia
   - Prevención de procesamiento duplicado de mensajes

### Diagrama de Flujo

```
Cliente (Postman/Frontend)
        ↓ HTTP REST
   API Gateway (3000)
        ↓ RabbitMQ
    ┌───────────────────┐
    ↓                   ↓
Servicio Médico    Servicio Receta
    ↓                   ↓
PostgreSQL          PostgreSQL
(5432)              (5433)
                        ↓
                    Redis (Idempotencia)
```

### Flujo de Creación de Receta (Con Idempotencia)

1. Cliente envía POST a `/api/recetas`
2. Gateway reenvía mensaje a `receta_queue`
3. Servicio Receta recibe mensaje
4. **Verifica en Redis si ya fue procesado** (Idempotencia)
5. Si no procesado, adquiere lock distribuido
6. Crea receta con estado PENDIENTE
7. Envía evento `medico.validar` a `medico_queue`
8. Servicio Médico valida y responde
9. Actualiza estado de receta (VALIDADA/RECHAZADA)
10. **Guarda resultado en Redis con TTL de 24h**
11. Envía ACK a RabbitMQ
12. Si mensaje duplicado llega, retorna resultado de Redis

---

## 🛠️ Tecnologías Utilizadas

- **NestJS** 11.x - Framework backend
- **TypeScript** 5.x
- **TypeORM** 0.3.x - ORM para PostgreSQL
- **RabbitMQ** - Message Broker
- **PostgreSQL** 16 - Bases de datos
- **Redis** 7 - Cache y control de idempotencia
- **Docker & Docker Compose** - Contenerización
- **class-validator** - Validación de DTOs
- **ioredis** - Cliente Redis

---

## 📁 Estructura del Proyecto

```
gateway_correccion/
├── apps/
│   ├── gateway/                    # API Gateway REST
│   ├── medico-service/             # Microservicio Médico
│   └── receta-service/             # Microservicio Receta
├── libs/
│   └── common/                      # Módulo compartido
├── docker-compose.yml               # Infraestructura Docker
├── .env                             # Variables de entorno
└── README.md
```

---

## ⚙️ Instalación y Configuración

### Prerrequisitos

- Node.js >= 18.x
- npm >= 9.x
- Docker & Docker Compose

### Paso 1: Instalar dependencias

```bash
npm install
```

### Paso 2: Levantar la infraestructura con Docker

```bash
docker-compose up -d
```

### Servicios disponibles:

- **RabbitMQ Management**: http://localhost:15672 (usuario: `guest`, password: `guest`)
- **PostgreSQL Médico**: localhost:5432
- **PostgreSQL Receta**: localhost:5433
- **Redis**: localhost:6379
- **Adminer** (DB UI): http://localhost:8080

---

## 🚀 Ejecución del Proyecto

Abre **3 terminales diferentes** y ejecuta:

**Terminal 1 - API Gateway:**
```bash
npm run start:gateway
```

**Terminal 2 - Microservicio Médico:**
```bash
npm run start:medico
```

**Terminal 3 - Microservicio Receta:**
```bash
npm run start:receta
```

---

## 🧪 Pruebas de la API

### Endpoints Disponibles

#### Médicos

**Crear Médico**
```http
POST http://localhost:3000/api/medicos
Content-Type: application/json

{
  "id_medico": "MED-001",
  "numero_licencia": "12345-ABC",
  "institucion": "Hospital General",
  "ubicacion_consultorio": "Piso 3, Consultorio 15"
}
```

**Listar Médicos**
```http
GET http://localhost:3000/api/medicos
```

#### Recetas

**Crear Receta (Con validación idempotente)**
```http
POST http://localhost:3000/api/recetas
Content-Type: application/json

{
  "id_receta": "REC-001",
  "id_medico": "MED-001",
  "id_paciente": "PAC-001",
  "fecha_emision": "2025-12-15T10:30:00.000Z",
  "diagnostico": "Gripe común",
  "observaciones": "Reposo por 3 días",
  "ubicacion_emision": "Consultorio 15"
}
```

**Listar Recetas**
```http
GET http://localhost:3000/api/recetas
```

---

## 🔒 Patrón Idempotent Consumer

### ¿Qué problema resuelve?

RabbitMQ garantiza **entrega "At-least-once"**, lo que significa que un mensaje puede ser entregado múltiples veces. El patrón Idempotent Consumer con Redis garantiza que aunque un mensaje llegue múltiples veces, **el efecto en la base de datos ocurre exactamente una vez**.

### Implementación

1. **Generación de clave de idempotencia**
2. **Verificación en Redis** antes de procesar
3. **Lock distribuido** para evitar race conditions
4. **Almacenamiento del resultado** con TTL de 24 horas
5. **Retorno de resultado cacheado** si el mensaje es duplicado

### Verificación en Redis

```bash
docker exec -it medical_redis redis-cli
KEYS idempotency:*
GET idempotency:create_receta_REC-001
```

---

## 🧨 Pruebas de Resiliencia

### Prueba 1: Mensaje Duplicado

Envía la misma receta 3 veces:
- Primera vez: Procesa y guarda
- Segunda/Tercera: Detecta duplicado y retorna resultado de Redis

### Prueba 2: Caída del Servicio

Detén el servicio de recetas, envía petición, reinicia el servicio.
- El mensaje se procesa automáticamente desde la cola de RabbitMQ

### Prueba 3: Médico Inexistente

Crea receta con `id_medico` que no existe:
- Estado: RECHAZADA
- Mensaje de error claro

---

## 🎯 Restricciones Implementadas

✅ **No existe comunicación HTTP directa** entre Microservicio Médico y Receta  
✅ **Toda comunicación es asíncrona** vía RabbitMQ  
✅ **Bases de datos independientes**  
✅ **Patrón Idempotent Consumer** implementado con Redis  
✅ **Garantía At-least-once** con prevención de duplicados  

---

## 🛑 Detener el Proyecto

```bash
# Detener microservicios (Ctrl+C en cada terminal)

# Detener infraestructura Docker
docker-compose down
```

---

## 👨‍💻 Autor

Proyecto de práctica - Servidores Web  
Universidad Laica Eloy Alfaro de Manabí
