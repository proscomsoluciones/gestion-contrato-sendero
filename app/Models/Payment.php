<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Payment extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'contract_id',
        'legacy_client_rut',
        'paid_at',
        'cash_amount',
        'card_amount',
        'check_amount',
        'total',
        'receipt_path',
        'status',
        'legacy_id',
    ];

    protected function casts(): array
    {
        return [
            'paid_at' => 'date:Y-m-d',
        ];
    }

    public function contract()
    {
        return $this->belongsTo(Contract::class);
    }
}
