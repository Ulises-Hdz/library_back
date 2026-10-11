import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from 'src/common/dto/user.dto';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import { User, UserRole } from 'src/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Public sign-up. Always creates a STUDENT account; the role is never
   * taken from the client to prevent self-promotion to ADMIN.
   */
  register(createUserDto: CreateUserDto) {
    return this.createUser(createUserDto, UserRole.STUDENT);
  }

  /**
   * Creates an ADMIN account. Must only be reachable by an authenticated ADMIN
   * (protect the controller route with JwtAuthGuard + RolesGuard).
   */
  create(createUserDto: CreateUserDto) {
    return this.createUser(createUserDto, UserRole.ADMIN);
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: this.toSafeUser(user),
      token: this.getJwtToken({ id: user._id.toString(), role: user.role }),
    };
  }

  async findAll() {
    const users = await this.userModel.find();
    return users.map((user) => this.toSafeUser(user));
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return this.toSafeUser(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...rest } = updateUserDto;

    const updateData: Record<string, any> = { ...rest };
    if (password) updateData.password = bcrypt.hashSync(password, 10);

    try {
      const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true });
      if (!user) throw new NotFoundException(`User with id ${id} not found`);

      return this.toSafeUser(user);
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  async remove(id: string) {
    const user = await this.userModel.findByIdAndDelete(id);
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    return this.toSafeUser(user);
  }

  private async createUser(createUserDto: CreateUserDto, role: UserRole) {
    const { password, ...userData } = createUserDto;

    try {
      const user = await this.userModel.create({
        ...userData,
        role,
        password: bcrypt.hashSync(password, 10),
      });

      return {
        user: this.toSafeUser(user),
        token: this.getJwtToken({ id: user._id.toString(), role: user.role }),
      };
    } catch (error) {
      this.handleDbErrors(error);
    }
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  /** Strips the password hash before returning a user document to the client. */
  private toSafeUser(user: User) {
    const { password, ...safeUser } = user.toObject();
    return safeUser;
  }

  private handleDbErrors(error: any): never {
    if (error.code === 11000) {
      throw new BadRequestException(`User already exists with that email`);
    }

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }
}
