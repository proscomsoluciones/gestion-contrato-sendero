<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Commune;
use App\Models\Contract;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ResolveCommuneTyposCommand extends Command
{
    protected $signature = 'communes:resolve-typos {--dry-run : Solo muestra qué se haría, sin modificar nada}';

    protected $description = 'Corrige a mano las comunas que quedaron pendientes de communes:dedupe: typos/variantes conocidas se fusionan con la comuna oficial, la basura real se limpia. Todo curado manualmente, nada por adivinanza automática.';

    /**
     * comuna_oficial => [ids de comunas legadas que son esa comuna con typo/variante/subsector conocido]
     * Curado a mano revisando cada entrada; no es un matching automático.
     */
    private array $mergeMap = [
        'Pudahuel' => [384, 421, 382, 351, 441, 448, 461, 388, 383, 378, 379, 413, 434],
        'Lo espejo' => [424],
        'Cerro Navia' => [465, 471, 355],
        'Casablanca' => [400],
        'Cerrillos' => [347, 412],
        'Catemu' => [429],
        'Colina' => [402],
        'Conchali' => [371],
        'Concepcion' => [453],
        'Curacavi' => [450],
        'Valparaiso' => [380, 430],
        'estacion Central' => [409, 433],
        'Huechuraba' => [416],
        'Independencia' => [452],
        'Lo Prado' => [377],
        'La Reina' => [425],
        'Lampa' => [410],
        'Las Condes' => [422],
        'La Florida' => [463],
        'Maipu' => [467, 427, 446, 418, 415, 395, 464],
        'Penaflor' => [407],
        'nunoa' => [460],
        'Pedro Aguirre Cerda' => [350, 363, 443, 451],
        'Penalolen' => [417, 428],
        'Providencia' => [458],
        'Puente Alto' => [406],
        'Puerto Montt' => [457],
        'Saavedra' => [477],
        'Quilicura' => [456],
        'Quinta Normal' => [431, 392, 445],
        'Rancagua' => [423],
        'Recoleta' => [455],
        'San Bernardo' => [386],
        'Mostazal' => [476],
        'San Pedro' => [442],
        'San Ramon' => [444],
        'Santiago' => [372, 440],
        'La Serena' => [436],
        'Tiltil' => [419],
        'Talca' => [437],
        'Coquimbo' => [432],
    ];

    /**
     * IDs que no representan ninguna comuna real (basura, variables rotas, placeholders).
     * Se limpia la referencia en clientes/contratos (queda sin comuna) y se borra la fila.
     */
    private array $junkIds = [
        352, 473, 357, 469, 475, 376, 390, 435, 474, 375, 447, 373, 391, 426, 366,
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        DB::beginTransaction();

        try {
            $mergedCount = $this->applyMerges($dryRun);
            $clearedCount = $this->applyJunkCleanup($dryRun);

            if ($dryRun) {
                DB::rollBack();
            } else {
                DB::commit();
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }

        $this->newLine();
        $this->components->info($dryRun ? 'Vista previa (no se modificó nada):' : 'Aplicado:');
        $this->components->twoColumnDetail('Comunas fusionadas a una oficial', (string) $mergedCount);
        $this->components->twoColumnDetail('Comunas basura limpiadas', (string) $clearedCount);

        if ($dryRun) {
            $this->newLine();
            $this->components->info('Corré sin --dry-run para aplicar.');
        }

        return self::SUCCESS;
    }

    private function applyMerges(bool $dryRun): int
    {
        $count = 0;

        foreach ($this->mergeMap as $officialName => $sourceIds) {
            $canonical = Commune::where('name', $officialName)->first();

            if (! $canonical) {
                $this->components->error("No encontré la comuna oficial \"{$officialName}\", salto ese grupo.");

                continue;
            }

            foreach ($sourceIds as $sourceId) {
                $source = Commune::find($sourceId);

                if (! $source) {
                    continue;
                }

                $this->line("  \"{$source->name}\" (#{$source->id}) → \"{$canonical->name}\" (#{$canonical->id})");

                if (! $dryRun) {
                    Client::where('commune_id', $source->id)->update(['commune_id' => $canonical->id]);
                    Contract::where('commune_id', $source->id)->update(['commune_id' => $canonical->id]);
                    $source->delete();
                }

                $count++;
            }
        }

        return $count;
    }

    private function applyJunkCleanup(bool $dryRun): int
    {
        $count = 0;

        foreach ($this->junkIds as $id) {
            $commune = Commune::find($id);

            if (! $commune) {
                continue;
            }

            $this->line("  \"{$commune->name}\" (#{$commune->id}) → sin comuna (dato basura)");

            if (! $dryRun) {
                Client::where('commune_id', $commune->id)->update(['commune_id' => null]);
                Contract::where('commune_id', $commune->id)->update(['commune_id' => null]);
                $commune->delete();
            }

            $count++;
        }

        return $count;
    }
}
