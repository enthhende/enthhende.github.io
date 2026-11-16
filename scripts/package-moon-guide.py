"""Bundle the unchanged moon walkthrough with its local decorative artwork."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
guide = root / 'games/moon/guide'
prefix = 'moon-guide-v1.1.16/'
html = (guide / 'index.html').read_text()
html = html.replace('../../../assets/', 'assets/')
html = html.replace('href="../../../"', 'href="https://enthhende.github.io/"')
html = html.replace('href="../"', 'href="https://enthhende.github.io/games/moon/"')
html = html.replace('href="../patch/"', 'href="https://enthhende.github.io/games/moon/patch/"')
html = html.replace('href="../guide/"', 'href="index.html"')
html = html.replace('href="../report/"', 'href="https://enthhende.github.io/games/moon/report/"')
html = html.replace('href="../../../downloads/', 'href="https://enthhende.github.io/downloads/')
dest = root / 'downloads/moon-guide-offline-v1.1.16.zip'
with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED) as z:
    z.writestr(prefix + 'index.html', html)
    z.write(root / 'assets/css/guide.css', prefix + 'assets/css/guide.css')
    z.write(root / 'assets/css/game-shell.css', prefix + 'assets/css/game-shell.css')
    z.write(root / 'assets/js/moon-guide.js', prefix + 'assets/js/moon-guide.js')
    z.write(guide / 'moon-style.css', prefix + 'moon-style.css')
    z.write(guide / 'moon-art.js', prefix + 'moon-art.js')
    for file in sorted((guide / 'assets/pixels').glob('*.png')):
        z.write(file, prefix + 'assets/pixels/' + file.name)
    z.writestr(prefix + 'README.txt', 'moon 한국어 공략\n\nZIP 전체를 압축 해제한 뒤 index.html을 브라우저에서 여세요.\n입력한 진행도는 해당 브라우저에 저장됩니다. 상단 백업 기능으로 옮길 수 있습니다.\n공략과 도트 이미지는 오프라인으로 표시되며, 홈·패치·참고 링크는 인터넷이 필요합니다.\n')
with zipfile.ZipFile(dest) as z:
    assert z.testzip() is None
    assert z.read(prefix + 'assets/js/moon-guide.js') == (root / 'assets/js/moon-guide.js').read_bytes()
print(f'{dest}: {dest.stat().st_size:,} bytes')
