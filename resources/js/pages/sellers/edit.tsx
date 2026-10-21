import { Form, Head } from '@inertiajs/react';
import SellerController from '@/actions/App/Http/Controllers/SellerController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import sellers from '@/routes/sellers';
import type { Seller } from '@/types/seller';

export default function EditSeller({ seller }: { seller: Seller }) {
    const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs";
    const labelClass = "text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1";

    return (
        <>
            <Head title={seller.name} />

            <div className="space-y-6 p-4 sm:p-6 w-full max-w-xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">EDICIÓN DE VENDEDOR</span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">Editar Vendedor #{seller.id}</h1>
                        <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            Modifica la información del vendedor seleccionado
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm">
                    <Form {...SellerController.update.form(seller.id)} className="space-y-6">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-4">
                                    <div>
                                        <Label htmlFor="name" className={labelClass}>Nombre Completo *</Label>
                                        <Input id="name" name="name" defaultValue={seller.name} required autoFocus className={inputClass} />
                                        <InputError message={errors.name} />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <Button type="submit" disabled={processing} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-md transition">
                                        {processing && <Spinner />}
                                        Guardar Cambios
                                    </Button>
                                    <Button type="button" variant="outline" asChild className="rounded-xl border-slate-200 text-slate-700 text-xs font-bold">
                                        <a href={sellers.index().url}>Cancelar</a>
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

EditSeller.layout = {
    breadcrumbs: [
        { title: 'Vendedores', href: sellers.index() },
        { title: 'Editar', href: '#' },
    ],
};
