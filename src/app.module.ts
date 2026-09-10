import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvConfiguration } from 'src/config/env.config';
import { JoiValidationSchema } from './config/joi.validation';

@Module({
  imports: [
    // 1. Cargar las variables de entorno
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
      isGlobal: true, // Disponible en toda la aplicación
    }),

    // 2. Conectar Mongoose usando el ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongoUri'),
      }),
    }),
  ],
})
export class AppModule {}
