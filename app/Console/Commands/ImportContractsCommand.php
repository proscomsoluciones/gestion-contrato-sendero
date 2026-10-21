<?php

namespace App\Console\Commands;

use App\Models\Commune;
use App\Models\Contract;
use App\Models\Seller;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ImportContractsCommand extends Command
{
    protected $signature = 'import:contracts';

    protected $description = 'Importa vendedores y contratos desde la base legada senderoo_funeraria, re-vinculando los PDFs históricos a storage privado';

    private string $legacyPdfDisk = 'legacy_contracts';

    public function handle(): int
    {
        $sellersImported = $this->importSellers();
        [$contractsImported, $pdfsLinked] = $this->importContracts();

        $legacyCount = DB::connection('legacy')->table('contratos')->count();

        $this->newLine();
        $this->components->twoColumnDetail('Vendedores importados', (string) $sellersImported);
        $this->components->twoColumnDetail('Contratos importados', "{$contractsImported} / {$legacyCount}");
        $this->components->twoColumnDetail('PDFs históricos re-vinculados', (string) $pdfsLinked);

        if ($contractsImported !== $legacyCount) {
            $this->components->error('El conteo migrado no coincide con el de origen.');

            return self::FAILURE;
        }

        $this->components->info('Migración de contratos completada correctamente.');

        return self::SUCCESS;
    }

    private function importSellers(): int
    {
        $rows = DB::connection('legacy')->table('vendedores')->get();

        foreach ($rows as $row) {
            $name = trim((string) $row->nombre_vend);

            if ($name === '') {
                continue;
            }

            Seller::query()->updateOrCreate(
                ['legacy_id' => $row->id_vendedor],
                ['name' => $name]
            );
        }

        return Seller::query()->count();
    }

    private function importContracts(): array
    {
        $rows = DB::connection('legacy')->table('contratos')->orderBy('id_contrato')->get();
        $pdfsLinked = 0;

        foreach ($rows as $row) {
            $communeId = $this->resolveCommune($row->comuna);
            $sellerId = $this->resolveSeller($row->vendedor);
            $pdfPath = $this->linkLegacyPdf($row->id_contrato, $row->ruta);

            if ($pdfPath !== null) {
                $pdfsLinked++;
            }

            Contract::query()->updateOrCreate(
                ['legacy_id' => $row->id_contrato],
                [
                    'contract_date' => $this->nullableDate($row->fech_contrato),
                    'first_name' => trim((string) $row->nombre),
                    'last_name' => trim((string) $row->apellido),
                    'rut' => trim((string) $row->rut) ?: "SIN-RUT-{$row->id_contrato}",
                    'address' => $this->nullableTrim($row->direccion),
                    'commune_id' => $communeId,
                    'phone_1' => $this->nullableTrim($row->fono1),
                    'phone_2' => $this->nullableTrim($row->fono2),
                    'email' => $this->nullableTrim($row->correo),
                    'marital_status' => $this->nullableTrim($row->estado),
                    'occupation_status' => $this->nullableTrim($row->situacion),
                    'education' => $this->nullableTrim($row->estudios),
                    'last_address' => $this->nullableTrim($row->ult_domi),
                    'beneficiary_first_name' => $this->nullableTrim($row->nom_beni),
                    'beneficiary_last_name' => $this->nullableTrim($row->ape_beni),
                    'beneficiary_rut' => $this->nullableTrim($row->rut_beni),
                    'beneficiary_relationship' => $this->nullableTrim($row->parentezco),
                    'transfer' => $this->nullableTrim($row->traslado),
                    'urn' => $this->nullableTrim($row->urna),
                    'press_notice' => $this->nullableTrim($row->prensa),
                    'religious_service' => $this->nullableTrim($row->s_religioso),
                    'service_time' => $this->nullableTrim($row->hora_servicio),
                    'hearse' => $this->nullableTrim($row->carroza),
                    'car_transport' => $this->nullableTrim($row->auto),
                    'van_transport' => $this->nullableTrim($row->van),
                    'chapel' => $this->nullableTrim($row->capilla),
                    'burial_date' => $this->nullableDate($row->fecha_sepult),
                    'burial_time' => $this->nullableTrim($row->hora_sepult),
                    'burial_type' => $this->nullableTrim($row->tipo),
                    'cemetery' => $this->nullableTrim($row->cementerio),
                    'registration_place' => $this->nullableTrim($row->inscrito),
                    'status' => $this->nullableTrim($row->estado),
                    'seller_id' => $sellerId,
                    'amount' => $this->parseMoney($row->valor),
                    'agreement_amount' => $this->parseMoney($row->convenio),
                    'surcharge' => $this->parseMoney($row->recargo),
                    'additional_charge' => $this->parseMoney($row->sub_re),
                    'down_payment' => $this->parseMoney($row->abono),
                    'total' => $this->parseMoney($row->total),
                    'is_installment_plan' => $this->parseTriBoolean($row->cuota),
                    'institution' => $this->nullableTrim($row->institucion),
                    'observation' => $this->nullableTrim($row->observacion),
                    'pdf_path' => $pdfPath,
                ]
            );
        }

        return [Contract::query()->whereNotNull('legacy_id')->count(), $pdfsLinked];
    }

    private function resolveCommune(mixed $value): ?int
    {
        $name = trim((string) $value);

        if ($name === '') {
            return null;
        }

        return Commune::query()->firstOrCreate(['name' => $name])->id;
    }

    private function resolveSeller(mixed $value): ?int
    {
        $name = trim((string) $value);

        if ($name === '' || str_starts_with($name, '$')) {
            return null;
        }

        return Seller::query()->firstOrCreate(['name' => $name])->id;
    }

    private function linkLegacyPdf(int $legacyId, mixed $ruta): ?string
    {
        $filename = trim((string) $ruta);

        if ($filename === '') {
            return null;
        }

        try {
            if (! Storage::disk($this->legacyPdfDisk)->exists($filename)) {
                return null;
            }

            $contents = Storage::disk($this->legacyPdfDisk)->get($filename);
        } catch (\Throwable) {
            // Nombres de archivo legados con encoding corrupto (mojibake) que
            // Flysystem rechaza como ruta inválida: se omite ese PDF puntual.
            return null;
        }

        $targetPath = "contracts/{$legacyId}.pdf";

        Storage::disk('local')->put($targetPath, $contents);

        return $targetPath;
    }

    private function nullableTrim(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function nullableDate(mixed $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '' || $value === '0000-00-00') {
            return null;
        }

        return $value;
    }

    private function parseMoney(mixed $value): ?int
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        // Datos legados con separador de miles ("1.200.000") o texto suelto.
        $digits = preg_replace('/[^\d]/', '', $value);

        return $digits === '' ? null : (int) $digits;
    }

    private function parseTriBoolean(mixed $value): ?bool
    {
        $value = strtolower(trim((string) $value));

        return match (true) {
            in_array($value, ['si', 'sí', 's', 'yes', 'y'], true) => true,
            in_array($value, ['no', 'n'], true) => false,
            default => null,
        };
    }
}
