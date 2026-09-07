#!/usr/bin/env python3
"""Turn data/*.json into write_db batch files for seeding a freshly published copy of the tracker.
Each batch has at most 50 documents and stays under the 1 MB request limit.
Usage: python3 make-seed-batches.py ../../data ./seed-batches
Then, in Claude Code, call the Artifact tool with action=write_db, db_op=batch and the `writes` list from each batch file."""
import json, os, sys
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
docs_dir = os.path.join(out, 'docs'); os.makedirs(docs_dir, exist_ok=True)
batches, cur, size = [], [], 0
for col in ['runs', 'events', 'properties', 'cases', 'tasks', 'meta', 'results']:
    data = json.load(open(os.path.join(src, col + '.json')))
    for doc_id, d in data.items():
        fp = os.path.abspath(os.path.join(docs_dir, f'{col}__{doc_id}.json'))
        json.dump(d, open(fp, 'w'), ensure_ascii=False)
        sz = os.path.getsize(fp)
        if len(cur) >= 50 or size + sz > 800_000:
            batches.append(cur); cur, size = [], 0
        cur.append({'op': 'set', 'collection': col, 'doc_id': doc_id, 'file_path': fp}); size += sz
if cur: batches.append(cur)
for i, b in enumerate(batches):
    json.dump(b, open(os.path.join(out, f'batch-{i:02d}.json'), 'w'), indent=1)
print(f'{len(batches)} batches written to {out}')
