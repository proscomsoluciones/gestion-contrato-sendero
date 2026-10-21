<?php

use App\Http\Controllers\SellerController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('sellers', SellerController::class)->except(['show']);
});
