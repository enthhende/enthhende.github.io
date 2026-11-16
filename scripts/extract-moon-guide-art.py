"""Export only spoiler-safe logo and UI cutouts from read-only moon references."""
import csv
import hashlib
import json
from pathlib import Path
import sys

import UnityPy
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
STEAM = Path(sys.argv[1])
PS1 = Path(sys.argv[2])
OUT = ROOT / 'games/moon/guide/assets/pixels'
OUT.mkdir(parents=True, exist_ok=True)
proof = []

def save(name, image, reference, crop=None):
    if crop:
        assert 0 <= crop[0] < crop[2] <= image.width
        assert 0 <= crop[1] < crop[3] <= image.height
        image = image.crop(crop)
    assert image.getbbox()
    padded = Image.new('RGBA', (image.width + 6, image.height + 6))
    padded.paste(image, (3, 3))
    file = OUT / (name + '.png')
    padded.save(file, optimize=True)
    proof.append(dict(file='pixels/' + file.name, crop=crop, padding=3,
                      sha256=hashlib.sha256(file.read_bytes()).hexdigest(), **reference))

bundle = STEAM / 'StreamingAssets/data'
env = UnityPy.load(str(bundle))
bundle_sha = hashlib.sha256(bundle.read_bytes()).hexdigest()

def indexed(stem):
    key = 'assets/dataassetbundle/data/' + stem
    index = env.container[key + '_index.png'].read().image
    palette = env.container[key + '_clut.png'].read().image
    assert index.getextrema()[:3] == ((0, 0), (0, 0), (0, 0))
    colors = list(palette.get_flattened_data())
    image = Image.new('RGBA', index.size)
    image.putdata([(0, 0, 0, 0) if v == 0 else colors[v]
                   for v in index.getchannel('A').get_flattened_data()])
    return image, dict(project='MoonRemixRPGSteamKpatch', bundle='StreamingAssets/data',
                      bundleSha256=bundle_sha, indexAsset=key + '_index.png',
                      paletteAsset=key + '_clut.png', indexChannel='alpha', transparentIndex=0)

image, reference = indexed('real/title/moon')
save('moon-logo', image, reference)
image, reference = indexed('perma/dnpane00')
assert image.size == (42, 84)
save('night-ticket', image, reference, (0, 0, 42, 42))
save('day-ticket', image, reference, (0, 42, 42, 84))

catalog = PS1 / 'work/v1_0_ending_image_extraction_2026-08-06/global_fpl_overview'
renders = list(csv.DictReader((catalog / 'renders.tsv').open(), delimiter='\t'))
row = next(r for r in renders if int(r['descriptor_source']) == 0x11F61C
           and r['palette_bank'] == '0' and r['resource_index'] == '0')
atlas = PS1 / row['png']
assert hashlib.sha256(atlas.read_bytes()).hexdigest() == row['png_sha256']
image = Image.open(atlas).convert('RGBA')
reference = dict(project='MoonRemixRPGKpatch', source=row['png'], sourceSha256=row['png_sha256'],
                 descriptor='0x0011F61C', purpose='Original MD player interface, no scene or album artwork')
sprite = next(r for r in csv.DictReader((catalog / 'sprites.tsv').open(), delimiter='\t')
              if r['descriptor_source'] == '0x0011F61C' and r['sprite_index'] == '0')
u, v, w, h = (int(sprite[k]) for k in ['u', 'v', 'width', 'height'])
save('md-player', image, dict(reference, spriteRecord=sprite), (u, v, u + w, v + h))
# Isolated opaque components of the same stock UI sheet; rectangles include the entire hand.
save('pointer-hand', image, dict(reference, isolation='Complete alpha-connected hand component'), (92, 49, 126, 79))
save('play-button', image, dict(reference, isolation='Complete stock play-button component'), (96, 1, 127, 23))
(OUT.parent / 'art-provenance.json').write_text(json.dumps(dict(
    scope='Logo, calendar and music-player UI only. No event scenes, maps, endings or album covers.',
    assets=proof), ensure_ascii=False, indent=2) + '\n')
print(f'Exported {len(proof)} original logo/UI cutouts to {OUT}')
