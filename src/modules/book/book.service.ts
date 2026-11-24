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
import { asMongoError } from 'src/common/utils/db-error';
import {
  CreateBookDto,
  SearchBookDto,
  UpdateBookDto,
} from 'src/common/dto/book.dto';
import { PhysicalItem, ItemStatus } from 'src/models/physical-resource.model';
import { DigitalResource } from 'src/models/digital-resource.model';
import { access, mkdir, rename, unlink } from 'fs/promises';
import { constants, createReadStream } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { UPLOAD_DIR } from '../resource-digital/resource-digital.service';
import type { UploadedFileData } from 'src/common/interfaces/uploaded-file.interface';

export const COVER_UPLOAD_DIR = join(process.cwd(), 'uploads', 'covers');

@Injectable()
export class BookService {
  constructor(
    @InjectModel('Book') private readonly booksModel: Model<Book>,
    @InjectModel('PhysicalItem')
    private readonly physicalItemModel: Model<PhysicalItem>,
    @InjectModel('DigitalResource')
    private readonly digitalResourceModel: Model<DigitalResource>,
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
    try {
      const { limit = 10, offset = 0, title, author, category } = searchDto;
      const filter: Record<string, unknown> = {};
      if (title) filter.title = this.regex(title);
      if (author) filter.author = this.regex(author);
      if (category) filter.categories = this.regex(category);

      return await this.booksModel
        .find(filter)
        .sort({ title: 1, _id: 1 })
        .skip(offset)
        .limit(limit);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBError(error);
    }
  }

  /** Books with physical stock and digital availability in three queries (no per-book requests). */
  async findInventory() {
    const [books, stock, digital] = await Promise.all([
      this.booksModel.find().sort({ title: 1, _id: 1 }).lean(),
      this.physicalItemModel.aggregate<{
        _id: unknown;
        total: number;
        available: number;
      }>([
        {
          $group: {
            _id: '$book_id',
            total: { $sum: 1 },
            available: {
              $sum: {
                $cond: [{ $eq: ['$status', ItemStatus.AVAILABLE] }, 1, 0],
              },
            },
          },
        },
      ]),
      this.digitalResourceModel.find().select('book_id').lean(),
    ]);

    const stockByBook = new Map(stock.map((s) => [String(s._id), s]));
    const digitalIds = new Set(digital.map((d) => String(d.book_id)));

    return books.map((book) => {
      const s = stockByBook.get(String(book._id));
      return {
        ...book,
        stock: { total: s?.total ?? 0, available: s?.available ?? 0 },
        digital: digitalIds.has(String(book._id)),
      };
    });
  }

  private regex(text: string) {
    return {
      $regex: text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      $options: 'i',
    };
  }

  async findOne(id: string) {
    try {
      const book = await this.booksModel.findById(id);

      if (!book) {
        throw new NotFoundException(`Book with id "${id}" not found.`);
      }

      return book;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.handleDBError(error);
    }
  }

  async update(id: string, updateBookDto: UpdateBookDto) {
    try {
      const book = await this.booksModel.findByIdAndUpdate(id, updateBookDto, {
        new: true,
      });
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
    try {
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
      await this.physicalItemModel.deleteMany({ book_id: book._id });
      const digital = await this.digitalResourceModel.findOneAndDelete({
        book_id: book._id,
      });
      if (digital) {
        await unlink(join(UPLOAD_DIR, digital.fileUrl)).catch(() => undefined);
      }
      await unlink(join(COVER_UPLOAD_DIR, `${id}.webp`)).catch(() => undefined);
      await book.deleteOne();
      return { message: `Book "${book.title}" deleted successfully.` };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      )
        throw error;
      this.handleDBError(error);
    }
  }

  async upload(bookId: string, file: UploadedFileData, baseUrl: string) {
    if (!file) {
      throw new BadRequestException('The file is required.');
    }

    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPG, PNG, or WEBP images are allowed.',
      );
    }

    const ext = file.originalname.split('.').pop()?.toLowerCase() || '';
    const allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    if (!allowedExts.includes(ext)) {
      throw new BadRequestException('Invalid file extension.');
    }

    const book = await this.booksModel.findById(bookId);
    if (!book) {
      throw new NotFoundException(`Book with id "${bookId}" not found.`);
    }

    const sharp = await import('sharp');

    await mkdir(COVER_UPLOAD_DIR, { recursive: true });

    const filename = `${bookId}.webp`;
    const filepath = join(COVER_UPLOAD_DIR, filename);
    const temporaryPath = join(COVER_UPLOAD_DIR, `${randomUUID()}.tmp.webp`);

    try {
      await sharp
        .default(file.buffer)
        .resize(300, 450, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: 80 })
        .toFile(temporaryPath);
    } catch (error) {
      await unlink(temporaryPath).catch(() => undefined);
      console.error('Error processing cover:', error);
      throw new BadRequestException('Error processing image.');
    }

    await rename(temporaryPath, filepath).catch(async (error) => {
      await unlink(temporaryPath).catch(() => undefined);
      throw error;
    });

    const coverUrl = `${baseUrl.replace(/\/+$/, '')}/api/books/${bookId}/cover`;
    book.coverUrl = coverUrl;
    await book.save();

    return { coverUrl };
  }

  async getCover(bookId: string) {
    const filepath = join(COVER_UPLOAD_DIR, `${bookId}.webp`);

    try {
      await access(filepath, constants.R_OK);
    } catch {
      throw new NotFoundException(`Book "${bookId}" has no cover.`);
    }

    return createReadStream(filepath);
  }

  private handleDBError(error: unknown): never {
    const { code, keyValue = {} } = asMongoError(error);
    if (code === 11000) {
      const field = Object.keys(keyValue)[0];
      throw new BadRequestException(
        `A book with that ${field} already exists: "${String(keyValue[field])}".`,
      );
    }
    console.error(error);
    throw new InternalServerErrorException(
      'Unexpected error. Check the server logs.',
    );
  }
}
