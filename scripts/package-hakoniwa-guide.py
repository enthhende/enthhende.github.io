"""Build a self-contained offline ZIP, including local artwork and guide scripts."""
from pathlib import Path
import re
import zipfile

root = Path(__file__).resolve().parents[1]
guide = root / 'games/hakoniwa/guide'
dest = root / 'downloads/hakoniwa-guide-offline-v0.19.0.zip'
html = (guide / 'index.html').read_text()
# The offline copy links back to the website for home/patch pages.
html = re.sub(r'<a\b[^>]*href="[^"]*downloads/hakoniwa-guide-offline-[^"]*"[^>]*>.*?</a>', '', html)
html = html.replace('href="../../../index.html"', 'href="https://enthhende.github.io/"')
html = html.replace('href="../index.html"', 'href="https://enthhende.github.io/games/hakoniwa/"')
html = html.replace('href="../../../"', 'href="https://enthhende.github.io/"')
html = html.replace('href="../"', 'href="https://enthhende.github.io/games/hakoniwa/"')
with zipfile.ZipFile(dest, 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('index.html', html)
    for name in ['game-reference.js', 'guide-knowledge.js', 'guide-graphics.js', 'sprite-map.js', 'guide-enhancements.js', 'guide-layout.js', 'guide-enhancements.css']:
        archive.write(guide / name, name)
    for file in sorted((guide / 'assets').rglob('*')):
        if file.is_file():
            archive.write(file, str(file.relative_to(guide)))
    archive.writestr('README.txt', '모형정원 양마을 한국어 공략 v0.19.0\n\nZIP 전체를 압축 해제한 뒤 index.html을 브라우저에서 여세요.\nassets 폴더와 JS/CSS 파일을 함께 두어야 합니다. 인터넷 없이 DB 검색·교환 검색·이벤트·주민 안내를 이용할 수 있습니다.\n웹 참고자료 링크를 여는 경우에는 인터넷이 필요합니다.\n\n한글화된 Nintendo Switch판 기준의 공략입니다. PSP판 공략 정보는 따로 표시했습니다.\n게임 삽화와 로고의 권리는 원권리자에게 있습니다.\n')
with zipfile.ZipFile(dest) as archive:
    assert archive.testzip() is None
print(dest)
