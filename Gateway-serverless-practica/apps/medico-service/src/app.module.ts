import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicoController } from './medico.controller';
import { MedicoService } from './medico.service';
import { Medico } from './entities/medico.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.MEDICO_DB_HOST || 'localhost',
      port: parseInt(process.env.MEDICO_DB_PORT) || 5432,
      username: process.env.MEDICO_DB_USER || 'postgres',
      password: process.env.MEDICO_DB_PASSWORD || 'postgres',
      database: process.env.MEDICO_DB_NAME || 'medico_db',
      entities: [Medico],
      synchronize: true, // Solo para desarrollo
      logging: true,
    }),
    TypeOrmModule.forFeature([Medico]),
  ],
  controllers: [MedicoController],
  providers: [MedicoService],
})
export class AppModule {}
