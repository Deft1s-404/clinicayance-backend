import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IntegrationKeyGuard implements CanActivate {
  private readonly headerName = 'x-integration-key';

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const providedKey =
      request.headers?.[this.headerName] ||
      request.headers?.[this.headerName.toUpperCase()];

    const expectedKey = this.configService.get<string>('INTEGRATIONS_API_KEY');

    if (!expectedKey) {
      throw new UnauthorizedException(
        'INTEGRATIONS_API_KEY nao configurado no servidor.'
      );
    }

    if (!providedKey || providedKey !== expectedKey) {
      throw new UnauthorizedException('Chave de integracao invalida.');
    }

    return true;
  }
}
