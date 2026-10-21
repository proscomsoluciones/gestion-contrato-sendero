import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import contracts from '@/routes/contracts';
import type { Commune } from '@/types/client';
import type { Contract, Seller } from '@/types/contract';

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
    return (f + l) || 'CT';
}

function isValidPhone(phone?: string | null) {
    if (!phone) return false;
    const clean = phone.trim().toLowerCase();
    return clean !== '' && clean !== '0' && clean !== 'no' && clean !== 'n/a' && clean !== 'null' && clean !== 'none';
}

function formatPhone(phone?: string | null) {
    if (!isValidPhone(phone)) return null;
    const cleaned = (phone || '').replace(/\D/g, '');
    if (cleaned.length === 8 || cleaned.length === 9) {
        return `+56 9 ${cleaned.slice(-8, -4)} ${cleaned.slice(-4)}`;
    }
    return phone;
}


function formatAmount(value: number | null) {
    if (value === null || value === undefined) return '—';
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(value);
}

function formatDate(value: string | null) {
    if (!value) return '—';
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('es-CL').format(new Date(year, month - 1, day));
}

export default function ContractsIndex({
    contracts: paginatedContracts,
    communes = [],
    sellers = [],
    filters,
}: {
    contracts: Paginated<Contract>;
    communes?: Commune[];
    sellers?: Seller[];
    filters: { q: string; per_page?: number };
}) {
    const [search, setSearch] = useState(filters.q ?? '');
    const [perPage, setPerPage] = useState(filters.per_page ?? 10);
    const [activeFilter, setActiveFilter] = useState<'all' | 'cuotas' | 'contado'>('all');
    
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);

    const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);
    const [editStep, setEditStep] = useState<1 | 2 | 3>(1);

    const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);

    // Create Form Hook
    const createForm = useForm({
        contract_date: new Date().toISOString().split('T')[0],
        first_name: '',
        last_name: '',
        rut: '',
        address: '',
        commune_id: '',
        phone_1: '',
        phone_2: '',
        email: '',
        marital_status: '',
        beneficiary_first_name: '',
        beneficiary_last_name: '',
        beneficiary_rut: '',
        beneficiary_relationship: '',
        urn: '',
        transfer: '',
        chapel: '',
        status: 'Vigente',
        seller_id: '',
        amount: '',
        down_payment: '',
        total: '',
        is_installment_plan: true,
        observation: '',
    });

    // Edit Form Hook
    const editForm = useForm({
        contract_date: '',
        first_name: '',
        last_name: '',
        rut: '',
        address: '',
        commune_id: '',
        phone_1: '',
        phone_2: '',
        email: '',
        marital_status: '',
        beneficiary_first_name: '',
        beneficiary_last_name: '',
        beneficiary_rut: '',
        beneficiary_relationship: '',
        urn: '',
        transfer: '',
        chapel: '',
        status: 'Vigente',
        seller_id: '',
        amount: '',
        down_payment: '',
        total: '',
        is_installment_plan: true,
        observation: '',
    });

    function submitSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(contracts.index().url, { q: search, per_page: perPage }, { preserveState: true, replace: true });
    }

    function handlePerPageChange(newPerPage: number) {
        setPerPage(newPerPage);
        router.get(contracts.index().url, { q: search, per_page: newPerPage }, { preserveState: true, replace: true });
    }

    function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(contracts.store().url, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setCreateStep(1);
                createForm.reset();
            },
        });
    }

    function openEditModal(contract: Contract) {
        setEditStep(1);
        editForm.setData({
            contract_date: contract.contract_date || '',
            first_name: contract.first_name || '',
            last_name: contract.last_name || '',
            rut: contract.rut || '',
            address: contract.address || '',
            commune_id: contract.commune_id ? String(contract.commune_id) : '',
            phone_1: contract.phone_1 || '',
            phone_2: contract.phone_2 || '',
            email: contract.email || '',
            marital_status: contract.marital_status || '',
            beneficiary_first_name: contract.beneficiary_first_name || '',
            beneficiary_last_name: contract.beneficiary_last_name || '',
            beneficiary_rut: contract.beneficiary_rut || '',
            beneficiary_relationship: contract.beneficiary_relationship || '',
            urn: contract.urn || '',
            transfer: contract.transfer || '',
            chapel: contract.chapel || '',
            status: contract.status || 'Vigente',
            seller_id: contract.seller_id ? String(contract.seller_id) : '',
            amount: contract.amount ? String(contract.amount) : '',
            down_payment: contract.down_payment ? String(contract.down_payment) : '',
            total: contract.total ? String(contract.total) : '',
            is_installment_plan: !!contract.is_installment_plan,
            observation: contract.observation || '',
        });
        setContractToEdit(contract);
    }

    function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!contractToEdit) return;
        editForm.put(contracts.update(contractToEdit).url, {
            onSuccess: () => {
                setContractToEdit(null);
                setEditStep(1);
            },
        });
    }

    function confirmDelete() {
        if (!contractToDelete) return;
        router.delete(contracts.destroy(contractToDelete).url, {
            preserveScroll: true,
            onSuccess: () => setContractToDelete(null),
        });
    }

    const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs";
    const labelClass = "text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1";

    const filteredData = paginatedContracts.data.filter((c) => {
        if (activeFilter === 'cuotas') {
            return !!c.is_installment_plan;
        }
        if (activeFilter === 'contado') {
            return !c.is_installment_plan;
        }
        return true;
    });

    return (
        <>
            <Head title="Directorio de Contratos" />

            <div className="space-y-6 p-4 sm:p-6 w-full max-w-[1440px] mx-auto">
                
                {/* Header Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">GESTIÓN DE CONTRATOS</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Directorio General de Contratos</h1>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            Gestión Ejecutiva Sendero Otoñal • {paginatedContracts.total ?? paginatedContracts.data.length} contratos registrados en el sistema
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
                            <span>📄</span>
                            <span>+ Emitir Nuevo Contrato</span>
                        </Button>
                    </div>
                </div>

                {/* 3 Quick Summary KPI Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL CONTRATOS REGISTRADOS</span>
                            <div className="text-xl font-black text-slate-900 mt-0.5">{paginatedContracts.total ?? paginatedContracts.data.length} Contratos</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                            📄
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">EFICIENCIA DE EMISIÓN</span>
                            <div className="text-xl font-black text-emerald-600 mt-0.5">92.4% Al Día</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                            📈
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">MODALIDAD DE PAGO</span>
                            <div className="text-xl font-black text-indigo-600 mt-0.5">En Cuotas / Contado</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base">
                            💳
                        </div>
                    </div>
                </div>

                {/* Main White Rounded Card Container */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                    
                    {/* Toolbar: Search + Category Filter Tabs + Per Page Select */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        
                        {/* Search Input Bar */}
                        <form onSubmit={submitSearch} className="w-full lg:w-80">
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm">
                                    🔍
                                </span>
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Buscar por RUT, contratante o beneficiario..."
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
                                    onClick={() => setActiveFilter('all')}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                                        activeFilter === 'all'
                                            ? 'bg-white text-slate-900 shadow-2xs border border-slate-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Todos ({paginatedContracts.total ?? paginatedContracts.data.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveFilter('cuotas')}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                                        activeFilter === 'cuotas'
                                            ? 'bg-white text-emerald-700 shadow-2xs border border-emerald-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    En Cuotas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveFilter('contado')}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                                        activeFilter === 'contado'
                                            ? 'bg-white text-blue-700 shadow-2xs border border-blue-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Al Contado
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* Table Data */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 w-full">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-500 tracking-wider py-2.5 px-3 border-b border-slate-200/80">
                                    <th className="py-2.5 px-3 whitespace-nowrap">RUT</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap">CONTRATANTE / CLIENTE</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap">TELÉFONOS</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap">BENEFICIARIO</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap">COMUNA</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap">VALOR TOTAL</th>
                                    <th className="py-2.5 px-3 text-center whitespace-nowrap">FECHA & ESTADO</th>
                                    <th className="py-2.5 px-3 text-right whitespace-nowrap min-w-[110px]">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                                {filteredData.map((contract, idx) => {
                                    const fullName = `${toTitleCase(contract.first_name)} ${toTitleCase(contract.last_name)}`;
                                    const initials = getInitials(contract.first_name, contract.last_name);
                                    const beneficiaryName = contract.beneficiary_first_name || contract.beneficiary_last_name
                                        ? `${toTitleCase(contract.beneficiary_first_name)} ${toTitleCase(contract.beneficiary_last_name)}`
                                        : '—';
                                    const phone1Formatted = formatPhone(contract.phone_1);
                                    const phone2Formatted = formatPhone(contract.phone_2);

                                    const bgColors = ['bg-emerald-100 text-emerald-800', 'bg-blue-100 text-blue-800', 'bg-indigo-100 text-indigo-800', 'bg-amber-100 text-amber-800', 'bg-teal-100 text-teal-800'];
                                    const avatarColor = bgColors[idx % bgColors.length];

                                    return (
                                        <tr key={contract.id} className="hover:bg-slate-50/90 transition-colors group">
                                            {/* 1. RUT */}
                                            <td className="py-2.5 px-3 font-mono font-extrabold text-slate-800 whitespace-nowrap">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 inline-block font-mono text-[11px]">
                                                    {contract.rut}
                                                </span>
                                            </td>

                                            {/* 2. CONTRATANTE / CLIENTE */}
                                            <td className="py-2.5 px-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`h-8 w-8 rounded-xl ${avatarColor} flex items-center justify-center font-black text-[10px] shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0`}>
                                                        {initials}
                                                    </div>
                                                    <div className="max-w-[160px]">
                                                        <div className="font-extrabold text-slate-900 text-xs truncate" title={fullName}>{fullName}</div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-slate-400">Contrato N° {contract.id}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => window.open(contracts.pdf(contract).url, '_blank')}
                                                                className="text-[10px] font-extrabold text-emerald-600 hover:underline cursor-pointer"
                                                            >
                                                                • 📄 PDF
                                                            </button>
                                                        </div>

                                                    </div>
                                                </div>
                                            </td>

                                            {/* 3. TELÉFONOS */}
                                            <td className="py-2.5 px-3 font-mono font-bold whitespace-nowrap">
                                                <div className="space-y-0.5 text-[11px]">
                                                    {phone1Formatted ? (
                                                        <div className="flex items-center gap-1 text-slate-800 hover:text-emerald-600 transition cursor-pointer">
                                                            <span className="text-emerald-600 text-[10px]">📞</span>
                                                            <span>{phone1Formatted}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 font-semibold">—</span>
                                                    )}
                                                    {phone2Formatted && (
                                                        <div className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 transition cursor-pointer text-[10px]">
                                                            <span className="text-slate-400 text-[9px]">📱</span>
                                                            <span>{phone2Formatted}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* 4. BENEFICIARIO */}
                                            <td className="py-2.5 px-3 text-slate-800 font-bold whitespace-nowrap">
                                                <div className="flex items-center gap-1 text-xs max-w-[150px]">
                                                    <span className="text-slate-400 flex-shrink-0">👤</span>
                                                    <span className="truncate" title={beneficiaryName}>{beneficiaryName}</span>
                                                </div>
                                            </td>

                                            {/* 5. COMUNA */}
                                            <td className="py-2.5 px-3 text-slate-700 font-bold whitespace-nowrap text-xs">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-400">📍</span>
                                                    <span>{toTitleCase(contract.commune?.name) || 'Santiago'}</span>
                                                </div>
                                            </td>

                                            {/* 6. VALOR TOTAL */}
                                            <td className="py-2.5 px-3 font-black text-emerald-700 text-xs whitespace-nowrap">
                                                {formatAmount(contract.total)}
                                            </td>

                                            {/* 7. FECHA & ESTADO */}
                                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                                <div className="space-y-0.5">
                                                    <div className="text-[10px] font-bold text-slate-500">
                                                        📅 {formatDate(contract.contract_date)}
                                                    </div>
                                                    <span className={`inline-flex items-center gap-1 rounded-full text-[9px] font-extrabold px-2 py-0.5 border shadow-2xs ${
                                                        contract.is_installment_plan
                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                            : 'bg-blue-50 text-blue-800 border-blue-200'
                                                    }`}>
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                        <span>{contract.is_installment_plan ? 'En Cuotas' : 'Al Contado'}</span>
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 8. ACCIONES */}
                                            <td className="py-2.5 px-3 text-right whitespace-nowrap min-w-[140px]">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => window.open(contracts.pdf(contract).url, '_blank')}
                                                        className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg px-2 py-1 text-[11px] font-bold shadow-2xs transition cursor-pointer"
                                                    >
                                                        <span>📄 PDF</span>
                                                    </button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditModal(contract)}
                                                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-2xs transition"
                                                    >
                                                        <span>✏️ Editar</span>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setContractToDelete(contract)}
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
                                            No se encontraron contratos registrados que coincidan con la búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>


                    {/* Pagination Bar */}
                    {paginatedContracts.links.length > 3 && (
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                            <div>Mostrando {filteredData.length} registros</div>
                            <div className="flex flex-wrap gap-1.5">
                                {paginatedContracts.links.map((link, i) => {
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

            {/* 3-STEP CREATE CONTRACT WIZARD MODAL */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span>📄</span>
                            <span>Emisión de Contrato — Asistente Guiado en 3 Pasos</span>
                        </DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">Gestión Ejecutiva de Contratos • Sendero Otoñal</p>
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
                                1. Contratante
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
                                2. Beneficiario & Servicio
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
                                3. Financiamiento
                            </span>
                        </button>

                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-1">
                        
                        {/* STEP 1: DATOS DEL CONTRATANTE */}
                        {createStep === 1 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span>Paso 1 de 3: Datos del Contratante & RUT</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="rut" className={labelClass}>RUT Contratante *</Label>
                                        <Input id="rut" value={createForm.data.rut} onChange={(e) => createForm.setData('rut', e.target.value)} required placeholder="12.345.678-9" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contract_date" className={labelClass}>Fecha de Emisión *</Label>
                                        <Input id="contract_date" type="date" value={createForm.data.contract_date} onChange={(e) => createForm.setData('contract_date', e.target.value)} required className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="first_name" className={labelClass}>Nombre Contratante *</Label>
                                        <Input id="first_name" value={createForm.data.first_name} onChange={(e) => createForm.setData('first_name', e.target.value)} required placeholder="Nombre del titular" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="last_name" className={labelClass}>Apellido Contratante *</Label>
                                        <Input id="last_name" value={createForm.data.last_name} onChange={(e) => createForm.setData('last_name', e.target.value)} required placeholder="Apellido del titular" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="address" className={labelClass}>Dirección Particular</Label>
                                        <Input id="address" value={createForm.data.address} onChange={(e) => createForm.setData('address', e.target.value)} placeholder="Av. Principal 123" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="commune_id" className={labelClass}>Comuna</Label>
                                        <select id="commune_id" value={createForm.data.commune_id} onChange={(e) => createForm.setData('commune_id', e.target.value)} className={inputClass}>
                                            <option value="">Sin especificar</option>
                                            {communes.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="phone_1" className={labelClass}>Teléfono Principal</Label>
                                        <Input id="phone_1" value={createForm.data.phone_1} onChange={(e) => createForm.setData('phone_1', e.target.value)} placeholder="+56 9 1234 5678" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone_2" className={labelClass}>Teléfono Secundario</Label>
                                        <Input id="phone_2" value={createForm.data.phone_2} onChange={(e) => createForm.setData('phone_2', e.target.value)} placeholder="+56 9 8765 4321" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: BENEFICIARIO & DETALLES DEL SERVICIO */}
                        {createStep === 2 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                    <span>Paso 2 de 3: Datos del Beneficiario & Servicio</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="beneficiary_first_name" className={labelClass}>Nombre Beneficiario</Label>
                                        <Input id="beneficiary_first_name" value={createForm.data.beneficiary_first_name} onChange={(e) => createForm.setData('beneficiary_first_name', e.target.value)} placeholder="Nombre" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="beneficiary_last_name" className={labelClass}>Apellido Beneficiario</Label>
                                        <Input id="beneficiary_last_name" value={createForm.data.beneficiary_last_name} onChange={(e) => createForm.setData('beneficiary_last_name', e.target.value)} placeholder="Apellido" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="beneficiary_rut" className={labelClass}>RUT Beneficiario</Label>
                                        <Input id="beneficiary_rut" value={createForm.data.beneficiary_rut} onChange={(e) => createForm.setData('beneficiary_rut', e.target.value)} placeholder="12.345.678-9" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="beneficiary_relationship" className={labelClass}>Parentesco</Label>
                                        <Input id="beneficiary_relationship" value={createForm.data.beneficiary_relationship} onChange={(e) => createForm.setData('beneficiary_relationship', e.target.value)} placeholder="Ej: Padre / Cónyuge" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="urn" className={labelClass}>Modelo de Urna / Cobertura</Label>
                                        <Input id="urn" value={createForm.data.urn} onChange={(e) => createForm.setData('urn', e.target.value)} placeholder="Ej: Urna Tradicional Ébano" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="chapel" className={labelClass}>Lugar de Velatorio / Capilla</Label>
                                        <Input id="chapel" value={createForm.data.chapel} onChange={(e) => createForm.setData('chapel', e.target.value)} placeholder="Ej: Parroquia Central" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: FINANCIAMIENTO & VENDEDOR */}
                        {createStep === 3 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                    <span>Paso 3 de 3: Financiamiento & Modalidad de Pago</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="total" className={labelClass}>Valor Total del Contrato ($ CLP) *</Label>
                                        <Input id="total" type="number" min={0} value={createForm.data.total} onChange={(e) => createForm.setData('total', e.target.value)} placeholder="450000" required className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="down_payment" className={labelClass}>Pie Inicial ($ CLP)</Label>
                                        <Input id="down_payment" type="number" min={0} value={createForm.data.down_payment} onChange={(e) => createForm.setData('down_payment', e.target.value)} placeholder="50000" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="seller_id" className={labelClass}>Vendedor Asignado</Label>
                                        <select id="seller_id" value={createForm.data.seller_id} onChange={(e) => createForm.setData('seller_id', e.target.value)} className={inputClass}>
                                            <option value="">Sin vendedor asignado</option>
                                            {sellers.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col justify-center pt-2">
                                        <div className="flex items-center gap-2.5">
                                            <Checkbox id="modal_is_installment_plan" checked={createForm.data.is_installment_plan} onCheckedChange={(val) => createForm.setData('is_installment_plan', !!val)} />
                                            <Label htmlFor="modal_is_installment_plan" className="text-xs font-bold text-slate-700 cursor-pointer">Modalidad en Cuotas Mensuales</Label>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="observation" className={labelClass}>Observaciones del Contrato</Label>
                                        <Input id="observation" value={createForm.data.observation} onChange={(e) => createForm.setData('observation', e.target.value)} placeholder="Notas adicionales o convenio" className={inputClass} />
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
                                        <span>Emitir Contrato</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                    </form>
                </DialogContent>
            </Dialog>

            {/* 3-STEP EDIT CONTRACT WIZARD MODAL */}
            <Dialog open={!!contractToEdit} onOpenChange={() => setContractToEdit(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span>✏️</span>
                            <span>Editar Contrato N° {contractToEdit?.id} — {contractToEdit && `${toTitleCase(contractToEdit.first_name)} ${toTitleCase(contractToEdit.last_name)}`}</span>
                        </DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">Gestión Ejecutiva de Contratos • Sendero Otoñal</p>
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
                                1. Contratante
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
                                2. Beneficiario & Servicio
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
                                3. Financiamiento
                            </span>
                        </button>

                    </div>

                    <form onSubmit={handleEditSubmit} className="space-y-4 pt-1">
                        
                        {/* STEP 1: DATOS DEL CONTRATANTE */}
                        {editStep === 1 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span>Paso 1 de 3: Datos del Contratante & RUT</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="edit_rut" className={labelClass}>RUT Contratante *</Label>
                                        <Input id="edit_rut" value={editForm.data.rut} onChange={(e) => editForm.setData('rut', e.target.value)} required placeholder="12.345.678-9" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_contract_date" className={labelClass}>Fecha de Emisión *</Label>
                                        <Input id="edit_contract_date" type="date" value={editForm.data.contract_date} onChange={(e) => editForm.setData('contract_date', e.target.value)} required className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_first_name" className={labelClass}>Nombre Contratante *</Label>
                                        <Input id="edit_first_name" value={editForm.data.first_name} onChange={(e) => editForm.setData('first_name', e.target.value)} required placeholder="Nombre del titular" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_last_name" className={labelClass}>Apellido Contratante *</Label>
                                        <Input id="edit_last_name" value={editForm.data.last_name} onChange={(e) => editForm.setData('last_name', e.target.value)} required placeholder="Apellido del titular" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_address" className={labelClass}>Dirección Particular</Label>
                                        <Input id="edit_address" value={editForm.data.address} onChange={(e) => editForm.setData('address', e.target.value)} placeholder="Av. Principal 123" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_commune_id" className={labelClass}>Comuna</Label>
                                        <select id="edit_commune_id" value={editForm.data.commune_id} onChange={(e) => editForm.setData('commune_id', e.target.value)} className={inputClass}>
                                            <option value="">Sin especificar</option>
                                            {communes.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_phone_1" className={labelClass}>Teléfono Principal</Label>
                                        <Input id="edit_phone_1" value={editForm.data.phone_1} onChange={(e) => editForm.setData('phone_1', e.target.value)} placeholder="+56 9 1234 5678" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_phone_2" className={labelClass}>Teléfono Secundario</Label>
                                        <Input id="edit_phone_2" value={editForm.data.phone_2} onChange={(e) => editForm.setData('phone_2', e.target.value)} placeholder="+56 9 8765 4321" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: BENEFICIARIO & DETALLES DEL SERVICIO */}
                        {editStep === 2 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                    <span>Paso 2 de 3: Datos del Beneficiario & Servicio</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="edit_beneficiary_first_name" className={labelClass}>Nombre Beneficiario</Label>
                                        <Input id="edit_beneficiary_first_name" value={editForm.data.beneficiary_first_name} onChange={(e) => editForm.setData('beneficiary_first_name', e.target.value)} placeholder="Nombre" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_beneficiary_last_name" className={labelClass}>Apellido Beneficiario</Label>
                                        <Input id="edit_beneficiary_last_name" value={editForm.data.beneficiary_last_name} onChange={(e) => editForm.setData('beneficiary_last_name', e.target.value)} placeholder="Apellido" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_beneficiary_rut" className={labelClass}>RUT Beneficiario</Label>
                                        <Input id="edit_beneficiary_rut" value={editForm.data.beneficiary_rut} onChange={(e) => editForm.setData('beneficiary_rut', e.target.value)} placeholder="12.345.678-9" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_beneficiary_relationship" className={labelClass}>Parentesco</Label>
                                        <Input id="edit_beneficiary_relationship" value={editForm.data.beneficiary_relationship} onChange={(e) => editForm.setData('beneficiary_relationship', e.target.value)} placeholder="Ej: Padre / Cónyuge" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_urn" className={labelClass}>Modelo de Urna / Cobertura</Label>
                                        <Input id="edit_urn" value={editForm.data.urn} onChange={(e) => editForm.setData('urn', e.target.value)} placeholder="Ej: Urna Tradicional Ébano" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_chapel" className={labelClass}>Lugar de Velatorio / Capilla</Label>
                                        <Input id="edit_chapel" value={editForm.data.chapel} onChange={(e) => editForm.setData('chapel', e.target.value)} placeholder="Ej: Parroquia Central" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: FINANCIAMIENTO & VENDEDOR */}
                        {editStep === 3 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                    <span>Paso 3 de 3: Financiamiento & Modalidad de Pago</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="edit_total" className={labelClass}>Valor Total del Contrato ($ CLP) *</Label>
                                        <Input id="edit_total" type="number" min={0} value={editForm.data.total} onChange={(e) => editForm.setData('total', e.target.value)} placeholder="450000" required className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_down_payment" className={labelClass}>Pie Inicial ($ CLP)</Label>
                                        <Input id="edit_down_payment" type="number" min={0} value={editForm.data.down_payment} onChange={(e) => editForm.setData('down_payment', e.target.value)} placeholder="50000" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_seller_id" className={labelClass}>Vendedor Asignado</Label>
                                        <select id="edit_seller_id" value={editForm.data.seller_id} onChange={(e) => editForm.setData('seller_id', e.target.value)} className={inputClass}>
                                            <option value="">Sin vendedor asignado</option>
                                            {sellers.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col justify-center pt-2">
                                        <div className="flex items-center gap-2.5">
                                            <Checkbox id="edit_modal_is_installment_plan" checked={editForm.data.is_installment_plan} onCheckedChange={(val) => editForm.setData('is_installment_plan', !!val)} />
                                            <Label htmlFor="edit_modal_is_installment_plan" className="text-xs font-bold text-slate-700 cursor-pointer">Modalidad en Cuotas Mensuales</Label>
                                        </div>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <Label htmlFor="edit_observation" className={labelClass}>Observaciones del Contrato</Label>
                                        <Input id="edit_observation" value={editForm.data.observation} onChange={(e) => editForm.setData('observation', e.target.value)} placeholder="Notas adicionales o convenio" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEPPER CONTROL BUTTONS */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setContractToEdit(null)}
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
                                        <span>Actualizar Contrato</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE WARNING CONFIRMATION MODAL */}
            <Dialog open={!!contractToDelete} onOpenChange={() => setContractToDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-xl font-bold">
                                ⚠️
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black text-slate-900">¿Eliminar Contrato N° {contractToDelete?.id}?</DialogTitle>
                                <p className="text-xs text-slate-500 font-medium">Esta acción requiere confirmación de seguridad</p>
                            </div>
                        </div>
                    </DialogHeader>

                    {contractToDelete && (
                        <div className="space-y-4 pt-2 text-xs font-semibold text-slate-600">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                                <div className="text-xs font-black text-slate-900">
                                    Contratante: {toTitleCase(contractToDelete.first_name)} {toTitleCase(contractToDelete.last_name)}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500">
                                    RUT: <span className="font-extrabold text-slate-800">{contractToDelete.rut}</span> | Total: <span className="font-extrabold text-emerald-700">{formatAmount(contractToDelete.total)}</span>
                                </div>
                            </div>

                            <p className="text-slate-600 leading-relaxed">
                                ¿Estás seguro de que deseas eliminar permanentemente este contrato? Esta acción anulará el registro y afectará el historial de cuotas asociadas.
                            </p>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setContractToDelete(null)}
                                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold transition"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 py-2 text-xs font-bold shadow-md transition flex items-center gap-1.5"
                                >
                                    <span>🗑️ Sí, Eliminar Contrato</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

ContractsIndex.layout = {
    breadcrumbs: [{ title: 'Contratos', href: contracts.index() }],
};

