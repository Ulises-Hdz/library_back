import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto, SearchBookDto, UpdateBookDto } from 'src/common/dto/book.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Controller('books')
export class BookController {
  constructor(private readonly bookService: BookService) {}

  // POST /api/books
  // Admin
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createBookDto: CreateBookDto) {
    return this.bookService.create(createBookDto);
  }

  // GET /api/books?title=x&author=y&category=z&limit=10&offset=0
  @Get()
  findAll(@Query() searchDto: SearchBookDto) {
    return this.bookService.findAll(searchDto);
  }

  // GET /api/books/:id  
  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.bookService.findOne(id);
  }

  // PUT /api/books/:id
  // Admin
  @Patch(':id')
  update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.bookService.update(id, updateBookDto);
  }

  // DELETE /api/books/:id
  // Admin
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.bookService.remove(id);
  }
}
