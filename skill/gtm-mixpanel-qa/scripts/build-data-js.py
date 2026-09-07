#!/usr/bin/env python3
"""Rebuild tracker/data.js from data/*.json so the standalone tracker shows the latest results.
Usage: python3 build-data-js.py data tracker/data.js"""
import json, os, sys
src, out = sys.argv[1], sys.argv[2]
seed = {c: json.load(open(os.path.join(src, c + '.json'))) for c in ['events','cases','properties','results','runs','tasks','meta']}
open(out, 'w').write('window.__SEED=' + json.dumps(seed, ensure_ascii=False) + ';\n')
print({k: len(v) for k, v in seed.items()})
