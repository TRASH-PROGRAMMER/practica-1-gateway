# 🧨 Guía de Pruebas de Resiliencia

## Objetivo
Demostrar que el sistema implementa correctamente el **Patrón Idempotent Consumer** y es resiliente a fallos comunes en sistemas distribuidos.

---

## Prueba 1: Detección de Mensajes Duplicados ⚡

### Objetivo
Verificar que si el mismo mensaje llega múltiples veces, se procesa solo una vez.

### Pasos

1. **Levantar el sistema**
```bash
docker-compose up -d
npm run start:gateway  # Terminal 1
npm run start:medico   # Terminal 2
npm run start:receta   # Terminal 3
```

2. **Crear un médico**
```bash
curl -X POST http://localhost:3000/api/medicos \
  -H "Content-Type: application/json" \
  -d '{"id_medico":"MED-001","numero_licencia":"12345","institucion":"Hospital General"}'
```

3. **Enviar la MISMA receta 5 veces seguidas**
```bash
for ($i=1; $i -le 5; $i++) {
  curl -X POST http://localhost:3000/api/recetas \
    -H "Content-Type: application/json" \
    -d '{"id_receta":"REC-001","id_medico":"MED-001","id_paciente":"PAC-001","fecha_emision":"2025-12-15T10:00:00Z","diagnostico":"Gripe","observaciones":"Reposo"}'
  Start-Sleep -Seconds 2
}
```

### Resultado Esperado

**Primera petición:**
```
✅ Logs del servicio:
🔑 Creando receta con Idempotency Key: ...
📝 Receta REC-001 creada con estado PENDIENTE
📤 Enviando solicitud de validación...
✅ Receta REC-001 VALIDADA correctamente

✅ Respuesta:
{
  "success": true,
  "data": { "id_receta": "REC-001", "estado": "VALIDADA", ... },
  "message": "Receta creada y validada exitosamente"
}
```

**Peticiones 2-5:**
```
❌ Respuesta:
{
  "statusCode": 400,
  "message": "Ya existe una receta con este ID"
}
```

4. **Verificar en Redis**
```bash
docker exec -it medical_redis redis-cli
KEYS idempotency:*
GET idempotency:create_receta_REC-001
```

### ✅ Criterio de Éxito
- Solo se crea UNA receta en la base de datos
- Peticiones duplicadas reciben error "Ya existe"
- Redis contiene la clave de idempotencia

---

## Prueba 2: Simulación de Mensaje Duplicado en RabbitMQ 🐰

### Objetivo
Simular que RabbitMQ reenvía un mensaje antes de recibir el ACK.

### Pasos

1. **Modificar temporalmente el código** (opcional para prueba avanzada)
   
   En [receta.controller.ts](apps/receta-service/src/receta.controller.ts), agregar un delay antes del ACK:

```typescript
// Antes del ACK
await new Promise(resolve => setTimeout(resolve, 10000)); // 10 segundos
channel.ack(originalMsg);
```

2. **Reiniciar servicio de receta**
```bash
# Detener y volver a ejecutar
npm run start:receta
```

3. **Enviar receta y detener servicio inmediatamente**
```bash
# Enviar petición
curl -X POST http://localhost:3000/api/recetas ...

# Detener servicio (Ctrl+C) antes de 10 segundos
```

4. **RabbitMQ reintentará el mensaje**
5. **Reiniciar servicio**
6. **Verificar que no se duplica**

### ✅ Criterio de Éxito
- El mensaje se procesa automáticamente al reiniciar
- NO se crea una receta duplicada
- Logs muestran: "♻️ Retornando resultado cacheado"

---

## Prueba 3: Médico Inexistente (Validación Rechazada) ❌

### Objetivo
Verificar que se rechaza una receta si el médico no existe.

### Pasos

```bash
curl -X POST http://localhost:3000/api/recetas \
  -H "Content-Type: application/json" \
  -d '{"id_receta":"REC-999","id_medico":"MED-NOEXISTE","id_paciente":"PAC-001","fecha_emision":"2025-12-15T10:00:00Z","diagnostico":"Test","observaciones":"Prueba"}'
```

### Resultado Esperado

```json
{
  "success": false,
  "data": {
    "id_receta": "REC-999",
    "estado": "RECHAZADA",
    ...
  },
  "message": "Receta creada pero rechazada en validación",
  "validacion": "Médico con ID MED-NOEXISTE no encontrado"
}
```

### ✅ Criterio de Éxito
- Receta se crea en BD pero con estado RECHAZADA
- No se permite actualizar una receta rechazada
- Mensaje de error claro

---

## Prueba 4: Caída del Servicio de Recetas 💥

### Objetivo
Verificar que los mensajes persisten en RabbitMQ y se procesan al recuperarse.

### Pasos

1. **Detener el servicio de recetas**
```bash
# En la terminal 3 presionar Ctrl+C
```

2. **Enviar peticiones mientras está caído**
```bash
curl -X POST http://localhost:3000/api/recetas \
  -H "Content-Type: application/json" \
  -d '{"id_receta":"REC-002","id_medico":"MED-001","id_paciente":"PAC-002","fecha_emision":"2025-12-15T11:00:00Z","diagnostico":"Fiebre","observaciones":"Control"}'
```

3. **Verificar en RabbitMQ**
   - Ir a http://localhost:15672
   - Ver cola `receta_queue`
   - Debería haber 1 mensaje pendiente

4. **Reiniciar servicio de recetas**
```bash
npm run start:receta
```

5. **Verificar logs**
   - El mensaje se procesa automáticamente
   - La receta se crea correctamente

### ✅ Criterio de Éxito
- Mensaje queda en cola de RabbitMQ
- Al reiniciar, se procesa automáticamente
- No se pierde ningún mensaje

---

## Prueba 5: Desconexión de Redis 🔴

### Objetivo
Verificar el comportamiento cuando Redis no está disponible.

### Pasos

1. **Detener Redis**
```bash
docker-compose stop redis
```

2. **Intentar crear una receta**
```bash
curl -X POST http://localhost:3000/api/recetas ...
```

3. **Observar logs del servicio de recetas**
```
❌ Error de conexión a Redis
⏳ Esperando reconexión...
```

4. **Reiniciar Redis**
```bash
docker-compose start redis
```

5. **Verificar reconexión**
```
✅ Conectado a Redis
```

### ✅ Criterio de Éxito
- El servicio intenta reconectar automáticamente
- Los mensajes quedan en cola de RabbitMQ
- Al recuperar Redis, todo funciona normalmente

---

## Prueba 6: Carga Concurrente (Race Condition) 🏃‍♂️

### Objetivo
Verificar que los locks distribuidos evitan race conditions.

### Pasos

1. **Crear script de carga**
```powershell
# crear-recetas-paralelas.ps1
$jobs = @()
for ($i=1; $i -le 10; $i++) {
    $jobs += Start-Job -ScriptBlock {
        param($id)
        curl -X POST http://localhost:3000/api/recetas `
          -H "Content-Type: application/json" `
          -d "{`"id_receta`":`"REC-$id`",`"id_medico`":`"MED-001`",`"id_paciente`":`"PAC-$id`",`"fecha_emision`":`"2025-12-15T10:00:00Z`",`"diagnostico`":`"Test $id`",`"observaciones`":`"Concurrencia`"}"
    } -ArgumentList $i
}
$jobs | Wait-Job | Receive-Job
```

2. **Ejecutar script**
```bash
.\crear-recetas-paralelas.ps1
```

3. **Verificar en base de datos**
```bash
# Conectar a PostgreSQL
docker exec -it medical_postgres_receta psql -U postgres -d receta_db
SELECT COUNT(*) FROM recetas;
```

### ✅ Criterio de Éxito
- Se crean exactamente 10 recetas (no duplicados)
- Cada lock evita procesamiento concurrente
- Todas las recetas tienen estado VALIDADA

---

## Prueba 7: Monitoreo de RabbitMQ 📊

### Objetivo
Verificar que los mensajes se procesan correctamente y se envían ACK.

### Pasos

1. **Abrir RabbitMQ Management**
   http://localhost:15672

2. **Ver colas**
   - `medico_queue`
   - `receta_queue`

3. **Enviar varias peticiones**
```bash
for ($i=1; $i -le 5; $i++) {
  curl -X POST http://localhost:3000/api/recetas ...
}
```

4. **Observar métricas**
   - Mensajes publicados
   - Mensajes confirmados (ACK)
   - Tasa de procesamiento

### ✅ Criterio de Éxito
- Todos los mensajes reciben ACK
- No hay mensajes "Unacked"
- No hay mensajes en "Ready" después de procesarse

---

## Prueba 8: Verificación de TTL en Redis ⏰

### Objetivo
Verificar que las claves de idempotencia expiran después de 24 horas.

### Pasos

1. **Crear receta**
```bash
curl -X POST http://localhost:3000/api/recetas ...
```

2. **Verificar TTL**
```bash
docker exec -it medical_redis redis-cli
TTL idempotency:create_receta_REC-001
```

**Resultado esperado**: `86400` (segundos = 24 horas)

3. **Esperar o modificar TTL manualmente para prueba rápida**
```bash
EXPIRE idempotency:create_receta_REC-001 10  # 10 segundos
```

4. **Esperar 10 segundos y verificar**
```bash
EXISTS idempotency:create_receta_REC-001
# Resultado: 0 (ya no existe)
```

### ✅ Criterio de Éxito
- Clave expira automáticamente
- Después de expirar, se puede procesar nuevamente
- No hay memoria infinita en Redis

---

## 📊 Resumen de Pruebas

| Prueba | Objetivo | Tiempo | Complejidad |
|--------|----------|--------|-------------|
| 1. Mensajes Duplicados | Idempotencia | 5 min | Fácil |
| 2. Duplicado RabbitMQ | At-least-once | 10 min | Media |
| 3. Médico Inexistente | Validación | 2 min | Fácil |
| 4. Caída de Servicio | Persistencia | 5 min | Fácil |
| 5. Desconexión Redis | Reconexión | 5 min | Media |
| 6. Carga Concurrente | Locks | 10 min | Difícil |
| 7. Monitoreo RabbitMQ | Observabilidad | 5 min | Fácil |
| 8. TTL Redis | Expiración | 5 min | Fácil |

---

## 🎯 Checklist de Validación

Marca cada punto cuando lo hayas verificado:

- [ ] Mensaje duplicado NO crea receta duplicada
- [ ] Redis almacena claves de idempotencia
- [ ] Locks distribuidos evitan race conditions
- [ ] Servicio se recupera automáticamente de caídas
- [ ] RabbitMQ persiste mensajes
- [ ] ACK manual funciona correctamente
- [ ] Validación de médico funciona
- [ ] Estados de receta son correctos (PENDIENTE → VALIDADA/RECHAZADA)
- [ ] TTL de Redis es 24 horas
- [ ] No hay comunicación HTTP directa entre microservicios

---

## 🏆 Criterios de Éxito Global

El sistema pasa todas las pruebas si:

✅ **Idempotencia**: Mensajes duplicados no causan efectos duplicados  
✅ **Persistencia**: Ningún mensaje se pierde aunque falle el servicio  
✅ **Consistencia**: Estados de recetas son correctos  
✅ **Aislamiento**: Microservicios son independientes  
✅ **Observabilidad**: Se pueden monitorear todos los componentes  

---

¡Sistema probado y validado! 🎉
