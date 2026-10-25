import type { Commune } from '@/types/client';
import type { Installment } from '@/types/installment';
import type { Payment } from '@/types/payment';

export type Seller = {
    id: number;
    name: string;
};

export type Contract = {
    id: number;
    contract_date: string | null;

    first_name: string;
    last_name: string;
    rut: string;
    address: string | null;
    commune_id: number | null;
    commune: Commune | null;
    phone_1: string | null;
    phone_2: string | null;
    email: string | null;
    marital_status: string | null;
    occupation_status: string | null;
    education: string | null;
    last_address: string | null;

    beneficiary_first_name: string | null;
    beneficiary_last_name: string | null;
    beneficiary_rut: string | null;
    beneficiary_relationship: string | null;

    transfer: string | null;
    urn: string | null;
    press_notice: string | null;
    religious_service: string | null;
    service_time: string | null;
    hearse: string | null;
    car_transport: string | null;
    van_transport: string | null;
    chapel: string | null;
    burial_date: string | null;
    burial_time: string | null;
    burial_type: string | null;
    cemetery: string | null;
    registration_place: string | null;
    status: string | null;

    seller_id: number | null;
    seller: Seller | null;
    amount: number | null;
    agreement_amount: number | null;
    surcharge: number | null;
    additional_charge: number | null;
    down_payment: number | null;
    mortuary_quota: number | null;
    total: number | null;
    is_installment_plan: boolean | null;
    installments_count: number | null;
    first_due_date: string | null;
    institution: string | null;

    installments?: Installment[];
    payments?: Payment[];

    observation: string | null;
};
