import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvConfiguration } from 'src/config/env.config';
import { JoiValidationSchema } from './config/joi.validation';
import { LoansModule } from './loans/loans.module';
import { BookModule } from './modules/book/book.module';
import { PhysicalItemModule } from './modules/physical-item/physical-item.module';
import { ResourceDigitalModule } from './modules/resource-digital/resource-digital.module';

@Module({
  imports: [
    // 1. Load environment variables
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
      isGlobal: true, // Available across the whole application
    }),

    // 2. Connect Mongoose using ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('mongoUri'),
      }),
    }),

    BookModule,
    PhysicalItemModule,
    ResourceDigitalModule,
    LoansModule,
  ],
})
export class AppModule {}
