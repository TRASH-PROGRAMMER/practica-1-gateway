import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException, Ctx, RmqContext } from '@nestjs/microservices';
import { RecetaService } from './receta.service';
import { IdempotencyService } from './idempotency.service';
import { CreateRecetaDto, UpdateRecetaDto, RABBITMQ_CONFIG } from '@app/common';

@Controller()
export class RecetaController {
  private readonly logger = new Logger(RecetaController.name);

  constructor(
    private readonly recetaService: RecetaService,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  /**
   * Crea una receta con validación idempotente
   * Implementa el patrón Idempotent Consumer
   */
  @MessagePattern(RABBITMQ_CONFIG.PATTERNS.RECETA_CREATE)
  async create(@Payload() createRecetaDto: CreateRecetaDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    
    // Generar clave de idempotencia basada en los datos de la receta
    const idempotencyKey = `create_receta_${createRecetaDto.id_receta}`;
    
    try {
      this.logger.log(`📨 Mensaje recibido - Idempotency Key: ${idempotencyKey}`);

      // PASO 1: Verificar si el mensaje ya fue procesado
      const alreadyProcessed = await this.idempotencyService.isProcessed(idempotencyKey);
      
      if (alreadyProcessed) {
        // Si ya fue procesado, retornar el resultado almacenado
        const cachedResult = await this.idempotencyService.getProcessedResult(idempotencyKey);
        
        this.logger.log(`♻️  Retornando resultado cacheado para: ${idempotencyKey}`);
        
        // ACK del mensaje (ya fue procesado anteriormente)
        channel.ack(originalMsg);
        
        return cachedResult;
      }

      // PASO 2: Adquirir lock para evitar procesamiento concurrente
      const lockAcquired = await this.idempotencyService.acquireLock(idempotencyKey, 60);
      
      if (!lockAcquired) {
        this.logger.warn(`⏳ Lock no disponible para: ${idempotencyKey}. Mensaje será reintentado.`);
        // No hacer ACK, el mensaje será reintentado
        channel.nack(originalMsg, false, true);
        return;
      }

      try {
        // PASO 3: Procesar la creación de la receta
        this.logger.log(`🔄 Procesando creación de receta: ${createRecetaDto.id_receta}`);
        
        const result = await this.recetaService.create(createRecetaDto);

        // PASO 4: Almacenar el resultado en Redis para idempotencia
        await this.idempotencyService.markAsProcessed(idempotencyKey, result);

        // PASO 5: ACK del mensaje (procesado exitosamente)
        channel.ack(originalMsg);
        
        this.logger.log(`✅ Receta creada y mensaje confirmado (ACK)`);

        return result;

      } finally {
        // PASO 6: Liberar el lock
        await this.idempotencyService.releaseLock(idempotencyKey);
      }

    } catch (error) {
      this.logger.error(`❌ Error al procesar mensaje:`, error.message);
      
      // En caso de error, hacer NACK con requeue
      // El mensaje será reintentado
      channel.nack(originalMsg, false, true);
      
      throw new RpcException({
        success: false,
        error: error.message,
      });
    }
  }

  @MessagePattern(RABBITMQ_CONFIG.PATTERNS.RECETA_FIND_ALL)
  async findAll() {
    try {
      const recetas = await this.recetaService.findAll();
      return {
        success: true,
        data: recetas,
      };
    } catch (error) {
      throw new RpcException({
        success: false,
        error: error.message,
      });
    }
  }

  @MessagePattern(RABBITMQ_CONFIG.PATTERNS.RECETA_FIND_ONE)
  async findOne(@Payload() id: string) {
    try {
      const receta = await this.recetaService.findOne(id);
      return {
        success: true,
        data: receta,
      };
    } catch (error) {
      throw new RpcException({
        success: false,
        error: error.message,
      });
    }
  }

  @MessagePattern(RABBITMQ_CONFIG.PATTERNS.RECETA_UPDATE)
  async update(@Payload() payload: { id: string } & UpdateRecetaDto) {
    try {
      const { id, ...updateDto } = payload;
      const receta = await this.recetaService.update(id, updateDto);
      return {
        success: true,
        data: receta,
        message: 'Receta actualizada exitosamente',
      };
    } catch (error) {
      throw new RpcException({
        success: false,
        error: error.message,
      });
    }
  }

  @MessagePattern(RABBITMQ_CONFIG.PATTERNS.RECETA_DELETE)
  async remove(@Payload() id: string) {
    try {
      const result = await this.recetaService.remove(id);
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      throw new RpcException({
        success: false,
        error: error.message,
      });
    }
  }
}
