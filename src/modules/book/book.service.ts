import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book } from 'src/models/book.model';
import { CreateBookDto, SearchBookDto, UpdateBookDto } from 'src/common/dto/book.dto';
import { PhysicalItem, ItemStatus } from 'src/models/physical-resource.model';

@Injectable()
export class BookService {
  constructor(
    @InjectModel('Book') private readonly booksModel: Model<Book>,
    @InjectModel('PhysicalItem') private readonly physicalItemModel: Model<PhysicalItem>,
  ) {}

  async create(createBookDto: CreateBookDto) {
    try {
      const book = await this.booksModel.create(createBookDto);
      return book;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async findAll(searchDto: SearchBookDto) {
    const { limit = 10, offset = 0, title, author, category } = searchDto;
    const filter: Record<string, unknown> = {};
    if (title) filter.title = this.regex(title);
    if (author) filter.author = this.regex(author);
    if (category) filter.categories = this.regex(category);

    return this.booksModel
      .find(filter)
      .skip(offset)
      .limit(limit)
  }

  private regex(text: string) {
    return { $regex: text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  }

  async findOne(id: string) { 
    try {
      const book = await this.booksModel.findById(id);
  
      if (!book) {
        throw new NotFoundException(
          `Book with id "${id}" not found.`,
        );
      }
  
      return book;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBError(error);
    }
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    try {
      const book = await this.booksModel.findByIdAndUpdate(
        id,
        updateBookDto,
        { new: true },
      );
      if (!book) {
        throw new NotFoundException(`Book with id "${id}" not found.`);
      }
      return book;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBError(error);
    }
  }

  async remove(id: string) {
    const book = await this.findOne(id);
    const loaned = await this.physicalItemModel.countDocuments({
      book_id: book._id,
      status: ItemStatus.LOANED,
    });
    if (loaned > 0) {
      throw new ConflictException(
        'The book cannot be deleted: it has active loans.',
      );
    }
    await book.deleteOne();
    return { message: `Book "${book.title}" deleted successfully.` };
  }

  private handleDBError(error: any): never {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      throw new BadRequestException(
        `A book with that ${field} already exists: "${error.keyValue[field]}".`,
      );
    }
    console.error(error);
    throw new InternalServerErrorException(
      'Unexpected error. Check the server logs.',
    );
  }
}
