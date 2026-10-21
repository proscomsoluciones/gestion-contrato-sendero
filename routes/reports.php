<?php

use App\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('reports/export', [ReportController::class, 'export'])->name('reports.export');
    Route::get('reports/export/excel', [ReportController::class, 'exportExcel'])->name('reports.exportExcel');
    Route::get('reports/export/pdf', [ReportController::class, 'exportPdf'])->name('reports.exportPdf');
});
