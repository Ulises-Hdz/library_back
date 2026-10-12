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
} from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto, SearchBookDto, UpdateBookDto } from 'src/common/dto/book.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/models/user.model';

@Controller('books')
@UseGuards(JwtAuthGuard)
export class BookController {
  constructor(private readonly bookService: BookService) {}

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

  // GET /api/books/:id
  // Authenticated
  @Get(':id')
  findOne(@Param('id', ParseMongoIdPipe) id: string) {
    return this.bookService.findOne(id);
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
}
