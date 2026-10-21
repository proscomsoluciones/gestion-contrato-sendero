import { useState } from 'react';
import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { Commune } from '@/types/client';
import type { Contract, Seller } from '@/types/contract';

type Errors = Partial<Record<keyof Contract, string>>;

const selectClass =
    'border-input dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring';

function Field({
    id,
    label,
    error,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

export default function ContractFormFields({
    communes,
    sellers,
    contract,
    errors,
}: {
    communes: Commune[];
    sellers: Seller[];
    contract?: Contract;
    errors: Errors;
}) {
    const [isInstallment, setIsInstallment] = useState<boolean>(contract?.is_installment_plan ?? false);
    const [total, setTotal] = useState<number>(contract?.total ?? 0);
    const [downPayment, setDownPayment] = useState<number>(contract?.down_payment ?? 0);
    const [count, setCount] = useState<number>(contract?.installments_count ?? (contract?.installments?.length || 12));
    const [firstDueDate, setFirstDueDate] = useState<string>(contract?.first_due_date ?? '');

    const balance = Math.max(0, (total || 0) - (downPayment || 0));
    const installmentEst = count > 0 ? Math.floor(balance / count) : 0;

    return (
        <div className="grid gap-6">
            <div>
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">Contratante</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="contract_date" label="Fecha de contrato" error={errors.contract_date}>
                        <Input id="contract_date" name="contract_date" type="date" defaultValue={contract?.contract_date ?? ''} />
                    </Field>
                    <Field id="rut" label="RUT" error={errors.rut}>
                        <Input id="rut" name="rut" defaultValue={contract?.rut} required />
                    </Field>
                    <Field id="first_name" label="Nombre" error={errors.first_name}>
                        <Input id="first_name" name="first_name" defaultValue={contract?.first_name} required />
                    </Field>
                    <Field id="last_name" label="Apellido" error={errors.last_name}>
                        <Input id="last_name" name="last_name" defaultValue={contract?.last_name} required />
                    </Field>
                    <Field id="address" label="Dirección" error={errors.address}>
                        <Input id="address" name="address" defaultValue={contract?.address ?? ''} />
                    </Field>
                    <Field id="commune_id" label="Comuna" error={errors.commune_id}>
                        <select id="commune_id" name="commune_id" defaultValue={contract?.commune_id ?? ''} className={selectClass}>
                            <option value="">Sin especificar</option>
                            {communes.map((commune) => (
                                <option key={commune.id} value={commune.id}>
                                    {commune.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field id="phone_1" label="Teléfono 1" error={errors.phone_1}>
                        <Input id="phone_1" name="phone_1" defaultValue={contract?.phone_1 ?? ''} />
                    </Field>
                    <Field id="phone_2" label="Teléfono 2" error={errors.phone_2}>
                        <Input id="phone_2" name="phone_2" defaultValue={contract?.phone_2 ?? ''} />
                    </Field>
                    <Field id="email" label="Correo" error={errors.email}>
                        <Input id="email" name="email" type="email" defaultValue={contract?.email ?? ''} />
                    </Field>
                    <Field id="marital_status" label="Estado civil" error={errors.marital_status}>
                        <Input id="marital_status" name="marital_status" defaultValue={contract?.marital_status ?? ''} />
                    </Field>
                    <Field id="occupation_status" label="Situación" error={errors.occupation_status}>
                        <Input id="occupation_status" name="occupation_status" defaultValue={contract?.occupation_status ?? ''} />
                    </Field>
                    <Field id="education" label="Estudios" error={errors.education}>
                        <Input id="education" name="education" defaultValue={contract?.education ?? ''} />
                    </Field>
                    <Field id="last_address" label="Último domicilio" error={errors.last_address}>
                        <Input id="last_address" name="last_address" defaultValue={contract?.last_address ?? ''} />
                    </Field>
                </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">Fallecido</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="beneficiary_first_name" label="Nombre" error={errors.beneficiary_first_name}>
                        <Input id="beneficiary_first_name" name="beneficiary_first_name" defaultValue={contract?.beneficiary_first_name ?? ''} />
                    </Field>
                    <Field id="beneficiary_last_name" label="Apellido" error={errors.beneficiary_last_name}>
                        <Input id="beneficiary_last_name" name="beneficiary_last_name" defaultValue={contract?.beneficiary_last_name ?? ''} />
                    </Field>
                    <Field id="beneficiary_rut" label="RUT" error={errors.beneficiary_rut}>
                        <Input id="beneficiary_rut" name="beneficiary_rut" defaultValue={contract?.beneficiary_rut ?? ''} />
                    </Field>
                    <Field id="beneficiary_relationship" label="Parentesco" error={errors.beneficiary_relationship}>
                        <Input id="beneficiary_relationship" name="beneficiary_relationship" defaultValue={contract?.beneficiary_relationship ?? ''} />
                    </Field>
                </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">Servicio</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="transfer" label="Traslado" error={errors.transfer}>
                        <Input id="transfer" name="transfer" defaultValue={contract?.transfer ?? ''} />
                    </Field>
                    <Field id="urn" label="Urna" error={errors.urn}>
                        <Input id="urn" name="urn" defaultValue={contract?.urn ?? ''} />
                    </Field>
                    <Field id="press_notice" label="Aviso de prensa" error={errors.press_notice}>
                        <Input id="press_notice" name="press_notice" defaultValue={contract?.press_notice ?? ''} />
                    </Field>
                    <Field id="religious_service" label="Servicio religioso" error={errors.religious_service}>
                        <Input id="religious_service" name="religious_service" defaultValue={contract?.religious_service ?? ''} />
                    </Field>
                    <Field id="service_time" label="Hora del servicio" error={errors.service_time}>
                        <Input id="service_time" name="service_time" defaultValue={contract?.service_time ?? ''} />
                    </Field>
                    <Field id="hearse" label="Carroza" error={errors.hearse}>
                        <Input id="hearse" name="hearse" defaultValue={contract?.hearse ?? ''} />
                    </Field>
                    <Field id="car_transport" label="Auto" error={errors.car_transport}>
                        <Input id="car_transport" name="car_transport" defaultValue={contract?.car_transport ?? ''} />
                    </Field>
                    <Field id="van_transport" label="Van" error={errors.van_transport}>
                        <Input id="van_transport" name="van_transport" defaultValue={contract?.van_transport ?? ''} />
                    </Field>
                    <Field id="chapel" label="Capilla" error={errors.chapel}>
                        <Input id="chapel" name="chapel" defaultValue={contract?.chapel ?? ''} />
                    </Field>
                    <Field id="burial_date" label="Fecha de sepultación" error={errors.burial_date}>
                        <Input id="burial_date" name="burial_date" type="date" defaultValue={contract?.burial_date ?? ''} />
                    </Field>
                    <Field id="burial_time" label="Hora de sepultación" error={errors.burial_time}>
                        <Input id="burial_time" name="burial_time" defaultValue={contract?.burial_time ?? ''} />
                    </Field>
                    <Field id="burial_type" label="Tipo" error={errors.burial_type}>
                        <Input id="burial_type" name="burial_type" defaultValue={contract?.burial_type ?? ''} />
                    </Field>
                    <Field id="cemetery" label="Cementerio" error={errors.cemetery}>
                        <Input id="cemetery" name="cemetery" defaultValue={contract?.cemetery ?? ''} />
                    </Field>
                    <Field id="registration_place" label="Inscrito en" error={errors.registration_place}>
                        <Input id="registration_place" name="registration_place" defaultValue={contract?.registration_place ?? ''} />
                    </Field>
                    <Field id="status" label="Estado" error={errors.status}>
                        <Input id="status" name="status" defaultValue={contract?.status ?? ''} />
                    </Field>
                </div>
            </div>

            <div className="border-t pt-6">
                <h3 className="mb-4 text-sm font-medium text-muted-foreground">Financiero & Modalidad de Pago</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="seller_id" label="Vendedor" error={errors.seller_id}>
                        <select id="seller_id" name="seller_id" defaultValue={contract?.seller_id ?? ''} className={selectClass}>
                            <option value="">Sin especificar</option>
                            {sellers.map((seller) => (
                                <option key={seller.id} value={seller.id}>
                                    {seller.name}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field id="institution" label="Institución" error={errors.institution}>
                        <Input id="institution" name="institution" defaultValue={contract?.institution ?? ''} />
                    </Field>
                    <Field id="amount" label="Valor Servicio Base" error={errors.amount}>
                        <Input id="amount" name="amount" type="number" min={0} defaultValue={contract?.amount ?? ''} placeholder="0" />
                    </Field>
                    <Field id="agreement_amount" label="Convenio / Descuento" error={errors.agreement_amount}>
                        <Input id="agreement_amount" name="agreement_amount" type="number" min={0} defaultValue={contract?.agreement_amount ?? ''} placeholder="0" />
                    </Field>
                    <Field id="surcharge" label="Recargo" error={errors.surcharge}>
                        <Input id="surcharge" name="surcharge" type="number" min={0} defaultValue={contract?.surcharge ?? ''} placeholder="0" />
                    </Field>
                    <Field id="additional_charge" label="Sub-recargo" error={errors.additional_charge}>
                        <Input id="additional_charge" name="additional_charge" type="number" min={0} defaultValue={contract?.additional_charge ?? ''} placeholder="0" />
                    </Field>
                    <Field id="down_payment" label="Pie / Abono Inicial" error={errors.down_payment}>
                        <Input 
                            id="down_payment" 
                            name="down_payment" 
                            type="number" 
                            min={0} 
                            defaultValue={contract?.down_payment ?? ''} 
                            onChange={(e) => setDownPayment(Number(e.target.value) || 0)}
                            placeholder="0" 
                        />
                    </Field>
                    <Field id="total" label="Total Contrato" error={errors.total}>
                        <Input 
                            id="total" 
                            name="total" 
                            type="number" 
                            min={0} 
                            defaultValue={contract?.total ?? ''} 
                            onChange={(e) => setTotal(Number(e.target.value) || 0)}
                            placeholder="0" 
                        />
                    </Field>

                    <div className="sm:col-span-2 rounded-lg border p-4 bg-muted/20 space-y-4">
                        <div className="flex items-center gap-3">
                            <Checkbox 
                                id="is_installment_plan" 
                                name="is_installment_plan" 
                                checked={isInstallment}
                                onCheckedChange={(checked) => setIsInstallment(Boolean(checked))} 
                            />
                            <Label htmlFor="is_installment_plan" className="font-semibold text-sm cursor-pointer">
                                Pago en cuotas (si no se marca, el pago es en su totalidad / al contado)
                            </Label>
                        </div>

                        {isInstallment && (
                            <div className="pt-3 border-t grid gap-4 sm:grid-cols-2">
                                <Field id="installments_count" label="N° de Cuotas" error={errors.installments_count}>
                                    <Input 
                                        id="installments_count" 
                                        name="installments_count" 
                                        type="number" 
                                        min={1} 
                                        max={120}
                                        value={count} 
                                        onChange={(e) => setCount(Number(e.target.value))}
                                        placeholder="12" 
                                    />
                                </Field>
                                <Field id="first_due_date" label="Fecha Vencimiento 1ª Cuota" error={errors.first_due_date}>
                                    <Input 
                                        id="first_due_date" 
                                        name="first_due_date" 
                                        type="date" 
                                        value={firstDueDate} 
                                        onChange={(e) => setFirstDueDate(e.target.value)} 
                                    />
                                </Field>

                                <div className="sm:col-span-2 rounded-md bg-background p-3 border text-xs space-y-1.5">
                                    <div className="flex justify-between font-medium">
                                        <span>Saldo a Financiar en Cuotas:</span>
                                        <span className="font-bold text-foreground">${balance.toLocaleString('es-CL')} CLP</span>
                                    </div>
                                    {count > 0 && balance > 0 && (
                                        <div className="flex justify-between text-muted-foreground">
                                            <span>Valor aprox. por cuota ({count} cuotas):</span>
                                            <span className="font-bold text-green-700 font-mono">${installmentEst.toLocaleString('es-CL')} CLP / mes</span>
                                        </div>
                                    )}
                                    <p className="text-[11px] text-muted-foreground pt-1 italic border-t border-dashed mt-1">
                                        Al guardar, el sistema generará automáticamente el calendario de {count} cuotas mensuales correlativas.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {contract?.installments && contract.installments.length > 0 && (
                <div className="border-t pt-6">
                    <h3 className="mb-4 text-sm font-medium text-muted-foreground">Calendario de Cuotas Registradas ({contract.installments.length})</h3>
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted text-muted-foreground uppercase font-semibold">
                                <tr>
                                    <th className="p-2 text-center">N°</th>
                                    <th className="p-2 text-center">Fecha Pago / Vencimiento</th>
                                    <th className="p-2 text-right">Monto</th>
                                    <th className="p-2 text-center">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {contract.installments.map((inst, idx) => (
                                    <tr key={inst.id}>
                                        <td className="p-2 text-center font-medium">Cuota {idx + 1}</td>
                                        <td className="p-2 text-center">{inst.due_date ?? inst.paid_at ?? 'Por definir'}</td>
                                        <td className="p-2 text-right font-medium">${Number(inst.amount ?? 0).toLocaleString('es-CL')}</td>
                                        <td className="p-2 text-center">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                                inst.status?.toLowerCase().includes('pagad') || inst.paid_at
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-orange-100 text-orange-800'
                                            }`}>
                                                {inst.status?.toUpperCase() ?? 'PENDIENTE'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {contract?.payments && contract.payments.length > 0 && (
                <div className="border-t pt-6">
                    <h3 className="mb-4 text-sm font-medium text-muted-foreground">Historial de Abonos Registrados ({contract.payments.length})</h3>
                    <div className="overflow-x-auto rounded-md border">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted text-muted-foreground uppercase font-semibold">
                                <tr>
                                    <th className="p-2 text-center">Fecha</th>
                                    <th className="p-2">Detalle</th>
                                    <th className="p-2 text-right">Monto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {contract.payments.map((pmt) => (
                                    <tr key={pmt.id}>
                                        <td className="p-2 text-center">{pmt.paid_at ?? 'N/A'}</td>
                                        <td className="p-2">Abono en caja</td>
                                        <td className="p-2 text-right font-medium text-green-700">${Number(pmt.total ?? 0).toLocaleString('es-CL')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="border-t pt-6">
                <Field id="observation" label="Observación" error={errors.observation}>
                    <Textarea id="observation" name="observation" defaultValue={contract?.observation ?? ''} rows={4} />
                </Field>
            </div>
        </div>
    );
}
