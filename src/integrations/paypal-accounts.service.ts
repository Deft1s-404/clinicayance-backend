import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type PaypalAccountWithUser = Prisma.PaypalAccountGetPayload<{
  include: { user: { select: { id: true; name: true; email: true } } };
}>;

export interface PaypalAccountSummary {
  userId: string;
  userName: string | null;
  userEmail: string | null;
  merchantId: string | null;
  paypalPayerId: string | null;
  businessName: string | null;
  lastSyncedAt: Date | null;
  connected: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  tokenType: string | null;
  scope: string | null;
  expiresAt: Date | null;
  connectionType: string | null;
}

@Injectable()
export class PaypalAccountsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<PaypalAccountSummary[]> {
    const accounts = await this.prisma.paypalAccount.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return accounts.map((account) => this.toSummary(account));
  }

  async findByMerchantId(merchantId: string): Promise<PaypalAccountSummary> {
    const account = await this.prisma.paypalAccount.findFirst({
      where: {
        merchantId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!account) {
      throw new NotFoundException('Conta PayPal nao encontrada para este merchantId.');
    }

    return this.toSummary(account);
  }

  async findByUserId(userId: string): Promise<PaypalAccountSummary> {
    const account = await this.prisma.paypalAccount.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!account) {
      throw new NotFoundException('Usuario nao possui conta PayPal conectada.');
    }

    return this.toSummary(account);
  }

  private toSummary(account: PaypalAccountWithUser): PaypalAccountSummary {
    return {
      userId: account.user.id,
      userName: account.user.name ?? null,
      userEmail: account.user.email ?? null,
      merchantId: account.merchantId ?? null,
      paypalPayerId: account.paypalPayerId ?? null,
      businessName: account.businessName ?? null,
      lastSyncedAt: account.lastSyncedAt ?? null,
      connected: Boolean(
        account.accessToken &&
          (account.refreshToken !== null || this.resolveConnectionType(account) === 'manual')
      ),
      accessToken: account.accessToken ?? null,
      refreshToken: account.refreshToken ?? null,
      tokenType: account.tokenType ?? null,
      scope: account.scope ?? null,
      expiresAt: account.expiresAt ?? null,
      connectionType: this.resolveConnectionType(account)
    };
  }

  private resolveConnectionType(account: PaypalAccountWithUser): 'manual' | 'oauth' | null {
    const metadata = this.extractTokenMetadata(account.rawTokens);

    if (metadata?.connectionType === 'manual') {
      return 'manual';
    }

    if (metadata?.connectionType === 'oauth') {
      return 'oauth';
    }

    if (!account.refreshToken) {
      return 'manual';
    }

    return account.accessToken ? 'oauth' : null;
  }

  private extractTokenMetadata(rawTokens: Prisma.JsonValue | null): Record<string, any> | null {
    if (!rawTokens || typeof rawTokens !== 'object') {
      return null;
    }

    return rawTokens as Record<string, any>;
  }
}
