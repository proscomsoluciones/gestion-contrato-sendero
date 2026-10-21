import { Form, Head } from '@inertiajs/react';
import InstallmentController from '@/actions/App/Http/Controllers/InstallmentController';
import ContractPicker from '@/components/contract-picker';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import installments from '@/routes/installments';

export default function CreateInstallment() {
    const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs";
    const labelClass = "text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1";

    return (
        <>
            <Head title="Nueva cuota" />

            <div className="space-y-6 p-4 sm:p-6 w-full max-w-2xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">REGISTRO DE CUOTA</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Nueva Cuota</h1>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            Registra una nueva cuota asociada a un contrato existente
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
                    <Form {...InstallmentController.store.form()} className="space-y-6">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-5">
                                    <ContractPicker error={errors.contract_id} />

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="amount" className={labelClass}>Valor de la Cuota ($ CLP)</Label>
                                        <Input id="amount" name="amount" type="number" min={0} step="any" placeholder="Ej: 25000" className={inputClass} />
                                        <InputError message={errors.amount} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="status" className={labelClass}>Estado de la Cuota *</Label>
                                        <select
                                            id="status"
                                            name="status"
                                            defaultValue="PENDIENTE DE PAGO"
                                            required
                                            className={inputClass}
                                        >
                                            <option value="PENDIENTE DE PAGO">PENDIENTE DE PAGO</option>
                                            <option value="PAGADO">PAGADO</option>
                                            <option value="VENCIDO">VENCIDO</option>
                                            <option value="CANCELADO">CANCELADO</option>
                                        </select>
                                        <InputError message={errors.status} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="paid_at" className={labelClass}>Fecha de Pago</Label>
                                        <Input id="paid_at" name="paid_at" type="date" className={inputClass} />
                                        <InputError message={errors.paid_at} />
                                    </div>

                                    <div className="grid gap-1.5">
                                        <Label htmlFor="invoice_number" className={labelClass}>N.° de Factura</Label>
                                        <Input id="invoice_number" name="invoice_number" placeholder="Ej: 10452" className={inputClass} />
                                        <InputError message={errors.invoice_number} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <Button type="submit" disabled={processing} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md transition">
                                        {processing && <Spinner />}
                                        Guardar Cuota
                                    </Button>
                                    <Button type="button" variant="outline" asChild className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold">
                                        <a href={installments.index().url}>Cancelar</a>
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </>
    );
}

CreateInstallment.layout = {
    breadcrumbs: [
        { title: 'Cuotas', href: installments.index() },
        { title: 'Nueva cuota', href: installments.create() },
    ],
};
