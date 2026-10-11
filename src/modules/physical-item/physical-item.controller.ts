import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PhysicalItemService } from './physical-item.service';
import {
  CreatePhysicalItemDto,
  UpdatePhysicalItemStatusDto,
} from 'src/common/dto/physical.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/models/user.model';

@Controller('physical-items')
@UseGuards(JwtAuthGuard)
export class PhysicalItemController {
  constructor(private readonly physicalItemService: PhysicalItemService) {}

  // POST /api/physical-items
  // Admin
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
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
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateDto: UpdatePhysicalItemStatusDto,
  ) {
    return this.physicalItemService.updateStatus(id, updateDto);
  }
}
