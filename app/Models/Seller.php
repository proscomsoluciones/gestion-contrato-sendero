<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Seller extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'legacy_id'];

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }
}
