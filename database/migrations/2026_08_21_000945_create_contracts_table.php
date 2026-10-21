<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->date('contract_date')->nullable();

            // Contratante
            $table->string('first_name');
            $table->string('last_name');
            $table->string('rut');
            $table->string('address')->nullable();
            $table->foreignId('commune_id')->nullable()->constrained('communes')->nullOnDelete();
            $table->string('phone_1')->nullable();
            $table->string('phone_2')->nullable();
            $table->string('email')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('occupation_status')->nullable();
            $table->string('education')->nullable();
            $table->string('last_address')->nullable();

            // Fallecido / beneficiario
            $table->string('beneficiary_first_name')->nullable();
            $table->string('beneficiary_last_name')->nullable();
            $table->string('beneficiary_rut')->nullable();
            $table->string('beneficiary_relationship')->nullable();

            // Servicio
            $table->string('transfer')->nullable();
            $table->string('urn')->nullable();
            $table->string('press_notice')->nullable();
            $table->string('religious_service')->nullable();
            $table->string('service_time')->nullable();
            $table->string('hearse')->nullable();
            $table->string('car_transport')->nullable();
            $table->string('van_transport')->nullable();
            $table->string('chapel')->nullable();
            $table->date('burial_date')->nullable();
            $table->string('burial_time')->nullable();
            $table->string('burial_type')->nullable();
            $table->string('cemetery')->nullable();
            $table->string('registration_place')->nullable();
            $table->string('status')->nullable();

            // Financiero
            $table->foreignId('seller_id')->nullable()->constrained('sellers')->nullOnDelete();
            $table->unsignedInteger('amount')->nullable();
            $table->unsignedInteger('agreement_amount')->nullable();
            $table->unsignedInteger('surcharge')->nullable();
            $table->unsignedInteger('additional_charge')->nullable();
            $table->unsignedInteger('down_payment')->nullable();
            $table->unsignedInteger('total')->nullable();
            $table->boolean('is_installment_plan')->nullable();
            $table->string('institution')->nullable();

            $table->text('observation')->nullable();
            $table->string('pdf_path')->nullable();

            // ID de la fila original en senderoo_funeraria.contratos, para reimportar sin duplicar
            $table->unsignedInteger('legacy_id')->nullable()->unique();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
