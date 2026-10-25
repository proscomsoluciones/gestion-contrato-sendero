<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Contrato N° {{ $contract->id }} - {{ $contract->rut }}</title>
    <style>
        body { font-family: Helvetica, Arial, sans-serif; font-size: 11px; color: #1e293b; line-height: 1.5; padding: 20px; }
        .header { background: #3f461c; padding: 18px 24px; border-radius: 12px; text-align: center; margin-bottom: 20px; border-bottom: 4px solid #282d12; }
        .header h1 { font-size: 18px; color: #ffffff; text-transform: uppercase; margin: 0; font-weight: 900; }
        .header p { margin: 2px 0; color: #d4db9e; font-size: 10px; font-weight: bold; }
        .badge { display: inline-block; padding: 4px 10px; background: #f5f7e9; color: #3f461c; border: 1px solid #d4db9e; border-radius: 12px; font-weight: bold; font-size: 10px; text-transform: uppercase; }
        
        .section-title { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #ffffff; background: #3f461c; padding: 6px 10px; border-left: 4px solid #282d12; margin-top: 16px; margin-bottom: 8px; border-radius: 4px; }
        
        table { width: 100%; border-collapse: collapse; margin-top: 4px; margin-bottom: 12px; }
        td, th { padding: 6px 10px; border: 1px solid #e2e8f0; text-align: left; vertical-align: top; }
        th { background: #f8fafc; color: #475569; font-size: 10px; text-transform: uppercase; font-weight: 800; width: 35%; }
        td { font-weight: 600; }
        
        .total-box { background: #f5f7e9; border: 1.5px solid #d4db9e; padding: 10px 14px; border-radius: 8px; margin-top: 16px; text-align: right; }
        .total-box .amount { font-size: 16px; font-weight: 900; color: #3f461c; }
        
        .signatures { margin-top: 50px; width: 100%; page-break-inside: avoid; }
        .signatures td { border: none; text-align: center; vertical-align: bottom; width: 50%; padding-top: 40px; }
        .line { border-top: 1.5px dashed #94a3b8; width: 70%; margin: 0 auto 6px auto; }
        .sign-title { font-size: 10px; font-weight: bold; color: #475569; }
        .footer { text-align: center; margin-top: 30px; font-size: 9px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 10px; }
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
            CONTRATO DE SERVICIOS INTEGRALES N.º {{ $contract->id }}
        </p>
        <p style="color: #d4db9e; font-size: 9px;">
            Fecha de Emisión: {{ $contract->contract_date ? \Illuminate\Support\Carbon::parse($contract->contract_date)->format('d/m/Y') : date('d/m/Y') }}
        </p>
    </div>

    <div class="section-title">1. Identificación del Titular / Contratante</div>
    <table>
        <tr>
            <th>Nombre Completo</th>
            <td>{{ $contract->first_name }} {{ $contract->last_name }}</td>
        </tr>
        <tr>
            <th>RUT Titular</th>
            <td>{{ $contract->rut }}</td>
        </tr>
        <tr>
            <th>Dirección Residencial</th>
            <td>{{ $contract->address ?? 'No especificada' }}</td>
        </tr>
        <tr>
            <th>Comuna</th>
            <td>{{ $contract->commune?->name ?? 'Santiago' }}</td>
        </tr>
        <tr>
            <th>Teléfonos de Contacto</th>
            <td>{{ $contract->phone_1 }} {{ $contract->phone_2 ? ' / ' . $contract->phone_2 : '' }}</td>
        </tr>
    </table>

    <div class="section-title">2. Identificación del Beneficiario</div>
    <table>
        <tr>
            <th>Nombre Beneficiario</th>
            <td>
                @if ($contract->beneficiary_first_name || $contract->beneficiary_last_name)
                    {{ $contract->beneficiary_first_name }} {{ $contract->beneficiary_last_name }}
                @else
                    Mismo Titular / Sin Especificar
                @endif
            </td>
        </tr>
    </table>

    <div class="section-title">3. Detalle Financiero & Modalidad de Pago</div>
    <table>
        <tr>
            <th>Modalidad de Pago</th>
            <td>
                <span class="badge">
                    {{ $contract->is_installment_plan ? 'Pago en Cuotas' : 'Pago en su Totalidad (Al Contado)' }}
                </span>
            </td>
        </tr>
        <tr>
            <th>Vendedor Asignado</th>
            <td>{{ $contract->seller?->name ?? 'Oficina Central' }}</td>
        </tr>
        @if ($contract->amount)
        <tr>
            <th>Valor Servicio Base</th>
            <td>${{ number_format($contract->amount, 0, ',', '.') }} CLP</td>
        </tr>
        @endif
        @if ($contract->agreement_amount)
        <tr>
            <th>Descuento / Convenio</th>
            <td>-${{ number_format($contract->agreement_amount, 0, ',', '.') }} CLP</td>
        </tr>
        @endif
        @if ($contract->surcharge || $contract->additional_charge)
        <tr>
            <th>Recargos Adicionales</th>
            <td>+${{ number_format(($contract->surcharge ?? 0) + ($contract->additional_charge ?? 0), 0, ',', '.') }} CLP</td>
        </tr>
        @endif
        <tr>
            <th>Valor Total del Contrato</th>
            <td class="amount" style="font-weight: 900; color: #3f461c;">${{ number_format($contract->total ?? 0, 0, ',', '.') }} CLP</td>
        </tr>
        @if ($contract->down_payment)
        <tr>
            <th>Pie / Abono Inicial</th>
            <td style="color: #166534; font-weight: 700;">${{ number_format($contract->down_payment, 0, ',', '.') }} CLP</td>
        </tr>
        @endif
        @if ($contract->mortuary_quota)
        <tr>
            <th>Cuota Mortuoria</th>
            <td style="color: #166534; font-weight: 700;">${{ number_format($contract->mortuary_quota, 0, ',', '.') }} CLP</td>
        </tr>
        @endif
        @php
            $totalPayments = ($contract->payments ? $contract->payments->sum('total') : 0) + ($contract->down_payment ?? 0);
            // La cuota mortuoria se descuenta del saldo igual que en ContractController::generateInstallments
            $pendingBalance = max(0, ($contract->total ?? 0) - $totalPayments - ($contract->mortuary_quota ?? 0));
        @endphp
        @if ($totalPayments > 0 || $contract->mortuary_quota)
        <tr>
            <th>Total Abonos / Pagos Realizados</th>
            <td style="color: #15803d; font-weight: 700;">${{ number_format($totalPayments, 0, ',', '.') }} CLP</td>
        </tr>
        <tr>
            <th>Saldo Pendiente de Pago</th>
            <td style="color: {{ $pendingBalance > 0 ? '#b91c1c' : '#166534' }}; font-weight: 900;">
                ${{ number_format($pendingBalance, 0, ',', '.') }} CLP
                @if ($pendingBalance == 0)
                    (PAGADO EN SU TOTALIDAD)
                @endif
            </td>
        </tr>
        @endif
    </table>

    @php $sectionNum = 4; @endphp

    @if ($contract->is_installment_plan || ($contract->installments && $contract->installments->count() > 0))
    <div class="section-title">{{ $sectionNum }}. Calendario y Fechas de Pago de Cuotas</div>
    @php $sectionNum++; @endphp
    @if ($contract->installments && $contract->installments->count() > 0)
    <table style="margin-top: 6px;">
        <thead>
            <tr style="background: #f1f5f9;">
                <th style="width: 15%; text-align: center;">N.º Cuota</th>
                <th style="width: 35%; text-align: center;">Fecha de Pago / Vencimiento</th>
                <th style="width: 25%; text-align: right;">Monto Cuota</th>
                <th style="width: 25%; text-align: center;">Estado</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($contract->installments as $index => $installment)
            <tr>
                <td style="text-align: center; font-weight: bold;">Cuota {{ $index + 1 }}</td>
                <td style="text-align: center;">
                    @if ($installment->due_date)
                        {{ \Illuminate\Support\Carbon::parse($installment->due_date)->format('d/m/Y') }}
                    @elseif ($installment->paid_at)
                        {{ \Illuminate\Support\Carbon::parse($installment->paid_at)->format('d/m/Y') }}
                    @else
                        Por definir
                    @endif
                </td>
                <td style="text-align: right; font-weight: bold;">${{ number_format($installment->amount ?? 0, 0, ',', '.') }} CLP</td>
                <td style="text-align: center;">
                    @if (strtolower((string)$installment->status) === 'pagada' || strtolower((string)$installment->status) === 'pagado' || $installment->paid_at)
                        <span style="color: #166534; font-weight: bold;">PAGADA</span>
                    @else
                        <span style="color: #c2410c; font-weight: bold;">{{ strtoupper($installment->status ?? 'PENDIENTE') }}</span>
                    @endif
                </td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @else
    <p style="font-size: 10px; color: #475569; font-style: italic; margin: 4px 0 12px 0;">
        Modalidad de pago configurada en cuotas. El detalle con las fechas especificadas de vencimiento de cada cuota se emite en el anexo de cuotas.
    </p>
    @endif
    @endif

    @if (($contract->payments && $contract->payments->count() > 0) || $contract->down_payment)
    <div class="section-title">{{ $sectionNum }}. Detalle de Abonos y Pagos Efectuados</div>
    @php $sectionNum++; @endphp
    <table style="margin-top: 6px;">
        <thead>
            <tr style="background: #f1f5f9;">
                <th style="width: 20%; text-align: center;">Fecha</th>
                <th style="width: 50%;">Detalle / Forma de Pago</th>
                <th style="width: 30%; text-align: right;">Monto Abono</th>
            </tr>
        </thead>
        <tbody>
            @if ($contract->down_payment)
            <tr>
                <td style="text-align: center;">{{ $contract->contract_date ? \Illuminate\Support\Carbon::parse($contract->contract_date)->format('d/m/Y') : date('d/m/Y') }}</td>
                <td>Abono Inicial / Pie de Contrato</td>
                <td style="text-align: right; font-weight: bold; color: #166534;">${{ number_format($contract->down_payment, 0, ',', '.') }} CLP</td>
            </tr>
            @endif
            @if ($contract->payments)
            @foreach ($contract->payments as $payment)
            <tr>
                <td style="text-align: center;">
                    {{ $payment->paid_at ? \Illuminate\Support\Carbon::parse($payment->paid_at)->format('d/m/Y') : 'N/A' }}
                </td>
                <td>
                    Abono en caja
                    @php
                        $methods = [];
                        if ($payment->cash_amount > 0) $methods[] = 'Efectivo';
                        if ($payment->card_amount > 0) $methods[] = 'Tarjeta';
                        if ($payment->check_amount > 0) $methods[] = 'Cheque';
                    @endphp
                    @if (count($methods) > 0)
                        ({{ implode(', ', $methods) }})
                    @endif
                </td>
                <td style="text-align: right; font-weight: bold; color: #166534;">${{ number_format($payment->total ?? 0, 0, ',', '.') }} CLP</td>
            </tr>
            @endforeach
            @endif
        </tbody>
    </table>
    @endif

    <div class="signatures">
        <table>
            <tr>
                <td>
                    <div class="line"></div>
                    <div class="sign-title">Firma del Titular / Contratante</div>
                    <div style="font-size: 9px; color: #64748b;">RUT: {{ $contract->rut }}</div>
                </td>
                <td>
                    <div class="line"></div>
                    <div class="sign-title">Firma Representante Sendero Otoñal</div>
                    <div style="font-size: 9px; color: #64748b;">Gestión Ejecutiva</div>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Documento oficial emitido por Sendero Otoñal • {{ date('Y') }} • Software diseñado por Proscom
    </div>
</body>
</html>
