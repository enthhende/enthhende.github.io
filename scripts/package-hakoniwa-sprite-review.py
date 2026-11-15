"""Package the transparent-sprite review tool as one offline HTML file."""
from pathlib import Path
import base64
import hashlib
import json

root = Path(__file__).resolve().parents[1]
review = root / 'games/hakoniwa/sprite-review'
catalog = json.loads((review / 'catalog.js').read_text().split(' = ', 1)[1].rstrip(';\n'))
assert len({r['id'] for r in catalog['entries']}) == len(catalog['entries'])
for entry in catalog['entries']:
    data = (review / entry['image']).read_bytes()
    assert hashlib.sha256(data).hexdigest() == entry['sha256'], entry['id']
    assert data[:8] == b'\x89PNG\r\n\x1a\n' and data[25] == 6, 'RGBA PNG required'
    entry['file'] = entry['image']
    entry['image'] = 'data:image/png;base64,' + base64.b64encode(data).decode()
html = (review / 'index.html').read_text()
html = html.replace('<link rel="stylesheet" href="review.css">', '<style>\n' + (review / 'review.css').read_text() + '\n</style>')
# Preserve defer ordering: execute the embedded catalog and UI after the body.
html = html.replace(' <script src="catalog.js" defer></script>', '').replace(' <script src="review.js" defer></script>', '')
js = 'window.SPRITE_CATALOG = ' + json.dumps(catalog, ensure_ascii=False) + ';\n' + (review / 'review.js').read_text()
html = html.replace('</body>', '<script>\n' + js.replace('</script', '<\\/script') + '\n</script>\n</body>')
dest = root / 'downloads/hakoniwa-sprite-review.html'
dest.write_text(html)
print(f'{dest} ({len(catalog["entries"])} sprites, {dest.stat().st_size:,} bytes; no external files needed)')
