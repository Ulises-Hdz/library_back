import { UserRole } from 'src/models/user.model';

export interface JwtPayload {
  id: string;
  role: UserRole;
}
