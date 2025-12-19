# 🛠️ Comandos Útiles - Referencia Rápida

## 🚀 Iniciar el Sistema

### Infraestructura (Docker)
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver estado de contenedores
docker-compose ps

# Ver logs
docker-compose logs -f rabbitmq
docker-compose logs -f redis
docker-compose logs -f postgres_medico
docker-compose logs -f postgres_receta

# Detener servicios
docker-compose stop

# Detener y eliminar
docker-compose down

# Eliminar todo (incluyendo volúmenes)
docker-compose down -v
```

### Microservicios (NestJS)
```bash
# Gateway
npm run start:gateway

# Médico
npm run start:medico

# Receta
npm run start:receta

# Todos en modo desarrollo (watch)
npm run start:gateway  # Terminal 1
npm run start:medico   # Terminal 2
npm run start:receta   # Terminal 3

# Compilar todo
npm run build
```

---

## 🔍 Monitoreo y Debugging

### RabbitMQ
```bash
# Management UI
open http://localhost:15672
# Usuario: guest / Password: guest

# Ver colas desde CLI
docker exec medical_rabbitmq rabbitmqctl list_queues

# Ver conexiones
docker exec medical_rabbitmq rabbitmqctl list_connections

# Ver consumidores
docker exec medical_rabbitmq rabbitmqctl list_consumers
```

### Redis
```bash
# Conectar a Redis CLI
docker exec -it medical_redis redis-cli

# Ver todas las claves
KEYS *

# Ver claves de idempotencia
KEYS idempotency:*

# Ver un valor
GET idempotency:create_receta_REC-001

# Ver TTL de una clave
TTL idempotency:create_receta_REC-001

# Eliminar una clave
DEL idempotency:create_receta_REC-001

# Limpiar todo Redis (CUIDADO)
FLUSHALL

# Salir
exit
```

### PostgreSQL (Médico)
```bash
# Conectar a base de datos
docker exec -it medical_postgres_medico psql -U postgres -d medico_db

# Ver tablas
\dt

# Ver médicos
SELECT * FROM medicos;

# Contar médicos
SELECT COUNT(*) FROM medicos;

# Salir
\q
```

### PostgreSQL (Receta)
```bash
# Conectar a base de datos
docker exec -it medical_postgres_receta psql -U postgres -d receta_db

# Ver tablas
\dt

# Ver recetas
SELECT * FROM recetas;

# Ver recetas por estado
SELECT estado, COUNT(*) FROM recetas GROUP BY estado;

# Ver recetas de un médico
SELECT * FROM recetas WHERE id_medico = 'MED-001';

# Salir
\q
```

### Adminer (UI para bases de datos)
```bash
# Abrir en navegador
open http://localhost:8080

# Conectar a Médico
# Sistema: PostgreSQL
# Servidor: postgres_medico
# Usuario: postgres
# Contraseña: postgres123
# Base: medico_db

# Conectar a Receta
# Sistema: PostgreSQL
# Servidor: postgres_receta
# Usuario: postgres
# Contraseña: postgres123
# Base: receta_db
```

---

## 🧪 Pruebas con cURL

### Médicos
```bash
# Crear médico
curl -X POST http://localhost:3000/api/medicos \
  -H "Content-Type: application/json" \
  -d '{"id_medico":"MED-001","numero_licencia":"12345-ABC","institucion":"Hospital General","ubicacion_consultorio":"Piso 3"}'

# Listar médicos
curl http://localhost:3000/api/medicos

# Obtener médico
curl http://localhost:3000/api/medicos/MED-001

# Actualizar médico
curl -X PUT http://localhost:3000/api/medicos/MED-001 \
  -H "Content-Type: application/json" \
  -d '{"institucion":"Clínica Santa María"}'

# Eliminar médico
curl -X DELETE http://localhost:3000/api/medicos/MED-001
```

### Recetas
```bash
# Crear receta
curl -X POST http://localhost:3000/api/recetas \
  -H "Content-Type: application/json" \
  -d '{"id_receta":"REC-001","id_medico":"MED-001","id_paciente":"PAC-001","fecha_emision":"2025-12-15T10:30:00.000Z","diagnostico":"Gripe común","observaciones":"Reposo 3 días","ubicacion_emision":"Consultorio 15"}'

# Listar recetas
curl http://localhost:3000/api/recetas

# Obtener receta
curl http://localhost:3000/api/recetas/REC-001

# Actualizar receta
curl -X PUT http://localhost:3000/api/recetas/REC-001 \
  -H "Content-Type: application/json" \
  -d '{"observaciones":"Reposo extendido a 5 días"}'

# Eliminar receta
curl -X DELETE http://localhost:3000/api/recetas/REC-001
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to RabbitMQ"
```bash
# Reiniciar RabbitMQ
docker-compose restart rabbitmq

# Ver logs
docker-compose logs rabbitmq

# Verificar que esté corriendo
docker ps | grep rabbitmq
```

### Error: "Cannot connect to PostgreSQL"
```bash
# Reiniciar bases de datos
docker-compose restart postgres_medico postgres_receta

# Ver logs
docker-compose logs postgres_medico
docker-compose logs postgres_receta

# Verificar puertos
netstat -an | findstr 5432
netstat -an | findstr 5433
```

### Error: "Cannot connect to Redis"
```bash
# Reiniciar Redis
docker-compose restart redis

# Probar conexión
docker exec medical_redis redis-cli ping
# Debe responder: PONG
```

### Error de compilación TypeScript
```bash
# Limpiar y recompilar
Remove-Item -Path dist -Recurse -Force
npm run build

# Verificar versiones
node --version
npm --version
```

### Limpiar todo y empezar de cero
```bash
# Detener servicios
docker-compose down -v

# Eliminar node_modules
Remove-Item -Path node_modules -Recurse -Force

# Reinstalar
npm install --legacy-peer-deps

# Levantar infraestructura
docker-compose up -d

# Compilar
npm run build

# Iniciar servicios
npm run start:gateway
npm run start:medico
npm run start:receta
```

---

## 📊 Scripts de Carga (PowerShell)

### Crear múltiples médicos
```powershell
for ($i=1; $i -le 10; $i++) {
  curl -X POST http://localhost:3000/api/medicos `
    -H "Content-Type: application/json" `
    -d "{`"id_medico`":`"MED-00$i`",`"numero_licencia`":`"LIC-$i`",`"institucion`":`"Hospital $i`",`"ubicacion_consultorio`":`"Piso $i`"}"
  Start-Sleep -Seconds 1
}
```

### Crear múltiples recetas
```powershell
for ($i=1; $i -le 10; $i++) {
  curl -X POST http://localhost:3000/api/recetas `
    -H "Content-Type: application/json" `
    -d "{`"id_receta`":`"REC-00$i`",`"id_medico`":`"MED-001`",`"id_paciente`":`"PAC-00$i`",`"fecha_emision`":`"2025-12-15T10:00:00Z`",`"diagnostico`":`"Diagnóstico $i`",`"observaciones`":`"Observación $i`"}"
  Start-Sleep -Seconds 1
}
```

---

## 🔧 Mantenimiento

### Backup de bases de datos
```bash
# Backup Médico
docker exec medical_postgres_medico pg_dump -U postgres medico_db > medico_backup.sql

# Backup Receta
docker exec medical_postgres_receta pg_dump -U postgres receta_db > receta_backup.sql
```

### Restaurar bases de datos
```bash
# Restaurar Médico
cat medico_backup.sql | docker exec -i medical_postgres_medico psql -U postgres -d medico_db

# Restaurar Receta
cat receta_backup.sql | docker exec -i medical_postgres_receta psql -U postgres -d receta_db
```

### Ver uso de recursos
```bash
# Docker stats
docker stats

# Espacio usado
docker system df

# Limpiar imágenes no usadas
docker image prune -a
```

---

## 📈 Métricas y Monitoreo

### RabbitMQ Métricas
```bash
# API REST de RabbitMQ
curl -u guest:guest http://localhost:15672/api/overview

# Ver cola específica
curl -u guest:guest http://localhost:15672/api/queues/%2F/medico_queue
curl -u guest:guest http://localhost:15672/api/queues/%2F/receta_queue
```

### Redis Métricas
```bash
docker exec medical_redis redis-cli INFO

# Ver memoria usada
docker exec medical_redis redis-cli INFO memory

# Ver clientes conectados
docker exec medical_redis redis-cli CLIENT LIST
```

---

## 🎯 Comandos de Desarrollo

### Watch mode (auto-reload)
```bash
npm run start:gateway  # Auto-reload en cambios
npm run start:medico   # Auto-reload en cambios
npm run start:receta   # Auto-reload en cambios
```

### Linting y formateo
```bash
# Ejecutar linter
npm run lint

# Formatear código
npm run format
```

### Tests (si se implementan)
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 📝 Notas Importantes

- Siempre iniciar Docker ANTES de los microservicios
- Esperar 10-15 segundos para que RabbitMQ esté listo
- Verificar que todos los puertos estén libres (3000, 5672, 5432, 5433, 6379)
- Revisar logs en caso de error
- Redis se limpia automáticamente (TTL 24h)

---

¡Guarda este archivo para referencia rápida! 🚀
