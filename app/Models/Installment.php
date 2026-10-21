<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Installment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'contract_id',
        'legacy_contract_rut',
        'amount',
        'due_date',
        'status',
        'paid_at',
        'invoice_number',
        'legacy_id',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'float',
            'due_date' => 'date:Y-m-d',
            'paid_at' => 'date:Y-m-d',
        ];
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }
}
