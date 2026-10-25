<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contract extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'contract_date',
        'first_name',
        'last_name',
        'rut',
        'address',
        'commune_id',
        'phone_1',
        'phone_2',
        'email',
        'marital_status',
        'occupation_status',
        'education',
        'last_address',
        'beneficiary_first_name',
        'beneficiary_last_name',
        'beneficiary_rut',
        'beneficiary_relationship',
        'transfer',
        'urn',
        'press_notice',
        'religious_service',
        'service_time',
        'hearse',
        'car_transport',
        'van_transport',
        'chapel',
        'burial_date',
        'burial_time',
        'burial_type',
        'cemetery',
        'registration_place',
        'status',
        'seller_id',
        'amount',
        'agreement_amount',
        'surcharge',
        'additional_charge',
        'down_payment',
        'mortuary_quota',
        'total',
        'is_installment_plan',
        'installments_count',
        'first_due_date',
        'institution',
        'observation',
        'pdf_path',
        'legacy_id',
    ];

    protected function casts(): array
    {
        return [
            'contract_date' => 'date:Y-m-d',
            'burial_date' => 'date:Y-m-d',
            'first_due_date' => 'date:Y-m-d',
            'is_installment_plan' => 'boolean',
            'installments_count' => 'integer',
        ];
    }

    public function commune()
    {
        return $this->belongsTo(Commune::class);
    }

    public function seller()
    {
        return $this->belongsTo(Seller::class);
    }

    public function installments()
    {
        return $this->hasMany(Installment::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }
}
