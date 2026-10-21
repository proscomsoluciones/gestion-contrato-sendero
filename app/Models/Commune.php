<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Commune extends Model
{
    public $timestamps = false;

    protected $fillable = ['name'];

    public function clients()
    {
        return $this->hasMany(Client::class);
    }

    public function contracts()
    {
        return $this->hasMany(Contract::class);
    }
}
