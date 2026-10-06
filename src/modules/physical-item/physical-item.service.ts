import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreatePhysicalItemDto,
  UpdatePhysicalItemStatusDto,
} from 'src/common/dto/physical.dto';
import {
  PhysicalItem,
  ItemStatus,
} from 'src/models/physical-resource.model';
import { Book } from 'src/models/book.model';

@Injectable()
export class PhysicalItemService {
  constructor(
    @InjectModel('PhysicalItem')
    private readonly physicalItemModel: Model<PhysicalItem>,
    @InjectModel('Book') private readonly bookModel: Model<Book>,
  ) {}

  async create(dto: CreatePhysicalItemDto) {
    if (!(await this.bookModel.exists({ _id: dto.book_id }))) {
      throw new NotFoundException(`Book with id "${dto.book_id}" not found.`);
    }
    try {
      return await this.physicalItemModel.create(dto);
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          `A physical item with barcode "${dto.barcode}" already exists.`,
        );
      }
      console.error(error);
      throw new InternalServerErrorException(
        'Unexpected error. Check the server logs.',
      );
    }
  }

  async getAvailability(bookId: string) {
    if (!(await this.bookModel.exists({ _id: bookId }))) {
      throw new NotFoundException(`Book with id "${bookId}" not found.`);
    }
    const items = await this.physicalItemModel
      .find({ book_id: bookId })
      .select('status');

    const byStatus: Record<string, number> = {};
    for (const status of Object.values(ItemStatus)) byStatus[status] = 0;
    for (const item of items) byStatus[item.status]++;

    return {
      book_id: bookId,
      total: items.length,
      available: byStatus[ItemStatus.AVAILABLE],
      byStatus,
    };
  }

  async updateStatus(id: string, dto: UpdatePhysicalItemStatusDto) {
    const item = await this.physicalItemModel.findById(id);
    if (!item) {
      throw new NotFoundException(`Physical item with id "${id}" not found.`);
    }
    if (item.status === ItemStatus.LOANED) {
      throw new ConflictException(
        'The item is on loan; its status changes when the return is registered.',
      );
    }
    item.status = dto.status;
    return item.save();
  }
}
