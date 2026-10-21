import { Form, Head } from '@inertiajs/react';
import PaymentController from '@/actions/App/Http/Controllers/PaymentController';
import ContractPicker from '@/components/contract-picker';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import payments from '@/routes/payments';

export default function CreatePayment() {
    return (
        <>
            <Head title="Nuevo pago" />

            <div className="space-y-6 p-4">
                <Heading title="Nuevo pago" description="Registra un pago y genera el comprobante" />

                <Form {...PaymentController.store.form()} className="max-w-xl space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-4">
                                <ContractPicker error={errors.contract_id} />

                                <div className="grid gap-2">
                                    <Label htmlFor="paid_at">Fecha</Label>
                                    <Input id="paid_at" name="paid_at" type="date" required />
                                    <InputError message={errors.paid_at} />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="cash_amount">Efectivo</Label>
                                        <Input id="cash_amount" name="cash_amount" type="number" min={0} />
                                        <InputError message={errors.cash_amount} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="card_amount">Tarjeta</Label>
                                        <Input id="card_amount" name="card_amount" type="number" min={0} />
                                        <InputError message={errors.card_amount} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="check_amount">Cheque</Label>
                                        <Input id="check_amount" name="check_amount" type="number" min={0} />
                                        <InputError message={errors.check_amount} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="total">Total</Label>
                                    <Input id="total" name="total" type="number" min={0} />
                                    <InputError message={errors.total} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Estado</Label>
                                    <Input id="status" name="status" />
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Guardar y generar comprobante
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <a href={payments.index().url}>Cancelar</a>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

CreatePayment.layout = {
    breadcrumbs: [
        { title: 'Pagos', href: payments.index() },
        { title: 'Nuevo pago', href: payments.create() },
    ],
};
