import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { BookService } from './book.service';
import {
  CreateBookDto,
  SearchBookDto,
  UpdateBookDto,
} from 'src/common/dto/book.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/models/user.model';
import { Public } from 'src/common/decorators/public.decorator';
import type { UploadedFileData } from 'src/common/interfaces/uploaded-file.interface';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BookController {
  constructor(
    private readonly bookService: BookService,
    private readonly configService: ConfigService,
  ) {}

  // POST /api/books
  // Admin
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  // GET /api/books?title=x&author=y&category=z&limit=10&offset=0
  // Authenticated
  @Get()
  findAll(@Query() searchDto: SearchBookDto) {
    return this.bookService.findAll(searchDto);
  }

  // GET /api/books/inventory
  // Admin
  @Get('inventory')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  findInventory() {
    return this.bookService.findInventory();
  }

  // GET /api/books/:id
  // Authenticated
  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.bookService.findOne(id);
  }

  // GET /api/books/:id/cover
  // Public
  @Public()
  @Get(':id/cover')
  async getCover(
    @Param('id', ParseMongoIdPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const stream = await this.bookService.getCover(id);
    res.type('image/webp');
    res.set('Cache-Control', 'public, max-age=3600');
    return new StreamableFile(stream);
  }

  // PATCH /api/books/:id
  // Admin
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.bookService.update(id, updateBookDto);
  }

  // DELETE /api/books/:id
  // Admin
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.bookService.remove(id);
  }

  // POST /api/books/:id/cover (multipart/form-data: file)
  // Admin
  @Post(':id/cover')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  uploadCover(
    @Param('id', ParseMongoIdPipe) id: string,
    @UploadedFile() file: UploadedFileData,
    @Req() req: Request,
  ) {
    if (!file) {
      throw new BadRequestException('The file is required.');
    }
    const configuredBaseUrl = this.configService.get<string>('baseUrl');
    const host = req.get('host');
    if (!configuredBaseUrl && !host) {
      throw new BadRequestException('The request host is required.');
    }
    const baseUrl =
      configuredBaseUrl?.replace(/\/+$/, '') ?? `${req.protocol}://${host}`;
    return this.bookService.upload(id, file, baseUrl);
  }
}
