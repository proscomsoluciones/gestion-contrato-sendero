<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->nullOnDelete();
            // RUT tal como está en el sistema legado, para los casos que no se pudieron
            // vincular a un contrato por diferencias de formato.
            $table->string('legacy_client_rut')->nullable();
            $table->date('paid_at')->nullable();
            $table->unsignedInteger('cash_amount')->nullable();
            $table->unsignedInteger('card_amount')->nullable();
            $table->unsignedInteger('check_amount')->nullable();
            $table->unsignedInteger('total')->nullable();
            $table->string('receipt_path')->nullable();
            $table->string('status')->nullable();

            $table->unsignedInteger('legacy_id')->nullable()->unique();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
