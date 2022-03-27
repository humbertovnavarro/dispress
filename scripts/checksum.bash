#!/bin/bash
FILE="./checksum.txt"
if test -f "$FILE"; then
    echo "$FILE exists."
    oldsum=$(cat $FILE)
fi
newsum=$(ls -alR --full-time ./dist | sha1sum)
if [ "$oldsum" != "$newsum" ]; then
    echo $newsum > ./sha1sum.txt
    exit 1
fi
echo $newsum > ./sha1sum.txt
exit 0
