<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->unsignedSmallInteger('installments_count')->nullable()->after('is_installment_plan');
            $table->date('first_due_date')->nullable()->after('installments_count');
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn(['installments_count', 'first_due_date']);
        });
    }
};
