import { Controller, Get, Post, Put, Delete, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateMedicoDto, UpdateMedicoDto, RABBITMQ_CONFIG } from '@app/common';
import { firstValueFrom } from 'rxjs';

@Controller('medicos')
export class MedicoController {
  constructor(
    @Inject('MEDICO_SERVICE') private readonly medicoClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createMedicoDto: CreateMedicoDto) {
    return firstValueFrom(
      this.medicoClient.send(RABBITMQ_CONFIG.PATTERNS.MEDICO_CREATE, createMedicoDto),
    );
  }

  @Get()
  async findAll() {
    return firstValueFrom(
      this.medicoClient.send(RABBITMQ_CONFIG.PATTERNS.MEDICO_FIND_ALL, {}),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.medicoClient.send(RABBITMQ_CONFIG.PATTERNS.MEDICO_FIND_ONE, id),
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMedicoDto: UpdateMedicoDto) {
    return firstValueFrom(
      this.medicoClient.send(RABBITMQ_CONFIG.PATTERNS.MEDICO_UPDATE, {
        id,
        ...updateMedicoDto,
      }),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(
      this.medicoClient.send(RABBITMQ_CONFIG.PATTERNS.MEDICO_DELETE, id),
    );
  }
}
