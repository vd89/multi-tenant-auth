import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Request } from 'express';
import { TenantContext } from 'src/types/express';

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
}

// Use the TenantContext type from express.d.ts
interface RequestWithUser extends Request {
  user?: JwtPayload;
  tenantContext?: TenantContext;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const result = await super.canActivate(context);

      if (typeof result === 'boolean' && result) {
        const payload = request.user;

        if (payload) {
          // const userId = payload.sub;
          // const email = payload.email;
          // const tenantId = payload.tenantId;

          const tenantContext = request.tenantContext;
          if (tenantContext?.tenantId && tenantContext.tenantId !== payload.tenantId) {
            throw new UnauthorizedException('Tenant mismatch: Token does not match tenant context');
          }
        }
      }

      return typeof result === 'boolean' ? result : false;
    } catch (error: unknown) {
      throw new UnauthorizedException(
        'Invalid token',
        error instanceof Error ? { cause: error } : undefined,
      );
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader || typeof authHeader !== 'string') {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' && token ? token : undefined;
  }
}
