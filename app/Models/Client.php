<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'rut',
        'first_name',
        'last_name',
        'address',
        'commune_id',
        'phone_1',
        'phone_2',
        'contact_first_name',
        'contact_last_name',
        'contact_rut',
        'contact_address',
        'contact_marital_status',
        'contact_education',
        'status',
        'urn',
        'includes_van',
        'includes_car',
        'amount',
        'contract_date',
        'payment_day',
        'installments_count',
        'legacy_id',
    ];

    protected function casts(): array
    {
        return [
            'includes_van' => 'boolean',
            'includes_car' => 'boolean',
            'contract_date' => 'date:Y-m-d',
        ];
    }

    public function commune()
    {
        return $this->belongsTo(Commune::class);
    }
}
