import { Injectable, NotFoundException, BadRequestException, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Receta } from './entities/receta.entity';
import { CreateRecetaDto, UpdateRecetaDto, RABBITMQ_CONFIG, RECETA_ESTADOS } from '@app/common';
import { IdempotencyService } from './idempotency.service';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RecetaService {
  private readonly logger = new Logger(RecetaService.name);

  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,
    @Inject('MEDICO_SERVICE')
    private readonly medicoClient: ClientProxy,
    private readonly idempotencyService: IdempotencyService,
  ) {}

  /**
   * Crea una receta con validación idempotente del médico
   * Este método implementa el patrón Idempotent Consumer
   */
  async create(createRecetaDto: CreateRecetaDto): Promise<any> {
    // Generar clave de idempotencia única
    const idempotencyKey = uuidv4();
    
    this.logger.log(`🔑 Creando receta con Idempotency Key: ${idempotencyKey}`);

    // PASO 1: Verificar si ya existe una receta con este ID
    const existingReceta = await this.recetaRepository.findOne({
      where: { id_receta: createRecetaDto.id_receta },
    });

    if (existingReceta) {
      throw new BadRequestException('Ya existe una receta con este ID');
    }

    // PASO 2: Crear receta con estado PENDIENTE
    const receta = this.recetaRepository.create({
      ...createRecetaDto,
      estado: RECETA_ESTADOS.PENDIENTE,
    });

    const savedReceta = await this.recetaRepository.save(receta);
    this.logger.log(`📝 Receta ${savedReceta.id_receta} creada con estado PENDIENTE`);

    // PASO 3: Validar médico a través de RabbitMQ (comunicación asíncrona obligatoria)
    try {
      this.logger.log(`📤 Enviando solicitud de validación a Microservicio Médico vía RabbitMQ`);
      
      const validacionResponse = await firstValueFrom(
        this.medicoClient.send(RABBITMQ_CONFIG.PATTERNS.VALIDAR_MEDICO, {
          idempotencyKey,
          id_medico: createRecetaDto.id_medico,
          id_receta: createRecetaDto.id_receta,
          recetaData: createRecetaDto,
        }),
      );

      this.logger.log(`📥 Respuesta de validación recibida:`, validacionResponse);

      // PASO 4: Actualizar estado de la receta según la validación
      if (validacionResponse.success && validacionResponse.status === 'VALIDADO') {
        savedReceta.estado = RECETA_ESTADOS.VALIDADA;
        await this.recetaRepository.save(savedReceta);
        
        this.logger.log(`✅ Receta ${savedReceta.id_receta} VALIDADA correctamente`);
        
        return {
          success: true,
          data: savedReceta,
          message: 'Receta creada y validada exitosamente',
          validacion: validacionResponse.mensaje,
        };
      } else {
        savedReceta.estado = RECETA_ESTADOS.RECHAZADA;
        await this.recetaRepository.save(savedReceta);
        
        this.logger.warn(`❌ Receta ${savedReceta.id_receta} RECHAZADA`);
        
        return {
          success: false,
          data: savedReceta,
          message: 'Receta creada pero rechazada en validación',
          validacion: validacionResponse.mensaje,
        };
      }
    } catch (error) {
      // Si falla la comunicación con el servicio de médicos
      this.logger.error(`❌ Error en validación de médico:`, error.message);
      
      savedReceta.estado = RECETA_ESTADOS.RECHAZADA;
      await this.recetaRepository.save(savedReceta);
      
      throw new BadRequestException(
        `Error al validar médico: ${error.message}. Receta marcada como RECHAZADA.`
      );
    }
  }

  async findAll(): Promise<Receta[]> {
    return await this.recetaRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Receta> {
    const receta = await this.recetaRepository.findOne({
      where: { id_receta: id },
    });

    if (!receta) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }

    return receta;
  }

  async update(id: string, updateRecetaDto: UpdateRecetaDto): Promise<Receta> {
    const receta = await this.findOne(id);

    // No permitir actualizar recetas rechazadas
    if (receta.estado === RECETA_ESTADOS.RECHAZADA) {
      throw new BadRequestException('No se puede actualizar una receta rechazada');
    }

    Object.assign(receta, updateRecetaDto);
    return await this.recetaRepository.save(receta);
  }

  async remove(id: string): Promise<{ message: string }> {
    const receta = await this.findOne(id);
    await this.recetaRepository.remove(receta);
    return { message: `Receta con ID ${id} eliminada exitosamente` };
  }
}
