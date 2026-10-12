import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateLoanDto, UpdateLoanDto } from 'src/common/dto/loan.dto';
import { Loan, LoanStatus } from 'src/models/loan.model';
import { PhysicalItem, ItemStatus } from 'src/models/physical-resource.model';
import { User } from 'src/models/user.model';

const LOAN_PERIOD_DAYS = 7;

@Injectable()
export class LoansService {
  constructor(
    @InjectModel('Loan') private readonly loanModel: Model<Loan>,
    @InjectModel('PhysicalItem')
    private readonly physicalItemModel: Model<PhysicalItem>,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {}

  async create(createLoanDto: CreateLoanDto) {
    const { user_id, physical_item_id } = createLoanDto;

    if (!(await this.userModel.exists({ _id: user_id }))) {
      throw new NotFoundException(`User with id "${user_id}" not found.`);
    }

    const item = await this.physicalItemModel.findById(physical_item_id);
    if (!item) {
      throw new NotFoundException(
        `Physical item with id "${physical_item_id}" not found.`,
      );
    }
    if (item.status !== ItemStatus.AVAILABLE) {
      throw new ConflictException(
        'This physical item is not available for loan.',
      );
    }

    try {
      const loanDate = new Date();
      const dueDate = new Date(loanDate);
      dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);

      const loan = await this.loanModel.create({
        user_id,
        physical_item_id,
        loanDate,
        dueDate,
        status: LoanStatus.ACTIVE,
      });

      item.status = ItemStatus.LOANED;
      await item.save();

      return loan;
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async findAll() {
    const loans = await this.loanModel.find();
    return loans.map((loan) => this.withComputedStatus(loan));
  }

  async findOne(id: string) {
    const loan = await this.findLoanOrFail(id);
    return this.withComputedStatus(loan);
  }

  async update(id: string, updateLoanDto: UpdateLoanDto) {
    const loan = await this.findLoanOrFail(id);

    if (loan.status === LoanStatus.RETURNED) {
      throw new ConflictException('A returned loan cannot be modified.');
    }

    if (
      updateLoanDto.user_id &&
      !(await this.userModel.exists({ _id: updateLoanDto.user_id }))
    ) {
      throw new NotFoundException(
        `User with id "${updateLoanDto.user_id}" not found.`,
      );
    }

    if (updateLoanDto.physical_item_id) {
      const item = await this.physicalItemModel.findById(
        updateLoanDto.physical_item_id,
      );
      if (!item) {
        throw new NotFoundException(
          `Physical item with id "${updateLoanDto.physical_item_id}" not found.`,
        );
      }
    }

    try {
      Object.assign(loan, updateLoanDto);
      await loan.save();
      return this.withComputedStatus(loan);
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  /** Registers the return of the book: closes the loan and frees the physical item. */
  async remove(id: string) {
    const loan = await this.findLoanOrFail(id);

    if (loan.status === LoanStatus.RETURNED) {
      throw new ConflictException('This loan was already returned.');
    }

    loan.status = LoanStatus.RETURNED;
    loan.returnDate = new Date();
    await loan.save();

    const item = await this.physicalItemModel.findById(loan.physical_item_id);
    if (item) {
      item.status = ItemStatus.AVAILABLE;
      await item.save();
    }

    return { message: 'Loan returned successfully.' };
  }

  private async findLoanOrFail(id: string) {
    const loan = await this.loanModel.findById(id);
    if (!loan) throw new NotFoundException(`Loan with id "${id}" not found.`);
    return loan;
  }

  /** Reports ACTIVE loans past their due date as OVERDUE without mutating the stored status. */
  private withComputedStatus(loan: Loan) {
    if (loan.status === LoanStatus.ACTIVE && loan.dueDate < new Date()) {
      return { ...loan.toObject(), status: LoanStatus.OVERDUE };
    }
    return loan;
  }

  private handleDbErrors(error: any): never {
    if (
      error instanceof NotFoundException ||
      error instanceof ConflictException
    ) {
      throw error;
    }
    if (error.name === 'CastError') {
      throw new BadRequestException('Invalid identifier provided.');
    }
    console.error(error);
    throw new InternalServerErrorException(
      'Unexpected error. Check the server logs.',
    );
  }
}
