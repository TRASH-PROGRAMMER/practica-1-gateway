import { Controller, Get, Post, Put, Delete, Body, Param, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CreateRecetaDto, UpdateRecetaDto, RABBITMQ_CONFIG } from '@app/common';
import { firstValueFrom } from 'rxjs';

@Controller('recetas')
export class RecetaController {
  constructor(
    @Inject('RECETA_SERVICE') private readonly recetaClient: ClientProxy,
  ) {}

  @Post()
  async create(@Body() createRecetaDto: CreateRecetaDto) {
    return firstValueFrom(
      this.recetaClient.send(RABBITMQ_CONFIG.PATTERNS.RECETA_CREATE, createRecetaDto),
    );
  }

  @Get()
  async findAll() {
    return firstValueFrom(
      this.recetaClient.send(RABBITMQ_CONFIG.PATTERNS.RECETA_FIND_ALL, {}),
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return firstValueFrom(
      this.recetaClient.send(RABBITMQ_CONFIG.PATTERNS.RECETA_FIND_ONE, id),
    );
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRecetaDto: UpdateRecetaDto) {
    return firstValueFrom(
      this.recetaClient.send(RABBITMQ_CONFIG.PATTERNS.RECETA_UPDATE, {
        id,
        ...updateRecetaDto,
      }),
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return firstValueFrom(
      this.recetaClient.send(RABBITMQ_CONFIG.PATTERNS.RECETA_DELETE, id),
    );
  }
}
