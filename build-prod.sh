#!/bin/bash

rm -R $(dirname $0)/dist
npm ci --include=dev
npm run nx -- build api --prod
npm run nx -- build client --prod
