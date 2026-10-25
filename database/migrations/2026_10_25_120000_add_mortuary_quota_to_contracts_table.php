<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            // Cuota mortuoria (AFP/IPS): monto variable y opcional que se descuenta del saldo a financiar
            $table->unsignedInteger('mortuary_quota')->nullable()->after('down_payment');
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn('mortuary_quota');
        });
    }
};
