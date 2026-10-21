import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { dashboard } from '@/routes';

export default function Dashboard() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    function handleQuickTransaction(e: React.FormEvent) {
        e.preventDefault();
        setIsModalOpen(false);
        setToastMessage("Cobro de contrato registrado exitosamente.");
        setTimeout(() => setToastMessage(null), 4000);
    }

    return (
        <>
            <Head title="Panel Principal - Gestión de Contratos" />

            <div className="space-y-6 p-6 max-w-7xl mx-auto">
                
                {/* Section Sub-Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">PANEL DE CONTROL EJECUTIVO</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">GESTIÓN DE CONTRATOS & CLIENTES</h1>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            Sistema Institucional Sendero Otoñal • Supervisión General de Cobranza y Ventas
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-md transition flex items-center gap-2"
                        >
                            <span>💳</span>
                            <span>+ Registrar Contrato / Cobro</span>
                        </Button>
                        <Button
                            variant="outline"
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold transition flex items-center gap-1.5"
                        >
                            <span>⚙️</span>
                            <span>Configuración</span>
                        </Button>
                    </div>
                </div>

                {/* Filter Bar: General Dashboard Filter by Period */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center font-extrabold text-sm text-slate-600">
                            📅
                        </div>
                        <div>
                            <div className="text-xs font-extrabold text-slate-900">Filtro General del Dashboard por Período</div>
                            <div className="text-[10px] text-slate-400 font-semibold">Filtra recaudación, contratos activos y cumplimiento por rango de fechas</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1">
                            <span>📅</span> Todo el Período 2026
                        </span>

                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-[11px]">
                            <span className="text-slate-400 font-extrabold">DESDE:</span>
                            <input type="text" defaultValue="dd/mm/aaaa" className="bg-transparent font-semibold text-slate-700 w-24 outline-none" />
                            <span>📅</span>
                        </div>

                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-[11px]">
                            <span className="text-slate-400 font-extrabold">HASTA:</span>
                            <input type="text" defaultValue="dd/mm/aaaa" className="bg-transparent font-semibold text-slate-700 w-24 outline-none" />
                            <span>📅</span>
                        </div>

                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-bold shadow-xs transition">
                            Filtrar Fechas
                        </Button>
                    </div>
                </div>

                {/* 4 KPI Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    
                    {/* KPI 1: Contratos Vigentes */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CONTRATOS VIGENTES</span>
                                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
                                    📄
                                </div>
                            </div>
                            <div className="text-3xl font-black text-slate-900 tracking-tight">1.420</div>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg w-fit">
                            <span>✓</span>
                            <span>+$450.000.000 en Coberturas</span>
                        </div>
                    </div>

                    {/* KPI 2: Recaudación Mensual */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">RECAUDACIÓN MENSUAL</span>
                                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-bold">
                                    📈
                                </div>
                            </div>
                            <div className="text-3xl font-black text-emerald-600 tracking-tight">$14.850.000</div>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
                            Cuotas y Pagos al Día Verificados
                        </div>
                    </div>

                    {/* KPI 3: Cuotas Vencidas */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">CUOTAS PENDIENTES / COBRANZA</span>
                                <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm font-bold">
                                    ⚠️
                                </div>
                            </div>
                            <div className="text-3xl font-black text-rose-600 tracking-tight">$1.850.000</div>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-slate-400 font-semibold">
                            32 Cuotas Pendientes de Pago
                        </div>
                    </div>

                    {/* KPI 4: Eficiencia de Cobro */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">EFICIENCIA DE COBRO</span>
                                <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">
                                    📊
                                </div>
                            </div>
                            <div className="flex items-baseline justify-between">
                                <span className="text-3xl font-black text-slate-900 tracking-tight">92.4%</span>
                                <span className="text-xs font-bold text-emerald-600">Cumplimiento Mensual</span>
                            </div>
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100">
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92.4%' }}></div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Cash Availability Cards (Caja Chica vs Banco) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-amber-50/60 p-5 rounded-3xl border border-amber-200/80 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
                                <span>💵</span>
                                <span>RECAUDACIÓN EN CAJA (EFECTIVO)</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900">$4.850.000</div>
                            <div className="text-[10px] font-bold text-amber-700">Entradas Cuotas Directas en Oficina</div>
                        </div>
                        <span className="bg-amber-200/80 text-amber-900 font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-amber-300">
                            Efectivo Caja
                        </span>
                    </div>

                    <div className="bg-blue-50/60 p-5 rounded-3xl border border-blue-200/80 flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-blue-800">
                                <span>🏦</span>
                                <span>DEPÓSITOS BANCO (TRANSFERENCIAS / PAC)</span>
                            </div>
                            <div className="text-2xl font-black text-slate-900">$10.000.000</div>
                            <div className="text-[10px] font-bold text-blue-700">Pago Automático y Transferencias Bancarias</div>
                        </div>
                        <span className="bg-blue-200/80 text-blue-900 font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-blue-300">
                            Cta. Bancaria
                        </span>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                                    <span>📊</span>
                                    <span>Gráfico Comparativo: Recaudación por Mes</span>
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">Evolución mensual de ingresos de contratos en la Temporada 2026</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-800 flex items-center gap-1.5">
                                        <span>📅</span> AGOSTO 2026
                                    </span>
                                    <div className="flex items-center gap-3 font-extrabold">
                                        <span className="text-emerald-600">+$14.850.000</span>
                                        <span className="text-rose-600">-$1.850.000</span>
                                        <span className="bg-slate-900 text-white px-2.5 py-0.5 rounded-lg text-[11px]">Neto: $13.000.000</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase font-black text-slate-400">RECAUDADO</div>
                                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92.4%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <div className="text-[10px] uppercase font-black text-slate-400">PENDIENTE COBRANZA</div>
                                    <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                                        <div className="bg-rose-500 h-full rounded-full" style={{ width: '12.5%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                        <div>
                            <h2 className="text-base font-black text-slate-900">Proporción de Recaudación</h2>
                            <p className="text-xs text-slate-500 font-medium">Relación % entre cuotas cobradas y cartera pendiente</p>

                            <div className="my-6 flex items-center justify-center">
                                <div className="relative h-36 w-36 rounded-full border-8 border-rose-500 flex items-center justify-center" style={{ borderTopColor: '#10B981', borderRightColor: '#10B981', borderBottomColor: '#10B981' }}>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-slate-900">92%</div>
                                        <div className="text-[9px] font-black uppercase text-emerald-600">COBRADO</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-xs font-bold">
                                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-between">
                                    <span>Cuotas Pagadas</span>
                                    <span>92% ($14.850.000)</span>
                                </div>
                                <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-between">
                                    <span>Cuotas Pendientes</span>
                                    <span>8% ($1.850.000)</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-900 text-white text-center">
                            <div className="text-[9px] font-black uppercase text-emerald-400">ESTADO GENERAL</div>
                            <div className="text-sm font-black mt-0.5">CARTERA SALUDABLE</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Quick Transaction Modal (Radix Dialog) */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-base font-black text-slate-900">Registrar Contrato / Cobro</DialogTitle>
                        <p className="text-xs text-slate-500 font-medium">Gestión Ejecutiva de Contratos — Sendero Otoñal</p>
                    </DialogHeader>

                    <form onSubmit={handleQuickTransaction} className="space-y-4 pt-2 text-xs font-bold">
                        <div>
                            <Label className="text-[11px] uppercase font-extrabold text-slate-500 mb-1 block">Cliente / Rut</Label>
                            <Input placeholder="Buscar cliente por RUT o Nombre..." className="rounded-xl border-slate-200 bg-slate-50" />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label className="text-[11px] uppercase font-extrabold text-slate-500 mb-1 block">Plan Contratado</Label>
                                <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800">
                                    <option value="plan_tradicional">Plan Tradicional ($450.000)</option>
                                    <option value="plan_premium">Plan Premium ($650.000)</option>
                                    <option value="cuota">Pago de Cuota Mensual</option>
                                </select>
                            </div>
                            <div>
                                <Label className="text-[11px] uppercase font-extrabold text-slate-500 mb-1 block">Monto CLP ($)</Label>
                                <Input type="number" defaultValue="450000" className="rounded-xl border-slate-200 bg-slate-50" />
                            </div>
                        </div>

                        <div>
                            <Label className="text-[11px] uppercase font-extrabold text-slate-500 mb-1 block">Observación / Nota del Contrato</Label>
                            <Input placeholder="Ej: Pago cuota 1/12 contrato #0042" className="rounded-xl border-slate-200 bg-slate-50" />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-xl">
                                Cancelar
                            </Button>
                            <Button type="submit" className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5">
                                Emitir Comprobante
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Toast Notification */}
            {toastMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-bounce">
                    <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    <span>{toastMessage}</span>
                </div>
            )}
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Panel Principal',
            href: dashboard(),
        },
    ],
};


