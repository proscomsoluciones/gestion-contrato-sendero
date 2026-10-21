import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Client, Commune } from '@/types/client';

type Errors = Partial<Record<keyof Client, string>>;

export default function ClientFormFields({
    communes,
    client,
    errors,
}: {
    communes: Commune[];
    client?: Client;
    errors: Errors;
}) {
    const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition shadow-2xs";
    const labelClass = "text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1";

    return (
        <div className="space-y-6">
            {/* Section 1: Client Data */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/70 space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span>Datos Principales del Cliente</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="rut" className={labelClass}>RUT</Label>
                        <Input id="rut" name="rut" defaultValue={client?.rut} required placeholder="12.345.678-9" className={inputClass} />
                        <InputError message={errors.rut} />
                    </div>
                    <div>
                        <Label htmlFor="status" className={labelClass}>Situación</Label>
                        <Input id="status" name="status" defaultValue={client?.status ?? ''} placeholder="Ej: Al Día / Vigente" className={inputClass} />
                        <InputError message={errors.status} />
                    </div>
                    <div>
                        <Label htmlFor="first_name" className={labelClass}>Nombre</Label>
                        <Input id="first_name" name="first_name" defaultValue={client?.first_name} required placeholder="Nombre del cliente" className={inputClass} />
                        <InputError message={errors.first_name} />
                    </div>
                    <div>
                        <Label htmlFor="last_name" className={labelClass}>Apellido</Label>
                        <Input id="last_name" name="last_name" defaultValue={client?.last_name} required placeholder="Apellido del cliente" className={inputClass} />
                        <InputError message={errors.last_name} />
                    </div>
                    <div>
                        <Label htmlFor="address" className={labelClass}>Dirección</Label>
                        <Input id="address" name="address" defaultValue={client?.address ?? ''} placeholder="Av. Principal 123" className={inputClass} />
                        <InputError message={errors.address} />
                    </div>
                    <div>
                        <Label htmlFor="commune_id" className={labelClass}>Comuna</Label>
                        <select
                            id="commune_id"
                            name="commune_id"
                            defaultValue={client?.commune_id ?? ''}
                            className={inputClass}
                        >
                            <option value="">Sin especificar</option>
                            {communes.map((commune) => (
                                <option key={commune.id} value={commune.id}>
                                    {commune.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.commune_id} />
                    </div>
                    <div>
                        <Label htmlFor="phone_1" className={labelClass}>Teléfono 1</Label>
                        <Input id="phone_1" name="phone_1" defaultValue={client?.phone_1 ?? ''} placeholder="+56 9 1234 5678" className={inputClass} />
                        <InputError message={errors.phone_1} />
                    </div>
                    <div>
                        <Label htmlFor="phone_2" className={labelClass}>Teléfono 2</Label>
                        <Input id="phone_2" name="phone_2" defaultValue={client?.phone_2 ?? ''} placeholder="+56 9 8765 4321" className={inputClass} />
                        <InputError message={errors.phone_2} />
                    </div>
                </div>
            </div>

            {/* Section 2: Responsible / Contact Person */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/70 space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span>Persona de Contacto / Responsable</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="contact_first_name" className={labelClass}>Nombre</Label>
                        <Input id="contact_first_name" name="contact_first_name" defaultValue={client?.contact_first_name ?? ''} className={inputClass} />
                        <InputError message={errors.contact_first_name} />
                    </div>
                    <div>
                        <Label htmlFor="contact_last_name" className={labelClass}>Apellido</Label>
                        <Input id="contact_last_name" name="contact_last_name" defaultValue={client?.contact_last_name ?? ''} className={inputClass} />
                        <InputError message={errors.contact_last_name} />
                    </div>
                    <div>
                        <Label htmlFor="contact_rut" className={labelClass}>RUT</Label>
                        <Input id="contact_rut" name="contact_rut" defaultValue={client?.contact_rut ?? ''} className={inputClass} />
                        <InputError message={errors.contact_rut} />
                    </div>
                    <div>
                        <Label htmlFor="contact_address" className={labelClass}>Dirección</Label>
                        <Input id="contact_address" name="contact_address" defaultValue={client?.contact_address ?? ''} className={inputClass} />
                        <InputError message={errors.contact_address} />
                    </div>
                    <div>
                        <Label htmlFor="contact_marital_status" className={labelClass}>Estado Civil</Label>
                        <Input id="contact_marital_status" name="contact_marital_status" defaultValue={client?.contact_marital_status ?? ''} className={inputClass} />
                        <InputError message={errors.contact_marital_status} />
                    </div>
                    <div>
                        <Label htmlFor="contact_education" className={labelClass}>Estudios</Label>
                        <Input id="contact_education" name="contact_education" defaultValue={client?.contact_education ?? ''} className={inputClass} />
                        <InputError message={errors.contact_education} />
                    </div>
                </div>
            </div>

            {/* Section 3: Plan & Contract Specs */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200/70 space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2 border-b border-slate-200/80 pb-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    <span>Especificaciones del Plan</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <Label htmlFor="urn" className={labelClass}>Urna</Label>
                        <Input id="urn" name="urn" defaultValue={client?.urn ?? ''} className={inputClass} />
                        <InputError message={errors.urn} />
                    </div>
                    <div>
                        <Label htmlFor="amount" className={labelClass}>Valor ($ CLP)</Label>
                        <Input id="amount" name="amount" type="number" min={0} defaultValue={client?.amount ?? ''} placeholder="450000" className={inputClass} />
                        <InputError message={errors.amount} />
                    </div>
                    <div>
                        <Label htmlFor="contract_date" className={labelClass}>Fecha de Contrato</Label>
                        <Input id="contract_date" name="contract_date" type="date" defaultValue={client?.contract_date ?? ''} className={inputClass} />
                        <InputError message={errors.contract_date} />
                    </div>
                    <div>
                        <Label htmlFor="payment_day" className={labelClass}>Día de Pago (1 a 31)</Label>
                        <Input id="payment_day" name="payment_day" type="number" min={1} max={31} defaultValue={client?.payment_day ?? ''} className={inputClass} />
                        <InputError message={errors.payment_day} />
                    </div>
                    <div>
                        <Label htmlFor="installments_count" className={labelClass}>N° de Cuotas</Label>
                        <Input id="installments_count" name="installments_count" type="number" min={0} defaultValue={client?.installments_count ?? ''} className={inputClass} />
                        <InputError message={errors.installments_count} />
                    </div>
                    <div className="flex flex-col justify-center gap-3 pt-2">
                        <div className="flex items-center gap-2.5">
                            <Checkbox id="includes_van" name="includes_van" defaultChecked={client?.includes_van} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                            <Label htmlFor="includes_van" className="text-xs font-bold text-slate-700 cursor-pointer">Incluye Van</Label>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <Checkbox id="includes_car" name="includes_car" defaultChecked={client?.includes_car} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                            <Label htmlFor="includes_car" className="text-xs font-bold text-slate-700 cursor-pointer">Incluye Auto</Label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

