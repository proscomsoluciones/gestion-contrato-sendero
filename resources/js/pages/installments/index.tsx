import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import installments from '@/routes/installments';
import type { PaymentContract } from '@/types/payment';
import type { Installment } from '@/types/installment';

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
    return (f + l) || 'CU';
}

function formatAmount(value: number | null) {
    if (value === null || value === undefined || isNaN(value)) return '—';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
}

function formatDate(value: string | null) {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
        const [year, month, day] = parts.map(Number);
        if (year && month && day) {
            return new Intl.DateTimeFormat('es-CL').format(new Date(year, month - 1, day));
        }
    }
    return value;
}

function renderStatusBadge(status: string) {
    const cleanStatus = (status || '').toUpperCase().trim();

    if (cleanStatus.includes('PAGAD')) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 border border-emerald-200/80 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>PAGADO</span>
            </span>
        );
    }

    if (cleanStatus.includes('VENCID') || cleanStatus.includes('ATRASAD')) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-extrabold text-rose-800 border border-rose-200/80 shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                <span>VENCIDO</span>
            </span>
        );
    }

    // Default to Pendiente / Amber
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold text-amber-800 border border-amber-200/80 shadow-2xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            <span>{cleanStatus || 'PENDIENTE DE PAGO'}</span>
        </span>
    );
}

export default function InstallmentsIndex({
    installments: paginatedInstallments,
    contractsList = [],
    filters,
}: {
    installments: Paginated<Installment>;
    contractsList?: PaymentContract[];
    filters: { q: string; per_page?: number };
}) {
    const [search, setSearch] = useState(filters.q ?? '');
    const [perPage, setPerPage] = useState(filters.per_page ?? 10);
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [installmentToEdit, setInstallmentToEdit] = useState<Installment | null>(null);
    const [installmentToDelete, setInstallmentToDelete] = useState<Installment | null>(null);

    // Create Form Hook
    const createForm = useForm({
        contract_id: '',
        legacy_contract_rut: '',
        amount: '',
        status: 'PENDIENTE DE PAGO',
        due_date: '',
        paid_at: '',
        invoice_number: '',
    });

    // Edit Form Hook
    const editForm = useForm({
        contract_id: '',
        legacy_contract_rut: '',
        amount: '',
        status: 'PENDIENTE DE PAGO',
        due_date: '',
        paid_at: '',
        invoice_number: '',
    });

    function submitSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(installments.index().url, { q: search, per_page: perPage }, { preserveState: true, replace: true });
    }

    function handlePerPageChange(newPerPage: number) {
        setPerPage(newPerPage);
        router.get(installments.index().url, { q: search, per_page: newPerPage }, { preserveState: true, replace: true });
    }

    function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(installments.store().url, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    }

    function openEditModal(installment: Installment) {
        editForm.setData({
            contract_id: installment.contract_id ? String(installment.contract_id) : '',
            legacy_contract_rut: installment.legacy_contract_rut || '',
            amount: installment.amount !== null && installment.amount !== undefined ? String(installment.amount) : '',
            status: installment.status || 'PENDIENTE DE PAGO',
            due_date: installment.due_date || '',
            paid_at: installment.paid_at || '',
            invoice_number: installment.invoice_number || '',
        });
        setInstallmentToEdit(installment);
    }

    function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!installmentToEdit) return;
        editForm.put(installments.update(installmentToEdit).url, {
            onSuccess: () => {
                setInstallmentToEdit(null);
            },
        });
    }

    function confirmDelete() {
        if (!installmentToDelete) return;
        router.delete(installments.destroy(installmentToDelete).url, {
            preserveScroll: true,
            onSuccess: () => setInstallmentToDelete(null),
        });
    }

    const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs";
    const labelClass = "text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1";

    const filteredData = paginatedInstallments.data.filter((inst) => {
        const s = (inst.status || '').toUpperCase();
        if (statusFilter === 'pending') {
            return s.includes('PENDIENTE') || s.includes('VENCID');
        }
        if (statusFilter === 'paid') {
            return s.includes('PAGAD');
        }
        return true;
    });

    const totalCount = paginatedInstallments.total ?? paginatedInstallments.data.length;
    const pendingCount = paginatedInstallments.data.filter((i) => (i.status || '').toUpperCase().includes('PENDIENTE')).length;
    const paidCount = paginatedInstallments.data.filter((i) => (i.status || '').toUpperCase().includes('PAGAD')).length;
    const totalAmountOnPage = filteredData.reduce((sum, i) => sum + (i.amount ?? 0), 0);

    return (
        <>
            <Head title="Directorio de Cuotas" />

            <div className="space-y-6 p-4 sm:p-6 w-full max-w-[1440px] mx-auto">
                {/* Header Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">GESTIÓN DE CUOTAS & COBRANZA</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Control de Cuotas y Pagos</h1>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            Sistema Institucional Sendero Otoñal • {totalCount} cuotas registradas en el sistema
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                        >
                            <span>💳</span>
                            <span>+ Nueva Cuota</span>
                        </Button>
                    </div>
                </div>

                {/* 3 Summary KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL CUOTAS</span>
                            <div className="text-xl font-black text-slate-900 mt-0.5">{totalCount} Cuotas</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base">
                            💳
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">MONTO EN PÁGINA</span>
                            <div className="text-xl font-black text-emerald-600 mt-0.5">{formatAmount(totalAmountOnPage)}</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                            💰
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PENDIENTES EN VISTA</span>
                            <div className="text-xl font-black text-amber-600 mt-0.5">{pendingCount} Pendientes</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-base">
                            ⏳
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PAGADAS EN VISTA</span>
                            <div className="text-xl font-black text-emerald-600 mt-0.5">{paidCount} Pagadas</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                            ✅
                        </div>
                    </div>
                </div>

                {/* Main White Rounded Card Container */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                    {/* Toolbar: Search + Category Filter Tabs + Per Page Select */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <form onSubmit={submitSearch} className="w-full lg:w-96">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm">
                                    🔍
                                </span>
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por RUT, contratante o N° factura..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs"
                                />
                            </div>
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
                                    onClick={() => setStatusFilter('all')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                        statusFilter === 'all'
                                            ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Todas ({paginatedInstallments.data.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('pending')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                        statusFilter === 'pending'
                                            ? 'bg-white text-amber-700 shadow-2xs border border-amber-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Pendientes ({pendingCount})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('paid')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                        statusFilter === 'paid'
                                            ? 'bg-white text-emerald-700 shadow-2xs border border-emerald-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Pagadas ({paidCount})
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table Data */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 w-full">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-500 tracking-wider py-2.5 px-3.5 border-b border-slate-200/80">
                                    <th className="py-3 px-3.5 whitespace-nowrap">CONTRATO / CLIENTE</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap">N° CUOTA</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap">VALOR CUOTA</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap">FECHA DE PAGO</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap">ESTADO</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap">PAGADA EL</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap">N° FACTURA</th>
                                    <th className="py-3 px-3.5 text-right whitespace-nowrap min-w-[130px]">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                                {filteredData.map((installment, idx) => {
                                    const contract = installment.contract;
                                    const clientName = contract
                                        ? `${toTitleCase(contract.first_name)} ${toTitleCase(contract.last_name)}`
                                        : null;
                                    const initials = contract
                                        ? getInitials(contract.first_name, contract.last_name)
                                        : 'CU';
                                    const rut = contract?.rut || installment.legacy_contract_rut;
                                    const paidDateFormatted = formatDate(installment.paid_at);
                                    const dueDateFormatted = formatDate(installment.due_date);
                                    const isPaid = (installment.status || '').toUpperCase().includes('PAGAD') || !!installment.paid_at;
                                    const isOverdue = !isPaid && !!installment.due_date && installment.due_date < new Date().toLocaleDateString('en-CA');

                                    const bgColors = [
                                        'bg-emerald-100 text-emerald-800',
                                        'bg-blue-100 text-blue-800',
                                        'bg-indigo-100 text-indigo-800',
                                        'bg-amber-100 text-amber-800',
                                        'bg-teal-100 text-teal-800',
                                    ];
                                    const avatarColor = bgColors[idx % bgColors.length];

                                    return (
                                        <tr key={installment.id} className="hover:bg-slate-50/90 transition-colors group">
                                            {/* 1. CONTRATO / CLIENTE */}
                                            <td className="py-3 px-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`h-9 w-9 rounded-xl ${avatarColor} flex items-center justify-center font-black text-xs shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0`}
                                                    >
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        {clientName ? (
                                                            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                                                                <span>{clientName}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="font-extrabold text-slate-700 text-xs">
                                                                Cuota #{installment.id}
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            {rut && (
                                                                <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 inline-block font-extrabold">
                                                                    RUT: {rut}
                                                                </span>
                                                            )}
                                                            {contract?.id && (
                                                                <span className="text-[10px] font-bold text-slate-400">
                                                                    Contrato N° {contract.id}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. N° CUOTA */}
                                            <td className="py-3 px-3.5 whitespace-nowrap">
                                                {installment.number ? (
                                                    <span className="font-extrabold text-slate-800">
                                                        {installment.number} <span className="text-slate-400 font-bold">de {installment.total_count}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-semibold text-xs">—</span>
                                                )}
                                            </td>

                                            {/* 3. VALOR CUOTA */}
                                            <td className="py-3 px-3.5 font-mono font-black text-emerald-700 text-xs whitespace-nowrap">
                                                {formatAmount(installment.amount)}
                                            </td>

                                            {/* 4. FECHA DE PAGO (VENCIMIENTO) */}
                                            <td className="py-3 px-3.5 whitespace-nowrap">
                                                {dueDateFormatted ? (
                                                    <div className={`font-bold ${isOverdue ? 'text-rose-700' : 'text-slate-700'}`}>
                                                        <span>{dueDateFormatted}</span>
                                                        {isOverdue && <span className="ml-1.5 text-[10px] font-black uppercase">Vencida</span>}
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 font-semibold text-xs">—</span>
                                                )}
                                            </td>

                                            {/* 5. ESTADO */}
                                            <td className="py-3 px-3.5 whitespace-nowrap">
                                                {renderStatusBadge(installment.status)}
                                            </td>

                                            {/* 6. PAGADA EL */}
                                            <td className="py-3 px-3.5 text-slate-800 whitespace-nowrap">
                                                {paidDateFormatted ? (
                                                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                                                        <span className="text-emerald-600 text-xs">📅</span>
                                                        <span>{paidDateFormatted}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-400 font-semibold text-xs">—</span>
                                                )}
                                            </td>

                                            {/* 7. FACTURA */}
                                            <td className="py-3 px-3.5 whitespace-nowrap">
                                                {installment.invoice_number ? (
                                                    <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 font-mono font-extrabold px-2.5 py-1 rounded-lg border border-slate-200 text-xs">
                                                        <span>📄</span>
                                                        <span>N° {installment.invoice_number}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-semibold text-xs">—</span>
                                                )}
                                            </td>

                                            {/* 8. ACCIONES */}
                                            <td className="py-3 px-3.5 text-right whitespace-nowrap min-w-[140px]">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditModal(installment)}
                                                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                                                    >
                                                        <span>✏️ Editar</span>
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setInstallmentToDelete(installment)}
                                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
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
                                            No se encontraron cuotas registradas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>

                            {/* Summary Footer Row */}
                            {filteredData.length > 0 && (
                                <tfoot>
                                    <tr className="bg-slate-100/90 text-xs font-black text-slate-800 border-t-2 border-slate-200">
                                        <td colSpan={2} className="py-3 px-3.5 uppercase tracking-wider text-slate-600">
                                            Total Montos en Vista:
                                        </td>
                                        <td className="py-3 px-3.5 font-mono text-emerald-700 text-sm">
                                            {formatAmount(totalAmountOnPage)}
                                        </td>
                                        <td colSpan={5} className="py-3 px-3.5"></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {paginatedInstallments.links.length > 3 && (
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                            <div>Mostrando {filteredData.length} registros</div>
                            <div className="flex flex-wrap gap-1.5">
                                {paginatedInstallments.links.map((link, i) => {
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

            {/* CREATE CUOTA MODAL DIALOG */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                            <span>💳</span>
                            <span>Emisión / Registro de Nueva Cuota</span>
                        </DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">Gestión Ejecutiva de Cuotas • Sendero Otoñal</p>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="contract_id" className={labelClass}>Vincular a Contrato Existente</Label>
                                <select
                                    id="contract_id"
                                    value={createForm.data.contract_id}
                                    onChange={(e) => {
                                        const selId = e.target.value;
                                        const found = contractsList.find((c) => String(c.id) === selId);
                                        createForm.setData({
                                            ...createForm.data,
                                            contract_id: selId,
                                            legacy_contract_rut: found ? found.rut : createForm.data.legacy_contract_rut,
                                        });
                                    }}
                                    className={inputClass}
                                >
                                    <option value="">Seleccionar contrato de la lista...</option>
                                    {contractsList.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            Contrato N° {c.id} — {toTitleCase(c.first_name)} {toTitleCase(c.last_name)} ({c.rut})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="legacy_contract_rut" className={labelClass}>RUT del Contrato / Cliente</Label>
                                <Input
                                    id="legacy_contract_rut"
                                    value={createForm.data.legacy_contract_rut}
                                    onChange={(e) => createForm.setData('legacy_contract_rut', e.target.value)}
                                    placeholder="12.345.678-9"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <Label htmlFor="amount" className={labelClass}>Valor de la Cuota ($ CLP)</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    min={0}
                                    step="any"
                                    value={createForm.data.amount}
                                    onChange={(e) => createForm.setData('amount', e.target.value)}
                                    placeholder="Ej: 25000"
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="status" className={labelClass}>Estado de la Cuota *</Label>
                                    <select
                                        id="status"
                                        value={createForm.data.status}
                                        onChange={(e) => createForm.setData('status', e.target.value)}
                                        required
                                        className={inputClass}
                                    >
                                        <option value="PENDIENTE DE PAGO">PENDIENTE DE PAGO</option>
                                        <option value="PAGADO">PAGADO</option>
                                        <option value="VENCIDO">VENCIDO</option>
                                        <option value="CANCELADO">CANCELADO</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="due_date" className={labelClass}>Fecha de Pago (Vencimiento)</Label>
                                    <Input
                                        id="due_date"
                                        type="date"
                                        value={createForm.data.due_date}
                                        onChange={(e) => createForm.setData('due_date', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="paid_at" className={labelClass}>Pagada el</Label>
                                    <Input
                                        id="paid_at"
                                        type="date"
                                        value={createForm.data.paid_at}
                                        onChange={(e) => createForm.setData('paid_at', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="invoice_number" className={labelClass}>N.° de Factura</Label>
                                <Input
                                    id="invoice_number"
                                    value={createForm.data.invoice_number}
                                    onChange={(e) => createForm.setData('invoice_number', e.target.value)}
                                    placeholder="Ej: 10452"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="rounded-xl text-xs font-bold"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={createForm.processing}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 text-xs font-bold shadow-md transition cursor-pointer"
                            >
                                Guardar Cuota
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT CUOTA MODAL DIALOG */}
            <Dialog open={!!installmentToEdit} onOpenChange={(open) => !open && setInstallmentToEdit(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                            <span>✏️</span>
                            <span>Editar Cuota #{installmentToEdit?.id}</span>
                        </DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">Modifica los detalles de la cuota seleccionada</p>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="edit_contract_id" className={labelClass}>Vincular a Contrato Existente</Label>
                                <select
                                    id="edit_contract_id"
                                    value={editForm.data.contract_id}
                                    onChange={(e) => {
                                        const selId = e.target.value;
                                        const found = contractsList.find((c) => String(c.id) === selId);
                                        editForm.setData({
                                            ...editForm.data,
                                            contract_id: selId,
                                            legacy_contract_rut: found ? found.rut : editForm.data.legacy_contract_rut,
                                        });
                                    }}
                                    className={inputClass}
                                >
                                    <option value="">Seleccionar contrato de la lista...</option>
                                    {contractsList.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            Contrato N° {c.id} — {toTitleCase(c.first_name)} {toTitleCase(c.last_name)} ({c.rut})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="edit_legacy_contract_rut" className={labelClass}>RUT del Contrato / Cliente</Label>
                                <Input
                                    id="edit_legacy_contract_rut"
                                    value={editForm.data.legacy_contract_rut}
                                    onChange={(e) => editForm.setData('legacy_contract_rut', e.target.value)}
                                    placeholder="12.345.678-9"
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <Label htmlFor="edit_amount" className={labelClass}>Valor de la Cuota ($ CLP)</Label>
                                <Input
                                    id="edit_amount"
                                    type="number"
                                    min={0}
                                    step="any"
                                    value={editForm.data.amount}
                                    onChange={(e) => editForm.setData('amount', e.target.value)}
                                    placeholder="Ej: 25000"
                                    className={inputClass}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="edit_status" className={labelClass}>Estado de la Cuota *</Label>
                                    <select
                                        id="edit_status"
                                        value={editForm.data.status}
                                        onChange={(e) => editForm.setData('status', e.target.value)}
                                        required
                                        className={inputClass}
                                    >
                                        <option value="PENDIENTE DE PAGO">PENDIENTE DE PAGO</option>
                                        <option value="PAGADO">PAGADO</option>
                                        <option value="VENCIDO">VENCIDO</option>
                                        <option value="CANCELADO">CANCELADO</option>
                                    </select>
                                </div>

                                <div>
                                    <Label htmlFor="edit_due_date" className={labelClass}>Fecha de Pago (Vencimiento)</Label>
                                    <Input
                                        id="edit_due_date"
                                        type="date"
                                        value={editForm.data.due_date}
                                        onChange={(e) => editForm.setData('due_date', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="edit_paid_at" className={labelClass}>Pagada el</Label>
                                    <Input
                                        id="edit_paid_at"
                                        type="date"
                                        value={editForm.data.paid_at}
                                        onChange={(e) => editForm.setData('paid_at', e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="edit_invoice_number" className={labelClass}>N.° de Factura</Label>
                                <Input
                                    id="edit_invoice_number"
                                    value={editForm.data.invoice_number}
                                    onChange={(e) => editForm.setData('invoice_number', e.target.value)}
                                    placeholder="Ej: 10452"
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setInstallmentToEdit(null)}
                                className="rounded-xl text-xs font-bold"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={editForm.processing}
                                className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 text-xs font-bold shadow-md transition cursor-pointer"
                            >
                                Guardar Cambios
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRMATION DIALOG */}
            <Dialog open={!!installmentToDelete} onOpenChange={(open) => !open && setInstallmentToDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>Confirmar Eliminación</span>
                        </DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">
                            ¿Está seguro de que desea eliminar la cuota #{installmentToDelete?.id}? Esta acción eliminará el registro permanentemente.
                        </p>
                    </DialogHeader>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setInstallmentToDelete(null)}
                            className="rounded-xl text-xs font-bold"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmDelete}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                            Eliminar Cuota
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

InstallmentsIndex.layout = {
    breadcrumbs: [{ title: 'Cuotas', href: installments.index() }],
};
