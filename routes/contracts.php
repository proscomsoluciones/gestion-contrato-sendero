<?php

use App\Http\Controllers\ContractController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('contracts/search', [ContractController::class, 'search'])->name('contracts.search');
    Route::resource('contracts', ContractController::class)->except(['show']);
    Route::get('contracts/{contract}/pdf', [ContractController::class, 'downloadPdf'])->name('contracts.pdf');
});
