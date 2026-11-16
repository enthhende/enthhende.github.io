"""Extract complete, spoiler-safe native sprites. Source projects stay read-only.

Usage: python -B scripts/extract-moon-native-art.py PS1_PROJECT DLLMOON_BINARY
Requires Pillow and the source project's existing BPE decoder. No game files ship.
"""
from functools import lru_cache
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import sys

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PS1 = Path(sys.argv[1])
DLL = Path(sys.argv[2])
sys.path.insert(0, str(PS1 / 'tools'))
from extract_moon_fpl_graphics import decode_bpe_block, decode_bpe_stream, psx_bgr555

OUT = ROOT / 'games/moon/guide/assets/pixels'
OUT.mkdir(parents=True, exist_ok=True)
proof = []
data = DLL.read_bytes()
dat = (PS1 / 'work/extracted_iso/MOON.DAT').read_bytes()
assert hashlib.sha256(dat).hexdigest() == '140d5f4eee505116b2c72212cd40d66069054037d89eb74d94af31382d5b57b3'

# Resolve addresses through the arm64 slice's segment table, never fixed offsets.
assert data[:4] == b'\xca\xfe\xba\xbe'
base = None
for i in range(struct.unpack_from('>I', data, 4)[0]):
    cpu, sub, off, size, align = struct.unpack_from('>5I', data, 8 + i * 20)
    if cpu == 0x100000C:
        base = off
assert base is not None
assert struct.unpack_from('<I', data, base)[0] == 0xFEEDFACF
segments = []
cursor = base + 32
for _ in range(struct.unpack_from('<I', data, base + 16)[0]):
    cmd, size = struct.unpack_from('<II', data, cursor)
    if cmd == 0x19:
        name, va, vsize, fileoff, filesize = struct.unpack_from('<16s4Q', data, cursor + 8)
        segments.append((va, base + fileoff, filesize))
    cursor += size

symbols = {}
for line in subprocess.check_output(['nm', '-arch', 'arm64', '-g', str(DLL)], text=True).splitlines():
    fields = line.split()
    if len(fields) == 3 and fields[1] in ('D', 'S'):
        symbols[fields[2]] = int(fields[0], 16)

def offset(address):
    for va, off, size in segments:
        if va <= address < va + size:
            return off + address - va
    raise ValueError(f'Unmapped address {address:x}')

def save(name, image, **reference):
    assert image.getbbox()
    file = OUT / (name + '.png')
    image.save(file, optimize=True)
    proof.append(dict(file='pixels/' + file.name, size=list(image.size),
                      sha256=hashlib.sha256(file.read_bytes()).hexdigest(), **reference))

def compose(parts):
    x0 = min(x for x, y, tile in parts)
    y0 = min(y for x, y, tile in parts)
    x1 = max(x + tile.width for x, y, tile in parts)
    y1 = max(y + tile.height for x, y, tile in parts)
    assert 0 < x1 - x0 < 200 and 0 < y1 - y0 < 200
    image = Image.new('RGBA', (x1 - x0 + 8, y1 - y0 + 8))
    for x, y, tile in parts:
        image.alpha_composite(tile, (x - x0 + 4, y - y0 + 4))
    return image

def part(data_source, address, pages):
    x, y, meta, dimensions = struct.unpack_from('<hhII', data_source, address)
    page = meta & 65535
    u, v = meta >> 16 & 255, meta >> 24
    w, h = dimensions & 255, dimensions >> 8 & 255
    assert dimensions >> 16 == 0, 'Selected frames must not use unresolved transform flags'
    assert page < len(pages) and w and h and u + w <= 128 and v + h <= 128
    return x, y, pages[page].crop((u, v, u + w, v + h))

@lru_cache(None)
def steam_page(address, palette):
    cursor = offset(address)
    decoded = bytearray()
    while len(decoded) < 16384:
        block, record = decode_bpe_block(data, cursor, len(data))
        decoded.extend(block)
        cursor = record.input_end
    assert len(decoded) == 16384
    colors = [psx_bgr555(v) for v in struct.unpack_from('<256H', data, offset(palette))]
    image = Image.new('RGBA', (128, 128))
    image.putdata([colors[value] for value in decoded])
    return image

def steam_frame(name, symbol, frame):
    kind, pa, pb, counts, pc, pd = struct.unpack_from('<I4xQQI4xQQ', data, offset(symbols[symbol]))
    n = kind & 255
    assert frame < counts & 65535 and pb - pa == n * 8
    pointers = struct.unpack_from('<' + 'Q' * (n + 1), data, offset(pa))
    count, pointer = struct.unpack_from('<I4xQ', data, offset(pc) + frame * 16)
    assert 0 < count < 40
    pages = [steam_page(p, pointers[-1]) for p in pointers[:-1]]
    image = compose([part(data, offset(pointer) + i * 12, pages) for i in range(count)])
    save(name, image, source='dllmoon/arm64', symbol=symbol, frame=frame, partCount=count)

def ps1_frame(name, descriptor, frame):
    kind, pa, pb, counts, pc, pd = struct.unpack_from('<6I', dat, descriptor)
    delta = (descriptor + 24 - pa) & 0xFFFFFFFF
    n = kind & 255
    assert frame < counts & 65535
    pointers = [(p + delta) & 0xFFFFFFFF for p in struct.unpack_from('<' + 'I' * (n + 1), dat, descriptor + 24)]
    colors = [psx_bgr555(v) for v in struct.unpack_from('<256H', dat, pointers[-1])]
    pages = []
    for a, b in zip(pointers, pointers[1:]):
        decoded, _, _ = decode_bpe_stream(dat, a, b)
        assert len(decoded) == 16384
        image = Image.new('RGBA', (128, 128))
        image.putdata([colors[value] for value in decoded])
        pages.append(image)
    count, pointer = struct.unpack_from('<II', dat, ((pc + delta) & 0xFFFFFFFF) + frame * 8)
    pointer = (pointer + delta) & 0xFFFFFFFF
    image = compose([part(dat, pointer + i * 12, pages) for i in range(count)])
    save(name, image, source='MOON.DAT', descriptor=f'0x{descriptor:08X}', frame=frame, partCount=count)

ps1_frame('boy-sitting', 0x00828110, 0)
ps1_frame('boy-looking', 0x00828110, 4)
ps1_frame('love-heart', 0x0041F37C, 0)
steam_frame('yoshida', '_yosida', 0)
steam_frame('yoshida-walking', '_yosida', 18)
steam_frame('grandma', '_gmam', 8)
steam_frame('baker', '_bake', 8)
for name, frame in zip(('sun', 'crescent', 'bonfire', 'tear', 'leaf', 'neka', 'echo'), range(56, 63)):
    steam_frame('day-' + name, '_clock_perma', frame)

# Item consumer _load_item_image uploads a 64-byte palette, then expands
# source+0x40 into 0x400 indices (32 x 32), matching these original symbols.
for name, symbol in [('bread', '_i_pan'), ('cookies', '_i_coki'), ('animal-book', '_i_zuka')]:
    address = symbols[symbol]
    limit = offset(min(p for p in symbols.values() if p > address))
    start = offset(address)
    colors = [psx_bgr555(v) for v in struct.unpack_from('<32H', data, start)]
    decoded, _, _ = decode_bpe_stream(data, start + 64, limit)
    assert len(decoded) == 1024 and max(decoded) < 32
    image = Image.new('RGBA', (40, 40))
    tile = Image.new('RGBA', (32, 32))
    tile.putdata([colors[value] for value in decoded])
    image.alpha_composite(tile, (4, 4))
    save(name, image, source='dllmoon/arm64', symbol=symbol, nativeSize=[32, 32], padding=4)

(OUT.parent / 'native-art-provenance.json').write_text(json.dumps(dict(
    scope='Complete boy/NPC sprites, everyday food/book, love heart and seven calendar UI symbols. No event scenes.',
    sources={'MOON.DAT': hashlib.sha256(dat).hexdigest(), 'dllmoon': hashlib.sha256(data).hexdigest()},
    assets=proof), ensure_ascii=False, indent=2) + '\n')
print(f'Extracted {len(proof)} complete native sprites')
