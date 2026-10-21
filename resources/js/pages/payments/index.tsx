import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import payments from '@/routes/payments';
import type { Payment, PaymentContract } from '@/types/payment';

type PaginationLink = { url: string | null; label: string; active: boolean };

type Paginated<T> = {
    data: T[];
    total?: number;
    links: PaginationLink[];
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
    return (f + l) || 'PG';
}

function formatAmount(value: number | null) {
    if (value === null || value === undefined) return '$0';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
}

function formatDate(value: string | null) {
    if (!value) return '—';
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('es-CL').format(new Date(year, month - 1, day));
}

export default function PaymentsIndex({
    payments: paginatedPayments,
    contractsList = [],
    filters,
}: {
    payments: Paginated<Payment>;
    contractsList?: PaymentContract[];
    filters: { date: string; q: string; per_page?: number };
}) {
    const [date, setDate] = useState(filters.date ?? '');
    const [search, setSearch] = useState(filters.q ?? '');
    const [perPage, setPerPage] = useState(filters.per_page ?? 10);
    const [activeFilter, setActiveFilter] = useState<'all' | 'cash' | 'card' | 'check'>('all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);

    const [paymentToEdit, setPaymentToEdit] = useState<Payment | null>(null);
    const [editStep, setEditStep] = useState<1 | 2 | 3>(1);

    const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

    // Create Form Hook
    const createForm = useForm({
        contract_id: '',
        legacy_client_rut: '',
        paid_at: new Date().toISOString().split('T')[0],
        cash_amount: '0',
        card_amount: '0',
        check_amount: '0',
        total: '0',
        status: 'Registrado',
    });

    // Edit Form Hook
    const editForm = useForm({
        contract_id: '',
        legacy_client_rut: '',
        paid_at: '',
        cash_amount: '0',
        card_amount: '0',
        check_amount: '0',
        total: '0',
        status: 'Registrado',
    });

    function submitFilter(e: React.FormEvent) {
        e.preventDefault();
        router.get(payments.index().url, { date, q: search, per_page: perPage }, { preserveState: true, replace: true });
    }

    function handlePerPageChange(newPerPage: number) {
        setPerPage(newPerPage);
        router.get(payments.index().url, { date, q: search, per_page: newPerPage }, { preserveState: true, replace: true });
    }

    // Auto-calculate totals
    function updateCreateAmounts(field: 'cash_amount' | 'card_amount' | 'check_amount', val: string) {
        const updated = { ...createForm.data, [field]: val };
        const cash = parseFloat(updated.cash_amount || '0') || 0;
        const card = parseFloat(updated.card_amount || '0') || 0;
        const check = parseFloat(updated.check_amount || '0') || 0;
        const sum = cash + card + check;

        createForm.setData({
            ...updated,
            total: sum.toString(),
        });
    }

    function updateEditAmounts(field: 'cash_amount' | 'card_amount' | 'check_amount', val: string) {
        const updated = { ...editForm.data, [field]: val };
        const cash = parseFloat(updated.cash_amount || '0') || 0;
        const card = parseFloat(updated.card_amount || '0') || 0;
        const check = parseFloat(updated.check_amount || '0') || 0;
        const sum = cash + card + check;

        editForm.setData({
            ...updated,
            total: sum.toString(),
        });
    }

    function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(payments.store().url, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setCreateStep(1);
                createForm.reset();
            },
        });
    }

    function openEditModal(payment: Payment) {
        setEditStep(1);
        editForm.setData({
            contract_id: payment.contract_id ? String(payment.contract_id) : '',
            legacy_client_rut: payment.contract?.rut || '',
            paid_at: payment.paid_at || '',
            cash_amount: String(payment.cash_amount ?? 0),
            card_amount: String(payment.card_amount ?? 0),
            check_amount: String(payment.check_amount ?? 0),
            total: String(payment.total ?? 0),
            status: payment.status || 'Registrado',
        });
        setPaymentToEdit(payment);
    }

    function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!paymentToEdit) return;
        editForm.put(payments.update(paymentToEdit).url, {
            onSuccess: () => {
                setPaymentToEdit(null);
                setEditStep(1);
            },
        });
    }

    function confirmDelete() {
        if (!paymentToDelete) return;
        router.delete(payments.destroy(paymentToDelete).url, {
            preserveScroll: true,
            onSuccess: () => setPaymentToDelete(null),
        });
    }

    const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs";
    const labelClass = "text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1";

    const filteredData = paginatedPayments.data.filter((p) => {
        if (activeFilter === 'cash') return (p.cash_amount ?? 0) > 0;
        if (activeFilter === 'card') return (p.card_amount ?? 0) > 0;
        if (activeFilter === 'check') return (p.check_amount ?? 0) > 0;
        return true;
    });

    const totalCashOnPage = filteredData.reduce((sum, p) => sum + (p.cash_amount ?? 0), 0);
    const totalCardOnPage = filteredData.reduce((sum, p) => sum + (p.card_amount ?? 0), 0);
    const totalCheckOnPage = filteredData.reduce((sum, p) => sum + (p.check_amount ?? 0), 0);
    const totalSumOnPage = filteredData.reduce((sum, p) => sum + (p.total ?? 0), 0);

    return (
        <>
            <Head title="Gestión de Pagos & Caja" />

            <div className="space-y-6 p-4 sm:p-6 w-full max-w-[1440px] mx-auto">
                
                {/* Header Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">GESTIÓN DE CAJA & PAGOS</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Control de Pagos Diarios</h1>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            Gestión Ejecutiva Sendero Otoñal • {paginatedPayments.total ?? paginatedPayments.data.length} pagos registrados en el sistema
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                setCreateStep(1);
                                setIsCreateModalOpen(true);
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-md transition flex items-center gap-2"
                        >
                            <span>💳</span>
                            <span>+ Registrar Nuevo Pago</span>
                        </Button>
                    </div>
                </div>

                {/* 3 Quick Summary KPI Bar */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PAGADO EN PÁGINA</span>
                            <div className="text-xl font-black text-emerald-600 mt-0.5">{formatAmount(totalSumOnPage)}</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                            💰
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL EFECTIVO</span>
                            <div className="text-xl font-black text-slate-900 mt-0.5">{formatAmount(totalCashOnPage)}</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-base">
                            💵
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL TARJETAS</span>
                            <div className="text-xl font-black text-blue-600 mt-0.5">{formatAmount(totalCardOnPage)}</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
                            💳
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL CHEQUES</span>
                            <div className="text-xl font-black text-amber-600 mt-0.5">{formatAmount(totalCheckOnPage)}</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base">
                            📋
                        </div>
                    </div>
                </div>

                {/* Main White Rounded Card Container */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                    
                    {/* Toolbar: Search + Date Filter + Category Tabs + Per Page Select */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        
                        {/* Search & Date Input Bar */}
                        <form onSubmit={submitFilter} className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                            <div className="relative w-full sm:w-64">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm">
                                    🔍
                                </span>
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por RUT o contratante..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs"
                                />
                            </div>
                            <div className="w-full sm:w-44">
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    onBlur={submitFilter}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition shadow-2xs"
                                />
                            </div>
                            <Button type="submit" variant="outline" className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-xl px-4 py-2 text-xs font-bold transition">
                                Buscar
                            </Button>
                        </form>

                        <div className="flex flex-wrap items-center gap-3">
                            {/* Per Page Select Dropdown */}
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-extrabold uppercase text-slate-400">Ver:</span>
                                <select
                                    value={perPage}
                                    onChange={(e) => handlePerPageChange(Number(e.target.value))}
                                    className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-extrabold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition shadow-2xs cursor-pointer"
                                >
                                    <option value={5}>5 por pág.</option>
                                    <option value={10}>10 por pág.</option>
                                    <option value={25}>25 por pág.</option>
                                    <option value={50}>50 por pág.</option>
                                    <option value={100}>100 por pág.</option>
                                </select>
                            </div>

                            {/* Filter Tabs */}
                            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 self-start lg:self-auto">
                                <button
                                    type="button"
                                    onClick={() => setActiveFilter('all')}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                                        activeFilter === 'all'
                                            ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Todos ({paginatedPayments.total ?? paginatedPayments.data.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveFilter('cash')}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                                        activeFilter === 'cash'
                                            ? 'bg-white text-emerald-700 shadow-2xs border border-emerald-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Efectivo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveFilter('card')}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                                        activeFilter === 'card'
                                            ? 'bg-white text-blue-700 shadow-2xs border border-blue-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Tarjeta
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveFilter('check')}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                                        activeFilter === 'check'
                                            ? 'bg-white text-amber-700 shadow-2xs border border-amber-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Cheque
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Table Data */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 w-full">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-500 tracking-wider py-2.5 px-3 border-b border-slate-200/80">
                                    <th className="py-2.5 px-3 whitespace-nowrap">FECHA PAGO</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap">RUT / CONTRATANTE</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap text-right">EFECTIVO</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap text-right">TARJETA</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap text-right">CHEQUE</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap text-right">TOTAL PAGO</th>
                                    <th className="py-2.5 px-3 text-center whitespace-nowrap">COMPROBANTE</th>
                                    <th className="py-2.5 px-3 text-right whitespace-nowrap min-w-[110px]">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                                {filteredData.map((payment, idx) => {
                                    const clientName = payment.contract
                                        ? `${toTitleCase(payment.contract.first_name)} ${toTitleCase(payment.contract.last_name)}`
                                        : 'Cliente Registrado';
                                    const clientRut = payment.contract?.rut || payment.legacy_client_rut || 'Sin RUT';
                                    const initials = payment.contract ? getInitials(payment.contract.first_name, payment.contract.last_name) : 'PG';

                                    const bgColors = ['bg-emerald-100 text-emerald-800', 'bg-blue-100 text-blue-800', 'bg-indigo-100 text-indigo-800', 'bg-amber-100 text-amber-800', 'bg-teal-100 text-teal-800'];
                                    const avatarColor = bgColors[idx % bgColors.length];

                                    return (
                                        <tr key={payment.id} className="hover:bg-slate-50/90 transition-colors group">
                                            {/* 1. FECHA PAGO */}
                                            <td className="py-2.5 px-3 font-extrabold text-slate-700 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-slate-400">📅</span>
                                                    <span>{formatDate(payment.paid_at)}</span>
                                                </div>
                                            </td>

                                            {/* 2. RUT / CONTRATANTE */}
                                            <td className="py-2.5 px-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`h-8 w-8 rounded-xl ${avatarColor} flex items-center justify-center font-black text-[10px] shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0`}>
                                                        {initials}
                                                    </div>
                                                    <div className="max-w-[170px]">
                                                        <div className="font-extrabold text-slate-900 text-xs truncate" title={clientName}>{clientName}</div>
                                                        <div className="text-[10px] font-mono font-bold text-slate-500">RUT: {clientRut}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 3. EFECTIVO */}
                                            <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-700 whitespace-nowrap">
                                                {formatAmount(payment.cash_amount)}
                                            </td>

                                            {/* 4. TARJETA */}
                                            <td className="py-2.5 px-3 text-right font-mono font-extrabold text-blue-700 whitespace-nowrap">
                                                {formatAmount(payment.card_amount)}
                                            </td>

                                            {/* 5. CHEQUE */}
                                            <td className="py-2.5 px-3 text-right font-mono font-extrabold text-amber-700 whitespace-nowrap">
                                                {formatAmount(payment.check_amount)}
                                            </td>

                                            {/* 6. TOTAL PAGO */}
                                            <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700 text-sm whitespace-nowrap">
                                                {formatAmount(payment.total)}
                                            </td>

                                            {/* 7. COMPROBANTE */}
                                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => window.open(payments.receipt(payment).url, '_blank')}
                                                    className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                                                >
                                                    <span>📄 PDF Comprobante</span>
                                                </button>
                                            </td>

                                            {/* 8. ACCIONES */}
                                            <td className="py-2.5 px-3 text-right whitespace-nowrap min-w-[140px]">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => window.open(payments.receipt(payment).url, '_blank')}
                                                        className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg px-2 py-1 text-[11px] font-bold shadow-2xs transition cursor-pointer"
                                                    >
                                                        <span>📄 PDF</span>
                                                    </button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditModal(payment)}
                                                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-2xs transition"
                                                    >
                                                        <span>✏️ Editar</span>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setPaymentToDelete(payment)}
                                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg px-2 py-1 text-[11px] font-bold transition"
                                                    >
                                                        <span>🗑️</span>
                                                    </Button>
                                                </div>
                                            </td>

                                        </tr>
                                    );
                                })}

                                {filteredData.length === 0 && (
                                    <tr>
                                        <td className="p-8 text-center text-slate-400 font-bold" colSpan={8}>
                                            No se encontraron pagos registrados que coincidan con los filtros.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                            {/* Summary Footer Line */}
                            {filteredData.length > 0 && (
                                <tfoot>
                                    <tr className="bg-slate-100/90 text-xs font-black text-slate-800 border-t-2 border-slate-200">
                                        <td colSpan={2} className="py-3 px-3 uppercase tracking-wider text-slate-600">
                                            Totales Recaudados en esta Página:
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono text-slate-800">{formatAmount(totalCashOnPage)}</td>
                                        <td className="py-3 px-3 text-right font-mono text-blue-700">{formatAmount(totalCardOnPage)}</td>
                                        <td className="py-3 px-3 text-right font-mono text-amber-700">{formatAmount(totalCheckOnPage)}</td>
                                        <td className="py-3 px-3 text-right font-mono text-emerald-700 text-sm">{formatAmount(totalSumOnPage)}</td>
                                        <td colSpan={2} className="py-3 px-3"></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {paginatedPayments.links.length > 3 && (
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                            <div>Mostrando {filteredData.length} registros</div>
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
                                            className={link.active ? 'bg-slate-900 text-white rounded-xl text-xs font-bold' : 'bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-bold'}
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

            {/* 3-STEP CREATE PAYMENT WIZARD MODAL */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span>💳</span>
                            <span>Registro de Pago — Asistente Guiado en 3 Pasos</span>
                        </DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">Gestión Ejecutiva de Caja • Sendero Otoñal</p>
                    </DialogHeader>

                    {/* Stepper Progress Bar */}
                    <div className="flex items-center justify-between border-y border-slate-100 py-3 my-1">
                        
                        {/* Step 1 Pill */}
                        <button
                            type="button"
                            onClick={() => setCreateStep(1)}
                            className="flex items-center gap-2 cursor-pointer focus:outline-none"
                        >
                            <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs transition ${
                                createStep === 1
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : createStep > 1
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                                {createStep > 1 ? '✓' : '1'}
                            </div>
                            <span className={`text-xs font-extrabold ${createStep === 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                                1. Contrato & Fecha
                            </span>
                        </button>

                        <div className="h-0.5 flex-1 mx-3 bg-slate-200"></div>

                        {/* Step 2 Pill */}
                        <button
                            type="button"
                            onClick={() => setCreateStep(2)}
                            className="flex items-center gap-2 cursor-pointer focus:outline-none"
                        >
                            <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs transition ${
                                createStep === 2
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : createStep > 2
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                                {createStep > 2 ? '✓' : '2'}
                            </div>
                            <span className={`text-xs font-extrabold ${createStep === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                                2. Desglose Montos
                            </span>
                        </button>

                        <div className="h-0.5 flex-1 mx-3 bg-slate-200"></div>

                        {/* Step 3 Pill */}
                        <button
                            type="button"
                            onClick={() => setCreateStep(3)}
                            className="flex items-center gap-2 cursor-pointer focus:outline-none"
                        >
                            <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs transition ${
                                createStep === 3
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                                3
                            </div>
                            <span className={`text-xs font-extrabold ${createStep === 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                                3. Confirmar
                            </span>
                        </button>

                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-1">
                        
                        {/* STEP 1: DATOS DEL CONTRATO & FECHA */}
                        {createStep === 1 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span>Paso 1 de 3: Identificación del Pago & Contrato</span>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="contract_id" className={labelClass}>Seleccionar Contrato *</Label>
                                        <select
                                            id="contract_id"
                                            value={createForm.data.contract_id}
                                            onChange={(e) => {
                                                const selId = e.target.value;
                                                const found = contractsList.find((c) => String(c.id) === selId);
                                                createForm.setData({
                                                    ...createForm.data,
                                                    contract_id: selId,
                                                    legacy_client_rut: found ? found.rut : createForm.data.legacy_client_rut,
                                                });
                                            }}
                                            className={inputClass}
                                        >
                                            <option value="">Seleccionar de la lista de contratos...</option>
                                            {contractsList.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    Contrato N° {c.id} — {toTitleCase(c.first_name)} {toTitleCase(c.last_name)} ({c.rut})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="legacy_client_rut" className={labelClass}>RUT Cliente / Titular</Label>
                                            <Input
                                                id="legacy_client_rut"
                                                value={createForm.data.legacy_client_rut}
                                                onChange={(e) => createForm.setData('legacy_client_rut', e.target.value)}
                                                placeholder="12.345.678-9"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="paid_at" className={labelClass}>Fecha de Pago *</Label>
                                            <Input
                                                id="paid_at"
                                                type="date"
                                                value={createForm.data.paid_at}
                                                onChange={(e) => createForm.setData('paid_at', e.target.value)}
                                                required
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: DESGLOSE DE MONTOS */}
                        {createStep === 2 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                    <span>Paso 2 de 3: Desglose de Forma de Pago ($ CLP)</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div>
                                        <Label htmlFor="cash_amount" className={labelClass}>💵 Efectivo ($ CLP)</Label>
                                        <Input
                                            id="cash_amount"
                                            type="number"
                                            min={0}
                                            value={createForm.data.cash_amount}
                                            onChange={(e) => updateCreateAmounts('cash_amount', e.target.value)}
                                            placeholder="0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="card_amount" className={labelClass}>💳 Tarjeta ($ CLP)</Label>
                                        <Input
                                            id="card_amount"
                                            type="number"
                                            min={0}
                                            value={createForm.data.card_amount}
                                            onChange={(e) => updateCreateAmounts('card_amount', e.target.value)}
                                            placeholder="0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="check_amount" className={labelClass}>📋 Cheque ($ CLP)</Label>
                                        <Input
                                            id="check_amount"
                                            type="number"
                                            min={0}
                                            value={createForm.data.check_amount}
                                            onChange={(e) => updateCreateAmounts('check_amount', e.target.value)}
                                            placeholder="0"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                                    <span className="text-xs font-black text-emerald-900 uppercase">Monto Total del Pago:</span>
                                    <span className="text-xl font-black text-emerald-700 font-mono">
                                        {formatAmount(parseFloat(createForm.data.total) || 0)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: CONFIRMACIÓN DE CAJA */}
                        {createStep === 3 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                    <span>Paso 3 de 3: Confirmación & Registro en Libro</span>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs font-semibold">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Fecha de Pago:</span>
                                        <span className="font-extrabold text-slate-900">{formatDate(createForm.data.paid_at)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">RUT Registrado:</span>
                                        <span className="font-mono font-extrabold text-slate-900">{createForm.data.legacy_client_rut || 'Sin especificación'}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                                        <span className="text-slate-900">Total a Ingresar en Caja:</span>
                                        <span className="text-emerald-700 font-mono">{formatAmount(parseFloat(createForm.data.total) || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEPPER CONTROL BUTTONS */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="bg-white text-slate-500 border-slate-200 rounded-xl px-4 text-xs font-bold"
                            >
                                Cancelar
                            </Button>

                            <div className="flex items-center gap-2">
                                {createStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCreateStep((s) => (s - 1) as 1 | 2 | 3)}
                                        className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition"
                                    >
                                        ← Anterior
                                    </Button>
                                )}

                                {createStep < 3 && (
                                    <Button
                                        type="button"
                                        onClick={() => setCreateStep((s) => (s + 1) as 1 | 2 | 3)}
                                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md transition"
                                    >
                                        Siguiente →
                                    </Button>
                                )}

                                {createStep === 3 && (
                                    <Button
                                        type="submit"
                                        disabled={createForm.processing}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-2.5 text-xs font-bold shadow-md transition flex items-center gap-2"
                                    >
                                        <span>✓</span>
                                        <span>Confirmar & Registrar Pago</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                    </form>
                </DialogContent>
            </Dialog>

            {/* 3-STEP EDIT PAYMENT WIZARD MODAL */}
            <Dialog open={!!paymentToEdit} onOpenChange={() => setPaymentToEdit(null)}>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span>✏️</span>
                            <span>Editar Pago N° {paymentToEdit?.id}</span>
                        </DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">Gestión Ejecutiva de Caja • Sendero Otoñal</p>
                    </DialogHeader>

                    {/* Stepper Progress Bar */}
                    <div className="flex items-center justify-between border-y border-slate-100 py-3 my-1">
                        
                        {/* Step 1 Pill */}
                        <button
                            type="button"
                            onClick={() => setEditStep(1)}
                            className="flex items-center gap-2 cursor-pointer focus:outline-none"
                        >
                            <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs transition ${
                                editStep === 1
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : editStep > 1
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                                {editStep > 1 ? '✓' : '1'}
                            </div>
                            <span className={`text-xs font-extrabold ${editStep === 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                                1. Identificación
                            </span>
                        </button>

                        <div className="h-0.5 flex-1 mx-3 bg-slate-200"></div>

                        {/* Step 2 Pill */}
                        <button
                            type="button"
                            onClick={() => setEditStep(2)}
                            className="flex items-center gap-2 cursor-pointer focus:outline-none"
                        >
                            <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs transition ${
                                editStep === 2
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : editStep > 2
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                                {editStep > 2 ? '✓' : '2'}
                            </div>
                            <span className={`text-xs font-extrabold ${editStep === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                                2. Desglose
                            </span>
                        </button>

                        <div className="h-0.5 flex-1 mx-3 bg-slate-200"></div>

                        {/* Step 3 Pill */}
                        <button
                            type="button"
                            onClick={() => setEditStep(3)}
                            className="flex items-center gap-2 cursor-pointer focus:outline-none"
                        >
                            <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs transition ${
                                editStep === 3
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                                3
                            </div>
                            <span className={`text-xs font-extrabold ${editStep === 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                                3. Guardar
                            </span>
                        </button>

                    </div>

                    <form onSubmit={handleEditSubmit} className="space-y-4 pt-1">
                        
                        {/* STEP 1: IDENTIFICACIÓN */}
                        {editStep === 1 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span>Paso 1 de 3: Identificación del Pago</span>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <Label htmlFor="edit_contract_id" className={labelClass}>Contrato Asociado</Label>
                                        <select
                                            id="edit_contract_id"
                                            value={editForm.data.contract_id}
                                            onChange={(e) => {
                                                const selId = e.target.value;
                                                const found = contractsList.find((c) => String(c.id) === selId);
                                                editForm.setData({
                                                    ...editForm.data,
                                                    contract_id: selId,
                                                    legacy_client_rut: found ? found.rut : editForm.data.legacy_client_rut,
                                                });
                                            }}
                                            className={inputClass}
                                        >
                                            <option value="">Seleccionar contrato...</option>
                                            {contractsList.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    Contrato N° {c.id} — {toTitleCase(c.first_name)} {toTitleCase(c.last_name)} ({c.rut})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div>
                                            <Label htmlFor="edit_legacy_client_rut" className={labelClass}>RUT Cliente</Label>
                                            <Input
                                                id="edit_legacy_client_rut"
                                                value={editForm.data.legacy_client_rut}
                                                onChange={(e) => editForm.setData('legacy_client_rut', e.target.value)}
                                                placeholder="12.345.678-9"
                                                className={inputClass}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="edit_paid_at" className={labelClass}>Fecha de Pago *</Label>
                                            <Input
                                                id="edit_paid_at"
                                                type="date"
                                                value={editForm.data.paid_at}
                                                onChange={(e) => editForm.setData('paid_at', e.target.value)}
                                                required
                                                className={inputClass}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: DESGLOSE */}
                        {editStep === 2 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                    <span>Paso 2 de 3: Desglose de Forma de Pago ($ CLP)</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div>
                                        <Label htmlFor="edit_cash_amount" className={labelClass}>💵 Efectivo ($ CLP)</Label>
                                        <Input
                                            id="edit_cash_amount"
                                            type="number"
                                            min={0}
                                            value={editForm.data.cash_amount}
                                            onChange={(e) => updateEditAmounts('cash_amount', e.target.value)}
                                            placeholder="0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_card_amount" className={labelClass}>💳 Tarjeta ($ CLP)</Label>
                                        <Input
                                            id="edit_card_amount"
                                            type="number"
                                            min={0}
                                            value={editForm.data.card_amount}
                                            onChange={(e) => updateEditAmounts('card_amount', e.target.value)}
                                            placeholder="0"
                                            className={inputClass}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_check_amount" className={labelClass}>📋 Cheque ($ CLP)</Label>
                                        <Input
                                            id="edit_check_amount"
                                            type="number"
                                            min={0}
                                            value={editForm.data.check_amount}
                                            onChange={(e) => updateEditAmounts('check_amount', e.target.value)}
                                            placeholder="0"
                                            className={inputClass}
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                                    <span className="text-xs font-black text-emerald-900 uppercase">Total Recalculado:</span>
                                    <span className="text-xl font-black text-emerald-700 font-mono">
                                        {formatAmount(parseFloat(editForm.data.total) || 0)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: GUARDAR */}
                        {editStep === 3 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                    <span>Paso 3 de 3: Confirmar Cambios</span>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs font-semibold">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Pago ID:</span>
                                        <span className="font-extrabold text-slate-900">#{paymentToEdit?.id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Fecha de Pago:</span>
                                        <span className="font-extrabold text-slate-900">{formatDate(editForm.data.paid_at)}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black">
                                        <span className="text-slate-900">Total Actualizado:</span>
                                        <span className="text-emerald-700 font-mono">{formatAmount(parseFloat(editForm.data.total) || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEPPER CONTROL BUTTONS */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setPaymentToEdit(null)}
                                className="bg-white text-slate-500 border-slate-200 rounded-xl px-4 text-xs font-bold"
                            >
                                Cancelar
                            </Button>

                            <div className="flex items-center gap-2">
                                {editStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setEditStep((s) => (s - 1) as 1 | 2 | 3)}
                                        className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition"
                                    >
                                        ← Anterior
                                    </Button>
                                )}

                                {editStep < 3 && (
                                    <Button
                                        type="button"
                                        onClick={() => setEditStep((s) => (s + 1) as 1 | 2 | 3)}
                                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md transition"
                                    >
                                        Siguiente →
                                    </Button>
                                )}

                                {editStep === 3 && (
                                    <Button
                                        type="submit"
                                        disabled={editForm.processing}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-2.5 text-xs font-bold shadow-md transition flex items-center gap-2"
                                    >
                                        <span>✓</span>
                                        <span>Actualizar Pago</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE WARNING CONFIRMATION MODAL */}
            <Dialog open={!!paymentToDelete} onOpenChange={() => setPaymentToDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-xl font-bold">
                                ⚠️
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black text-slate-900">¿Eliminar Pago N° {paymentToDelete?.id}?</DialogTitle>
                                <p className="text-xs text-slate-500 font-medium">Esta acción requiere confirmación de seguridad</p>
                            </div>
                        </div>
                    </DialogHeader>

                    {paymentToDelete && (
                        <div className="space-y-4 pt-2 text-xs font-semibold text-slate-600">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                                <div className="text-xs font-black text-slate-900">
                                    Contratante / RUT: {paymentToDelete.contract ? `${toTitleCase(paymentToDelete.contract.first_name)} ${toTitleCase(paymentToDelete.contract.last_name)} (${paymentToDelete.contract.rut})` : (paymentToDelete.legacy_client_rut || 'Sin RUT')}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500">
                                    Fecha: <span className="font-extrabold text-slate-800">{formatDate(paymentToDelete.paid_at)}</span> | Total Pago: <span className="font-extrabold text-emerald-700">{formatAmount(paymentToDelete.total)}</span>
                                </div>
                            </div>

                            <p className="text-slate-600 leading-relaxed">
                                ¿Estás seguro de que deseas anular y eliminar este registro de pago? Se descontará del balance de caja diaria.
                            </p>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setPaymentToDelete(null)}
                                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold transition"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 py-2 text-xs font-bold shadow-md transition flex items-center gap-1.5"
                                >
                                    <span>🗑️ Sí, Eliminar Pago</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

PaymentsIndex.layout = {
    breadcrumbs: [{ title: 'Pagos', href: payments.index() }],
};

