#!/bin/bash
FILE="/tmp/dispress_checksum.txt"
CHECKSUM=$(tar c ./dist | md5sum)
if test -f "$FILE"; then
    CHECKSUM_OLD=$(cat "$FILE")
else
    echo "$CHECKSUM" > "$FILE"
    exit 0
fi

if [ "$CHECKSUM" = "$CHECKSUM_OLD" ]; then
    exit 1
fi

echo "$CHECKSUM" > "$FILE"
