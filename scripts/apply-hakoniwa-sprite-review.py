"""Apply human labels first, then exact native candidate links, without renaming DB items."""
import hashlib
import json
from pathlib import Path
import re
import shutil
import sys
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]
GUIDE = ROOT / 'games/hakoniwa/guide'
REVIEW = ROOT / 'games/hakoniwa/sprite-review'
SAVED = ROOT / 'scripts/data/hakoniwa-sprite-review.json'
source = Path(sys.argv[1]) if len(sys.argv) > 1 else SAVED
human = json.loads(source.read_text())
catalog = json.loads((REVIEW / 'catalog.js').read_text().split(' = ', 1)[1].rstrip(';\n'))
assert human['format'] == 'hakoniwa-sprite-review' and human['version'] == 1
assert human['catalogId'] == catalog['catalogId'], 'Review catalog changed; reconcile before applying'
entries = {e['id']: e for e in catalog['entries']}
annotations = {}
for row in human['entries']:
    assert row['id'] in entries and row['sha256'] == entries[row['id']]['sha256']
    assert row['status'] in {'pending', 'named', 'unsure', 'skip'}
    assert row['id'] not in annotations
    if row['status'] == 'named':
        assert row['name'].strip()
    annotations[row['id']] = row
db = json.loads(re.search(r'id="dbData">(.*?)</script>', (GUIDE / 'index.html').read_text(), re.S)[1])
names = {r['id']: r['nameKo'] for r in db}
sprite_path = GUIDE / 'sprite-map.js'
sprites = json.loads(sprite_path.read_text().split(' = ', 1)[1].rstrip(';\n'))
manifest_path = GUIDE / 'assets/provenance.json'
manifest = json.loads(manifest_path.read_text())
assets = [r for r in manifest['assets'] if not r.get('reviewId')]
old_proofs = {Path(r['file']).stem: r for r in manifest['assets'] if r.get('outputSha256')}
by_hash = {r['outputSha256']: Path(r['file']).stem for r in reversed(assets) if r.get('outputSha256')}
review_proofs = json.loads((REVIEW / 'asset-proof.json').read_text())['assets']
proof_by_hash = {r['outputSha256']: r for r in review_proofs}
for e in entries.values():
    raw = (REVIEW / e['image']).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == e['sha256'], e['id']
    assert e['sha256'] in proof_by_hash
    for c in e['candidates']:
        assert names[c['itemId']] == c['name'], 'Canonical Korean name mismatch'

standing = {'item-0015':35, 'item-0022':45, 'item-0028':55, 'item-0047':85,
            'item-0053':95, 'item-0063':115, 'item-0095':185, 'item-0100':195,
            'item-0104':205, 'item-0109':215}
grasses = {'item-0001','item-0002','item-0003','item-0004','item-0006'}
trees = {'item-0083','item-0084','item-0085','item-0087','item-0088','item-0089'}

def visual_state(item_id, candidates, annotation):
    note = annotation.get('note', '')
    if re.search(r'수확\s*전', note): return 'standing', '수확 전'
    if re.search(r'수확\s*후', note): return 'harvested', '수확 후'
    if item_id in standing:
        before = any(c['nativeId'] == standing[item_id] for c in candidates)
        return ('standing', '수확 전') if before else ('harvested', '수확 후')
    if item_id in grasses:
        return 'season', '도토리 달' if candidates[0]['state'] == 1 else '민들레 달 · 포도 달'
    if item_id in trees:
        return 'season', {0:'기본 모습',1:'민들레 달 · 포도 달',2:'도토리 달',3:'풀없는 달'}[candidates[0]['state']]
    if item_id == 'item-0529' and annotation.get('name'):
        return '', annotation['name'].strip()
    return '', ''

bindings = defaultdict(list)
for e in entries.values():
    annotation = annotations.get(e['id'], {})
    if annotation.get('status') in {'skip','unsure'}:
        continue
    sha = e['sha256']
    if sha not in by_hash:
        slug = e['id']
        shutil.copyfile(REVIEW / e['image'], GUIDE / 'assets/pixels' / (slug + '.png'))
        assets.append(dict(proof_by_hash[sha], file='pixels/' + slug + '.png', reviewId=e['id']))
        by_hash[sha] = slug
    by_item = defaultdict(list)
    for candidate in e['candidates']:
        by_item[candidate['itemId']].append(candidate)
    for item_id, candidates in by_item.items():
        kind, caption = visual_state(item_id, candidates, annotation)
        bindings[item_id].append(dict(sprite=by_hash[sha], kind=kind, caption=caption,
            reviewId=e['id'], sha256=sha, humanReviewed=annotation.get('status') == 'named',
            candidates=candidates))

old_map = sprites['items']
new_map = {}
variants = {}
for item_id, rows in bindings.items():
    rows.sort(key=lambda r:(0 if r['kind']=='standing' else 1,
                          0 if r['caption']=='민들레 달 · 포도 달' else 1,
                          min((c['nativeId'],c['state']) for c in r['candidates'])))
    old = old_map.get(item_id)
    old_sha = old_proofs.get(old, {}).get('outputSha256')
    new_map[item_id] = old if any(r['sha256'] == old_sha for r in rows) else rows[0]['sprite']
    if len(rows)>1 or rows[0]['caption']:
        variants[item_id] = [{k:r[k] for k in ['sprite','kind','caption']} for r in rows]
sprites['items'] = new_map
sprites['variants'] = variants
# Explicit representatives for overview tables, never used as item-card fallbacks.
overview = {'닭':'수탉','오리':'수오리','거위':'수거위','돼지':'암퇘지',
            '염소':'수염소','페럿':'수컷 페럿','당나귀':'수컷 당나귀',
            '라쿤':'수컷 라쿤','삵':'수컷 삵','소':'암소',
            '앙고라토끼':'수컷 앙고라토끼','흰뺨검둥오리':'수컷 흰뺨검둥오리'}
by_name = {name:item_id for item_id,name in names.items()}
for family, name in overview.items():
    sprites['families'][family] = new_map[by_name[name]]
manifest['assets'] = assets
manifest['itemSpriteBindings'] = dict(bindings)
manifest['omittedItemSprites'] = {r['id']:'No resolved native frame' for r in db if r['id'] not in new_map}
manifest['spriteReview'] = dict(catalogId=catalog['catalogId'], humanCount=len(annotations),
    sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(), mappedItemCount=len(new_map))
if source.resolve() != SAVED.resolve():
    SAVED.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, SAVED)
sprite_path.write_text('// Exact native item links with approved review labels. No family fallback.\nwindow.HAKO_SPRITES = '+json.dumps(sprites,ensure_ascii=False,indent=2)+';\n')
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(f'Applied {len(annotations)} human reviews and native candidates: {len(new_map)} item IDs, {sum(len(v)>1 for v in bindings.values())} variant galleries. Canonical names unchanged.')
