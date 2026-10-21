import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import sellers from '@/routes/sellers';
import type { SellerWithCount } from '@/types/seller';

function toTitleCase(str?: string | null) {
    if (!str) return '—';
    return str
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function getInitials(name?: string | null) {
    if (!name) return 'VD';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

export default function SellersIndex({ sellers: sellerList }: { sellers: SellerWithCount[] }) {
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [sellerToEdit, setSellerToEdit] = useState<SellerWithCount | null>(null);
    const [sellerToDelete, setSellerToDelete] = useState<SellerWithCount | null>(null);

    // Create Form Hook
    const createForm = useForm({
        name: '',
    });

    // Edit Form Hook
    const editForm = useForm({
        name: '',
    });

    function handleCreateSubmit(e: React.FormEvent) {
        e.preventDefault();
        createForm.post(sellers.store().url, {
            onSuccess: () => {
                setIsCreateModalOpen(false);
                createForm.reset();
            },
        });
    }

    function openEditModal(seller: SellerWithCount) {
        editForm.setData({
            name: seller.name || '',
        });
        setSellerToEdit(seller);
    }

    function handleEditSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!sellerToEdit) return;
        editForm.put(sellers.update(sellerToEdit).url, {
            onSuccess: () => {
                setSellerToEdit(null);
            },
        });
    }

    function confirmDelete() {
        if (!sellerToDelete) return;
        router.delete(sellers.destroy(sellerToDelete).url, {
            preserveScroll: true,
            onSuccess: () => setSellerToDelete(null),
        });
    }

    const filteredSellers = sellerList.filter((s) =>
        (s.name || '').toLowerCase().includes(search.toLowerCase())
    );

    const totalContractsSum = sellerList.reduce((sum, s) => sum + (s.contracts_count ?? 0), 0);
    const avgContractsPerSeller = sellerList.length > 0 ? (totalContractsSum / sellerList.length).toFixed(1) : '0';

    const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs";
    const labelClass = "text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1";

    return (
        <>
            <Head title="Directorio de Vendedores" />

            <div className="space-y-6 p-4 sm:p-6 w-full max-w-[1440px] mx-auto">
                {/* Header Title Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">EQUIPO DE VENTAS & EJECUTIVOS</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Directorio de Vendedores</h1>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            Gestión Ejecutiva Sendero Otoñal • {sellerList.length} vendedores registrados en el sistema
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                        >
                            <span>👤</span>
                            <span>+ Nuevo Vendedor</span>
                        </Button>
                    </div>
                </div>

                {/* 3 Summary KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">TOTAL VENDEDORES</span>
                            <div className="text-xl font-black text-slate-900 mt-0.5">{sellerList.length} Ejecutivos</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base">
                            👥
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CONTRATOS GESTIONADOS</span>
                            <div className="text-xl font-black text-emerald-600 mt-0.5">{totalContractsSum} Contratos</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-base">
                            📄
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PROMEDIO DE VENTAS</span>
                            <div className="text-xl font-black text-blue-600 mt-0.5">{avgContractsPerSeller} Contratos/Vendedor</div>
                        </div>
                        <div className="h-9 w-9 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-base">
                            📊
                        </div>
                    </div>
                </div>

                {/* Main White Rounded Card Container */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                    {/* Search Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div className="relative w-full sm:w-80">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 text-sm">
                                🔍
                            </span>
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Buscar por nombre de vendedor..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs"
                            />
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                            Mostrando {filteredSellers.length} de {sellerList.length} ejecutivos
                        </span>
                    </div>

                    {/* Table Data */}
                    <div className="overflow-x-auto rounded-2xl border border-slate-200/80 w-full">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 text-[10px] font-black uppercase text-slate-500 tracking-wider py-2.5 px-3.5 border-b border-slate-200/80">
                                    <th className="py-3 px-3.5 whitespace-nowrap">EJECUTIVO / VENDEDOR</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap">CONTRATOS ASOCIADOS</th>
                                    <th className="py-3 px-3.5 whitespace-nowrap">DESEMPEÑO</th>
                                    <th className="py-3 px-3.5 text-right whitespace-nowrap min-w-[130px]">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                                {filteredSellers.map((seller, idx) => {
                                    const name = toTitleCase(seller.name);
                                    const initials = getInitials(seller.name);
                                    const contractsCount = seller.contracts_count ?? 0;

                                    const bgColors = [
                                        'bg-emerald-100 text-emerald-800',
                                        'bg-blue-100 text-blue-800',
                                        'bg-indigo-100 text-indigo-800',
                                        'bg-amber-100 text-amber-800',
                                        'bg-teal-100 text-teal-800',
                                    ];
                                    const avatarColor = bgColors[idx % bgColors.length];

                                    return (
                                        <tr key={seller.id} className="hover:bg-slate-50/90 transition-colors group">
                                            {/* 1. EJECUTIVO / VENDEDOR */}
                                            <td className="py-3 px-3.5 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`h-9 w-9 rounded-xl ${avatarColor} flex items-center justify-center font-black text-xs shadow-2xs group-hover:scale-105 transition-transform flex-shrink-0`}
                                                    >
                                                        {initials}
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-slate-900 text-xs">
                                                            {name}
                                                        </div>
                                                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                            Ejecutivo Comercial N° {seller.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. CONTRATOS ASOCIADOS */}
                                            <td className="py-3 px-3.5 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 font-mono font-extrabold px-3 py-1 rounded-xl border border-slate-200 text-xs">
                                                    <span>📄</span>
                                                    <span>{contractsCount} Contratos</span>
                                                </span>
                                            </td>

                                            {/* 3. DESEMPEÑO */}
                                            <td className="py-3 px-3.5 whitespace-nowrap">
                                                {contractsCount > 500 ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 border border-emerald-200/80 shadow-2xs">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                        <span>LÍDER DE VENTAS</span>
                                                    </span>
                                                ) : contractsCount > 0 ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-extrabold text-blue-800 border border-blue-200/80 shadow-2xs">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                                        <span>EJECUTIVO ACTIVO</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-600 border border-slate-200 shadow-2xs">
                                                        <span>SIN CONTRATOS</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* 4. ACCIONES */}
                                            <td className="py-3 px-3.5 text-right whitespace-nowrap min-w-[140px]">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditModal(seller)}
                                                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                                                    >
                                                        <span>✏️ Editar</span>
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => setSellerToDelete(seller)}
                                                        className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl px-2.5 py-1.5 text-xs font-bold transition cursor-pointer"
                                                    >
                                                        <span>🗑️</span>
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}

                                {filteredSellers.length === 0 && (
                                    <tr>
                                        <td className="p-8 text-center text-slate-400 font-bold" colSpan={4}>
                                            No se encontraron vendedores registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* CREATE SELLER MODAL DIALOG */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                            <span>👤</span>
                            <span>Nuevo Vendedor / Ejecutivo</span>
                        </DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">Gestión Ejecutiva de Ventas • Sendero Otoñal</p>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="name" className={labelClass}>Nombre Completo del Vendedor *</Label>
                            <Input
                                id="name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                required
                                autoFocus
                                placeholder="Ej: Juan Pérez Morales"
                                className={inputClass}
                            />
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
                                Guardar Vendedor
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT SELLER MODAL DIALOG */}
            <Dialog open={!!sellerToEdit} onOpenChange={(open) => !open && setSellerToEdit(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                            <span>✏️</span>
                            <span>Editar Vendedor</span>
                        </DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">Modifica la información del vendedor seleccionado</p>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
                        <div>
                            <Label htmlFor="edit_name" className={labelClass}>Nombre Completo del Vendedor *</Label>
                            <Input
                                id="edit_name"
                                value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)}
                                required
                                autoFocus
                                className={inputClass}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setSellerToEdit(null)}
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
            <Dialog open={!!sellerToDelete} onOpenChange={(open) => !open && setSellerToDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
                            <span>⚠️</span>
                            <span>Confirmar Eliminación</span>
                        </DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">
                            ¿Está seguro de que desea eliminar a <strong className="text-slate-900">{sellerToDelete?.name}</strong>? Sus <strong className="text-slate-900">{sellerToDelete?.contracts_count ?? 0}</strong> contratos asociados quedarán sin vendedor asignado.
                        </p>
                    </DialogHeader>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setSellerToDelete(null)}
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
                            Eliminar Vendedor
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

SellersIndex.layout = {
    breadcrumbs: [{ title: 'Vendedores', href: sellers.index() }],
};
