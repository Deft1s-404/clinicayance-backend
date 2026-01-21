import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, PaypalTransaction } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import {
  NormalizedPaypalTransaction,
  PaypalTransactionsService
} from '../integrations/paypal-transactions.service';
import { PaypalOAuthService } from '../integrations/paypal-oauth.service';
import { PaypalSyncDto } from './dto/paypal-sync.dto';
import { PaypalTransactionsFilterDto } from './dto/paypal-transactions-filter.dto';
import { PaypalIncomingPaymentDto } from './dto/paypal-incoming-payment.dto';

const DEFAULT_PAGE_SIZE = 100;
const DEFAULT_MAX_PAGES = 10;
const LIST_DEFAULT_PAGE_SIZE = 50;

export interface PaypalSyncResult {
  imported: number;
  created: number;
  updated: number;
  processedPages: number;
  totalPages: number;
  startDate: string;
  endDate: string;
}

export interface PaypalTransactionsList {
  items: Array<PaypalTransaction & { client?: { id: string; name: string | null; email: string | null } | null }>;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface PaypalManualTokenResponse {
  accessToken: string;
  tokenType: string | null;
  expiresIn: number | null;
  scope: string | null;
}

@Injectable()
export class PaypalPaymentsService {
  private readonly logger = new Logger(PaypalPaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paypalTransactionsService: PaypalTransactionsService,
    private readonly paypalOAuthService: PaypalOAuthService
  ) {}

  async syncTransactions(userId: string, dto: PaypalSyncDto): Promise<PaypalSyncResult> {
    const pageSize = dto.pageSize ?? DEFAULT_PAGE_SIZE;
    const maxPages = dto.maxPages ?? DEFAULT_MAX_PAGES;
    let currentPage = 1;
    let totalPages = 0;
    let created = 0;
    let updated = 0;
    let imported = 0;

    do {
      const pageData = await this.paypalTransactionsService.listTransactions(userId, {
        startDate: dto.startDate,
        endDate: dto.endDate,
        transactionStatus: dto.transactionStatus,
        page: currentPage,
        pageSize
      });

      totalPages = pageData.summary.totalPages;
      const result = await this.persistBatch(userId, pageData.transactions);
      created += result.created;
      updated += result.updated;
      imported += result.processed;

      if (currentPage >= totalPages || currentPage >= maxPages) {
        break;
      }
      currentPage += 1;
    } while (true);

    await this.touchAccountSync(userId).catch((error) => {
      this.logger.warn(
        `Nao foi possivel atualizar o lastSyncedAt para a conta PayPal do usuario ${userId}: ${error instanceof Error ? error.message : String(error)}`
      );
    });

    return {
      imported,
      created,
      updated,
      processedPages: Math.min(currentPage, totalPages),
      totalPages,
      startDate: dto.startDate,
      endDate: dto.endDate
    };
  }

  async listStoredTransactions(
    userId: string,
    query: PaypalTransactionsFilterDto
  ): Promise<PaypalTransactionsList> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? LIST_DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * pageSize;

    const where: Prisma.PaypalTransactionWhereInput = {
      userId
    };

    if (query.transactionId) {
      where.transactionId = query.transactionId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.payerEmail) {
      where.payerEmail = {
        equals: query.payerEmail,
        mode: 'insensitive'
      };
    }

    if (query.startDate || query.endDate) {
      where.transactionDate = {};
      if (query.startDate) {
        (where.transactionDate as Prisma.DateTimeFilter).gte = new Date(query.startDate);
      }
      if (query.endDate) {
        (where.transactionDate as Prisma.DateTimeFilter).lte = new Date(query.endDate);
      }
    }

    const [items, totalItems] = await this.prisma.$transaction([
      this.prisma.paypalTransaction.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: [
          {
            transactionDate: 'desc'
          },
          {
            createdAt: 'desc'
          }
        ],
        skip,
        take: pageSize
      }),
      this.prisma.paypalTransaction.count({ where })
    ]);

    const totalPages = Math.ceil(totalItems / pageSize) || 1;

    return {
      items,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages
      }
    };
  }

  async getStoredTransaction(userId: string, id: string): Promise<PaypalTransaction> {
    const record = await this.prisma.paypalTransaction.findFirst({
      where: {
        id,
        userId
      },
      include: {
        client: true
      }
    });

    if (!record) {
      throw new NotFoundException('Transacao PayPal nao encontrada.');
    }

    return record;
  }

  async updateTransactionClient(
    userId: string,
    id: string,
    clientId: string | null
  ): Promise<PaypalTransaction> {
    const transaction = await this.prisma.paypalTransaction.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!transaction) {
      throw new NotFoundException('Transacao PayPal nao encontrada.');
    }

    let resolvedClientId: string | null = null;

    if (clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
        select: { id: true }
      });

      if (!client) {
        throw new NotFoundException('Cliente informado nao foi encontrado.');
      }

      resolvedClientId = client.id;
    }

    const updated = await this.prisma.paypalTransaction.update({
      where: { id: transaction.id },
      data: {
        clientId: resolvedClientId
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return updated;
  }

  async storeIncomingTransaction(body: PaypalIncomingPaymentDto): Promise<PaypalTransaction> {
    const account = await this.prisma.paypalAccount.findFirst({
      where: { merchantId: body.merchantId }
    });

    if (!account) {
      throw new NotFoundException('Conta PayPal nao encontrada para o merchantId informado.');
    }

    const resolvedClientId =
      (await this.resolveClientIdentifier(account.userId, body.clientId, body.clientEmail)) ?? null;

    const createData: Prisma.PaypalTransactionUncheckedCreateInput = {
      userId: account.userId,
      clientId: resolvedClientId,
      transactionId: body.transactionId,
      status: body.status ?? null,
      eventCode: null,
      referenceId: null,
      invoiceId: null,
      customField: null,
      transactionDate: this.parseDate(body.transactionDate ?? null),
      updatedDate: this.parseDate(body.updatedDate ?? null),
      currency: body.currency ?? null,
      grossAmount: this.normalizeAmount(this.parseIncomingAmount(body.grossAmount)),
      feeAmount: this.normalizeAmount(this.parseIncomingAmount(body.feeAmount)),
      netAmount: this.normalizeAmount(this.parseIncomingAmount(body.netAmount)),
      payerEmail: body.payerEmail ?? null,
      payerName: body.payerName ?? null,
      payerId: body.payerId ?? null,
      rawPayload: this.serializeRaw(
        typeof body.rawPayload === 'object' && body.rawPayload !== null ? body.rawPayload : undefined
      )
    };

    const updateData: Prisma.PaypalTransactionUncheckedUpdateInput = {
      clientId: resolvedClientId ?? undefined,
      status: createData.status,
      eventCode: createData.eventCode,
      referenceId: createData.referenceId,
      invoiceId: createData.invoiceId,
      customField: createData.customField,
      transactionDate: createData.transactionDate,
      updatedDate: createData.updatedDate,
      currency: createData.currency,
      grossAmount: createData.grossAmount,
      feeAmount: createData.feeAmount,
      netAmount: createData.netAmount,
      payerEmail: createData.payerEmail,
      payerName: createData.payerName,
      payerId: createData.payerId,
      rawPayload: createData.rawPayload
    };

    return this.prisma.paypalTransaction.upsert({
      where: {
        userId_transactionId: {
          userId: account.userId,
          transactionId: body.transactionId
        }
      },
      create: createData,
      update: updateData,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
  }

  async issueManualAccessToken(merchantId: string): Promise<PaypalManualTokenResponse> {
    const account = await this.prisma.paypalAccount.findFirst({
      where: { merchantId }
    });

    if (!account) {
      throw new NotFoundException('Conta PayPal nao encontrada para o merchantId informado.');
    }

    const manualCredentials = this.extractManualCredentials(account.rawTokens);

    if (!manualCredentials) {
      throw new NotFoundException('Esta conta nao possui credenciais manuais configuradas.');
    }

    const tokens = await this.paypalOAuthService.requestManualClientCredentialsToken(
      manualCredentials.clientId,
      manualCredentials.clientSecret
    );

    const expiresIn = typeof tokens.expires_in === 'number' ? tokens.expires_in : null;

    const existingRaw = this.parseRawObject(account.rawTokens) ?? {};

    await this.prisma.paypalAccount.update({
      where: { id: account.id },
      data: {
        accessToken: tokens.access_token,
        tokenType: tokens.token_type ?? account.tokenType,
        scope: tokens.scope ?? account.scope,
        expiresAt: this.computeManualExpiry(tokens.expires_in),
        rawTokens: this.serializeRaw({
          ...existingRaw,
          manualCredentials: manualCredentials,
          connectionType: 'manual',
          lastManualIssuedAt: new Date().toISOString()
        })
      }
    });

    return {
      accessToken: tokens.access_token,
      tokenType: tokens.token_type ?? null,
      expiresIn,
      scope: tokens.scope ?? null
    };
  }

  private async persistBatch(
    userId: string,
    transactions: NormalizedPaypalTransaction[]
  ): Promise<{ processed: number; created: number; updated: number }> {
    let created = 0;
    let updated = 0;
    let processed = 0;

    for (const transaction of transactions) {
      const transactionId = this.extractTransactionId(transaction);
      if (!transactionId) {
        this.logger.warn('Transacao PayPal ignorada pois nao possui transactionId ou referencia valida.');
        continue;
      }

      processed += 1;

      const existing = await this.prisma.paypalTransaction.findUnique({
        where: {
          userId_transactionId: {
            userId,
            transactionId
          }
        }
      });

      const clientId = await this.resolveClientId(transaction.payer.email);

      if (existing) {
        const updateData = this.buildUpdateData(clientId, transaction);
        await this.prisma.paypalTransaction.update({
          where: { id: existing.id },
          data: updateData
        });
        updated += 1;
      } else {
        const createData = this.buildCreateData(userId, clientId, transaction, transactionId);
        await this.prisma.paypalTransaction.create({
          data: createData
        });
        created += 1;
      }
    }

    return { processed, created, updated };
  }

  private async resolveClientId(email: string | null | undefined): Promise<string | null> {
    if (!email) {
      return null;
    }

    const client = await this.prisma.client.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      },
      select: {
        id: true
      }
    });

    return client?.id ?? null;
  }

  private buildCreateData(
    userId: string,
    clientId: string | null,
    transaction: NormalizedPaypalTransaction,
    transactionId: string
  ): Prisma.PaypalTransactionUncheckedCreateInput {
    return {
      userId,
      clientId,
      transactionId,
      status: transaction.transactionStatus ?? null,
      eventCode: transaction.transactionEventCode ?? null,
      referenceId: transaction.paypalReferenceId ?? null,
      invoiceId: transaction.invoiceId ?? null,
      customField: transaction.customField ?? null,
      transactionDate: this.parseDate(transaction.transactionInitiationDate),
      updatedDate: this.parseDate(transaction.transactionUpdatedDate),
      currency: transaction.transactionAmount.currency ?? null,
      grossAmount: this.normalizeAmount(transaction.transactionAmount.value),
      feeAmount: this.normalizeAmount(transaction.feeAmount.value),
      netAmount: this.normalizeAmount(transaction.netAmount.value),
      payerEmail: transaction.payer.email ?? null,
      payerName: transaction.payer.name ?? null,
      payerId: transaction.payer.payerId ?? null,
      rawPayload: this.serializeRaw(transaction.raw)
    };
  }

  private buildUpdateData(
    clientId: string | null,
    transaction: NormalizedPaypalTransaction
  ): Prisma.PaypalTransactionUncheckedUpdateInput {
    const data: Prisma.PaypalTransactionUncheckedUpdateInput = {
      status: transaction.transactionStatus ?? null,
      eventCode: transaction.transactionEventCode ?? null,
      referenceId: transaction.paypalReferenceId ?? null,
      invoiceId: transaction.invoiceId ?? null,
      customField: transaction.customField ?? null,
      transactionDate: this.parseDate(transaction.transactionInitiationDate),
      updatedDate: this.parseDate(transaction.transactionUpdatedDate),
      currency: transaction.transactionAmount.currency ?? null,
      grossAmount: this.normalizeAmount(transaction.transactionAmount.value),
      feeAmount: this.normalizeAmount(transaction.feeAmount.value),
      netAmount: this.normalizeAmount(transaction.netAmount.value),
      payerEmail: transaction.payer.email ?? null,
      payerName: transaction.payer.name ?? null,
      payerId: transaction.payer.payerId ?? null,
      rawPayload: this.serializeRaw(transaction.raw)
    };

    if (clientId) {
      data.clientId = clientId;
    }

    return data;
  }

  private async resolveClientIdentifier(
    userId: string,
    clientId?: string | null,
    clientEmail?: string | null
  ): Promise<string | null> {
    if (clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: clientId },
        select: { id: true }
      });

      if (client) {
        return client.id;
      }
    }

    if (clientEmail) {
      return this.resolveClientId(clientEmail);
    }

    return null;
  }

  private extractTransactionId(transaction: NormalizedPaypalTransaction): string | null {
    return transaction.transactionId ?? transaction.paypalReferenceId ?? null;
  }

  private parseDate(value: string | null): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private normalizeAmount(value: number | null): Prisma.Decimal | null {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return null;
    }

    return new Prisma.Decimal(value);
  }

  private serializeRaw(raw?: Record<string, unknown> | null): Prisma.InputJsonValue {
    if (!raw) {
      return {} as Prisma.JsonObject;
    }

    return JSON.parse(JSON.stringify(raw)) as Prisma.JsonObject;
  }

  private parseIncomingAmount(value?: number | null): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    return Number.isFinite(value) ? value : null;
  }

  private parseRawObject(raw: Prisma.JsonValue | null): Record<string, any> | null {
    if (!raw || typeof raw !== 'object') {
      return null;
    }

    return raw as Record<string, any>;
  }

  private computeManualExpiry(expiresIn?: number): Date | null {
    if (!expiresIn || expiresIn <= 0) {
      return null;
    }

    const skewMs = 60 * 1000;
    const expiresMs = Date.now() + expiresIn * 1000 - skewMs;
    return expiresMs > 0 ? new Date(expiresMs) : null;
  }

  private extractManualCredentials(
    rawTokens: Prisma.JsonValue | null
  ): { clientId: string; clientSecret: string } | null {
    const metadata = this.parseRawObject(rawTokens);

    if (!metadata) {
      return null;
    }

    const manualBlock =
      (metadata.manualCredentials as Record<string, any> | undefined) ?? (metadata as Record<string, any>);

    const clientId =
      typeof manualBlock?.clientId === 'string' && manualBlock.clientId.trim().length > 0
        ? manualBlock.clientId
        : typeof (metadata as any).manualClientId === 'string'
          ? (metadata as any).manualClientId
          : null;
    const clientSecret =
      typeof manualBlock?.clientSecret === 'string' && manualBlock.clientSecret.trim().length > 0
        ? manualBlock.clientSecret
        : typeof (metadata as any).manualClientSecret === 'string'
          ? (metadata as any).manualClientSecret
          : null;

    if (clientId && clientSecret) {
      return { clientId, clientSecret };
    }

    return null;
  }

  private async touchAccountSync(userId: string): Promise<void> {
    await this.prisma.paypalAccount.update({
      where: { userId },
      data: {
        lastSyncedAt: new Date()
      }
    });
  }
}
