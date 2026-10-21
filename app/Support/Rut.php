<?php

namespace App\Support;

class Rut
{
    /**
     * Normaliza un RUT chileno para comparación: sin puntos ni guion, mayúsculas.
     * "15.950.059-4" y "159500594" normalizan al mismo valor.
     */
    public static function normalize(mixed $value): string
    {
        $value = strtoupper(trim((string) $value));

        return str_replace(['.', '-', ' '], '', $value);
    }
}
