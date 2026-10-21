<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'rut' => ['required', 'string', 'max:20', 'unique:clients,rut'],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'commune_id' => ['nullable', 'exists:communes,id'],
            'phone_1' => ['nullable', 'string', 'max:20'],
            'phone_2' => ['nullable', 'string', 'max:20'],
            'contact_first_name' => ['nullable', 'string', 'max:255'],
            'contact_last_name' => ['nullable', 'string', 'max:255'],
            'contact_rut' => ['nullable', 'string', 'max:20'],
            'contact_address' => ['nullable', 'string', 'max:255'],
            'contact_marital_status' => ['nullable', 'string', 'max:50'],
            'contact_education' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'max:100'],
            'urn' => ['nullable', 'string', 'max:100'],
            'includes_van' => ['boolean'],
            'includes_car' => ['boolean'],
            'amount' => ['nullable', 'integer', 'min:0'],
            'contract_date' => ['nullable', 'date'],
            'payment_day' => ['nullable', 'integer', 'between:1,31'],
            'installments_count' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
