<?php

namespace App\Console\Commands;

use App\Models\Contract;
use App\Models\Payment;
use App\Support\Rut;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ImportPaymentsCommand extends Command
{
    protected $signature = 'import:payments';

    protected $description = 'Importa los pagos desde la base legada senderoo_funeraria, vinculándolos al contrato por RUT normalizado y re-vinculando los comprobantes PDF';

    private string $legacyReceiptsDisk = 'legacy_receipts';

    public function handle(): int
    {
        $contractsByRut = Contract::query()
            ->whereNotNull('legacy_id')
            ->pluck('id', 'rut')
            ->mapWithKeys(fn ($id, $rut) => [Rut::normalize($rut) => $id]);

        $rows = DB::connection('legacy')->table('pagos')->orderBy('id_pago')->get();
        $linked = 0;
        $receiptsLinked = 0;

        foreach ($rows as $row) {
            $contractId = $contractsByRut->get(Rut::normalize($row->id_cliente));

            if ($contractId !== null) {
                $linked++;
            }

            $receiptPath = $this->linkLegacyReceipt($row->id_pago, $row->com_pdf);

            if ($receiptPath !== null) {
                $receiptsLinked++;
            }

            Payment::query()->updateOrCreate(
                ['legacy_id' => $row->id_pago],
                [
                    'contract_id' => $contractId,
                    'legacy_client_rut' => trim((string) $row->id_cliente) ?: null,
                    'paid_at' => $this->nullableDate($row->fecha),
                    'cash_amount' => $this->parseMoney($row->efectivo),
                    'card_amount' => $this->parseMoney($row->tarjeta),
                    'check_amount' => $this->parseMoney($row->cheque),
                    'total' => $this->parseMoney($row->total),
                    'receipt_path' => $receiptPath,
                    'status' => trim((string) $row->estado) ?: null,
                ]
            );
        }

        $legacyCount = DB::connection('legacy')->table('pagos')->count();
        $imported = Payment::query()->whereNotNull('legacy_id')->count();

        $this->newLine();
        $this->components->twoColumnDetail('Pagos importados', "{$imported} / {$legacyCount}");
        $this->components->twoColumnDetail('Vinculados a un contrato', (string) $linked);
        $this->components->twoColumnDetail('Comprobantes re-vinculados', (string) $receiptsLinked);

        if ($imported !== $legacyCount) {
            $this->components->error('El conteo migrado no coincide con el de origen.');

            return self::FAILURE;
        }

        $this->components->info('Migración de pagos completada correctamente.');

        return self::SUCCESS;
    }

    private function linkLegacyReceipt(int $legacyId, mixed $filename): ?string
    {
        $filename = trim((string) $filename);

        if ($filename === '') {
            return null;
        }

        try {
            if (! Storage::disk($this->legacyReceiptsDisk)->exists($filename)) {
                return null;
            }

            $contents = Storage::disk($this->legacyReceiptsDisk)->get($filename);
        } catch (\Throwable) {
            return null;
        }

        $targetPath = "receipts/{$legacyId}.pdf";

        Storage::disk('local')->put($targetPath, $contents);

        return $targetPath;
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
}
