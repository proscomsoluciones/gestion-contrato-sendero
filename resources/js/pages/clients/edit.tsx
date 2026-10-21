import { Form, Head } from '@inertiajs/react';
import ClientController from '@/actions/App/Http/Controllers/ClientController';
import ClientFormFields from '@/components/client-form-fields';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import clients from '@/routes/clients';
import type { Client, Commune } from '@/types/client';

export default function EditClient({ client, communes }: { client: Client; communes: Commune[] }) {
    return (
        <>
            <Head title={`${client.first_name} ${client.last_name}`} />

            <div className="space-y-6 p-4">
                <Heading title="Editar cliente" description={`${client.first_name} ${client.last_name} · ${client.rut}`} />

                <Form {...ClientController.update.form(client.id)} className="max-w-3xl space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <ClientFormFields communes={communes} client={client} errors={errors} />

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Guardar cambios
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <a href={clients.index().url}>Cancelar</a>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

EditClient.layout = {
    breadcrumbs: [
        { title: 'Clientes', href: clients.index() },
        { title: 'Editar', href: '#' },
    ],
};
