import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum ItemStatus {
  AVAILABLE = 'AVAILABLE',
  LOANED = 'LOANED',
  LOST = 'LOST',
  IN_REPAIR = 'IN_REPAIR',
}

@Schema({ timestamps: true })
export class PhysicalItem extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  book_id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  barcode: string; // Label attached to the physical book

  @Prop({ type: String, enum: ItemStatus, default: ItemStatus.AVAILABLE })
  status: ItemStatus;

  @Prop()
  shelfLocation: string;
}

export const PhysicalItemSchema = SchemaFactory.createForClass(PhysicalItem);