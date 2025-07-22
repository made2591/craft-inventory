#!/bin/bash

# Script per aggiornare la formattazione in tutti i componenti Vue
# Questo script cerca e sostituisce i pattern comuni di formattazione

echo "Aggiornamento formattazione nei componenti Vue..."

# Directory dei componenti
VIEWS_DIR="frontend/src/views"
COMPONENTS_DIR="frontend/src/components"

# Funzione per aggiornare i file
update_file() {
    local file="$1"
    echo "Aggiornando: $file"
    
    # Sostituisce € {{ formatCost(...) }} con {{ $formatCost(...) }}
    sed -i.bak 's/€ {{ formatCost(\([^}]*\)) }}/{{ $formatCost(\1) }}/g' "$file"
    
    # Sostituisce {{ formatCost(...) }} con {{ $formatCost(...) }} (se non preceduto da €)
    sed -i.bak 's/\(\W\){{ formatCost(\([^}]*\)) }}/\1{{ $formatCost(\2) }}/g' "$file"
    
    # Rimuove i file di backup
    rm -f "$file.bak"
}

# Trova tutti i file .vue e aggiornali
find "$VIEWS_DIR" -name "*.vue" -type f | while read -r file; do
    if grep -q "formatCost\|€ {{" "$file"; then
        update_file "$file"
    fi
done

find "$COMPONENTS_DIR" -name "*.vue" -type f | while read -r file; do
    if grep -q "formatCost\|€ {{" "$file"; then
        update_file "$file"
    fi
done

echo "Aggiornamento completato!"
echo ""
echo "Ricorda di:"
echo "1. Rimuovere le funzioni formatCost locali dai componenti"
echo "2. Testare che tutto funzioni correttamente"
echo "3. Aggiornare i componenti per usare \$formatQuantity per le quantità"
