<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        $from = $request->string('from')->trim()->toString();
        $to = $request->string('to')->trim()->toString();

        $query = Payment::query()->with('contract');

        // Solo filtrar por rango si ambas fechas están presentes
        if ($from !== '' && $to !== '') {
            $query->whereBetween('paid_at', [$from, $to]);
        }

        $payments = (clone $query)
            ->orderByDesc('paid_at')
            ->orderByDesc('id')
            ->paginate(50)
            ->withQueryString();

        $totals = (clone $query)
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(cash_amount), 0) as cash, COALESCE(SUM(card_amount), 0) as card, COALESCE(SUM(check_amount), 0) as check_amount, COALESCE(SUM(total), 0) as total')
            ->first();

        return Inertia::render('reports/index', [
            'payments' => $payments,
            'totals' => $totals,
            'filters' => ['from' => $from, 'to' => $to],
        ]);
    }

    public function export(Request $request)
    {
        return $this->exportExcel($request);
    }

    public function exportExcel(Request $request): StreamedResponse
    {
        ini_set('memory_limit', '1024M');
        set_time_limit(300);

        $from = $request->string('from')->trim()->toString();
        $to = $request->string('to')->trim()->toString();

        $filename = "reporte-pagos-" . ($from && $to ? "{$from}-a-{$to}" : "historico") . ".xlsx";

        return response()->streamDownload(function () use ($from, $to) {
            $handle = fopen('php://output', 'w');

            // BOM para que Excel detecte UTF-8 correctamente.
            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, ['N° Comprobante', 'RUT', 'Nombres', 'Apellidos', 'Efectivo CLP', 'Tarjeta CLP', 'Cheque CLP', 'Total Recaudado CLP', 'Fecha de Pago', 'Estado']);

            $query = Payment::query()->with('contract');
            if ($from !== '' && $to !== '') {
                $query->whereBetween('paid_at', [$from, $to]);
            }

            $query->orderByDesc('paid_at')->orderByDesc('id')->chunk(200, function ($payments) use ($handle) {
                foreach ($payments as $payment) {
                    fputcsv($handle, [
                        $payment->id,
                        $payment->contract->rut ?? $payment->legacy_client_rut,
                        $payment->contract->first_name ?? '',
                        $payment->contract->last_name ?? '',
                        $payment->cash_amount ?? 0,
                        $payment->card_amount ?? 0,
                        $payment->check_amount ?? 0,
                        $payment->total ?? 0,
                        $payment->paid_at,
                        $payment->status ?? 'ACTIVO PARA CUADRATURA',
                    ]);
                }
            });

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'application/vnd.ms-excel',
        ]);
    }

    public function exportPdf(Request $request)
    {
        ini_set('memory_limit', '1024M');
        set_time_limit(300);

        $from = $request->string('from')->trim()->toString();
        $to = $request->string('to')->trim()->toString();

        $query = Payment::query()->with('contract');

        if ($from !== '' && $to !== '') {
            $query->whereBetween('paid_at', [$from, $to]);
        }

        $payments = (clone $query)->orderByDesc('paid_at')->orderByDesc('id')->get();
        $totals = (clone $query)
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(cash_amount), 0) as cash, COALESCE(SUM(card_amount), 0) as card, COALESCE(SUM(check_amount), 0) as check_amount, COALESCE(SUM(total), 0) as total')
            ->first();

        $pdf = Pdf::loadView('reports.pdf', [
            'payments' => $payments,
            'totals' => $totals,
            'from' => $from,
            'to' => $to,
        ])->setPaper('letter', 'portrait');

        $filename = "reporte-pagos-" . ($from && $to ? "{$from}-a-{$to}" : "historico") . ".pdf";

        return $pdf->stream($filename);
    }
}
