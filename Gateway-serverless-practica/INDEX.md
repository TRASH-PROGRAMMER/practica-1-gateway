# 📚 Índice de Documentación del Proyecto

## 📖 Guías de Usuario

### 1. [README.md](README.md) - 📘 Documentación Principal
**Lectura obligatoria** - Documentación completa del sistema
- Arquitectura detallada
- Tecnologías utilizadas
- Estructura del proyecto
- Instalación y configuración completa
- Pruebas de la API
- Explicación del patrón Idempotent Consumer

**👉 Empieza aquí si quieres entender TODO el sistema**

---

### 2. [QUICKSTART.md](QUICKSTART.md) - 🚀 Inicio Rápido
**Para comenzar inmediatamente**
- Pasos mínimos para levantar el sistema
- Comandos esenciales
- Pruebas básicas con cURL
- Verificación de componentes

**👉 Empieza aquí si quieres EJECUTAR el sistema YA**

---

### 3. [ARQUITECTURA_DIAGRAMAS.md](ARQUITECTURA_DIAGRAMAS.md) - 🎨 Diagramas Visuales
**Para entender visualmente**
- Diagrama de componentes ASCII
- Flujo de creación de receta
- Flujo de idempotencia
- Estados de receta
- Estructura de datos en Redis

**👉 Empieza aquí si eres VISUAL**

---

### 4. [PRUEBAS_RESILIENCIA.md](PRUEBAS_RESILIENCIA.md) - 🧪 Testing
**Para validar el sistema**
- 8 pruebas de resiliencia detalladas
- Pruebas de idempotencia
- Simulación de fallos
- Pruebas de carga concurrente
- Checklist de validación

**👉 Empieza aquí si quieres PROBAR la resiliencia**

---

### 5. [COMANDOS_UTILES.md](COMANDOS_UTILES.md) - 🛠️ Referencia de Comandos
**Para el día a día**
- Comandos Docker Compose
- Comandos Redis
- Comandos PostgreSQL
- Scripts de carga
- Solución de problemas

**👉 Empieza aquí si necesitas REFERENCIA RÁPIDA**

---

### 6. [PROYECTO_COMPLETADO.md](PROYECTO_COMPLETADO.md) - 📊 Resumen Ejecutivo
**Para presentaciones**
- Resumen de características
- Métricas del proyecto
- Cumplimiento de requisitos
- Próximos pasos

**👉 Empieza aquí si necesitas un RESUMEN**

---

## 🔧 Archivos de Configuración

### 7. [docker-compose.yml](docker-compose.yml) - 🐳 Infraestructura
Configuración de:
- RabbitMQ
- PostgreSQL (Médico)
- PostgreSQL (Receta)
- Redis
- Adminer

---

### 8. [.env](.env) - ⚙️ Variables de Entorno
Configuración de:
- Puertos de servicios
- Credenciales de bases de datos
- URLs de conexión

---

### 9. [package.json](package.json) - 📦 Dependencias
- Lista de dependencias
- Scripts de ejecución
- Configuración de Jest

---

### 10. [nest-cli.json](nest-cli.json) - 🏗️ Configuración NestJS
- Configuración de monorepo
- Proyectos (Gateway, Médico, Receta, Common)

---

## 🧪 Pruebas

### 11. [postman_collection.json](postman_collection.json) - 📮 Colección Postman
Incluye:
- 5 endpoints de Médicos
- 7 endpoints de Recetas (incluye pruebas de idempotencia)

---

## 📂 Código Fuente

### API Gateway
- [apps/gateway/src/main.ts](apps/gateway/src/main.ts)
- [apps/gateway/src/app.module.ts](apps/gateway/src/app.module.ts)
- [apps/gateway/src/medico.controller.ts](apps/gateway/src/medico.controller.ts)
- [apps/gateway/src/receta.controller.ts](apps/gateway/src/receta.controller.ts)

### Microservicio Médico
- [apps/medico-service/src/main.ts](apps/medico-service/src/main.ts)
- [apps/medico-service/src/app.module.ts](apps/medico-service/src/app.module.ts)
- [apps/medico-service/src/medico.controller.ts](apps/medico-service/src/medico.controller.ts)
- [apps/medico-service/src/medico.service.ts](apps/medico-service/src/medico.service.ts)
- [apps/medico-service/src/entities/medico.entity.ts](apps/medico-service/src/entities/medico.entity.ts)

### Microservicio Receta (con Idempotencia)
- [apps/receta-service/src/main.ts](apps/receta-service/src/main.ts)
- [apps/receta-service/src/app.module.ts](apps/receta-service/src/app.module.ts)
- [apps/receta-service/src/receta.controller.ts](apps/receta-service/src/receta.controller.ts)
- [apps/receta-service/src/receta.service.ts](apps/receta-service/src/receta.service.ts)
- [apps/receta-service/src/idempotency.service.ts](apps/receta-service/src/idempotency.service.ts) ⭐
- [apps/receta-service/src/entities/receta.entity.ts](apps/receta-service/src/entities/receta.entity.ts)

### Módulo Compartido
- [libs/common/src/dto/medico.dto.ts](libs/common/src/dto/medico.dto.ts)
- [libs/common/src/dto/receta.dto.ts](libs/common/src/dto/receta.dto.ts)
- [libs/common/src/dto/events.dto.ts](libs/common/src/dto/events.dto.ts)
- [libs/common/src/interfaces/index.ts](libs/common/src/interfaces/index.ts)
- [libs/common/src/constants/index.ts](libs/common/src/constants/index.ts)

---

## 🎓 Rutas de Aprendizaje Sugeridas

### Para Principiantes
1. Lee [QUICKSTART.md](QUICKSTART.md)
2. Ejecuta el sistema siguiendo los pasos
3. Prueba con Postman
4. Lee [README.md](README.md) sección por sección

### Para Desarrolladores
1. Lee [README.md](README.md) completo
2. Revisa [ARQUITECTURA_DIAGRAMAS.md](ARQUITECTURA_DIAGRAMAS.md)
3. Estudia el código en este orden:
   - `libs/common` (DTOs y constantes)
   - `apps/gateway` (punto de entrada)
   - `apps/medico-service` (servicio simple)
   - `apps/receta-service` (servicio con idempotencia)
4. Ejecuta [PRUEBAS_RESILIENCIA.md](PRUEBAS_RESILIENCIA.md)

### Para Presentaciones/Demos
1. Lee [PROYECTO_COMPLETADO.md](PROYECTO_COMPLETADO.md)
2. Revisa [ARQUITECTURA_DIAGRAMAS.md](ARQUITECTURA_DIAGRAMAS.md)
3. Prepara demo siguiendo [QUICKSTART.md](QUICKSTART.md)
4. Usa [PRUEBAS_RESILIENCIA.md](PRUEBAS_RESILIENCIA.md) para demos en vivo

### Para Troubleshooting
1. Ve directo a [COMANDOS_UTILES.md](COMANDOS_UTILES.md)
2. Busca el problema en la sección "Solución de Problemas"
3. Revisa logs con los comandos indicados

---

## 🔍 Búsqueda Rápida

### ¿Cómo...?

**¿Cómo iniciar el sistema?**
→ [QUICKSTART.md](QUICKSTART.md) - Sección "Ejecutar Microservicios"

**¿Cómo funciona la idempotencia?**
→ [README.md](README.md) - Sección "Patrón Idempotent Consumer"
→ [apps/receta-service/src/idempotency.service.ts](apps/receta-service/src/idempotency.service.ts)

**¿Cómo probar el sistema?**
→ [PRUEBAS_RESILIENCIA.md](PRUEBAS_RESILIENCIA.md)

**¿Cómo funciona RabbitMQ aquí?**
→ [README.md](README.md) - Sección "Flujo de Creación de Receta"
→ [ARQUITECTURA_DIAGRAMAS.md](ARQUITECTURA_DIAGRAMAS.md)

**¿Cómo ver los logs?**
→ [COMANDOS_UTILES.md](COMANDOS_UTILES.md) - Sección "Monitoreo y Debugging"

**¿Cómo resetear todo?**
→ [COMANDOS_UTILES.md](COMANDOS_UTILES.md) - "Limpiar todo y empezar de cero"

---

## 📊 Estadísticas del Proyecto

- **Archivos de documentación**: 7 archivos MD
- **Archivos de código**: 30+ archivos TypeScript
- **Líneas de código**: ~2000 líneas
- **Microservicios**: 3 (Gateway, Médico, Receta)
- **Tecnologías**: 10+ (NestJS, TypeScript, RabbitMQ, Redis, PostgreSQL, Docker, etc.)
- **Endpoints REST**: 10 endpoints
- **Servicios Docker**: 5 contenedores
- **Bases de datos**: 2 PostgreSQL independientes

---

## 🎯 Checklist de Lectura

Marca lo que ya leíste:

- [ ] QUICKSTART.md - Inicio rápido
- [ ] README.md - Documentación completa
- [ ] ARQUITECTURA_DIAGRAMAS.md - Diagramas visuales
- [ ] PRUEBAS_RESILIENCIA.md - Guía de pruebas
- [ ] COMANDOS_UTILES.md - Referencia de comandos
- [ ] PROYECTO_COMPLETADO.md - Resumen ejecutivo
- [ ] Código fuente de Gateway
- [ ] Código fuente de Médico
- [ ] Código fuente de Receta
- [ ] Servicio de Idempotencia

---

## 📞 Recursos Externos

### Acceso Web (cuando el sistema esté corriendo)

- **API Gateway**: http://localhost:3000/api
- **RabbitMQ Management**: http://localhost:15672
- **Adminer (DB UI)**: http://localhost:8080
- **Redis**: localhost:6379 (CLI)
- **PostgreSQL Médico**: localhost:5432
- **PostgreSQL Receta**: localhost:5433

### Documentación Oficial

- [NestJS](https://docs.nestjs.com/)
- [RabbitMQ](https://www.rabbitmq.com/documentation.html)
- [Redis](https://redis.io/documentation)
- [TypeORM](https://typeorm.io/)
- [Docker](https://docs.docker.com/)

---

¡Navega la documentación según tu necesidad! 🚀
