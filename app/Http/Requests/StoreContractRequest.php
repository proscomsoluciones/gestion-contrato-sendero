<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contract_date' => ['nullable', 'date'],

            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'rut' => ['required', 'string', 'max:20'],
            'address' => ['nullable', 'string', 'max:255'],
            'commune_id' => ['nullable', 'exists:communes,id'],
            'phone_1' => ['nullable', 'string', 'max:20'],
            'phone_2' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'marital_status' => ['nullable', 'string', 'max:100'],
            'occupation_status' => ['nullable', 'string', 'max:150'],
            'education' => ['nullable', 'string', 'max:100'],
            'last_address' => ['nullable', 'string', 'max:255'],

            'beneficiary_first_name' => ['nullable', 'string', 'max:255'],
            'beneficiary_last_name' => ['nullable', 'string', 'max:255'],
            'beneficiary_rut' => ['nullable', 'string', 'max:20'],
            'beneficiary_relationship' => ['nullable', 'string', 'max:100'],

            'transfer' => ['nullable', 'string', 'max:150'],
            'urn' => ['nullable', 'string', 'max:150'],
            'press_notice' => ['nullable', 'string', 'max:150'],
            'religious_service' => ['nullable', 'string', 'max:150'],
            'service_time' => ['nullable', 'string', 'max:50'],
            'hearse' => ['nullable', 'string', 'max:150'],
            'car_transport' => ['nullable', 'string', 'max:100'],
            'van_transport' => ['nullable', 'string', 'max:100'],
            'chapel' => ['nullable', 'string', 'max:150'],
            'burial_date' => ['nullable', 'date'],
            'burial_time' => ['nullable', 'string', 'max:50'],
            'burial_type' => ['nullable', 'string', 'max:100'],
            'cemetery' => ['nullable', 'string', 'max:150'],
            'registration_place' => ['nullable', 'string', 'max:150'],
            'status' => ['nullable', 'string', 'max:100'],

            'seller_id' => ['nullable', 'exists:sellers,id'],
            'amount' => ['nullable', 'integer', 'min:0'],
            'agreement_amount' => ['nullable', 'integer', 'min:0'],
            'surcharge' => ['nullable', 'integer', 'min:0'],
            'additional_charge' => ['nullable', 'integer', 'min:0'],
            'down_payment' => ['nullable', 'integer', 'min:0'],
            'mortuary_quota' => ['nullable', 'integer', 'min:0'],
            'total' => ['nullable', 'integer', 'min:0'],
            'is_installment_plan' => ['boolean'],
            'installments_count' => ['nullable', 'integer', 'min:1', 'max:120'],
            'first_due_date' => ['nullable', 'date'],
            'institution' => ['nullable', 'string', 'max:255'],

            'observation' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
