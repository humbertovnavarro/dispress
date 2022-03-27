#!/bin/bash
./scripts/checksum.bash || exit 0
yarn stop $1
yarn start $1 || exit 1
