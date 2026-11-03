import {
  IsNotEmpty,
  IsMongoId,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateLoanDto {
  @IsMongoId()
  @IsNotEmpty()
  user_id: string;

  @IsMongoId()
  @IsNotEmpty()
  physical_item_id: string;
}

// Only the due date can change: reassigning user or item would break stock consistency.
export class UpdateLoanDto {
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
