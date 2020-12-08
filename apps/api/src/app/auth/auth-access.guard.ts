import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { createParamDecorator } from '@nestjs/common';

export const IsLoggedIn = createParamDecorator((_data, req) => {
  return req.authorized;
});

@Injectable()
export class AuthAccessGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = this.getRequest(context);
    try {
      const result = (await super.canActivate(context)) as boolean;
      request.authorized = true;
      return result;
    } catch {}
    return false;
  }

  getRequest(context: ExecutionContext) {
    return context.switchToHttp().getRequest();
  }
}
