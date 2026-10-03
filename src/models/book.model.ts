import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true, unique: true })
  isbn: string;

  @Prop({ required: true, index: true }) // Indexed for the search engine
  title: string;

  @Prop({ required: true, index: true })
  author: string;

  @Prop({ required: true })
  publisher: string;

  @Prop()
  publicationYear: number;

  @Prop({ type: [String], index: true }) // E.g. ['Programming', 'Databases']
  categories: string[];

  @Prop()
  coverUrl: string; // Cover image URL

  @Prop()
  description: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);