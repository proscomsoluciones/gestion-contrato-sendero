<?php

use App\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('payments', PaymentController::class)->except(['show']);
    Route::get('payments/{payment}/receipt', [PaymentController::class, 'downloadReceipt'])->name('payments.receipt');
});
