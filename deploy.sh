#!/usr/bin/env bash

set -ex
git pull
cd prisma
prisma deploy --env-file ../.env
cd ..
pm2 restart API
