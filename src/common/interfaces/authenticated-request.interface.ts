import type { Request } from 'express';
import type { UserRole } from 'src/models/user.model';

/** Shape attached to `request.user` by JwtStrategy.validate(). */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
}

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
