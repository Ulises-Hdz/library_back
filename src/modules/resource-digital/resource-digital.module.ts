import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourceDigitalService } from './resource-digital.service';
import { ResourceDigitalController } from './resource-digital.controller';
import { DigitalResourceSchema } from 'src/models/digital-resource.model';
import { BookSchema } from 'src/models/book.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'DigitalResource', schema: DigitalResourceSchema },
      { name: 'Book', schema: BookSchema },
    ]),
  ],
  controllers: [ResourceDigitalController],
  providers: [ResourceDigitalService],
})
export class ResourceDigitalModule {}
