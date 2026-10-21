<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/clients.php';
require __DIR__.'/contracts.php';
require __DIR__.'/payments.php';
require __DIR__.'/installments.php';
require __DIR__.'/sellers.php';
require __DIR__.'/reports.php';
