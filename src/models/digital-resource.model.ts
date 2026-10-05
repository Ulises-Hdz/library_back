import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum DigitalFormat {
  PDF = 'PDF',
  EPUB = 'EPUB'
}

@Schema({ timestamps: true, versionKey: false })
export class DigitalResource extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true, unique: true })
  book_id: Types.ObjectId;

  @Prop({ required: true })
  fileUrl: string; // Secure path where the file is stored (S3 or local server)

  @Prop({ type: String, enum: DigitalFormat, required: true })
  format: DigitalFormat;

  @Prop()
  sizeMegabytes: number;

  @Prop({ default: true })
  onlineReadOnly: boolean; // If true, the student cannot download the file, only read it in the viewer
}

export const DigitalResourceSchema = SchemaFactory.createForClass(DigitalResource);