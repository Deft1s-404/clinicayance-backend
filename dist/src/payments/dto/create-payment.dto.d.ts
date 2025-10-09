import { PaymentStatus } from '@prisma/client';
export declare class CreatePaymentDto {
    appointmentId: string;
    value: number;
    method: string;
    status?: PaymentStatus;
    pixTxid?: string;
    comprovanteUrl?: string;
}
