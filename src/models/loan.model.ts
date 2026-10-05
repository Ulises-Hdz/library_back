import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE'
}

@Schema({ timestamps: true, versionKey: false })
export class Loan extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'PhysicalItem', required: true })
  physical_item_id: Types.ObjectId;

  @Prop({ required: true, default: Date.now })
  loanDate: Date;

  @Prop({ required: true })
  dueDate: Date; // Calculated by the system (e.g. +7 days)

  @Prop()
  returnDate: Date;

  @Prop({ type: String, enum: LoanStatus, default: LoanStatus.ACTIVE })
  status: LoanStatus;
}

export const LoanSchema = SchemaFactory.createForClass(Loan);