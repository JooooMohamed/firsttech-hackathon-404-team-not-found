import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";

/**
 * Ensures staff can only access merchant routes for their own merchant.
 * Admins bypass this check.
 * Expects route param `:id` to be the merchantId.
 */
@Injectable()
export class MerchantOwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) throw new ForbiddenException("Access denied");

    // Admins can access any merchant
    if (user.roles?.includes("admin")) return true;

    const merchantIdParam = request.params?.id;
    if (merchantIdParam && user.merchantId !== merchantIdParam) {
      throw new ForbiddenException(
        "You can only access data for your own merchant",
      );
    }

    return true;
  }
}
