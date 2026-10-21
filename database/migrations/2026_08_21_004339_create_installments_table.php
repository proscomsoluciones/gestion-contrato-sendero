<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->nullOnDelete();
            // RUT tal como está en el sistema legado, para los casos que no se pudieron
            // vincular a un contrato por diferencias de formato.
            $table->string('legacy_contract_rut')->nullable();
            $table->string('status')->nullable();
            $table->date('paid_at')->nullable();
            $table->string('invoice_number')->nullable();

            $table->unsignedInteger('legacy_id')->nullable()->unique();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('installments');
    }
};
