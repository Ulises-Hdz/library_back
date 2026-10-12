import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { ResourceDigitalService } from './resource-digital.service';
import type { UploadedFileData } from 'src/common/interfaces/uploaded-file.interface';
import { CreateDigitalResourceDto } from 'src/common/dto/digital-resource.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id.pipe';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UserRole } from 'src/models/user.model';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

@Controller('digital-resources')
@UseGuards(JwtAuthGuard)
export class ResourceDigitalController {
  constructor(private readonly resourceDigitalService: ResourceDigitalService) {}

  // POST /api/digital-resources (multipart/form-data: file, book_id, onlineReadOnly?)
  // Admin
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
    }),
  )
  create(
    @Body() createDto: CreateDigitalResourceDto,
    @UploadedFile() file: UploadedFileData,
  ) {
    if (!file) {
      throw new BadRequestException('The file (field "file") is required.');
    }
    return this.resourceDigitalService.create(createDto, file);
  }

  // GET /api/digital-resources/book/:bookId
  // Autenticado
  @Get('book/:bookId')
  async findByBook(
    @Param('bookId', ParseMongoIdPipe) bookId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, mimeType, fileName, readOnly } =
      await this.resourceDigitalService.getFileByBook(bookId);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `${readOnly ? 'inline' : 'attachment'}; filename="${fileName}"`,
      'Cache-Control': 'private, no-store',
    });
    return new StreamableFile(stream);
  }

  // DELETE /api/digital-resources/:id
  // Admin
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  remove(@Param('id', ParseMongoIdPipe) id: string) {
    return this.resourceDigitalService.remove(id);
  }
}
