import { Form, Head } from '@inertiajs/react';
import ClientController from '@/actions/App/Http/Controllers/ClientController';
import ClientFormFields from '@/components/client-form-fields';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import clients from '@/routes/clients';
import type { Commune } from '@/types/client';

export default function CreateClient({ communes }: { communes: Commune[] }) {
    return (
        <>
            <Head title="Nuevo cliente" />

            <div className="space-y-6 p-6 max-w-5xl">
                <Heading title="Nuevo Cliente" description="Registra un nuevo cliente corporativo y su plan contratado" />

                <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
                    <Form {...ClientController.store.form()} className="space-y-6">
                        {({ processing, errors }) => (
                            <>
                                <ClientFormFields communes={communes} errors={errors} />

                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-2.5 text-xs font-bold shadow-md transition flex items-center gap-2"
                                    >
                                        {processing && <Spinner />}
                                        <span>Guardar Cliente</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-2.5 text-xs font-bold transition"
                                    >
                                        <a href={clients.index().url}>Cancelar</a>
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

CreateClient.layout = {
    breadcrumbs: [
        { title: 'Clientes', href: clients.index() },
        { title: 'Nuevo cliente', href: clients.create() },
    ],
};

