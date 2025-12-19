# 🚀 Guía de Inicio Rápido

## 1️⃣ Levantar Infraestructura

```bash
# Iniciar RabbitMQ, PostgreSQL y Redis
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker-compose ps
```

**Espera 10-15 segundos** para que los servicios estén completamente inicializados.

## 2️⃣ Ejecutar Microservicios

Abre **3 terminales diferentes** en la raíz del proyecto:

### Terminal 1 - API Gateway
```bash
npm run start:gateway
```
Espera a ver: `🚀 API Gateway running on http://localhost:3000`

### Terminal 2 - Microservicio Médico
```bash
npm run start:medico
```
Espera a ver: `🩺 Microservicio Médico escuchando en RabbitMQ`

### Terminal 3 - Microservicio Receta
```bash
npm run start:receta
```
Espera a ver: `💊 Microservicio Receta escuchando en RabbitMQ`

## 3️⃣ Probar el Sistema

### Opción A: Con Postman
1. Importa `postman_collection.json`
2. Ejecuta "Crear Médico"
3. Ejecuta "Crear Receta (Validada)"

### Opción B: Con cURL

**1. Crear Médico:**
```bash
curl -X POST http://localhost:3000/api/medicos \
  -H "Content-Type: application/json" \
  -d "{\"id_medico\":\"MED-001\",\"numero_licencia\":\"12345-ABC\",\"institucion\":\"Hospital General\",\"ubicacion_consultorio\":\"Piso 3, Consultorio 15\"}"
```

**2. Crear Receta:**
```bash
curl -X POST http://localhost:3000/api/recetas \
  -H "Content-Type: application/json" \
  -d "{\"id_receta\":\"REC-001\",\"id_medico\":\"MED-001\",\"id_paciente\":\"PAC-001\",\"fecha_emision\":\"2025-12-15T10:30:00.000Z\",\"diagnostico\":\"Gripe común\",\"observaciones\":\"Reposo por 3 días\",\"ubicacion_emision\":\"Consultorio 15\"}"
```

**3. Listar Recetas:**
```bash
curl http://localhost:3000/api/recetas
```

## 4️⃣ Verificar Idempotencia

Ejecuta la misma petición de "Crear Receta" **3 veces seguidas**.

**Resultado esperado:**
- 1ra vez: Crea la receta, estado VALIDADA
- 2da vez: Retorna "Ya existe una receta con este ID"
- 3ra vez: Ídem

**Logs del servicio Receta:**
```
🔑 Creando receta con Idempotency Key: abc123
📝 Receta REC-001 creada con estado PENDIENTE
📤 Enviando solicitud de validación...
✅ Receta REC-001 VALIDADA correctamente
```

## 5️⃣ Monitorear el Sistema

### RabbitMQ Management UI
- URL: http://localhost:15672
- Usuario: `guest`
- Password: `guest`
- Ve a "Queues" para ver `medico_queue` y `receta_queue`

### Redis CLI
```bash
# Conectar a Redis
docker exec -it medical_redis redis-cli

# Ver claves de idempotencia
KEYS idempotency:*

# Ver contenido
GET idempotency:create_receta_REC-001
```

### Adminer (Base de Datos)
- URL: http://localhost:8080
- Sistema: PostgreSQL
- Servidor: `postgres_medico`
- Usuario: `postgres`
- Password: `postgres123`
- Base de datos: `medico_db`

## 6️⃣ Detener Todo

```bash
# Detener microservicios (Ctrl+C en cada terminal)

# Detener infraestructura
docker-compose down

# Detener y borrar datos (CUIDADO)
docker-compose down -v
```

## 🎯 Pruebas de Resiliencia

### Prueba 1: Mensaje Duplicado
Envía la misma receta 3 veces. Verifica en Redis que se detecta el duplicado.

### Prueba 2: Médico Inexistente
Crea receta con `"id_medico": "MED-999"`. Debe rechazarse.

### Prueba 3: Caída del Servicio
1. Detén el servicio de recetas (Ctrl+C)
2. Envía petición POST a `/api/recetas`
3. Reinicia el servicio
4. El mensaje se procesa automáticamente

## 📚 Documentación Completa

Ver [README.md](README.md) para documentación detallada.

## ⚠️ Problemas Comunes

**Error: "Cannot connect to RabbitMQ"**
```bash
docker-compose restart rabbitmq
```

**Error: "Cannot connect to PostgreSQL"**
```bash
docker-compose restart postgres_medico postgres_receta
```

**Error: "Cannot connect to Redis"**
```bash
docker-compose restart redis
```

**Error de compilación TypeScript**
```bash
npm run build
```

## 🎓 Conceptos Clave Implementados

✅ **Monorepo NestJS** con múltiples aplicaciones
✅ **Comunicación asíncrona** vía RabbitMQ (sin HTTP entre microservicios)
✅ **Bases de datos independientes** por microservicio
✅ **Patrón Idempotent Consumer** con Redis
✅ **ACK manual** para garantizar procesamiento
✅ **Locks distribuidos** para evitar race conditions
✅ **At-least-once delivery** con deduplicación
