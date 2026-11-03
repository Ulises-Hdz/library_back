import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { BookSchema } from 'src/models/book.model';
import { PhysicalItemSchema } from 'src/models/physical-resource.model';
import { DigitalResourceSchema } from 'src/models/digital-resource.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Book', schema: BookSchema },
      { name: 'PhysicalItem', schema: PhysicalItemSchema },
      { name: 'DigitalResource', schema: DigitalResourceSchema },
    ]),
  ],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
