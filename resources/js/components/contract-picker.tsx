import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { search } from '@/routes/contracts';
import type { PaymentContract } from '@/types/payment';

type SearchResult = { id: number; label: string };

export default function ContractPicker({
    initialContract,
    error,
}: {
    initialContract?: PaymentContract | null;
    error?: string;
}) {
    const [query, setQuery] = useState(
        initialContract ? `${initialContract.first_name} ${initialContract.last_name} · ${initialContract.rut}` : ''
    );
    const [selectedId, setSelectedId] = useState<number | null>(initialContract?.id ?? null);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (query === '' || selectedId !== null) {
            setResults([]);
            return;
        }

        const timeout = setTimeout(() => {
            fetch(search({ query: { q: query } }).url)
                .then((response) => response.json())
                .then((data: SearchResult[]) => {
                    setResults(data);
                    setOpen(true);
                })
                .catch(() => setResults([]));
        }, 250);

        return () => clearTimeout(timeout);
    }, [query, selectedId]);

    function select(result: SearchResult) {
        setSelectedId(result.id);
        setQuery(result.label);
        setOpen(false);
    }

    function change(value: string) {
        setQuery(value);
        setSelectedId(null);
    }

    return (
        <div className="relative grid gap-2">
            <Label htmlFor="contract_search">Contrato</Label>
            <input type="hidden" name="contract_id" value={selectedId ?? ''} />
            <Input
                id="contract_search"
                value={query}
                onChange={(e) => change(e.target.value)}
                onFocus={() => results.length > 0 && setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                placeholder="Buscar por RUT o nombre..."
                autoComplete="off"
            />
            {open && results.length > 0 && (
                <ul className="absolute top-full z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover shadow-md">
                    {results.map((result) => (
                        <li key={result.id}>
                            <button
                                type="button"
                                className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                                onClick={() => select(result)}
                            >
                                {result.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {selectedId === null && query !== '' && (
                <p className="text-xs text-muted-foreground">Sin contrato seleccionado: el registro quedará sin vincular.</p>
            )}
            <InputError message={error} />
        </div>
    );
}
