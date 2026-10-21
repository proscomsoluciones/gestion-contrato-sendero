import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import clients from '@/routes/clients';
import type { Client, Commune } from '@/types/client';

type PaginationLink = { url: string | null; label: string; active: boolean };

type Paginated<T> = {
    data: T[];
    total?: number;
    links: PaginationLink[];
};


function toTitleCase(str?: string) {
    if (!str) return '—';
    return str
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getInitials(firstName?: string, lastName?: string) {
    const f = firstName ? firstName.trim().charAt(0).toUpperCase() : '';
    const l = lastName ? lastName.trim().charAt(0).toUpperCase() : '';
    return (f + l) || 'CL';
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


export default function ClientsIndex({
    clients: paginatedClients,
    communes = [],
    filters,
}: {
    clients: Paginated<Client>;
    communes?: Commune[];
    filters: { q: string; per_page?: number };
}) {
    const [search, setSearch] = useState(filters.q ?? '');
    const [perPage, setPerPage] = useState(filters.per_page ?? 10);
    const [activeFilter, setActiveFilter] = useState<'all' | 'pensionados' | 'activos'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
    const [editStep, setEditStep] = useState<1 | 2 | 3>(1);

    function submitSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(clients.index().url, { q: search, per_page: perPage }, { preserveState: true, replace: true });
    }

    function handlePerPageChange(newPerPage: number) {
        setPerPage(newPerPage);
        router.get(clients.index().url, { q: search, per_page: newPerPage }, { preserveState: true, replace: true });
    }

    function confirmDelete() {
        if (!clientToDelete) return;
        router.delete(clients.destroy(clientToDelete).url, {
            preserveScroll: true,
            onSuccess: () => setClientToDelete(null),
        });
    }

    const { data, setData, post, processing, errors, reset } = useForm({
        rut: '',
        status: '',
        first_name: '',
        last_name: '',
        address: '',
        commune_id: '',
        phone_1: '',
        phone_2: '',
        contact_first_name: '',
        contact_last_name: '',
        contact_rut: '',
        contact_address: '',
        contact_marital_status: '',
        contact_education: '',
        urn: '',
        amount: '',
        contract_date: '',
        payment_day: '',
        installments_count: '',
        includes_van: false,
        includes_car: false,
    });

    const editForm = useForm({
        rut: '',
        status: '',
        first_name: '',
        last_name: '',
        address: '',
        commune_id: '',
        phone_1: '',
        phone_2: '',
        contact_first_name: '',
        contact_last_name: '',
        contact_rut: '',
        contact_address: '',
        contact_marital_status: '',
        contact_education: '',
        urn: '',
        amount: '',
        contract_date: '',
        payment_day: '',
        installments_count: '',
        includes_van: false,
        includes_car: false,
    });

    function openEditModal(client: Client) {
        setEditStep(1);
        editForm.setData({
            rut: client.rut || '',
            status: client.status || '',
            first_name: client.first_name || '',
            last_name: client.last_name || '',
            address: client.address || '',
            commune_id: client.commune_id ? String(client.commune_id) : '',
            phone_1: client.phone_1 || '',
            phone_2: client.phone_2 || '',
            contact_first_name: client.contact_first_name || '',
            contact_last_name: client.contact_last_name || '',
            contact_rut: client.contact_rut || '',
            contact_address: client.contact_address || '',
            contact_marital_status: client.contact_marital_status || '',
            contact_education: client.contact_education || '',
            urn: client.urn || '',
            amount: client.amount ? String(client.amount) : '',
            contract_date: client.contract_date || '',
            payment_day: client.payment_day ? String(client.payment_day) : '',
            installments_count: client.installments_count ? String(client.installments_count) : '',
            includes_van: !!client.includes_van,
            includes_car: !!client.includes_car,
        });
        setClientToEdit(client);
    }

    function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!clientToEdit) return;
        editForm.put(clients.update(clientToEdit).url, {
            onSuccess: () => {
                setClientToEdit(null);
                setEditStep(1);
            },
        });
    }


    function submitSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(clients.index().url, { q: search }, { preserveState: true, replace: true });
    }

    function destroy(client: Client) {
        if (confirm(`¿Confirma eliminar el registro del cliente ${client.first_name} ${client.last_name}?`)) {
            router.delete(clients.destroy(client).url, { preserveScroll: true });
        }
    }

    function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(clients.store().url, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setCurrentStep(1);
                reset();
            },
        });
    }

    const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs";
    const labelClass = "text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1";

    const filteredData = paginatedClients.data.filter((c) => {
        if (activeFilter === 'pensionados') {
            return (c.status ?? '').toLowerCase().includes('pensionad');
        }
        if (activeFilter === 'activos') {
            return (c.status ?? '').toLowerCase().includes('activ');
        }
        return true;
    });

    return (
        <>
            <Head title="Directorio de Clientes" />

            <div className="space-y-6 p-4 sm:p-6 w-full max-w-[1440px] mx-auto">

                
                {/* Header Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">GESTIÓN DE CLIENTES</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Directorio de Clientes & Titulares</h1>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            Gestión Ejecutiva de Contratos Sendero Otoñal • {paginatedClients.total ?? paginatedClients.data.length} titulares registrados
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => {
                                setCurrentStep(1);
                                setIsCreateModalOpen(true);
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-md transition flex items-center gap-2"
                        >
                            <span>👤</span>
                            <span>+ Registrar Nuevo Cliente</span>
                        </Button>
                    </div>
                </div>

                {/* 3 Quick Summary KPI Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL CLIENTES REGISTRADOS</span>
                            <div className="text-xl font-black text-slate-900 mt-0.5">{paginatedClients.total ?? paginatedClients.data.length} Titulares</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                            👥
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">ESTADO DE COBRANZA</span>
                            <div className="text-xl font-black text-emerald-600 mt-0.5">90% Al Día</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                            ✓
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PLANES Y COBERTURAS</span>
                            <div className="text-xl font-black text-blue-600 mt-0.5">Vigentes</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
                            📄
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
                                    placeholder="Buscar por RUT, nombre o apellido..."
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
                                    Todos ({paginatedClients.total ?? paginatedClients.data.length})
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveFilter('pensionados')}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                                        activeFilter === 'pensionados'
                                            ? 'bg-white text-emerald-700 shadow-2xs border border-emerald-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Pensionados INP
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveFilter('activos')}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                                        activeFilter === 'activos'
                                            ? 'bg-white text-blue-700 shadow-2xs border border-blue-200'
                                            : 'text-slate-500 hover:text-slate-800'
                                    }`}
                                >
                                    Trabajadores Activos
                                </button>
                            </div>
                        </div>

                    </div>


                    {/* Table Data */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/80 w-full">
                        <table className="w-full text-left border-collapse table-auto">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-500 tracking-wider py-2.5 px-3 border-b border-slate-200/80">
                                    <th className="py-2.5 px-3 whitespace-nowrap">RUT</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap">TITULAR / CLIENTE</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap">TELÉFONOS</th>
                                    <th className="py-2.5 px-3 whitespace-nowrap">COMUNA</th>
                                    <th className="py-2.5 px-3 text-center whitespace-nowrap">SITUACIÓN</th>
                                    <th className="py-2.5 px-3 text-right whitespace-nowrap">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                                {filteredData.map((client, idx) => {
                                    const fullName = `${toTitleCase(client.first_name)} ${toTitleCase(client.last_name)}`;
                                    const initials = getInitials(client.first_name, client.last_name);
                                    const rawStatus = (client.status || 'Pensionado INP').trim();
                                    const isPensionado = rawStatus.toLowerCase().includes('pensionad');
                                    const isActivo = rawStatus.toLowerCase().includes('activ');

                                    const phone1Formatted = formatPhone(client.phone_1);
                                    const phone2Formatted = formatPhone(client.phone_2);

                                    const bgColors = ['bg-emerald-100 text-emerald-800', 'bg-blue-100 text-blue-800', 'bg-indigo-100 text-indigo-800', 'bg-amber-100 text-amber-800', 'bg-teal-100 text-teal-800'];
                                    const avatarColor = bgColors[idx % bgColors.length];

                                    return (
                                        <tr key={client.id} className="hover:bg-slate-50/90 transition-colors group">
                                            {/* 1. RUT */}
                                            <td className="py-2.5 px-3 font-mono font-extrabold text-slate-800 whitespace-nowrap">
                                                <span className="bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 inline-block font-mono text-[11px]">
                                                    {client.rut}
                                                </span>
                                            </td>

                                            {/* 2. TITULAR / CLIENTE */}
                                            <td className="py-2.5 px-3 whitespace-nowrap">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={`h-8 w-8 rounded-xl ${avatarColor} flex items-center justify-center font-black text-[10px] shadow-2xs group-hover:scale-105 transition-transform`}>
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-slate-900 text-xs">{fullName}</div>
                                                        <div className="text-[10px] font-bold text-slate-400">Cliente N° {client.id}</div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 3. TELÉFONOS (Principal y Secundario) */}
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

                                            {/* 4. COMUNA */}
                                            <td className="py-2.5 px-3 text-slate-700 font-bold whitespace-nowrap text-xs">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-400">📍</span>
                                                    <span>{toTitleCase(client.commune?.name) || 'Santiago'}</span>
                                                </div>
                                            </td>

                                            {/* 5. SITUACIÓN */}
                                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 rounded-full text-[9px] font-extrabold px-2.5 py-0.5 border shadow-2xs ${
                                                    isPensionado
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : isActivo
                                                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                                                        : 'bg-amber-50 text-amber-800 border-amber-200'
                                                }`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${isPensionado ? 'bg-emerald-500 animate-pulse' : isActivo ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                                                    <span>{toTitleCase(rawStatus)}</span>
                                                </span>
                                            </td>

                                            {/* 6. ACCIONES */}
                                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditModal(client)}
                                                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-2xs transition"
                                                    >
                                                        <span>✏️ Editar</span>
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setClientToDelete(client)}
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
                                        <td className="p-8 text-center text-slate-400 font-bold" colSpan={6}>
                                            No se encontraron clientes registrados que coincidan con la búsqueda.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Bar */}
                    {paginatedClients.links.length > 3 && (
                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold text-slate-500">
                            <div>Mostrando {filteredData.length} registros</div>
                            <div className="flex flex-wrap gap-1.5">
                                {paginatedClients.links.map((link, i) => {
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

            {/* 3-STEP CREATE MODAL WIZARD */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span>👤</span>
                            <span>Nuevo Cliente — Registro Guiado en 3 Pasos</span>
                        </DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">Gestión Ejecutiva de Contratos • Sendero Otoñal</p>
                    </DialogHeader>

                    {/* Stepper Progress Bar */}
                    <div className="flex items-center justify-between border-y border-slate-100 py-3 my-1">
                        
                        {/* Step 1 Pill */}
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="flex items-center gap-2 cursor-pointer focus:outline-none"
                        >
                            <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs transition ${
                                currentStep === 1
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : currentStep > 1
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                                {currentStep > 1 ? '✓' : '1'}
                            </div>
                            <span className={`text-xs font-extrabold ${currentStep === 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                                1. Datos Titular
                            </span>
                        </button>

                        <div className="h-0.5 flex-1 mx-3 bg-slate-200"></div>

                        {/* Step 2 Pill */}
                        <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="flex items-center gap-2 cursor-pointer focus:outline-none"
                        >
                            <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs transition ${
                                currentStep === 2
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : currentStep > 2
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                                {currentStep > 2 ? '✓' : '2'}
                            </div>
                            <span className={`text-xs font-extrabold ${currentStep === 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                                2. Responsable
                            </span>
                        </button>

                        <div className="h-0.5 flex-1 mx-3 bg-slate-200"></div>

                        {/* Step 3 Pill */}
                        <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="flex items-center gap-2 cursor-pointer focus:outline-none"
                        >
                            <div className={`h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs transition ${
                                currentStep === 3
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-slate-100 text-slate-400'
                            }`}>
                                3
                            </div>
                            <span className={`text-xs font-extrabold ${currentStep === 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                                3. Plan & Cobertura
                            </span>
                        </button>

                    </div>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-1">
                        
                        {/* STEP 1: DATOS PRINCIPALES DEL CLIENTE */}
                        {currentStep === 1 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span>Paso 1 de 3: Datos Principales del Cliente</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="rut" className={labelClass}>RUT *</Label>
                                        <Input id="rut" value={data.rut} onChange={(e) => setData('rut', e.target.value)} required placeholder="12.345.678-9" className={inputClass} />
                                        {errors.rut && <span className="text-[10px] text-rose-600 font-bold">{errors.rut}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="status" className={labelClass}>Situación / Estado</Label>
                                        <Input id="status" value={data.status} onChange={(e) => setData('status', e.target.value)} placeholder="Ej: Pensionado INP / Al Día" className={inputClass} />
                                        {errors.status && <span className="text-[10px] text-rose-600 font-bold">{errors.status}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="first_name" className={labelClass}>Nombre *</Label>
                                        <Input id="first_name" value={data.first_name} onChange={(e) => setData('first_name', e.target.value)} required placeholder="Nombre del titular" className={inputClass} />
                                        {errors.first_name && <span className="text-[10px] text-rose-600 font-bold">{errors.first_name}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="last_name" className={labelClass}>Apellido *</Label>
                                        <Input id="last_name" value={data.last_name} onChange={(e) => setData('last_name', e.target.value)} required placeholder="Apellido del titular" className={inputClass} />
                                        {errors.last_name && <span className="text-[10px] text-rose-600 font-bold">{errors.last_name}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="address" className={labelClass}>Dirección</Label>
                                        <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} placeholder="Av. Principal 123" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="commune_id" className={labelClass}>Comuna</Label>
                                        <select
                                            id="commune_id"
                                            value={data.commune_id}
                                            onChange={(e) => setData('commune_id', e.target.value)}
                                            className={inputClass}
                                        >
                                            <option value="">Sin especificar</option>
                                            {communes.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Label htmlFor="phone_1" className={labelClass}>Teléfono Principal</Label>
                                        <Input id="phone_1" value={data.phone_1} onChange={(e) => setData('phone_1', e.target.value)} placeholder="+56 9 1234 5678" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="phone_2" className={labelClass}>Teléfono Secundario</Label>
                                        <Input id="phone_2" value={data.phone_2} onChange={(e) => setData('phone_2', e.target.value)} placeholder="+56 9 8765 4321" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: PERSONA DE CONTACTO / RESPONSABLE */}
                        {currentStep === 2 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                    <span>Paso 2 de 3: Persona de Contacto / Responsable</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="contact_first_name" className={labelClass}>Nombre Responsable</Label>
                                        <Input id="contact_first_name" value={data.contact_first_name} onChange={(e) => setData('contact_first_name', e.target.value)} placeholder="Nombre" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_last_name" className={labelClass}>Apellido Responsable</Label>
                                        <Input id="contact_last_name" value={data.contact_last_name} onChange={(e) => setData('contact_last_name', e.target.value)} placeholder="Apellido" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_rut" className={labelClass}>RUT Responsable</Label>
                                        <Input id="contact_rut" value={data.contact_rut} onChange={(e) => setData('contact_rut', e.target.value)} placeholder="12.345.678-9" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_address" className={labelClass}>Dirección Responsable</Label>
                                        <Input id="contact_address" value={data.contact_address} onChange={(e) => setData('contact_address', e.target.value)} placeholder="Dirección" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_marital_status" className={labelClass}>Estado Civil</Label>
                                        <Input id="contact_marital_status" value={data.contact_marital_status} onChange={(e) => setData('contact_marital_status', e.target.value)} placeholder="Ej: Soltero / Casado" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contact_education" className={labelClass}>Estudios / Profesión</Label>
                                        <Input id="contact_education" value={data.contact_education} onChange={(e) => setData('contact_education', e.target.value)} placeholder="Ej: Técnico / Universitario" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: ESPECIFICACIONES DEL PLAN & COBERTURA */}
                        {currentStep === 3 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                    <span>Paso 3 de 3: Especificaciones del Plan & Cobertura</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="urn" className={labelClass}>Tipo de Urna / Cobertura</Label>
                                        <Input id="urn" value={data.urn} onChange={(e) => setData('urn', e.target.value)} placeholder="Ej: Urna Tradicional Ébano" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="amount" className={labelClass}>Valor del Plan ($ CLP)</Label>
                                        <Input id="amount" type="number" min={0} value={data.amount} onChange={(e) => setData('amount', e.target.value)} placeholder="450000" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="contract_date" className={labelClass}>Fecha de Contrato</Label>
                                        <Input id="contract_date" type="date" value={data.contract_date} onChange={(e) => setData('contract_date', e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="payment_day" className={labelClass}>Día de Pago (1 a 31)</Label>
                                        <Input id="payment_day" type="number" min={1} max={31} value={data.payment_day} onChange={(e) => setData('payment_day', e.target.value)} placeholder="5" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="installments_count" className={labelClass}>N° de Cuotas</Label>
                                        <Input id="installments_count" type="number" min={0} value={data.installments_count} onChange={(e) => setData('installments_count', e.target.value)} placeholder="12" className={inputClass} />
                                    </div>
                                    <div className="flex flex-col justify-center gap-3 pt-2">
                                        <div className="flex items-center gap-2.5">
                                            <Checkbox id="modal_includes_van" checked={data.includes_van} onCheckedChange={(val) => setData('includes_van', !!val)} />
                                            <Label htmlFor="modal_includes_van" className="text-xs font-bold text-slate-700 cursor-pointer">Incluye Servicio de Van</Label>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <Checkbox id="modal_includes_car" checked={data.includes_car} onCheckedChange={(val) => setData('includes_car', !!val)} />
                                            <Label htmlFor="modal_includes_car" className="text-xs font-bold text-slate-700 cursor-pointer">Incluye Auto de Acompañamiento</Label>
                                        </div>
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
                                {currentStep > 1 && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCurrentStep((s) => (s - 1) as 1 | 2 | 3)}
                                        className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition"
                                    >
                                        ← Anterior
                                    </Button>
                                )}

                                {currentStep < 3 && (
                                    <Button
                                        type="button"
                                        onClick={() => setCurrentStep((s) => (s + 1) as 1 | 2 | 3)}
                                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md transition"
                                    >
                                        Siguiente →
                                    </Button>
                                )}

                                {currentStep === 3 && (
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-2.5 text-xs font-bold shadow-md transition flex items-center gap-2"
                                    >
                                        <span>✓</span>
                                        <span>Guardar Cliente</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                    </form>
                </DialogContent>
            </Dialog>

            {/* 3-STEP EDIT MODAL WIZARD */}
            <Dialog open={!!clientToEdit} onOpenChange={() => setClientToEdit(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-slate-900 flex items-center gap-2">
                            <span>✏️</span>
                            <span>Editar Cliente — {clientToEdit && `${toTitleCase(clientToEdit.first_name)} ${toTitleCase(clientToEdit.last_name)}`}</span>
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
                                1. Datos Titular
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
                                2. Responsable
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
                                3. Plan & Cobertura
                            </span>
                        </button>

                    </div>

                    <form onSubmit={handleEditSubmit} className="space-y-4 pt-1">
                        
                        {/* STEP 1: DATOS PRINCIPALES DEL CLIENTE */}
                        {editStep === 1 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                                    <span>Paso 1 de 3: Datos Principales del Cliente</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="edit_rut" className={labelClass}>RUT *</Label>
                                        <Input id="edit_rut" value={editForm.data.rut} onChange={(e) => editForm.setData('rut', e.target.value)} required placeholder="12.345.678-9" className={inputClass} />
                                        {editForm.errors.rut && <span className="text-[10px] text-rose-600 font-bold">{editForm.errors.rut}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_status" className={labelClass}>Situación / Estado</Label>
                                        <Input id="edit_status" value={editForm.data.status} onChange={(e) => editForm.setData('status', e.target.value)} placeholder="Ej: Pensionado INP / Al Día" className={inputClass} />
                                        {editForm.errors.status && <span className="text-[10px] text-rose-600 font-bold">{editForm.errors.status}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_first_name" className={labelClass}>Nombre *</Label>
                                        <Input id="edit_first_name" value={editForm.data.first_name} onChange={(e) => editForm.setData('first_name', e.target.value)} required placeholder="Nombre del titular" className={inputClass} />
                                        {editForm.errors.first_name && <span className="text-[10px] text-rose-600 font-bold">{editForm.errors.first_name}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_last_name" className={labelClass}>Apellido *</Label>
                                        <Input id="edit_last_name" value={editForm.data.last_name} onChange={(e) => editForm.setData('last_name', e.target.value)} required placeholder="Apellido del titular" className={inputClass} />
                                        {editForm.errors.last_name && <span className="text-[10px] text-rose-600 font-bold">{editForm.errors.last_name}</span>}
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_address" className={labelClass}>Dirección</Label>
                                        <Input id="edit_address" value={editForm.data.address} onChange={(e) => editForm.setData('address', e.target.value)} placeholder="Av. Principal 123" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_commune_id" className={labelClass}>Comuna</Label>
                                        <select
                                            id="edit_commune_id"
                                            value={editForm.data.commune_id}
                                            onChange={(e) => editForm.setData('commune_id', e.target.value)}
                                            className={inputClass}
                                        >
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

                        {/* STEP 2: PERSONA DE CONTACTO / RESPONSABLE */}
                        {editStep === 2 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                                    <span>Paso 2 de 3: Persona de Contacto / Responsable</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="edit_contact_first_name" className={labelClass}>Nombre Responsable</Label>
                                        <Input id="edit_contact_first_name" value={editForm.data.contact_first_name} onChange={(e) => editForm.setData('contact_first_name', e.target.value)} placeholder="Nombre" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_contact_last_name" className={labelClass}>Apellido Responsable</Label>
                                        <Input id="edit_contact_last_name" value={editForm.data.contact_last_name} onChange={(e) => editForm.setData('contact_last_name', e.target.value)} placeholder="Apellido" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_contact_rut" className={labelClass}>RUT Responsable</Label>
                                        <Input id="edit_contact_rut" value={editForm.data.contact_rut} onChange={(e) => editForm.setData('contact_rut', e.target.value)} placeholder="12.345.678-9" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_contact_address" className={labelClass}>Dirección Responsable</Label>
                                        <Input id="edit_contact_address" value={editForm.data.contact_address} onChange={(e) => editForm.setData('contact_address', e.target.value)} placeholder="Dirección" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_contact_marital_status" className={labelClass}>Estado Civil</Label>
                                        <Input id="edit_contact_marital_status" value={editForm.data.contact_marital_status} onChange={(e) => editForm.setData('contact_marital_status', e.target.value)} placeholder="Ej: Soltero / Casado" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_contact_education" className={labelClass}>Estudios / Profesión</Label>
                                        <Input id="edit_contact_education" value={editForm.data.contact_education} onChange={(e) => editForm.setData('contact_education', e.target.value)} placeholder="Ej: Técnico / Universitario" className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: ESPECIFICACIONES DEL PLAN & COBERTURA */}
                        {editStep === 3 && (
                            <div className="space-y-4 animate-in fade-in-50 duration-200">
                                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-100 pb-2">
                                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                                    <span>Paso 3 de 3: Especificaciones del Plan & Cobertura</span>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div>
                                        <Label htmlFor="edit_urn" className={labelClass}>Tipo de Urna / Cobertura</Label>
                                        <Input id="edit_urn" value={editForm.data.urn} onChange={(e) => editForm.setData('urn', e.target.value)} placeholder="Ej: Urna Tradicional Ébano" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_amount" className={labelClass}>Valor del Plan ($ CLP)</Label>
                                        <Input id="edit_amount" type="number" min={0} value={editForm.data.amount} onChange={(e) => editForm.setData('amount', e.target.value)} placeholder="450000" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_contract_date" className={labelClass}>Fecha de Contrato</Label>
                                        <Input id="edit_contract_date" type="date" value={editForm.data.contract_date} onChange={(e) => editForm.setData('contract_date', e.target.value)} className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_payment_day" className={labelClass}>Día de Pago (1 a 31)</Label>
                                        <Input id="edit_payment_day" type="number" min={1} max={31} value={editForm.data.payment_day} onChange={(e) => editForm.setData('payment_day', e.target.value)} placeholder="5" className={inputClass} />
                                    </div>
                                    <div>
                                        <Label htmlFor="edit_installments_count" className={labelClass}>N° de Cuotas</Label>
                                        <Input id="edit_installments_count" type="number" min={0} value={editForm.data.installments_count} onChange={(e) => editForm.setData('installments_count', e.target.value)} placeholder="12" className={inputClass} />
                                    </div>
                                    <div className="flex flex-col justify-center gap-3 pt-2">
                                        <div className="flex items-center gap-2.5">
                                            <Checkbox id="edit_includes_van" checked={editForm.data.includes_van} onCheckedChange={(val) => editForm.setData('includes_van', !!val)} />
                                            <Label htmlFor="edit_includes_van" className="text-xs font-bold text-slate-700 cursor-pointer">Incluye Servicio de Van</Label>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                            <Checkbox id="edit_includes_car" checked={editForm.data.includes_car} onCheckedChange={(val) => editForm.setData('includes_car', !!val)} />
                                            <Label htmlFor="edit_includes_car" className="text-xs font-bold text-slate-700 cursor-pointer">Incluye Auto de Acompañamiento</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEPPER CONTROL BUTTONS */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setClientToEdit(null)}
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
                                        <span>Actualizar Cliente</span>
                                    </Button>
                                )}
                            </div>
                        </div>

                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE WARNING CONFIRMATION MODAL */}
            <Dialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-xl font-bold">
                                ⚠️
                            </div>
                            <div>
                                <DialogTitle className="text-base font-black text-slate-900">¿Eliminar Registro de Cliente?</DialogTitle>
                                <p className="text-xs text-slate-500 font-medium">Esta acción requiere confirmación de seguridad</p>
                            </div>
                        </div>
                    </DialogHeader>

                    {clientToDelete && (
                        <div className="space-y-4 pt-2 text-xs font-semibold text-slate-600">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                                <div className="text-xs font-black text-slate-900">
                                    {toTitleCase(clientToDelete.first_name)} {toTitleCase(clientToDelete.last_name)}
                                </div>
                                <div className="text-[11px] font-mono text-slate-500">
                                    RUT: <span className="font-extrabold text-slate-800">{clientToDelete.rut}</span>
                                </div>
                            </div>

                            <p className="text-slate-600 leading-relaxed">
                                ¿Estás seguro de que deseas eliminar permanentemente a este titular? Esta acción eliminará su perfil del sistema y afectará el seguimiento de sus contratos.
                            </p>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setClientToDelete(null)}
                                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold transition"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="button"
                                    onClick={confirmDelete}
                                    className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-5 py-2 text-xs font-bold shadow-md transition flex items-center gap-1.5"
                                >
                                    <span>🗑️ Sí, Eliminar</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}


ClientsIndex.layout = {
    breadcrumbs: [{ title: 'Clientes', href: clients.index() }],
};



