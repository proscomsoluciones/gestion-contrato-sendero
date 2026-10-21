import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import payments from '@/routes/payments';
import reports from '@/routes/reports';
import type { Payment } from '@/types/payment';

type PaginationLink = { url: string | null; label: string; active: boolean };

type Paginated<T> = {
    data: T[];
    total?: number;
    links: PaginationLink[];
};

type Totals = {
    count: number;
    cash: number | null;
    card: number | null;
    check_amount: number | null;
    total: number | null;
};

function toTitleCase(str?: string | null) {
    if (!str) return '—';
    return str
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getInitials(firstName?: string | null, lastName?: string | null) {
    const f = firstName ? firstName.trim().charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.trim().charAt(0).toUpperCase() : '';
    return (f + l) || 'RP';
}

function formatAmount(value: number | null) {
    if (value === null || value === undefined || isNaN(value)) return '$0';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
}

function formatDate(value: string | null) {
    if (!value) return '—';
    const parts = value.split('-');
    if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);
        if (year && month && day) {
            return new Intl.DateTimeFormat('es-CL').format(new Date(year, month - 1, day));
        }
    }
    return value;
}

export default function ReportsIndex({
    payments: paginatedPayments,
    totals,
    filters,
}: {
    payments: Paginated<Payment> | null;
    totals: Totals | null;
    filters: { from: string; to: string };
}) {
    const [from, setFrom] = useState(filters.from ?? '');
    const [to, setTo] = useState(filters.to ?? '');

    function submit(e: React.FormEvent) {
        e.preventDefault();
        router.get(reports.index().url, { from, to }, { preserveState: true });
    }

    function clearFilter() {
        setFrom('');
        setTo('');
        router.get(reports.index().url, {}, { preserveState: true });
    }

    function setThisMonthPreset() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        setFrom(start);
        setTo(end);
        router.get(reports.index().url, { from: start, to: end }, { preserveState: true });
    }

    function setLastMonthPreset() {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        setFrom(start);
        setTo(end);
        router.get(reports.index().url, { from: start, to: end }, { preserveState: true });
    }

    function setYear2026Preset() {
        setFrom('2026-01-01');
        setTo('2026-12-31');
        router.get(reports.index().url, { from: '2026-01-01', to: '2026-12-31' }, { preserveState: true });
    }

    const inputClass = "w-full rounded-xl border-2 border-slate-200 bg-white px-3.5 py-2.5 text-xs font-black text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs cursor-pointer";
    const labelClass = "text-[11px] font-black uppercase tracking-wider text-slate-700 block mb-1";

    const paymentsList = paginatedPayments?.data ?? [];

    return (
        <>
            <Head title="Reportes & Libros Contables" />

            <div className="space-y-6 p-4 sm:p-6 w-full max-w-[1440px] mx-auto">
                {/* Header Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">INFORMES INSTITUCIONALES & LIBRO DE INGRESOS</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Reporte de Pagos & Libros Contables</h1>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            Gestión Ejecutiva Sendero Otoñal • Consolidado de Recaudación y Cuadratura Financiera
                        </p>
                    </div>

                    {/* Export Action Buttons (Excel & PDF) */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer">
                            <a href={reports.exportExcel({ query: { from, to } }).url}>
                                <span>📊</span>
                                <span>Exportar a Excel (.xlsx)</span>
                            </a>
                        </Button>

                        <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer">
                            <a href={reports.exportPdf({ query: { from, to } }).url} target="_blank" rel="noopener noreferrer">
                                <span>📄</span>
                                <span>Exportar a PDF (.pdf)</span>
                            </a>
                        </Button>
                    </div>
                </div>

                {/* 4 Summary KPI Cards */}
                {totals && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL RECAUDADO</span>
                                <div className="text-xl font-black text-emerald-600 mt-0.5">{formatAmount(totals.total)}</div>
                                <div className="text-[10px] text-slate-400 font-bold mt-0.5">{totals.count} comprobantes en vista</div>
                            </div>
                            <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                                💰
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">EFECTIVO CAJA</span>
                                <div className="text-xl font-black text-slate-900 mt-0.5">{formatAmount(totals.cash)}</div>
                                <div className="text-[10px] text-slate-400 font-bold mt-0.5">Entradas directas</div>
                            </div>
                            <div className="h-9 w-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base">
                                💵
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TARJETAS / PAC</span>
                                <div className="text-xl font-black text-blue-600 mt-0.5">{formatAmount(totals.card)}</div>
                                <div className="text-[10px] text-slate-400 font-bold mt-0.5">Transferencias / Débito</div>
                            </div>
                            <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
                                💳
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CHEQUES</span>
                                <div className="text-xl font-black text-amber-600 mt-0.5">{formatAmount(totals.check_amount)}</div>
                                <div className="text-[10px] text-slate-400 font-bold mt-0.5">Documentos bancarios</div>
                            </div>
                            <div className="h-9 w-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base">
                                📋
                            </div>
                        </div>
                    </div>
                )}

                {/* Main White Rounded Card Container */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                    {/* Interactive Date Picker & Filter Toolbar */}
                    <div className="space-y-3 border-b border-slate-100 pb-4">
                        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                            <form onSubmit={submit} className="flex flex-col sm:flex-row items-end gap-3 w-full lg:w-auto">
                                <div className="w-full sm:w-48">
                                    <Label htmlFor="from" className={labelClass}>
                                        <span>📅 DESDE FECHA:</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="from"
                                            type="date"
                                            value={from}
                                            onChange={(e) => setFrom(e.target.value)}
                                            onClick={(e) => {
                                                if ('showPicker' in e.currentTarget) {
                                                    try { (e.currentTarget as any).showPicker(); } catch (_) {}
                                                }
                                            }}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="w-full sm:w-48">
                                    <Label htmlFor="to" className={labelClass}>
                                        <span>📅 HASTA FECHA:</span>
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="to"
                                            type="date"
                                            value={to}
                                            onChange={(e) => setTo(e.target.value)}
                                            onClick={(e) => {
                                                if ('showPicker' in e.currentTarget) {
                                                    try { (e.currentTarget as any).showPicker(); } catch (_) {}
                                                }
                                            }}
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2.5 text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer">
                                        <span>🔍</span>
                                        <span>Filtrar Fechas</span>
                                    </Button>

                                    {(from || to) && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={clearFilter}
                                            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold transition cursor-pointer"
                                        >
                                            <span>❌ Limpiar</span>
                                        </Button>
                                    )}
                                </div>
                            </form>

                            {/* Quick Presets Bar */}
                            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
                                <span className="text-[10px] font-black uppercase text-slate-400 px-2">RANGOS RÁPIDOS:</span>
                                <button
                                    type="button"
                                    onClick={clearFilter}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                                        !from && !to
                                            ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                                    }`}
                                >
                                    📜 Ver Todo Histórico
                                </button>
                                <button
                                    type="button"
                                    onClick={setThisMonthPreset}
                                    className="px-3 py-1.5 rounded-xl text-xs font-black transition text-slate-700 hover:bg-white hover:text-slate-900 cursor-pointer"
                                >
                                    📅 Este Mes
                                </button>
                                <button
                                    type="button"
                                    onClick={setLastMonthPreset}
                                    className="px-3 py-1.5 rounded-xl text-xs font-black transition text-slate-700 hover:bg-white hover:text-slate-900 cursor-pointer"
                                >
                                    🗓️ Mes Anterior
                                </button>
                                <button
                                    type="button"
                                    onClick={setYear2026Preset}
                                    className="px-3 py-1.5 rounded-xl text-xs font-black transition text-slate-700 hover:bg-white hover:text-slate-900 cursor-pointer"
                                >
                                    📊 Año 2026
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 w-full">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-500 tracking-wider py-2.5 px-3.5 border-b border-slate-200/80">
                                    <th className="py-3 px-3.5 whitespace-nowrap">N° COMPROBANTE</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap">FECHA PAGO</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap">RUT / CONTRATANTE</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap text-right">EFECTIVO</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap text-right">TARJETA</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap text-right">CHEQUE</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap text-right">TOTAL RECAUDADO</th>
                                    <th className="py-3 px-3.5 text-center whitespace-nowrap">COMPROBANTE</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                                {paymentsList.map((payment, idx) => {
                                    const clientName = payment.contract
                                        ? `${toTitleCase(payment.contract.first_name)} ${toTitleCase(payment.contract.last_name)}`
                                        : 'Cliente Registrado';
                                    const clientRut = payment.contract?.rut || payment.legacy_client_rut || 'Sin RUT';
                                    const initials = payment.contract ? getInitials(payment.contract.first_name, payment.contract.last_name) : 'RP';

                                    const bgColors = [
                                        'bg-emerald-100 text-emerald-800',
                                        'bg-blue-100 text-blue-800',
                                        'bg-indigo-100 text-indigo-800',
                                        'bg-amber-100 text-amber-800',
                                        'bg-teal-100 text-teal-800',
                                    ];
                                    const avatarColor = bgColors[idx % bgColors.length];

                                    return (
                                        <tr key={payment.id} className="hover:bg-slate-50/90 transition-colors group">
                                            {/* 1. N° COMPROBANTE */}
                                            <td className="py-3 px-3.5 font-mono font-extrabold text-slate-800 whitespace-nowrap">
                                                <span className="bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block font-mono">
                                                    #{payment.id}
                                                </span>
                                            </td>

                                            {/* 2. FECHA PAGO */}
                                            <td className="py-3 px-3.5 font-bold text-slate-700 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-slate-400">📅</span>
                                                    <span>{formatDate(payment.paid_at)}</span>
                                                </div>
                                            </td>

                                            {/* 3. RUT / CONTRATANTE */}
                                            <td className="py-3 px-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`h-8 w-8 rounded-xl ${avatarColor} flex items-center justify-center font-black text-[10px] shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0`}
                                                    >
                                                        {initials}
                                                    </div>
                                                    <div className="max-w-[170px]">
                                                        <div className="font-extrabold text-slate-900 text-xs truncate" title={clientName}>
                                                            {clientName}
                                                        </div>
                                                        <div className="text-[10px] font-mono font-bold text-slate-500">
                                                            RUT: {clientRut}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 4. EFECTIVO */}
                                            <td className="py-3 px-3.5 text-right font-mono font-extrabold text-slate-700 whitespace-nowrap">
                                                {formatAmount(payment.cash_amount)}
                                            </td>

                                            {/* 5. TARJETA */}
                                            <td className="py-3 px-3.5 text-right font-mono font-extrabold text-blue-700 whitespace-nowrap">
                                                {formatAmount(payment.card_amount)}
                                            </td>

                                            {/* 6. CHEQUE */}
                                            <td className="py-3 px-3.5 text-right font-mono font-extrabold text-amber-700 whitespace-nowrap">
                                                {formatAmount(payment.check_amount)}
                                            </td>

                                            {/* 7. TOTAL RECAUDADO */}
                                            <td className="py-3 px-3.5 text-right font-mono font-black text-emerald-700 text-sm whitespace-nowrap">
                                                {formatAmount(payment.total)}
                                            </td>

                                            {/* 8. COMPROBANTE */}
                                            <td className="py-3 px-3.5 text-center whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => window.open(payments.receipt(payment).url, '_blank')}
                                                    className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                                                >
                                                    <span>📄 PDF Comprobante</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {paymentsList.length === 0 && (
                                    <tr>
                                        <td className="p-8 text-center text-slate-400 font-bold" colSpan={8}>
                                            No se encontraron pagos en el rango de fechas seleccionado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                            {/* Summary Footer Line */}
                            {paymentsList.length > 0 && totals && (
                                <tfoot>
                                    <tr className="bg-slate-100/90 text-xs font-black text-slate-800 border-t-2 border-slate-200">
                                        <td colSpan={3} className="py-3 px-3.5 uppercase tracking-wider text-slate-600">
                                            Totales del Rango ({totals.count} Pagos):
                                        </td>
                                        <td className="py-3 px-3.5 text-right font-mono text-slate-800">{formatAmount(totals.cash)}</td>
                                        <td className="py-3 px-3.5 text-right font-mono text-blue-700">{formatAmount(totals.card)}</td>
                                        <td className="py-3 px-3.5 text-right font-mono text-amber-700">{formatAmount(totals.check_amount)}</td>
                                        <td className="py-3 px-3.5 text-right font-mono text-emerald-700 text-sm">{formatAmount(totals.total)}</td>
                                        <td className="py-3 px-3.5"></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {paginatedPayments && paginatedPayments.links.length > 3 && (
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                            <div>Mostrando {paymentsList.length} registros</div>
                            <div className="flex flex-wrap gap-1.5">
                                {paginatedPayments.links.map((link, i) => {
                                    const cleanLabel = link.label
                                        .replace('&laquo; Previous', '« Anterior')
                                        .replace('Previous', '« Anterior')
                                        .replace('Next &raquo;', 'Siguiente »')
                                        .replace('Next', 'Siguiente »');

                                    return (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            disabled={!link.url}
                                            asChild={!!link.url}
                                            className={
                                                link.active
                                                    ? 'bg-slate-900 text-white rounded-xl text-xs font-bold'
                                                    : 'bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-bold'
                                            }
                                        >
                                            {link.url ? (
                                                <Link href={link.url} dangerouslySetInnerHTML={{ __html: cleanLabel }} />
                                            ) : (
                                                <span dangerouslySetInnerHTML={{ __html: cleanLabel }} />
                                            )}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

ReportsIndex.layout = {
    breadcrumbs: [{ title: 'Reportes', href: reports.index() }],
};
