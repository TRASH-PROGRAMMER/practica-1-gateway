import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: 'receta_queue',
      queueOptions: {
        durable: true,
      },
      // Configuración para garantizar entrega y procesamiento idempotente
      noAck: false, // Requiere ACK manual
      prefetchCount: 1, // Procesa un mensaje a la vez
    },
  });

  await app.listen();
  console.log('💊 Microservicio Receta escuchando en RabbitMQ');
  console.log('🔒 Patrón Idempotent Consumer activado con Redis');
}
bootstrap();
