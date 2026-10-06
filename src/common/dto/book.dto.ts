import { PaginationDto } from './pagination.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsUrl } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  publisher: string;

  @IsOptional()
  @IsNumber()
  publicationYear?: number;

  @IsArray()
  @IsString({ each: true })
  categories: string[];

  @IsOptional()
  @IsUrl()
  coverUrl?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateBookDto extends PartialType(CreateBookDto) {}

export class SearchBookDto extends PaginationDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  category?: string;
}
