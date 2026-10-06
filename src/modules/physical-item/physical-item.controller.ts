import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PhysicalItemService } from './physical-item.service';
import {
  CreatePhysicalItemDto,
  UpdatePhysicalItemStatusDto,
} from 'src/common/dto/physical.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';

@Controller('physical-items')
export class PhysicalItemController {
  constructor(private readonly physicalItemService: PhysicalItemService) {}

  // POST /api/physical-items
  // Admin
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreatePhysicalItemDto) {
    return this.physicalItemService.create(createDto);
  }

  // GET /api/physical-items/book/:bookId
  // Autenticado
  @Get('book/:bookId')
  getAvailability(@Param('bookId', ParseMongoIdPipe) bookId: string) {
    return this.physicalItemService.getAvailability(bookId);
  }

  // PATCH /api/physical-items/:id/status
  // Admin
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateDto: UpdatePhysicalItemStatusDto,
  ) {
    return this.physicalItemService.updateStatus(id, updateDto);
  }
}
