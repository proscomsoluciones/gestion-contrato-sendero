<?php

namespace App\Console\Commands;

use App\Models\Contract;
use App\Models\Installment;
use App\Support\Rut;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ImportInstallmentsCommand extends Command
{
    protected $signature = 'import:installments';

    protected $description = 'Importa las cuotas desde la base legada senderoo_funeraria, vinculándolas al contrato por RUT normalizado';

    public function handle(): int
    {
        $contractsByRut = Contract::query()
            ->whereNotNull('legacy_id')
            ->pluck('id', 'rut')
            ->mapWithKeys(fn ($id, $rut) => [Rut::normalize($rut) => $id]);

        $rows = DB::connection('legacy')->table('cuotas')->orderBy('id_cuota')->get();
        $linked = 0;

        foreach ($rows as $row) {
            $contractId = $contractsByRut->get(Rut::normalize($row->rut_contrato));

            if ($contractId !== null) {
                $linked++;
            }

            Installment::query()->updateOrCreate(
                ['legacy_id' => $row->id_cuota],
                [
                    'contract_id' => $contractId,
                    'legacy_contract_rut' => trim((string) $row->rut_contrato) ?: null,
                    'status' => trim((string) $row->estado) ?: null,
                    'paid_at' => $this->nullableDate($row->fecha_pago),
                    'invoice_number' => trim((string) $row->factura) ?: null,
                ]
            );
        }

        $legacyCount = DB::connection('legacy')->table('cuotas')->count();
        $imported = Installment::query()->whereNotNull('legacy_id')->count();

        $this->newLine();
        $this->components->twoColumnDetail('Cuotas importadas', "{$imported} / {$legacyCount}");
        $this->components->twoColumnDetail('Vinculadas a un contrato', (string) $linked);

        if ($imported !== $legacyCount) {
            $this->components->error('El conteo migrado no coincide con el de origen.');

            return self::FAILURE;
        }

        $this->components->info('Migración de cuotas completada correctamente.');

        return self::SUCCESS;
    }

    private function nullableDate(mixed $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '' || $value === '0000-00-00') {
            return null;
        }

        return $value;
    }
}
