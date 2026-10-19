/* Homestar browser patch engine. RFC 3284 default table + xdelta3 Adler32.
 * No network or DOM dependencies. Unsupported encodings fail closed.
 */
(function (root) {
  'use strict';
  const fail = message => { throw new Error(message); };
  const check = (condition, message) => { if (!condition) fail(message); };
  const K = new Uint32Array([
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ]);
  const rr = (x,n) => (x >>> n) | (x << (32-n));
  class SHA256 {
    constructor() {
      this.h = new Uint32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
      this.tail = new Uint8Array(64); this.used = 0; this.length = 0; this.w = new Uint32Array(64);
    }
    block(b, p) {
      const w=this.w, h=this.h;
      for(let i=0;i<16;i++,p+=4) w[i]=(b[p]<<24)|(b[p+1]<<16)|(b[p+2]<<8)|b[p+3];
      for(let i=16;i<64;i++) {
        const x=w[i-15],y=w[i-2];
        w[i]=w[i-16]+(rr(x,7)^rr(x,18)^(x>>>3))+w[i-7]+(rr(y,17)^rr(y,19)^(y>>>10));
      }
      let a=h[0],b0=h[1],c=h[2],d=h[3],e=h[4],f=h[5],g=h[6],h0=h[7];
      for(let i=0;i<64;i++) {
        const t1=(h0+(rr(e,6)^rr(e,11)^rr(e,25))+((e&f)^(~e&g))+K[i]+w[i])|0;
        const t2=((rr(a,2)^rr(a,13)^rr(a,22))+((a&b0)^(a&c)^(b0&c)))|0;
        h0=g;g=f;f=e;e=(d+t1)|0;d=c;c=b0;b0=a;a=(t1+t2)|0;
      }
      h[0]+=a;h[1]+=b0;h[2]+=c;h[3]+=d;h[4]+=e;h[5]+=f;h[6]+=g;h[7]+=h0;
    }
    update(b) {
      check(!this.done,'SHA256 already finalized'); this.length+=b.length;
      let p=0;
      if(this.used) {
        const n=Math.min(64-this.used,b.length); this.tail.set(b.subarray(0,n),this.used); this.used+=n;p=n;
        if(this.used===64) {this.block(this.tail,0);this.used=0;}
      }
      for(;p+64<=b.length;p+=64) this.block(b,p);
      if(p<b.length) {this.tail.set(b.subarray(p));this.used=b.length-p;}
      return this;
    }
    hex() {
      check(!this.done,'SHA256 already finalized');
      const n=this.used<56?64:128, b=new Uint8Array(n); b.set(this.tail.subarray(0,this.used));b[this.used]=128;
      const view=new DataView(b.buffer), bits=this.length*8;
      view.setUint32(n-8,Math.floor(bits/4294967296));view.setUint32(n-4,bits>>>0);
      for(let p=0;p<n;p+=64) this.block(b,p);this.done=true;
      return Array.from(this.h,x=>x.toString(16).padStart(8,'0')).join('');
    }
  }
  const aborted = signal => { if(signal?.aborted) throw new DOMException('취소했습니다.','AbortError'); };
  async function hashBlob(blob, {signal,onProgress=()=>{}}={}) {
    const hash=new SHA256(), chunk=8*1024*1024;
    for(let p=0;p<blob.size;p+=chunk) {
      aborted(signal);hash.update(new Uint8Array(await blob.slice(p,p+chunk).arrayBuffer()));
      onProgress(Math.min(p+chunk,blob.size),blob.size);
    }
    aborted(signal);return hash.hex();
  }
  class Reader {
    constructor(bytes,start=0,end=bytes.length) {this.b=bytes;this.p=start;this.end=end;}
    byte() {check(this.p<this.end,'잘린 패치 데이터');return this.b[this.p++];}
    integer() {
      let v=0;
      for(let i=0;i<8;i++) {
        const b=this.byte();v=v*128+(b&127);check(Number.isSafeInteger(v),'패치 정수 범위 초과');
        if(!(b&128)) return v;
      }
      fail('패치 정수 범위 초과');
    }
    section(n) {check(n<=this.end-this.p,'패치 구간 범위 초과');const r=new Reader(this.b,this.p,this.p+n);this.p+=n;return r;}
    complete() {check(this.p===this.end,'패치 구간에 남은 데이터');}
  }
  const table=[];
  table.push([[0,0,0]]); // RUN=0, ADD=1, COPY=2
  for(let n=0;n<=17;n++) table.push([[1,n,0]]);
  for(let mode=0;mode<9;mode++) for(const n of [0,...Array.from({length:15},(_,i)=>i+4)]) table.push([[2,n,mode]]);
  for(let mode=0;mode<6;mode++) for(let a=1;a<=4;a++) for(let c=4;c<=6;c++) table.push([[1,a,0],[2,c,mode]]);
  for(let mode=6;mode<9;mode++) for(let a=1;a<=4;a++) table.push([[1,a,0],[2,4,mode]]);
  for(let mode=0;mode<9;mode++) table.push([[2,4,mode],[1,1,0]]);
  function adler32(b) {
    let a=1,c=0;
    for(let p=0;p<b.length;) {const end=Math.min(p+5552,b.length);for(;p<end;p++){a+=b[p];c+=a;}a%=65521;c%=65521;}
    return ((c<<16)|a)>>>0;
  }
  // Deliberately bounded profile: default table, no secondary compressor/app header.
  async function decode(source, patch, outputSize, {signal,onProgress=()=>{}}={}) {
    check(Number.isSafeInteger(outputSize)&&outputSize>0&&outputSize<=2**31,'출력 크기 범위 초과');
    check(patch.length<=64*1024*1024,'패치 크기 범위 초과');
    const r=new Reader(patch), parts=[], hash=new SHA256(), maxWindow=16*1024*1024;
    for(const b of [0xd6,0xc3,0xc4,0,0]) check(r.byte()===b,'지원하지 않는 VCDIFF 헤더');
    let total=0,windows=0;
    while(r.p<r.end) {
      aborted(signal);check(++windows<=4096,'패치 창 개수 초과');
      const flags=r.byte();check((flags&~5)===0,'지원하지 않는 VCDIFF 창 플래그 (TARGET 포함)');
      let sn=0,sp=0;
      if(flags&3) {sn=r.integer();sp=r.integer();}
      const base=source;
      check(sn<=maxWindow&&sp<=base.size&&sn<=base.size-sp,'원본 창 범위 초과');
      const enc=r.section(r.integer()),tn=enc.integer();
      check(tn>0&&tn<=maxWindow&&tn<=outputSize-total,'출력 창 범위 초과');
      check(enc.byte()===0,'보조 압축은 지원하지 않습니다.');
      const dn=enc.integer(),inn=enc.integer(),an=enc.integer();
      let expected=null;
      if(flags&4) expected=(enc.byte()*16777216+enc.byte()*65536+enc.byte()*256+enc.byte())>>>0;
      const data=enc.section(dn),inst=enc.section(inn),addr=enc.section(an);enc.complete();
      const src=new Uint8Array(await base.slice(sp,sp+sn).arrayBuffer()),out=new Uint8Array(tn);
      const near=new Uint32Array(4),same=new Uint32Array(768);let next=0,t=0;
      while(inst.p<inst.end) {
        for(const [kind,fixed,mode] of table[inst.byte()]) {
          const n=fixed||inst.integer();check(n>0&&n<=tn-t,'명령 출력 범위 초과');
          if(kind===0) out.fill(data.byte(),t,t+n);
          else if(kind===1) {const bytes=data.section(n);out.set(bytes.b.subarray(bytes.p,bytes.end),t);}
          else {
            let a;
            if(mode===0) a=addr.integer();
            else if(mode===1) a=sn+t-addr.integer();
            else if(mode<6) a=near[mode-2]+addr.integer();
            else a=same[(mode-6)*256+addr.byte()];
            check(Number.isSafeInteger(a)&&a>=0&&a<sn+t,'COPY 주소 범위 초과');
            near[next]=a;next=(next+1)%4;same[a%768]=a;
            let q=t,left=n;
            if(a<sn) {const k=Math.min(left,sn-a);out.set(src.subarray(a,a+k),q);a+=k;q+=k;left-=k;}
            a-=sn;
            // Forward expansion, including overlapping copies; never read future bytes.
            while(left>0) {check(a>=0&&a<q,'COPY 미래 데이터 참조');const k=Math.min(left,q-a);out.set(out.subarray(a,a+k),q);a+=k;q+=k;left-=k;}
          }
          t+=n;
        }
      }
      check(t===tn,'출력 창 길이 불일치');data.complete();addr.complete();
      if(expected!==null) check(adler32(out)===expected,'출력 창 Adler32 불일치');
      hash.update(out);parts.push(new Blob([out]));total+=tn;onProgress(total,outputSize);
    }
    check(total===outputSize,'완성 ISO 크기 불일치');aborted(signal);
    return {blob:new Blob(parts,{type:'application/octet-stream'}),sha256:hash.hex(),windows};
  }
  function validateEntry(entry) {
    check(entry&&Number.isSafeInteger(entry.size_bytes)&&entry.size_bytes>0&&/^[a-f0-9]{64}$/.test(entry.sha256),'잘못된 manifest');
  }
  async function apply({source,patch,manifest,signal,onProgress=()=>{}}) {
    check(manifest?.schema==='homestar-korean-release-v1','지원하지 않는 manifest');
    for(const key of ['source','patch','output']) validateEntry(manifest[key]);
    check(source instanceof Blob&&source.size===manifest.source.size_bytes,'지원 원본 ISO 크기가 아닙니다.');
    check(patch instanceof Uint8Array&&patch.length===manifest.patch.size_bytes,'패치 크기가 다릅니다.');
    check(new SHA256().update(patch).hex()===manifest.patch.sha256,'패치 SHA256 불일치');
    check(await hashBlob(source,{signal,onProgress:(done,total)=>onProgress({stage:'source',done,total})})===manifest.source.sha256,'지원 원본 ISO SHA256이 아닙니다.');
    const result=await decode(source,patch,manifest.output.size_bytes,{signal,onProgress:(done,total)=>onProgress({stage:'apply',done,total})});
    check(result.sha256===manifest.output.sha256,'완성 ISO SHA256 불일치: 저장하지 않습니다.');
    aborted(signal);return {...result,filename:manifest.output.filename};
  }
  root.HomestarPatch=Object.freeze({apply,hashBlob,SHA256,decode,adler32});
})(globalThis);
