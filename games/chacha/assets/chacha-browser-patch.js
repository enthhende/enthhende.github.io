// SPDX-License-Identifier: MIT
// Standalone browser BPS application; no ROM data leaves the browser.
(function (root) {
  'use strict';
  function requireThat(ok, message) { if (!ok) throw new Error(message); }
  function crc32(bytes) {
    let crc = 0xffffffff;
    for (const byte of bytes) {
      crc ^= byte;
      for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }
  // Portable SHA-256 also works in offline browsers without Web Crypto.
  function sha256(bytes) {
    const constants = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const state = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    const padded = new Uint8Array(Math.ceil((bytes.length + 9) / 64) * 64);
    padded.set(bytes); padded[bytes.length] = 0x80;
    const view = new DataView(padded.buffer), bits = bytes.length * 8;
    view.setUint32(padded.length - 8, Math.floor(bits / 0x100000000));
    view.setUint32(padded.length - 4, bits >>> 0);
    const words = new Uint32Array(64), rotate = (x, n) => (x >>> n) | (x << (32 - n));
    for (let offset = 0; offset < padded.length; offset += 64) {
      for (let i = 0; i < 16; i++) words[i] = view.getUint32(offset + i * 4);
      for (let i = 16; i < 64; i++) {
        const x = words[i - 15], y = words[i - 2];
        words[i] = words[i - 16] + (rotate(x,7) ^ rotate(x,18) ^ (x >>> 3)) + words[i - 7] + (rotate(y,17) ^ rotate(y,19) ^ (y >>> 10));
      }
      let [a,b,c,d,e,f,g,h] = state;
      for (let i = 0; i < 64; i++) {
        const t1 = (h + (rotate(e,6) ^ rotate(e,11) ^ rotate(e,25)) + ((e & f) ^ (~e & g)) + constants[i] + words[i]) >>> 0;
        const t2 = ((rotate(a,2) ^ rotate(a,13) ^ rotate(a,22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
        h=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
      }
      [a,b,c,d,e,f,g,h].forEach((value, i) => { state[i] = (state[i] + value) >>> 0; });
    }
    return state.map(word => word.toString(16).padStart(8, '0')).join('');
  }
  function applyBps(source, patch, limit) {
    requireThat(patch.length >= 19 && String.fromCharCode(...patch.subarray(0,4)) === 'BPS1', '올바른 BPS 패치가 아닙니다.');
    const view = new DataView(patch.buffer, patch.byteOffset, patch.byteLength), end = patch.length - 12;
    requireThat(crc32(patch.subarray(0, patch.length - 4)) === view.getUint32(patch.length - 4, true), '패치 CRC32가 일치하지 않습니다.');
    requireThat(crc32(source) === view.getUint32(end, true), '원본 CRC32가 일치하지 않습니다.');
    let cursor = 4;
    function number() {
      let value = 0, shift = 1;
      for (let i = 0; i < 8; i++) {
        requireThat(cursor < end, 'BPS 숫자 데이터가 잘렸습니다.');
        const byte = patch[cursor++]; value += (byte & 127) * shift;
        requireThat(Number.isSafeInteger(value), 'BPS 숫자가 범위를 벗어났습니다.');
        if (byte & 128) return value;
        shift *= 128; value += shift;
      }
      throw new Error('BPS 숫자가 너무 깁니다.');
    }
    const sourceSize = number(), targetSize = number(), metadata = number();
    requireThat(sourceSize === source.length, '원본 크기가 일치하지 않습니다.');
    requireThat(targetSize > 0 && targetSize <= limit, '출력 크기가 허용 범위를 벗어났습니다.');
    requireThat(metadata <= end - cursor, 'BPS 메타데이터가 잘렸습니다.'); cursor += metadata;
    const output = new Uint8Array(targetSize);
    let position = 0, sourceRelative = 0, targetRelative = 0;
    while (position < targetSize) {
      const code = number(), action = code % 4, length = Math.floor(code / 4) + 1;
      requireThat(length <= targetSize - position, 'BPS 쓰기가 출력 범위를 벗어났습니다.');
      if (action === 0) {
        requireThat(position + length <= source.length, 'BPS 원본 읽기가 범위를 벗어났습니다.');
        output.set(source.subarray(position, position + length), position); position += length;
      } else if (action === 1) {
        requireThat(length <= end - cursor, 'BPS 삽입 데이터가 잘렸습니다.');
        output.set(patch.subarray(cursor, cursor + length), position); cursor += length; position += length;
      } else {
        const encoded = number(), delta = Math.floor(encoded / 2) * (encoded % 2 ? -1 : 1);
        if (action === 2) {
          sourceRelative += delta;
          requireThat(sourceRelative >= 0 && sourceRelative + length <= source.length, 'BPS 원본 복사가 범위를 벗어났습니다.');
          output.set(source.subarray(sourceRelative, sourceRelative + length), position); sourceRelative += length; position += length;
        } else {
          targetRelative += delta;
          requireThat(targetRelative >= 0 && targetRelative < position, 'BPS 출력 복사가 미생성 데이터를 참조합니다.');
          for (let i = 0; i < length; i++) output[position++] = output[targetRelative++];
        }
      }
    }
    requireThat(cursor === end, 'BPS 동작 뒤에 불필요한 데이터가 있습니다.');
    requireThat(crc32(output) === view.getUint32(end + 4, true), '완성 ROM의 CRC32가 일치하지 않습니다.');
    return output;
  }
  function applyVerified(source, patch, manifest) {
    requireThat(source.length === manifest.source.size, '원본 크기가 다릅니다. 헤더 없는 일본판(1,572,864바이트)을 선택해 주세요.');
    requireThat(sha256(source) === manifest.source.sha256, '지원하는 일본판 원본과 다릅니다. 이미 패치한 ROM이나 다른 리비전은 사용할 수 없습니다.');
    requireThat(patch.length === manifest.patch.size && sha256(patch) === manifest.patch.sha256, '패치 데이터가 손상되었습니다. 공식 배포본을 다시 받아 주세요.');
    const output = applyBps(source, patch, manifest.target.size);
    requireThat(output.length === manifest.target.size && sha256(output) === manifest.target.sha256, '완성 ROM 검사가 실패했습니다. 파일을 저장하지 않았습니다.');
    return output;
  }
  const api = {crc32, sha256, applyBps, applyVerified};
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  root.ChachaPatch = api;
  const config = JSON.parse(document.getElementById('patch-data').textContent);
  const input = document.getElementById('rom'), apply = document.getElementById('apply');
  const status = document.getElementById('status'), download = document.getElementById('download');
  const zone = document.getElementById('dropzone'), selected = document.getElementById('selected');
  let file = null, outputUrl = null, busy = false;
  function clearDownload() {
    download.hidden = true; download.removeAttribute('href');
    if (outputUrl) URL.revokeObjectURL(outputUrl); outputUrl = null;
  }
  function choose(candidate) {
    if (busy) return;
    clearDownload(); file = candidate || null;
    selected.textContent = file ? file.name : '선택한 파일 없음';
    status.textContent = file ? '원본을 선택했습니다. 한글 ROM 만들기를 눌러 주세요.' : '헤더 없는 일본판 원본 ROM을 선택해 주세요.';
    apply.disabled = !file;
  }
  input.addEventListener('change', () => choose(input.files[0]));
  zone.addEventListener('dragover', event => { event.preventDefault(); });
  zone.addEventListener('drop', event => { event.preventDefault(); choose(event.dataTransfer.files[0]); });
  window.addEventListener('dragover', event => event.preventDefault());
  window.addEventListener('drop', event => event.preventDefault());
  apply.addEventListener('click', async () => {
    if (!file || busy) return;
    const current = file; busy = true; apply.disabled = true; input.disabled = true; clearDownload();
    status.textContent = '원본과 패치를 확인하고 있습니다…';
    try {
      requireThat(current.size === config.manifest.source.size, '원본 크기가 다릅니다. 헤더 없는 일본판(1,572,864바이트)을 선택해 주세요.');
      const source = new Uint8Array(await current.arrayBuffer());
      const patch = Uint8Array.from(atob(config.bps), char => char.charCodeAt(0));
      const output = applyVerified(source, patch, config.manifest);
      outputUrl = URL.createObjectURL(new Blob([output], {type: 'application/octet-stream'}));
      download.href = outputUrl; download.hidden = false;
      status.textContent = '완료! 한글 ROM 저장 버튼을 눌러 내려받은 뒤 에뮬레이터에서 열어 주세요.';
    } catch (error) { status.textContent = error.message; }
    finally { busy = false; apply.disabled = !file; input.disabled = false; }
  });
})(typeof globalThis !== 'undefined' ? globalThis : window);
