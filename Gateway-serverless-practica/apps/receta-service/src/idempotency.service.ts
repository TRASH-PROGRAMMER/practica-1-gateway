import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CONFIG } from '@app/common';

/**
 * Servicio de Idempotencia
 * Implementa el patrón Idempotent Consumer para garantizar que los mensajes
 * se procesen exactamente una vez, aunque lleguen múltiples veces.
 */
@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.redis.on('connect', () => {
      this.logger.log('✅ Conectado a Redis para control de idempotencia');
    });

    this.redis.on('error', (error) => {
      this.logger.error('❌ Error de conexión a Redis:', error);
    });
  }

  /**
   * Verifica si una operación ya fue procesada
   * @param idempotencyKey Clave única de idempotencia
   * @returns true si ya fue procesada, false si es nueva
   */
  async isProcessed(idempotencyKey: string): Promise<boolean> {
    const key = `${REDIS_CONFIG.PREFIX.IDEMPOTENCY}${idempotencyKey}`;
    const exists = await this.redis.exists(key);
    
    if (exists) {
      this.logger.warn(`⚠️  Mensaje duplicado detectado: ${idempotencyKey}`);
    }
    
    return exists === 1;
  }

  /**
   * Obtiene el resultado de una operación previamente procesada
   * @param idempotencyKey Clave única de idempotencia
   * @returns Resultado almacenado o null
   */
  async getProcessedResult(idempotencyKey: string): Promise<any> {
    const key = `${REDIS_CONFIG.PREFIX.IDEMPOTENCY}${idempotencyKey}`;
    const result = await this.redis.get(key);
    
    if (result) {
      this.logger.log(`♻️  Retornando resultado almacenado para: ${idempotencyKey}`);
      return JSON.parse(result);
    }
    
    return null;
  }

  /**
   * Marca una operación como procesada y almacena su resultado
   * @param idempotencyKey Clave única de idempotencia
   * @param result Resultado de la operación
   */
  async markAsProcessed(idempotencyKey: string, result: any): Promise<void> {
    const key = `${REDIS_CONFIG.PREFIX.IDEMPOTENCY}${idempotencyKey}`;
    
    await this.redis.setex(
      key,
      REDIS_CONFIG.TTL,
      JSON.stringify(result),
    );
    
    this.logger.log(`✅ Operación marcada como procesada: ${idempotencyKey}`);
  }

  /**
   * Adquiere un lock distribuido para procesamiento exclusivo
   * @param lockKey Clave del lock
   * @param ttlSeconds TTL del lock en segundos
   * @returns true si adquirió el lock, false si está bloqueado
   */
  async acquireLock(lockKey: string, ttlSeconds: number = 30): Promise<boolean> {
    const key = `${REDIS_CONFIG.PREFIX.LOCK}${lockKey}`;
    const result = await this.redis.set(key, '1', 'EX', ttlSeconds, 'NX');
    
    return result === 'OK';
  }

  /**
   * Libera un lock distribuido
   * @param lockKey Clave del lock
   */
  async releaseLock(lockKey: string): Promise<void> {
    const key = `${REDIS_CONFIG.PREFIX.LOCK}${lockKey}`;
    await this.redis.del(key);
  }

  /**
   * Cierra la conexión a Redis
   */
  async onModuleDestroy() {
    await this.redis.quit();
  }
}
