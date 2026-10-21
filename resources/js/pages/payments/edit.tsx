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
import type { Payment } from '@/types/payment';

export default function EditPayment({ payment, hasReceipt }: { payment: Payment; hasReceipt: boolean }) {
    return (
        <>
            <Head title={`Pago #${payment.id}`} />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading title="Editar pago" description={`Pago #${payment.id}`} />
                    {hasReceipt && (
                        <Button variant="outline" asChild>
                            <a href={payments.receipt(payment).url}>Descargar comprobante</a>
                        </Button>
                    )}
                </div>

                <Form {...PaymentController.update.form(payment.id)} className="max-w-xl space-y-6">
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-4">
                                <ContractPicker initialContract={payment.contract} error={errors.contract_id} />

                                <div className="grid gap-2">
                                    <Label htmlFor="paid_at">Fecha</Label>
                                    <Input id="paid_at" name="paid_at" type="date" defaultValue={payment.paid_at ?? ''} required />
                                    <InputError message={errors.paid_at} />
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="cash_amount">Efectivo</Label>
                                        <Input id="cash_amount" name="cash_amount" type="number" min={0} defaultValue={payment.cash_amount ?? ''} />
                                        <InputError message={errors.cash_amount} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="card_amount">Tarjeta</Label>
                                        <Input id="card_amount" name="card_amount" type="number" min={0} defaultValue={payment.card_amount ?? ''} />
                                        <InputError message={errors.card_amount} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="check_amount">Cheque</Label>
                                        <Input id="check_amount" name="check_amount" type="number" min={0} defaultValue={payment.check_amount ?? ''} />
                                        <InputError message={errors.check_amount} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="total">Total</Label>
                                    <Input id="total" name="total" type="number" min={0} defaultValue={payment.total ?? ''} />
                                    <InputError message={errors.total} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="status">Estado</Label>
                                    <Input id="status" name="status" defaultValue={payment.status ?? ''} />
                                    <InputError message={errors.status} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Spinner />}
                                    Guardar cambios
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

EditPayment.layout = {
    breadcrumbs: [
        { title: 'Pagos', href: payments.index() },
        { title: 'Editar', href: '#' },
    ],
};
