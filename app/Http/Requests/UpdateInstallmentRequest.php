<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInstallmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contract_id' => ['nullable', 'exists:contracts,id'],
            'legacy_contract_rut' => ['nullable', 'string', 'max:50'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'due_date' => ['nullable', 'date'],
            'status' => ['required', 'string', 'max:100'],
            'paid_at' => ['nullable', 'date'],
            'invoice_number' => ['nullable', 'string', 'max:50'],
        ];
    }
}
