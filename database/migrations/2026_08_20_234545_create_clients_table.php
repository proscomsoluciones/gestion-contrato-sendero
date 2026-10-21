<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('rut')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('address')->nullable();
            $table->foreignId('commune_id')->nullable()->constrained('communes')->nullOnDelete();
            $table->string('phone_1')->nullable();
            $table->string('phone_2')->nullable();

            // Persona de contacto / responsable del plan
            $table->string('contact_first_name')->nullable();
            $table->string('contact_last_name')->nullable();
            $table->string('contact_rut')->nullable();
            $table->string('contact_address')->nullable();
            $table->string('contact_marital_status')->nullable();
            $table->string('contact_education')->nullable();

            $table->string('status')->nullable();
            $table->string('urn')->nullable();
            $table->boolean('includes_van')->default(false);
            $table->boolean('includes_car')->default(false);
            $table->unsignedInteger('amount')->nullable();
            $table->date('contract_date')->nullable();
            $table->unsignedTinyInteger('payment_day')->nullable();
            $table->unsignedSmallInteger('installments_count')->nullable();

            // ID de la fila original en senderoo_funeraria.clientes, para reimportar sin duplicar
            $table->unsignedInteger('legacy_id')->nullable()->unique();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
