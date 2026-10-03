import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PhysicalItemService } from './physical-item.service';
import { PhysicalItemController } from './physical-item.controller';
import { PhysicalItemSchema } from 'src/models/physical-resource.model';
import { BookSchema } from 'src/models/book.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PhysicalItem', schema: PhysicalItemSchema },
      { name: 'Book', schema: BookSchema },
    ]),
  ],
  controllers: [PhysicalItemController],
  providers: [PhysicalItemService],
})
export class PhysicalItemModule {}
