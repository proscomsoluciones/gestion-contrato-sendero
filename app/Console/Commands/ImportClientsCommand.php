<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Commune;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ImportClientsCommand extends Command
{
    protected $signature = 'import:clients';

    protected $description = 'Importa comunas y clientes desde la base legada senderoo_funeraria (conexión de solo lectura "legacy")';

    public function handle(): int
    {
        $communesImported = $this->importCommunes();
        $clientsImported = $this->importClients();

        $legacyClientCount = DB::connection('legacy')->table('clientes')->count();

        $this->newLine();
        $this->components->twoColumnDetail('Comunas importadas', (string) $communesImported);
        $this->components->twoColumnDetail('Clientes importados', "{$clientsImported} / {$legacyClientCount}");

        if ($clientsImported !== $legacyClientCount) {
            $this->components->error('El conteo migrado no coincide con el de origen.');

            return self::FAILURE;
        }

        $this->components->info('Migración de clientes completada correctamente.');

        return self::SUCCESS;
    }

    private function importCommunes(): int
    {
        $names = DB::connection('legacy')->table('comunas')->pluck('nom_comuna')
            ->map(fn ($name) => trim($name))
            ->filter()
            ->unique();

        foreach ($names as $name) {
            Commune::query()->firstOrCreate(['name' => $name]);
        }

        return Commune::query()->count();
    }

    private function importClients(): int
    {
        $rows = DB::connection('legacy')->table('clientes')->orderBy('id_cliente')->get();

        foreach ($rows as $row) {
            $communeId = null;
            $communeName = trim((string) $row->comuna);
            if ($communeName !== '') {
                $communeId = Commune::query()->firstOrCreate(['name' => $communeName])->id;
            }

            Client::query()->updateOrCreate(
                ['legacy_id' => $row->id_cliente],
                [
                    'rut' => trim((string) $row->rut_cliente) ?: "SIN-RUT-{$row->id_cliente}",
                    'first_name' => trim((string) $row->nom_cliente),
                    'last_name' => trim((string) $row->ape_cliente),
                    'address' => $this->nullableTrim($row->direccion),
                    'commune_id' => $communeId,
                    'phone_1' => $this->nullableTrim($row->fono1),
                    'phone_2' => $this->nullableTrim($row->fono2),
                    'contact_first_name' => $this->nullableTrim($row->nom_per),
                    'contact_last_name' => $this->nullableTrim($row->ape_per),
                    'contact_rut' => $this->nullableTrim($row->rut_per),
                    'contact_address' => $this->nullableTrim($row->direccion_per),
                    'contact_marital_status' => $this->nullableTrim($row->estadocivil),
                    'contact_education' => $this->nullableTrim($row->estudios),
                    'status' => $this->nullableTrim($row->situacion),
                    'urn' => $this->nullableTrim($row->urna),
                    'includes_van' => $this->parseBoolean($row->van),
                    'includes_car' => $this->parseBoolean($row->auto),
                    'amount' => $row->valor !== null ? (int) $row->valor : null,
                    'contract_date' => $this->parseLegacyDate($row->fech_contrato),
                    'payment_day' => $this->parsePaymentDay($row->dia_pago),
                    'installments_count' => $row->cuotas !== null ? (int) $row->cuotas : null,
                ]
            );
        }

        return Client::query()->whereNotNull('legacy_id')->count();
    }

    private function nullableTrim(mixed $value): ?string
    {
        $value = trim((string) $value);

        return $value === '' ? null : $value;
    }

    private function parseBoolean(mixed $value): bool
    {
        $value = strtolower(trim((string) $value));

        return in_array($value, ['1', 'si', 'sí', 's', 'yes', 'y'], true);
    }

    private function parsePaymentDay(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        $day = (int) $value;

        // Datos legados con valores basura (p. ej. una fecha completa tipeada por error).
        return ($day >= 1 && $day <= 31) ? $day : null;
    }

    private function parseLegacyDate(mixed $value): ?string
    {
        $value = trim((string) $value);

        if ($value === '') {
            return null;
        }

        try {
            return Carbon::createFromFormat('d/m/Y', $value)->toDateString();
        } catch (\Throwable) {
            return null;
        }
    }
}
