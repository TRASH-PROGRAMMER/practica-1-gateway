import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RecetaController } from './receta.controller';
import { RecetaService } from './receta.service';
import { IdempotencyService } from './idempotency.service';
import { Receta } from './entities/receta.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.RECETA_DB_HOST || 'localhost',
      port: parseInt(process.env.RECETA_DB_PORT) || 5433,
      username: process.env.RECETA_DB_USER || 'postgres',
      password: process.env.RECETA_DB_PASSWORD || 'postgres',
      database: process.env.RECETA_DB_NAME || 'receta_db',
      entities: [Receta],
      synchronize: true, // Solo para desarrollo
      logging: true,
    }),
    TypeOrmModule.forFeature([Receta]),
    // Cliente para comunicarse con el servicio de Médico
    ClientsModule.register([
      {
        name: 'MEDICO_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'medico_queue',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  controllers: [RecetaController],
  providers: [RecetaService, IdempotencyService],
})
export class AppModule {}
