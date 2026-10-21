export type Commune = {
    id: number;
    name: string;
};

export type Client = {
    id: number;
    rut: string;
    first_name: string;
    last_name: string;
    address: string | null;
    commune_id: number | null;
    commune: Commune | null;
    phone_1: string | null;
    phone_2: string | null;
    contact_first_name: string | null;
    contact_last_name: string | null;
    contact_rut: string | null;
    contact_address: string | null;
    contact_marital_status: string | null;
    contact_education: string | null;
    status: string | null;
    urn: string | null;
    includes_van: boolean;
    includes_car: boolean;
    amount: number | null;
    contract_date: string | null;
    payment_day: number | null;
    installments_count: number | null;
};
