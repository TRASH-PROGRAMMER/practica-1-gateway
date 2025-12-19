import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medico } from './entities/medico.entity';
import { CreateMedicoDto, UpdateMedicoDto } from '@app/common';

@Injectable()
export class MedicoService {
  constructor(
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
  ) {}

  async create(createMedicoDto: CreateMedicoDto): Promise<Medico> {
    // Verificar si ya existe un médico con ese ID o licencia
    const existingMedico = await this.medicoRepository.findOne({
      where: [
        { id_medico: createMedicoDto.id_medico },
        { numero_licencia: createMedicoDto.numero_licencia },
      ],
    });

    if (existingMedico) {
      throw new ConflictException('Médico o número de licencia ya existe');
    }

    const medico = this.medicoRepository.create(createMedicoDto);
    return await this.medicoRepository.save(medico);
  }

  async findAll(): Promise<Medico[]> {
    return await this.medicoRepository.find();
  }

  async findOne(id: string): Promise<Medico> {
    const medico = await this.medicoRepository.findOne({
      where: { id_medico: id },
    });

    if (!medico) {
      throw new NotFoundException(`Médico con ID ${id} no encontrado`);
    }

    return medico;
  }

  async update(id: string, updateMedicoDto: UpdateMedicoDto): Promise<Medico> {
    const medico = await this.findOne(id);

    Object.assign(medico, updateMedicoDto);
    return await this.medicoRepository.save(medico);
  }

  async remove(id: string): Promise<{ message: string }> {
    const medico = await this.findOne(id);
    await this.medicoRepository.remove(medico);
    return { message: `Médico con ID ${id} eliminado exitosamente` };
  }

  // Método especial para validar médico (usado por el servicio de recetas)
  async validarMedico(id_medico: string): Promise<{ valido: boolean; mensaje: string }> {
    try {
      const medico = await this.findOne(id_medico);
      
      // Aquí puedes agregar lógica adicional de validación
      // Por ejemplo, verificar si el médico está activo, tiene permisos, etc.
      
      return {
        valido: true,
        mensaje: `Médico ${medico.id_medico} validado correctamente`,
      };
    } catch (error) {
      return {
        valido: false,
        mensaje: error.message || 'Médico no válido',
      };
    }
  }
}
