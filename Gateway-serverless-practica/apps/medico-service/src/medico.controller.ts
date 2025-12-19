import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { MedicoService } from './medico.service';
import { CreateMedicoDto, UpdateMedicoDto, RABBITMQ_CONFIG, ValidarMedicoEventDto } from '@app/common';

@Controller()
export class MedicoController {
  constructor(private readonly medicoService: MedicoService) {}

  @MessagePattern(RABBITMQ_CONFIG.PATTERNS.MEDICO_CREATE)
  async create(@Payload() createMedicoDto: CreateMedicoDto) {
    try {
      const medico = await this.medicoService.create(createMedicoDto);
      return {
        success: true,
        data: medico,
        message: 'Médico creado exitosamente',
      };
    } catch (error) {
      throw new RpcException({
        success: false,
        error: error.message,
      });
    }
  }

  @MessagePattern(RABBITMQ_CONFIG.PATTERNS.MEDICO_FIND_ALL)
  async findAll() {
    try {
      const medicos = await this.medicoService.findAll();
      return {
        success: true,
        data: medicos,
      };
    } catch (error) {
      throw new RpcException({
        success: false,
        error: error.message,
      });
    }
  }

  @MessagePattern(RABBITMQ_CONFIG.PATTERNS.MEDICO_FIND_ONE)
  async findOne(@Payload() id: string) {
    try {
      const medico = await this.medicoService.findOne(id);
      return {
        success: true,
        data: medico,
      };
    } catch (error) {
      throw new RpcException({
        success: false,
        error: error.message,
      });
    }
  }

  @MessagePattern(RABBITMQ_CONFIG.PATTERNS.MEDICO_UPDATE)
  async update(@Payload() payload: { id: string } & UpdateMedicoDto) {
    try {
      const { id, ...updateDto } = payload;
      const medico = await this.medicoService.update(id, updateDto);
      return {
        success: true,
        data: medico,
        message: 'Médico actualizado exitosamente',
      };
    } catch (error) {
      throw new RpcException({
        success: false,
        error: error.message,
      });
    }
  }

  @MessagePattern(RABBITMQ_CONFIG.PATTERNS.MEDICO_DELETE)
  async remove(@Payload() id: string) {
    try {
      const result = await this.medicoService.remove(id);
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

  // Pattern para validar médico (usado por el servicio de recetas)
  @MessagePattern(RABBITMQ_CONFIG.PATTERNS.VALIDAR_MEDICO)
  async validarMedico(@Payload() payload: ValidarMedicoEventDto) {
    try {
      console.log(`📋 Validando médico ${payload.id_medico} para receta ${payload.id_receta}`);
      console.log(`🔑 Idempotency Key: ${payload.idempotencyKey}`);
      
      const validacion = await this.medicoService.validarMedico(payload.id_medico);
      
      return {
        success: true,
        idempotencyKey: payload.idempotencyKey,
        id_medico: payload.id_medico,
        id_receta: payload.id_receta,
        status: validacion.valido ? 'VALIDADO' : 'RECHAZADO',
        mensaje: validacion.mensaje,
      };
    } catch (error) {
      return {
        success: false,
        idempotencyKey: payload.idempotencyKey,
        id_medico: payload.id_medico,
        id_receta: payload.id_receta,
        status: 'RECHAZADO',
        mensaje: error.message || 'Error al validar médico',
      };
    }
  }
}
