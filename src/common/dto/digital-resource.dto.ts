import { Transform } from 'class-transformer';
import { IsBoolean, IsMongoId, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateDigitalResourceDto {
  @IsMongoId()
  @IsNotEmpty()
  book_id: string;

  // Multipart sends strings; with implicit conversion "false" would become true
  @IsOptional()
  @Transform(({ obj }: { obj: Record<string, unknown> }) =>
    obj.onlineReadOnly === 'true' || obj.onlineReadOnly === true,
  )
  @IsBoolean()
  onlineReadOnly?: boolean;
}
