import {
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsIn,
} from 'class-validator';
import { ItemStatus } from 'src/models/physical-resource.model';

export class CreatePhysicalItemDto {
  @IsMongoId()
  @IsNotEmpty()
  book_id: string;

  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsOptional()
  @IsString()
  shelfLocation?: string;
}

// LOANED is managed by the loans module, never assigned manually
export class UpdatePhysicalItemStatusDto {
  @IsIn([
    ItemStatus.AVAILABLE,
    ItemStatus.LOST,
    ItemStatus.IN_REPAIR,
  ])
  status: ItemStatus;
}
