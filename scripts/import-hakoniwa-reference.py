"""Import approved Korean names and diary descriptions without retranslating them.

Usage: python3 scripts/import-hakoniwa-reference.py /path/to/010059C017346000
Only this site's guide is written; the translation project is read-only.
"""
import csv
import hashlib
import json
import re
import struct
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1])
manifest = source / '30_translation/text/translation_manifest.tsv'
wit_file = source / '10_extract/romfs_v1_3/Data/StreamingAssets/DAT/_Export/rule/SPC_SETUP/WIT_DATA.DAT'
records = {r['id']: r for r in csv.DictReader(manifest.open(), delimiter='\t')}
blob = wit_file.read_bytes()
count = struct.unpack_from('<I', blob)[0]
references = []
for offset in struct.unpack_from('<' + 'I' * count, blob, 4):
    _, length = struct.unpack_from('<HH', blob, offset)
    for i in range(length):
        row = struct.unpack_from('<10H', blob, offset + 4 + i * 20)
        name = records.get(f'TXT_WITNAME:{row[2]:04d}')
        text = records.get(f'TXT_WITNAME:{row[0]:04d}')
        if name and text:
            references.append(dict(name=name['target_ko'], nameJa=name['ja'], text=text['target_ko'], key=text['id']))

page = root / 'games/hakoniwa/guide/index.html'
html = page.read_text()
match = re.search(r'(<script type="application/json" id="dbData">)(.*?)(</script>)', html, re.S)
db = json.loads(match[2])
for item in db:
    if item['id'].startswith('item-'):
        record = records[f"TXT_ITNAME:{item['id'][5:]}"]
        item['nameKo'] = record['target_ko']
        item['nameJa'] = record['ja']
        item['nameSource'] = record['id']
    item['gameText'] = [dict(key=r['key'], text=r['text']) for r in references if r['nameJa'] == item['nameJa']]
html = html[:match.start(2)] + json.dumps(db, ensure_ascii=False) + html[match.end(2):]
page.write_text(html)

payload = dict(
    manifestSha256=hashlib.sha256(manifest.read_bytes()).hexdigest(),
    mappingSha256=hashlib.sha256(blob).hexdigest(),
    reference=references,
    itemNames={k: r['target_ko'] for k, r in records.items() if k.startswith('TXT_ITNAME:')},
    hints={k: r['target_ko'] for k, r in records.items() if k.startswith('TXT_ITBRAM:')},
    events={k: r['target_ko'] for k, r in records.items() if k in {
        'TXT_EVENT:0238', 'TXT_EVENT:0239', 'TXT_EVENT:0240', 'TXT_EVENT:0241',
        'TXT_EVENT:0242', 'TXT_EVENT:0243', 'TXT_EVENT:0244', 'TXT_EVENT:0245',
        'TXT_EVENT:0247', 'TXT_EVENT:0207', 'save_ctxt:0011'}},
)
dest = root / 'games/hakoniwa/guide/game-reference.js'
dest.write_text('// Imported Korean translation; do not retranslate game terms.\nwindow.HAKO_REFERENCE = ' + json.dumps(payload, ensure_ascii=False, indent=2) + ';\n')
print(f'Imported {len(db)} DB entries and {len(references)} diary descriptions; {manifest.name} SHA256 {payload["manifestSha256"]}')
