<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\Commune;
use App\Models\Contract;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class DedupeCommunesCommand extends Command
{
    protected $signature = 'communes:dedupe {--dry-run : Solo muestra qué se fusionaría, sin modificar nada}';

    protected $description = 'Fusiona comunas que son la misma en el fondo (mayúscula/acentos/espacios distintos o encoding roto). No toca casos ambiguos.';

    /**
     * Patrones de mojibake detectados en los datos reales, mapeados a su forma correcta.
     * No es una teoría general de encoding: son los casos puntuales que aparecen en esta base.
     */
    private array $mojibakeFixes = [
        'Ã‘' => 'Ñ',
        'Ã“' => 'Ó',
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $officialNames = DB::connection('legacy')->table('comunas')->pluck('nom_comuna')
            ->map(fn ($name) => trim((string) $name))
            ->filter()
            ->unique()
            ->values();

        $officialByNormalized = $officialNames->mapWithKeys(fn ($name) => [$this->normalize($name) => $name]);

        $communes = Commune::query()->withCount(['clients', 'contracts'])->get();

        $groups = $communes->groupBy(fn (Commune $commune) => $this->normalize($commune->name));

        $merges = [];
        $unresolved = [];
        $mergedCount = 0;

        DB::beginTransaction();

        try {
            foreach ($groups as $normalized => $group) {
                if ($group->count() < 2) {
                    $isOfficial = $officialByNormalized->has($normalized);

                    if (! $isOfficial && $this->looksSuspicious($group->first())) {
                        $unresolved[] = $group->first();
                    }

                    continue;
                }

                $canonical = $this->pickCanonical($group, $officialByNormalized->get($normalized));
                $duplicates = $group->reject(fn (Commune $c) => $c->id === $canonical->id);

                $merges[] = [
                    'canonical' => $canonical,
                    'duplicates' => $duplicates,
                ];

                if (! $dryRun) {
                    foreach ($duplicates as $duplicate) {
                        Client::where('commune_id', $duplicate->id)->update(['commune_id' => $canonical->id]);
                        Contract::where('commune_id', $duplicate->id)->update(['commune_id' => $canonical->id]);
                        $duplicate->delete();
                    }
                }

                $mergedCount += $duplicates->count();
            }

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
        $this->components->info($dryRun ? 'Vista previa (no se modificó nada):' : 'Fusión aplicada:');

        foreach ($merges as $merge) {
            $names = $merge['duplicates']->map(fn (Commune $c) => "\"{$c->name}\" (#{$c->id})")->implode(', ');
            $this->line("  {$names} → \"{$merge['canonical']->name}\" (#{$merge['canonical']->id})");
        }

        $this->newLine();
        $this->components->twoColumnDetail('Grupos fusionados', (string) count($merges));
        $this->components->twoColumnDetail('Comunas eliminadas', (string) $mergedCount);
        $this->components->twoColumnDetail('Comunas antes', (string) $communes->count());
        $this->components->twoColumnDetail('Comunas después', (string) ($communes->count() - $mergedCount));

        if ($unresolved !== []) {
            $this->newLine();
            $this->components->warn('Entradas que no se tocaron por ser ambiguas (posible typo o dato basura) — requieren revisión manual:');
            foreach ($unresolved as $commune) {
                $refs = $commune->clients_count + $commune->contracts_count;
                $this->line("  \"{$commune->name}\" (#{$commune->id}) — {$refs} referencia(s)");
            }
        }

        if ($dryRun) {
            $this->newLine();
            $this->components->info('Corré sin --dry-run para aplicar la fusión.');
        }

        return self::SUCCESS;
    }

    private function pickCanonical($group, ?string $officialName): Commune
    {
        if ($officialName !== null) {
            $exactOfficialMatch = $group->first(fn (Commune $c) => $c->name === $officialName);

            if ($exactOfficialMatch) {
                return $exactOfficialMatch;
            }
        }

        return $group->sortByDesc(fn (Commune $c) => $c->clients_count + $c->contracts_count)
            ->sortBy(fn (Commune $c) => mb_strlen($c->name))
            ->first();
    }

    /**
     * Solo se llama para comunas que ya sabemos que NO están en la lista oficial.
     * Reporta como "requiere revisión" únicamente las que además tienen algún
     * indicio de ser basura/typo Y tienen datos reales enganchados (si no tiene
     * ninguna referencia, no vale la pena ni mostrarla).
     */
    private function looksSuspicious(Commune $commune): bool
    {
        if ($commune->clients_count + $commune->contracts_count === 0) {
            return false;
        }

        $name = $commune->name;

        if (mb_strlen(trim($name)) <= 2) {
            return true;
        }

        if (preg_match('/[\$0-9]/', $name)) {
            return true;
        }

        if (! preg_match('/[a-zA-ZÀ-ÿ]/', $name)) {
            return true;
        }

        return true;
    }

    private function normalize(string $name): string
    {
        $name = strtr($name, $this->mojibakeFixes);
        $name = trim($name);
        $name = mb_strtoupper($name);

        $name = strtr($name, [
            'Á' => 'A', 'É' => 'E', 'Í' => 'I', 'Ó' => 'O', 'Ú' => 'U', 'Ñ' => 'N', 'Ü' => 'U',
        ]);

        $name = preg_replace('/\s+/', ' ', $name);
        $name = trim($name, " .,-");

        return $name;
    }
}
