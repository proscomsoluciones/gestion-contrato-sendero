import type { PaymentContract } from '@/types/payment';

export type Installment = {
    id: number;
    contract_id: number | null;
    contract: PaymentContract | null;
    legacy_contract_rut: string | null;
    amount: number | null;
    due_date: string | null;
    status: string;
    paid_at: string | null;
    invoice_number: string | null;
    number?: number | null;
    total_count?: number | null;
};
