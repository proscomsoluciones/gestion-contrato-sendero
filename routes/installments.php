<?php

use App\Http\Controllers\InstallmentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('installments', InstallmentController::class)->except(['show']);
});
