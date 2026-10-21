<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Reporte Consolidado de Pagos - Sendero Otoñal</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 10px; color: #1e293b; line-height: 1.4; padding: 15px; }
        .header { background: #3f461c; padding: 18px 20px; border-radius: 12px; text-align: center; margin-bottom: 18px; border-bottom: 4px solid #282d12; }
        .header h1 { font-size: 18px; color: #ffffff; text-transform: uppercase; margin: 0; font-weight: 900; letter-spacing: 0.5px; }
        .header p { margin: 2px 0; color: #d4db9e; font-size: 9px; font-weight: bold; }
        
        .kpi-container { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        .kpi-box { width: 25%; padding: 8px; border: 1px solid #cbd5e1; background: #fcfdfe; border-radius: 6px; text-align: center; }
        .kpi-title { font-size: 8px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
        .kpi-value { font-size: 12px; font-weight: 900; color: #3f461c; font-family: Courier, monospace; }

        table.data-table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 9px; }
        table.data-table td, table.data-table th { padding: 6px 8px; border: 1px solid #e2e8f0; text-align: left; }
        table.data-table th { background: #3f461c; color: #ffffff; font-size: 8px; text-transform: uppercase; font-weight: 800; }
        
        .num-col { text-align: right; font-family: Courier, monospace; font-weight: bold; }
        .total-row { background: #f5f7e9; font-weight: bold; }
        .total-row td { border-top: 2px solid #3f461c; font-weight: 900; color: #3f461c; }

        .footer { text-align: center; margin-top: 20px; font-size: 8px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 8px; }
    </style>
</head>
<body>
    @php
        $logoPath = public_path('images/logo.png');
        $logoBase64 = file_exists($logoPath) ? 'data:image/png;base64,' . base64_encode(file_get_contents($logoPath)) : null;
    @endphp

    <div class="header">
        @if ($logoBase64)
            <img src="{{ $logoBase64 }}" style="max-height: 85px; margin-bottom: 6px;" alt="Sendero Otoñal" />
        @else
            <h1>Sendero Otoñal</h1>
        @endif
        <p style="font-size: 11px; font-weight: 900; color: #f3f7d4; margin-top: 4px; text-transform: uppercase;">
            REPORTE CONSOLIDADO DE PAGOS & LIBROS CONTABLES
        </p>
        <p style="color: #d4db9e; font-size: 9px;">
            Rango de Fechas: <strong>{{ $from && $to ? \Illuminate\Support\Carbon::parse($from)->format('d/m/Y') . ' al ' . \Illuminate\Support\Carbon::parse($to)->format('d/m/Y') : 'Histórico Completo' }}</strong>
        </p>
    </div>

    @if ($totals)
    <table class="kpi-container">
        <tr>
            <td class="kpi-box">
                <div class="kpi-title">TOTAL RECAUDADO</div>
                <div class="kpi-value">${{ number_format($totals->total ?? 0, 0, ',', '.') }}</div>
            </td>
            <td class="kpi-box">
                <div class="kpi-title">EFECTIVO CAJA</div>
                <div class="kpi-value" style="color: #1e293b;">${{ number_format($totals->cash ?? 0, 0, ',', '.') }}</div>
            </td>
            <td class="kpi-box">
                <div class="kpi-title">TARJETAS / PAC</div>
                <div class="kpi-value" style="color: #1d4ed8;">${{ number_format($totals->card ?? 0, 0, ',', '.') }}</div>
            </td>
            <td class="kpi-box">
                <div class="kpi-title">CHEQUES</div>
                <div class="kpi-value" style="color: #b45309;">${{ number_format($totals->check_amount ?? 0, 0, ',', '.') }}</div>
            </td>
        </tr>
    </table>
    @endif

    <table class="data-table">
        <thead>
            <tr>
                <th style="width: 8%;">N.º</th>
                <th style="width: 12%;">FECHA</th>
                <th style="width: 16%;">RUT</th>
                <th style="width: 24%;">CONTRATANTE / CLIENTE</th>
                <th style="width: 10%; text-align: right;">EFECTIVO</th>
                <th style="width: 10%; text-align: right;">TARJETA</th>
                <th style="width: 10%; text-align: right;">CHEQUE</th>
                <th style="width: 10%; text-align: right;">TOTAL</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($payments as $payment)
            <tr>
                <td style="font-family: Courier, monospace; font-weight: bold;">#{{ $payment->id }}</td>
                <td>{{ \Illuminate\Support\Carbon::parse($payment->paid_at)->format('d/m/Y') }}</td>
                <td style="font-family: Courier, monospace;">{{ $payment->contract->rut ?? $payment->legacy_client_rut ?? '—' }}</td>
                <td>
                    @if ($payment->contract)
                        {{ $payment->contract->first_name }} {{ $payment->contract->last_name }}
                    @else
                        Cliente Registrado
                    @endif
                </td>
                <td class="num-col">${{ number_format($payment->cash_amount ?? 0, 0, ',', '.') }}</td>
                <td class="num-col" style="color: #1d4ed8;">${{ number_format($payment->card_amount ?? 0, 0, ',', '.') }}</td>
                <td class="num-col" style="color: #b45309;">${{ number_format($payment->check_amount ?? 0, 0, ',', '.') }}</td>
                <td class="num-col" style="color: #3f461c; font-weight: 900;">${{ number_format($payment->total ?? 0, 0, ',', '.') }}</td>
            </tr>
            @endforeach
        </tbody>
        @if ($totals)
        <tfoot>
            <tr class="total-row">
                <td colspan="4" style="text-align: left; text-transform: uppercase;">TOTALES CONSOLIDADOS ({{ $totals->count }} PAGOS):</td>
                <td class="num-col">${{ number_format($totals->cash ?? 0, 0, ',', '.') }}</td>
                <td class="num-col">${{ number_format($totals->card ?? 0, 0, ',', '.') }}</td>
                <td class="num-col">${{ number_format($totals->check_amount ?? 0, 0, ',', '.') }}</td>
                <td class="num-col" style="font-size: 11px; color: #3f461c; font-weight: 900;">${{ number_format($totals->total ?? 0, 0, ',', '.') }}</td>
            </tr>
        </tfoot>
        @endif
    </table>

    <div class="footer">
        Documento Oficial de Rendición y Cuadratura • Sendero Otoñal • Generado el {{ date('d/m/Y H:i') }}
    </div>
</body>
</html>
