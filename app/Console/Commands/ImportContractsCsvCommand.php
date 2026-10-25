<?php

namespace App\Console\Commands;

use App\Models\Commune;
use App\Models\Contract;
use App\Models\Seller;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ImportContractsCsvCommand extends Command
{
    protected $signature = 'import:contracts-csv 
                            {file? : Ruta al archivo CSV con delimitador punto y coma}
                            {--sync-legacy : Sincronizar también con la tabla legada contratos en senderoo_funeraria}';

    protected $description = 'Importa contratos desde un archivo CSV con formato exportado (delimitador punto y coma)';

    private string $legacyPdfDisk = 'legacy_contracts';

    public function handle(): int
    {
        $filePath = $this->argument('file') ?? storage_path('app/imports/contratos_6645_6675.csv');

        if (! file_exists($filePath)) {
            $this->components->error("El archivo no existe: {$filePath}");
            return self::FAILURE;
        }

        $handle = fopen($filePath, 'r');
        if ($handle === false) {
            $this->components->error("No se pudo abrir el archivo: {$filePath}");
            return self::FAILURE;
        }

        // Leer encabezados
        $headerLine = fgetcsv($handle, 0, ';', '"', '\\');
        if ($headerLine === false) {
            $this->components->error('El archivo CSV está vacío.');
            fclose($handle);
            return self::FAILURE;
        }

        $headers = array_map(fn ($h) => trim($h, " \t\n\r\0\x0B\"'"), $headerLine);

        $processed = 0;
        $created = 0;
        $updated = 0;
        $legacySynced = 0;
        $syncLegacy = $this->option('sync-legacy');

        while (($row = fgetcsv($handle, 0, ';', '"', '\\')) !== false) {
            if (count($row) === 1 && empty($row[0])) {
                continue;
            }

            // Mapear fila con encabezados
            $data = [];
            foreach ($headers as $index => $key) {
                $data[$key] = $row[$index] ?? null;
            }

            $legacyId = isset($data['id_contrato']) ? (int) $data['id_contrato'] : null;
            if (! $legacyId) {
                continue;
            }

            $communeId = $this->resolveCommune($data['comuna'] ?? null);
            $sellerId = $this->resolveSeller($data['vendedor'] ?? null);
            $pdfPath = $this->linkLegacyPdf($legacyId, $data['ruta'] ?? null);

            $contractAttributes = [
                'contract_date' => $this->nullableDate($data['fech_contrato'] ?? null),
                'first_name' => trim((string) ($data['nombre'] ?? '')),
                'last_name' => trim((string) ($data['apellido'] ?? '')),
                'rut' => trim((string) ($data['rut'] ?? '')) ?: "SIN-RUT-{$legacyId}",
                'address' => $this->nullableTrim($data['direccion'] ?? null),
                'commune_id' => $communeId,
                'phone_1' => $this->nullableTrim($data['fono1'] ?? null),
                'phone_2' => $this->nullableTrim($data['fono2'] ?? null),
                'email' => $this->nullableTrim($data['correo'] ?? null),
                'marital_status' => $this->nullableTrim($data['estado'] ?? null),
                'occupation_status' => $this->nullableTrim($data['situacion'] ?? null),
                'education' => $this->nullableTrim($data['estudios'] ?? null),
                'last_address' => $this->nullableTrim($data['ult_domi'] ?? null),
                'beneficiary_first_name' => $this->nullableTrim($data['nom_beni'] ?? null),
                'beneficiary_last_name' => $this->nullableTrim($data['ape_beni'] ?? null),
                'beneficiary_rut' => $this->nullableTrim($data['rut_beni'] ?? null),
                'beneficiary_relationship' => $this->nullableTrim($data['parentezco'] ?? null),
                'transfer' => $this->nullableTrim($data['traslado'] ?? null),
                'urn' => $this->nullableTrim($data['urna'] ?? null),
                'press_notice' => $this->nullableTrim($data['prensa'] ?? null),
                'religious_service' => $this->nullableTrim($data['s_religioso'] ?? null),
                'service_time' => $this->nullableTrim($data['hora_servicio'] ?? null),
                'hearse' => $this->nullableTrim($data['carroza'] ?? null),
                'car_transport' => $this->nullableTrim($data['auto'] ?? null),
                'van_transport' => $this->nullableTrim($data['van'] ?? null),
                'chapel' => $this->nullableTrim($data['capilla'] ?? null),
                'burial_date' => $this->nullableDate($data['fecha_sepult'] ?? null),
                'burial_time' => $this->nullableTrim($data['hora_sepult'] ?? null),
                'burial_type' => $this->nullableTrim($data['tipo'] ?? null),
                'cemetery' => $this->nullableTrim($data['cementerio'] ?? null),
                'registration_place' => $this->nullableTrim($data['inscrito'] ?? null),
                'status' => $this->nullableTrim($data['estado'] ?? null),
                'seller_id' => $sellerId,
                'amount' => $this->parseMoney($data['valor'] ?? null),
                'agreement_amount' => $this->parseMoney($data['convenio'] ?? null),
                'surcharge' => $this->parseMoney($data['recargo'] ?? null),
                'additional_charge' => $this->parseMoney($data['sub_re'] ?? null),
                'down_payment' => $this->parseMoney($data['abono'] ?? null),
                'total' => $this->parseMoney($data['total'] ?? null),
                'is_installment_plan' => $this->parseTriBoolean($data['cuota'] ?? null),
                'institution' => $this->nullableTrim($data['institucion'] ?? null),
                'observation' => $this->nullableTrim($data['observacion'] ?? null),
                'pdf_path' => $pdfPath,
            ];

            $contract = Contract::query()->where('legacy_id', $legacyId)->first();
            if ($contract) {
                $contract->update($contractAttributes);
                $updated++;
            } else {
                Contract::query()->create(array_merge(['legacy_id' => $legacyId], $contractAttributes));
                $created++;
            }

            // Opcional: sincronizar con senderoo_funeraria.contratos
            if ($syncLegacy) {
                $this->syncToLegacyDatabase($legacyId, $data);
                $legacySynced++;
            }

            $processed++;
        }

        fclose($handle);

        $this->newLine();
        $this->components->info("Procesamiento finalizado.");
        $this->components->twoColumnDetail('Total procesados', (string) $processed);
        $this->components->twoColumnDetail('Nuevos contratos creados', (string) $created);
        $this->components->twoColumnDetail('Contratos actualizados', (string) $updated);
        if ($syncLegacy) {
            $this->components->twoColumnDetail('Sincronizados en legacy (senderoo_funeraria)', (string) $legacySynced);
        }

        return self::SUCCESS;
    }

    private function syncToLegacyDatabase(int $legacyId, array $data): void
    {
        try {
            $legacyRow = [
                'id_contrato' => $legacyId,
                'fech_contrato' => $data['fech_contrato'] ?: date('Y-m-d'),
                'nombre' => (string) ($data['nombre'] ?? ''),
                'apellido' => (string) ($data['apellido'] ?? ''),
                'rut' => (string) ($data['rut'] ?? ''),
                'direccion' => (string) ($data['direccion'] ?? ''),
                'comuna' => (string) ($data['comuna'] ?? ''),
                'fono1' => (string) ($data['fono1'] ?? ''),
                'fono2' => (string) ($data['fono2'] ?? ''),
                'correo' => (string) ($data['correo'] ?? ''),
                'nom_beni' => (string) ($data['nom_beni'] ?? ''),
                'ape_beni' => (string) ($data['ape_beni'] ?? ''),
                'rut_beni' => (string) ($data['rut_beni'] ?? ''),
                'traslado' => (string) ($data['traslado'] ?? ''),
                'urna' => (string) ($data['urna'] ?? ''),
                'prensa' => (string) ($data['prensa'] ?? ''),
                's_religioso' => (string) ($data['s_religioso'] ?? ''),
                'hora_servicio' => (string) ($data['hora_servicio'] ?? ''),
                'parentezco' => (string) ($data['parentezco'] ?? ''),
                'carroza' => (string) ($data['carroza'] ?? ''),
                'auto' => (string) ($data['auto'] ?? ''),
                'van' => (string) ($data['van'] ?? ''),
                'capilla' => (string) ($data['capilla'] ?? ''),
                'fecha_sepult' => $data['fecha_sepult'] ?: date('Y-m-d'),
                'hora_sepult' => (string) ($data['hora_sepult'] ?? ''),
                'tipo' => (string) ($data['tipo'] ?? ''),
                'cementerio' => (string) ($data['cementerio'] ?? ''),
                'inscrito' => (string) ($data['inscrito'] ?? ''),
                'estudios' => (string) ($data['estudios'] ?? ''),
                'estado' => (string) ($data['estado'] ?? ''),
                'ult_domi' => (string) ($data['ult_domi'] ?? ''),
                'situacion' => (string) ($data['situacion'] ?? ''),
                'valor' => (string) ($data['valor'] ?? '0'),
                'convenio' => (string) ($data['convenio'] ?? '0'),
                'recargo' => (string) ($data['recargo'] ?? '0'),
                'sub_re' => (string) ($data['sub_re'] ?? '0'),
                'abono' => (string) ($data['abono'] ?? '0'),
                'vendedor' => (string) ($data['vendedor'] ?? ''),
                'total' => (string) ($data['total'] ?? '0'),
                'observacion' => (string) ($data['observacion'] ?? ''),
                'ruta' => (string) ($data['ruta'] ?? ''),
                'cuota' => (string) ($data['cuota'] ?? ''),
                'institucion' => (string) ($data['institucion'] ?? ''),
            ];

            $exists = DB::connection('legacy')->table('contratos')->where('id_contrato', $legacyId)->exists();
            if ($exists) {
                DB::connection('legacy')->table('contratos')->where('id_contrato', $legacyId)->update($legacyRow);
            } else {
                DB::connection('legacy')->table('contratos')->insert($legacyRow);
            }
        } catch (\Throwable $e) {
            $this->components->warn("No se pudo sincronizar en legacy el contrato #{$legacyId}: " . $e->getMessage());
        }
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
