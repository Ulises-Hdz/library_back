import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { createReadStream } from 'fs';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import type { UploadedFileData } from 'src/common/interfaces/uploaded-file.interface';
import { CreateDigitalResourceDto } from 'src/common/dto/digital-resource.dto';
import {
  DigitalFormat,
  DigitalResource,
} from 'src/models/digital-resource.model';
import { Book } from 'src/models/book.model';

const UPLOAD_DIR = join(process.cwd(), 'uploads', 'digital-resources');

const FORMATS: Record<string, { format: DigitalFormat; mime: string }> = {
  '.pdf': { format: DigitalFormat.PDF, mime: 'application/pdf' },
  '.epub': { format: DigitalFormat.EPUB, mime: 'application/epub+zip' },
};

@Injectable()
export class ResourceDigitalService {
  constructor(
    @InjectModel('DigitalResource')
    private readonly digitalResourceModel: Model<DigitalResource>,
    @InjectModel('Book') private readonly bookModel: Model<Book>,
  ) {}

  async create(dto: CreateDigitalResourceDto, file: UploadedFileData) {
    const ext = extname(file.originalname).toLowerCase();
    const format = FORMATS[ext];
    if (!format) {
      throw new BadRequestException('Only PDF or EPUB files are allowed.');
    }
    if (!this.hasValidSignature(file.buffer, format.format)) {
      throw new BadRequestException(
        'The file content does not match its format.',
      );
    }

    if (!(await this.bookModel.exists({ _id: dto.book_id }))) {
      throw new NotFoundException(`Book with id "${dto.book_id}" not found.`);
    }
    if (await this.digitalResourceModel.exists({ book_id: dto.book_id })) {
      throw new ConflictException('This book already has a digital resource.');
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    const storedName = `${randomUUID()}${ext}`;
    await writeFile(join(UPLOAD_DIR, storedName), file.buffer);

    try {
      return await this.digitalResourceModel.create({
        book_id: dto.book_id,
        fileUrl: storedName,
        format: format.format,
        sizeMegabytes: +(file.size / (1024 * 1024)).toFixed(2),
        onlineReadOnly: dto.onlineReadOnly ?? true,
      });
    } catch (error) {
      await unlink(join(UPLOAD_DIR, storedName)).catch(() => undefined);
      throw error;
    }
  }

  async getFileByBook(bookId: string) {
    const resource = await this.digitalResourceModel.findOne({ book_id: bookId });
    if (!resource) {
      throw new NotFoundException(
        `Book "${bookId}" has no digital resource.`,
      );
    }
    const ext = extname(resource.fileUrl).toLowerCase();
    return {
      stream: createReadStream(join(UPLOAD_DIR, resource.fileUrl)),
      mimeType: FORMATS[ext].mime,
      fileName: `${bookId}${ext}`,
      readOnly: resource.onlineReadOnly,
    };
  }

  async remove(id: string) {
    const resource = await this.digitalResourceModel.findById(id);
    if (!resource) {
      throw new NotFoundException(`Digital resource "${id}" not found.`);
    }
    await resource.deleteOne();
    await unlink(join(UPLOAD_DIR, resource.fileUrl)).catch(() => undefined);
    return { message: 'Digital resource deleted successfully.' };
  }

  private hasValidSignature(buffer: Buffer, format: DigitalFormat) {
    const magic = format === DigitalFormat.PDF ? '%PDF' : 'PK\u0003\u0004';
    return buffer.subarray(0, 4).toString('latin1') === magic;
  }
}
