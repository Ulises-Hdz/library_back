import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookService } from './book.service';
import { BookController } from './book.controller';
import { BookSchema } from 'src/models/book.model';
import { PhysicalItemSchema } from 'src/models/physical-resource.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Book', schema: BookSchema },
      { name: 'PhysicalItem', schema: PhysicalItemSchema },
    ]),
  ],
  controllers: [BookController],
  providers: [BookService],
  exports: [BookService],
})
export class BookModule {}
