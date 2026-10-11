import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Model } from 'mongoose';
import { User, UserStatus } from 'src/models/user.model';
import { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectModel('User') private readonly userModel: Model<User>,
  ) {
    super({
      secretOrKey: configService.getOrThrow<string>('jwtSecret'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userModel.findById(payload.id);

    if (!user) throw new UnauthorizedException('Token refers to a non-existent user');
    if (user.status !== UserStatus.ACTIVE) throw new UnauthorizedException('User is not active');

    // Attached to `request.user` and consumed by RolesGuard / controllers.
    return { id: user._id, email: user.email, role: user.role };
  }
}
