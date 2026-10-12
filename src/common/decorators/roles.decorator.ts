import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/models/user.model';

export const ROLES_KEY = 'roles';

/**
 * Restricts a route to the given user roles.
 * Must be combined with `JwtAuthGuard` and `RolesGuard`.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
