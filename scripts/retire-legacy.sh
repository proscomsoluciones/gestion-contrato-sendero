#!/usr/bin/env bash
#
# Retira el back-office PHP legado (admin.php, login.php, conexion.php, gestion/)
# del document root, moviéndolo a un backup con timestamp fuera de htdocs.
# El sitio público (index.html, css/, js/, img/) NO se toca.
#
# Uso: bash scripts/retire-legacy.sh
# Pide confirmación explícita antes de mover nada. Nunca borra: solo mueve.

set -euo pipefail

SENDEROO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKUP_DIR="$(dirname "$SENDEROO_DIR")/senderoo-legacy-backup-$(date +%Y%m%d-%H%M%S)"
FILES_TO_RETIRE=(admin.php login.php conexion.php gestion)

echo "Directorio del sitio: $SENDEROO_DIR"
echo ""
echo "Esto va a MOVER (no borrar) del document root:"
for f in "${FILES_TO_RETIRE[@]}"; do
    echo "  - $f"
done
echo ""
echo "Destino del backup: $BACKUP_DIR"
echo "El sitio público (index.html, css/, js/, img/) no se toca."
echo ""
read -r -p "Escribí CONFIRMAR para continuar: " confirm

if [ "$confirm" != "CONFIRMAR" ]; then
    echo "Cancelado, no se movió nada."
    exit 1
fi

mkdir -p "$BACKUP_DIR"

for f in "${FILES_TO_RETIRE[@]}"; do
    if [ -e "$SENDEROO_DIR/$f" ]; then
        mv "$SENDEROO_DIR/$f" "$BACKUP_DIR/"
        echo "Movido: $f"
    else
        echo "Aviso: $f no existe en $SENDEROO_DIR, se omite"
    fi
done

echo ""
echo "Listo. Backup completo en: $BACKUP_DIR"
