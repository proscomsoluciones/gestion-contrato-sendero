import { Form, Head } from '@inertiajs/react';
import ContractController from '@/actions/App/Http/Controllers/ContractController';
import ContractFormFields from '@/components/contract-form-fields';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import contracts from '@/routes/contracts';
import type { Commune } from '@/types/client';
import type { Contract, Seller } from '@/types/contract';

export default function EditContract({
    contract,
    communes,
    sellers,
    hasPdf,
}: {
    contract: Contract;
    communes: Commune[];
    sellers: Seller[];
    hasPdf: boolean;
}) {
    return (
        <>
            <Head title={`${contract.first_name} ${contract.last_name}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading title="Editar contrato" description={`${contract.first_name} ${contract.last_name} · ${contract.rut}`} />
                    {hasPdf && (
                        <Button variant="outline" asChild>
                            <a href={contracts.pdf(contract).url}>Descargar PDF histórico</a>
                        </Button>
                    )}
                </div>

                <Form {...ContractController.update.form(contract.id)} className="max-w-3xl space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <ContractFormFields communes={communes} sellers={sellers} contract={contract} errors={errors} />

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Guardar cambios
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

EditContract.layout = {
    breadcrumbs: [
        { title: 'Contratos', href: contracts.index() },
        { title: 'Editar', href: '#' },
    ],
};
