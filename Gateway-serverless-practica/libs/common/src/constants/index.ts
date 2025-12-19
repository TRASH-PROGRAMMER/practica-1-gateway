// Constantes de RabbitMQ
export const RABBITMQ_CONFIG = {
  EXCHANGE: 'medical_exchange',
  QUEUES: {
    MEDICO: 'medico_queue',
    RECETA: 'receta_queue',
    VALIDACION: 'validacion_queue',
    RESPUESTA: 'respuesta_queue',
  },
  PATTERNS: {
    // Médico patterns
    MEDICO_CREATE: 'medico.create',
    MEDICO_FIND_ALL: 'medico.findAll',
    MEDICO_FIND_ONE: 'medico.findOne',
    MEDICO_UPDATE: 'medico.update',
    MEDICO_DELETE: 'medico.delete',
    
    // Receta patterns
    RECETA_CREATE: 'receta.create',
    RECETA_FIND_ALL: 'receta.findAll',
    RECETA_FIND_ONE: 'receta.findOne',
    RECETA_UPDATE: 'receta.update',
    RECETA_DELETE: 'receta.delete',
    
    // Eventos de dominio
    VALIDAR_MEDICO: 'medico.validar',
    MEDICO_VALIDADO: 'medico.validado',
  },
};

// Constantes de Redis para idempotencia
export const REDIS_CONFIG = {
  TTL: 86400, // 24 horas en segundos
  PREFIX: {
    IDEMPOTENCY: 'idempotency:',
    LOCK: 'lock:',
  },
};

// Estados de receta
export const RECETA_ESTADOS = {
  PENDIENTE: 'PENDIENTE',
  VALIDADA: 'VALIDADA',
  RECHAZADA: 'RECHAZADA',
  EMITIDA: 'EMITIDA',
};
