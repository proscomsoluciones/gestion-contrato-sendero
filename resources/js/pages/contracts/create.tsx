import { Form, Head } from '@inertiajs/react';
import ContractController from '@/actions/App/Http/Controllers/ContractController';
import ContractFormFields from '@/components/contract-form-fields';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import contracts from '@/routes/contracts';
import type { Commune } from '@/types/client';
import type { Seller } from '@/types/contract';

export default function CreateContract({ communes, sellers }: { communes: Commune[]; sellers: Seller[] }) {
    return (
        <>
            <Head title="Nuevo contrato" />

            <div className="space-y-6 p-4">
                <Heading title="Nuevo contrato" description="Registra un nuevo contrato de servicio funerario" />

                <Form {...ContractController.store.form()} className="max-w-3xl space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <ContractFormFields communes={communes} sellers={sellers} errors={errors} />

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Guardar
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <a href={contracts.index().url}>Cancelar</a>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

CreateContract.layout = {
    breadcrumbs: [
        { title: 'Contratos', href: contracts.index() },
        { title: 'Nuevo contrato', href: contracts.create() },
    ],
};
