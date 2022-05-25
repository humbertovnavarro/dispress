#!/bin/bash
yarn tsc
mkdir staging
rm userdata.db
yarn prisma generate
rm -rf ./userdata.db
yarn prisma db push
yarn nexe dist/main.js -o staging/windows-x64/main.exe --build
cp ./userdata.db staging/windows-x64/userdata.db
mkdir -p staging/windows-x64/node_modules
cp -r ./node_modules staging/windows-x64