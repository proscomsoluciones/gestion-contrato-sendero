<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Comprobante de Pago N° {{ $payment->id }} - Sendero Otoñal</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.5; padding: 24px; }
        .header { background: #3f461c; padding: 18px 24px; border-radius: 12px; text-align: center; margin-bottom: 20px; border-bottom: 4px solid #282d12; }
        .header h1 { font-size: 20px; color: #ffffff; text-transform: uppercase; margin: 0; font-weight: 900; letter-spacing: 0.5px; }
        .header p { margin: 3px 0; color: #d4db9e; font-size: 10px; font-weight: bold; }
        
        .badge-status { display: inline-block; padding: 4px 12px; background: #f5f7e9; color: #3f461c; border: 1.5px solid #d4db9e; border-radius: 16px; font-weight: 900; font-size: 10px; margin-top: 4px; text-transform: uppercase; }
        
        .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #ffffff; background: #3f461c; padding: 6px 10px; border-left: 4px solid #282d12; margin-top: 18px; margin-bottom: 8px; border-radius: 4px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 4px; margin-bottom: 12px; }
        td, th { padding: 7px 10px; border: 1px solid #e2e8f0; text-align: left; vertical-align: middle; }
        th { background: #f8fafc; color: #475569; font-size: 10px; text-transform: uppercase; font-weight: 800; width: 35%; }
        td { font-weight: 600; color: #0f172a; }
        
        .amount-col { text-align: right; font-family: Courier, monospace; font-weight: bold; }
        
        .total-card { background: #f5f7e9; border: 2px solid #d4db9e; padding: 14px 18px; border-radius: 12px; margin-top: 20px; text-align: right; }
        .total-card .label { font-size: 11px; font-weight: 900; color: #3f461c; text-transform: uppercase; }
        .total-card .amount { font-size: 20px; font-weight: 900; color: #3f461c; font-family: Courier, monospace; margin-top: 2px; }
        
        .signatures { margin-top: 50px; width: 100%; }
        .signatures td { border: none; text-align: center; vertical-align: bottom; width: 50%; padding-top: 30px; }
        .line { border-top: 1.5px dashed #94a3b8; width: 70%; margin: 0 auto 6px auto; }
        .sign-title { font-size: 10px; font-weight: bold; color: #475569; }
        
        .footer { text-align: center; margin-top: 35px; font-size: 9px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px; }
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
        <p style="color: #f3f7d4; font-size: 11px; font-weight: 900; text-transform: uppercase; margin-top: 4px;">
            COMPROBANTE OFICIAL DE INGRESO EN CAJA N.º {{ $payment->id }}
        </p>
        <p style="color: #d4db9e; font-size: 9px;">
            Fecha de Pago: {{ \Illuminate\Support\Carbon::parse($payment->paid_at)->format('d/m/Y') }}
        </p>
        <span class="badge-status">PAGO CONCILIADO EN CAJA</span>
    </div>

    <div class="section-title">1. Identificación del Cliente & Contrato</div>
    <table>
        <tr>
            <th>Contratante / Titular</th>
            <td>
                @if ($payment->contract)
                    {{ $payment->contract->first_name }} {{ $payment->contract->last_name }}
                @else
                    Cliente Registrado
                @endif
            </td>
        </tr>
        <tr>
            <th>RUT del Cliente</th>
            <td>{{ $payment->contract->rut ?? $payment->legacy_client_rut ?? 'Sin RUT' }}</td>
        </tr>
        <tr>
            <th>N.º de Contrato Asociado</th>
            <td>
                @if ($payment->contract_id)
                    Contrato N.º {{ $payment->contract_id }}
                @else
                    Sin Contrato Específico
                @endif
            </td>
        </tr>
    </table>

    <div class="section-title">2. Desglose por Método de Pago ($ CLP)</div>
    <table>
        <thead>
            <tr style="background: #f1f5f9;">
                <th style="width: 60%;">Método / Forma de Pago</th>
                <th style="text-align: right; width: 40%;">Monto Recaudado</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <th>EFECTIVO</th>
                <td class="amount-col">${{ number_format($payment->cash_amount ?? 0, 0, ',', '.') }} CLP</td>
            </tr>
            <tr>
                <th>TARJETA (DÉBITO / CRÉDITO)</th>
                <td class="amount-col">${{ number_format($payment->card_amount ?? 0, 0, ',', '.') }} CLP</td>
            </tr>
            <tr>
                <th>CHEQUE DOCUMENTADO</th>
                <td class="amount-col">${{ number_format($payment->check_amount ?? 0, 0, ',', '.') }} CLP</td>
            </tr>
        </tbody>
    </table>

    <div class="total-card">
        <div class="label">Total Recaudado e Ingresado en Caja:</div>
        <div class="amount">${{ number_format($payment->total ?? 0, 0, ',', '.') }} CLP</div>
    </div>

    <div class="signatures">
        <table>
            <tr>
                <td>
                    <div class="line"></div>
                    <div class="sign-title">Firma Cajero / Recepción de Fondos</div>
                    <div style="font-size: 9px; color: #64748b;">Sendero Otoñal — Caja Diaria</div>
                </td>
                <td>
                    <div class="line"></div>
                    <div class="sign-title">Firma del Titular / Cliente</div>
                    <div style="font-size: 9px; color: #64748b;">RUT: {{ $payment->contract->rut ?? $payment->legacy_client_rut ?? '—' }}</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Comprobante de Caja Electrónico • Sendero Otoñal • {{ date('Y') }} • Software diseñado por Proscom
    </div>
</body>
</html>
