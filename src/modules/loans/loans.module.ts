import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoansService } from './loans.service';
import { LoansController } from './loans.controller';
import { LoanSchema } from 'src/models/loan.model';
import { PhysicalItemSchema } from 'src/models/physical-resource.model';
import { UserSchema } from 'src/models/user.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Loan', schema: LoanSchema },
      { name: 'PhysicalItem', schema: PhysicalItemSchema },
      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [LoansController],
  providers: [LoansService],
})
export class LoansModule {}
