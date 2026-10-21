export type PaymentContract = {
    id: number;
    rut: string;
    first_name: string;
    last_name: string;
};

export type Payment = {
    id: number;
    contract_id: number | null;
    contract: PaymentContract | null;
    paid_at: string | null;
    cash_amount: number | null;
    card_amount: number | null;
    check_amount: number | null;
    total: number | null;
    receipt_path: string | null;
    status: string | null;
};
