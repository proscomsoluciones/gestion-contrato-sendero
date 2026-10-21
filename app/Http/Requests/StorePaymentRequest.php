<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'contract_id' => ['nullable', 'exists:contracts,id'],
            'paid_at' => ['required', 'date'],
            'cash_amount' => ['nullable', 'integer', 'min:0'],
            'card_amount' => ['nullable', 'integer', 'min:0'],
            'check_amount' => ['nullable', 'integer', 'min:0'],
            'total' => ['nullable', 'integer', 'min:0'],
            'status' => ['nullable', 'string', 'max:100'],
        ];
    }
}
