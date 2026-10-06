import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateLoanDto {
  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @IsMongoId()
  @IsNotEmpty()
  physical_item_id: string;
}

export class UpdateLoanDto extends PartialType(CreateLoanDto) {}