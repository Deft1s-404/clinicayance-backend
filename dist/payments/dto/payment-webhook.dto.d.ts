import { PaymentStatus } from '@prisma/client';
export declare class PaymentWebhookDto {
    pixTxid: string;
    amount?: number;
    status?: PaymentStatus;
}
