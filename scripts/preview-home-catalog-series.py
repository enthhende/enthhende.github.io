"""Create a temporary, untracked series QA page using the real homepage assets."""
import json
from pathlib import Path
import re
import tempfile

ROOT = Path(__file__).resolve().parents[1]
out = Path(tempfile.mkdtemp(prefix='enthhende-series-preview-'))
for name in ('assets', 'games'):
    (out / name).symlink_to(ROOT / name, target_is_directory=True)
source = (ROOT / 'index.html').read_text()
(out / 'index.html').write_text(source)
html = source
definitions = {
    'preview-adventure': {'title': '검수용 모험 시리즈', 'aliases': ['모험모음', 'sample-adventure'], 'icon': '🎮'},
    'preview-moon': {'title': '검수용 달빛 시리즈', 'aliases': ['달빛모음'],
                     'image': 'games/moon/guide/assets/pixels/moon-logo.png'},
    'preview-empty': {'title': '검수용 빈 시리즈'},
    'preview-drafts': {'title': '검수용 준비 시리즈'}
}
html = re.sub(r'(<script type="application/json" id="catalogSeriesData">).*?(</script>)',
              lambda match: match[1] + json.dumps(definitions, ensure_ascii=False) + match[2], html, flags=re.S)
for game, group in [('chacha', 'preview-adventure'), ('homestar', 'preview-adventure'), ('moon', 'preview-moon')]:
    html = html.replace(f'id="game-{game}"', f'id="game-{game}" data-series="{group}"', 1)
draft = '''<article class="card gameCard" id="game-preview-draft" data-series="preview-drafts"
data-published="false" data-title="검수용 준비 작품" data-platforms="sfc"><h3>검수용 준비 작품</h3></article>'''
html = html.replace('      </div>\n      <div class="catalog-empty"', draft + '\n      </div>\n      <div class="catalog-empty"', 1)
(out / 'series-preview.html').write_text(html)
print(out)
