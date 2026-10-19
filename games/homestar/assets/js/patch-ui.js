'use strict';
(() => {
 let enabled=0;
 document.querySelectorAll('.download-link').forEach(a=>{
  const cfg=window.HOMESTAR_CONFIG?.[a.dataset.edition];
  if(cfg?.zip && /^(https:\/\/|\.\.\/|\.\/)/.test(cfg.zip)){
   a.href=cfg.zip;a.download=cfg.filename;a.removeAttribute('aria-disabled');a.textContent=(a.dataset.edition==='psp'?'기본판':'Vita 호환판')+' ZIP 받기 ↗';enabled++;
  }
 });
 const label=document.querySelector('#download-status');
 if(label&&enabled===2)label.hidden=true;
})();

(() => {
 const form=document.querySelector('#patch-form');if(!form)return;
 const file=document.querySelector('#source-file'),start=document.querySelector('#apply-button'),cancel=document.querySelector('#cancel-button'),status=document.querySelector('#patch-status'),meter=document.querySelector('#patch-progress'),save=document.querySelector('#save-iso'),hash=document.querySelector('#result-hash');
 const radios=[...form.querySelectorAll('input[name=edition]')];let client,controller,resultURL,run=0,busy=false;
 const supported=typeof Worker!=='undefined'&&typeof Blob!=='undefined'&&typeof File!=='undefined'&&typeof fetch!=='undefined';
 const webProtocol=location.protocol==='http:'||location.protocol==='https:';
 const setStatus=t=>status.textContent=t;
 const clearResult=()=>{save.hidden=true;save.removeAttribute('href');hash.hidden=true;hash.textContent='';if(resultURL){URL.revokeObjectURL(resultURL);resultURL=null}};
 const setBusy=b=>{busy=b;start.disabled=b||!supported||!webProtocol;cancel.hidden=!b;file.disabled=b;radios.forEach(r=>r.disabled=b)};
 const reset=()=>{clearResult();meter.value=0;setStatus('일본판 ISO를 선택하고 사용할 기기를 골라 주세요.')};
 const get=async(path,type,signal)=>{const response=await fetch(path,{signal});if(!response.ok)throw new Error('패치 자료를 불러오지 못했습니다. ZIP을 내려받아 오프라인 적용기를 이용해 주세요.');return response[type]()};
 const base64=buf=>{const bytes=new Uint8Array(buf);let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(s)};
 const stageNames={'source':'원본 확인','source-hash':'원본 SHA256 확인','patch':'패치 확인','patch-hash':'패치 SHA256 확인','apply':'패치 적용','output':'완성 ISO 확인','output-hash':'완성 ISO SHA256 확인'};
 form.addEventListener('submit',async e=>{
  e.preventDefault();if(busy||!supported||!webProtocol)return;clearResult();meter.value=0;
  const source=file.files?.[0];if(!source){setStatus('먼저 일본판 원본 ISO를 선택해 주세요.');file.focus();return}
  const edition=radios.find(r=>r.checked).value,id=++run,taskController=new AbortController();controller=taskController;setBusy(true);setStatus('지원 원본 조건을 확인하고 있습니다.');
  try{
   const manifest=await get(`engine/${edition}/manifest.json`,'json',taskController.signal);
   if(id!==run)return;
   if(manifest.edition!==edition)throw new Error('배포판 정보가 일치하지 않습니다. 적용을 중단했습니다.');
   if(source.size!==manifest.source.size_bytes)throw new Error(`지원 원본 크기는 ${manifest.source.size_bytes.toLocaleString('ko-KR')}바이트입니다. 선택한 파일은 ${source.size.toLocaleString('ko-KR')}바이트입니다. 압축하지 않은 일본판 원본 ISO를 확인해 주세요.`);
   setStatus('선택한 판의 패치 자료를 내려받고 있습니다. 원본 ISO는 기기 안에서만 읽습니다.');
   const [engine,worker,patch]=await Promise.all([get('engine/engine.js','text',taskController.signal),get('engine/worker.js','text',taskController.signal),get(`engine/${edition}/${manifest.patch.filename}`,'arrayBuffer',taskController.signal)]);
   if(id!==run)return;
   client=new HomestarPatcherClient(engine+'\n'+worker);
   const result=await client.apply({source,base64:base64(patch),manifest,onProgress:({stage,done,total})=>{if(id!==run)return;const percentage=total?Math.min(100,Math.round(done/total*100)):0;meter.value=percentage;setStatus(`${stageNames[stage]||'검사·적용'} · ${percentage}%`)}});
   if(id!==run)return;
   resultURL=URL.createObjectURL(result.blob);save.href=resultURL;save.download=result.filename;save.hidden=false;hash.textContent=`완성 ISO SHA256: ${result.sha256}`;hash.hidden=false;meter.value=100;setStatus('원본·패치·완성 ISO 검사를 모두 통과했습니다. ‘완성 ISO 저장’을 눌러 저장한 뒤 기기로 복사하세요.');
  }catch(error){if(id!==run)return;clearResult();meter.value=0;setStatus(error.name==='AbortError'?'적용을 취소했습니다. 원본 파일은 바뀌지 않았습니다.':`적용하지 못했습니다. ${error.message}`)}
  finally{if(id===run){client=null;controller=null;setBusy(false)}}
 });
 const stop=()=>{run++;controller?.abort();client?.cancel();controller=null;client=null;clearResult();meter.value=0;setBusy(false)};
 cancel.addEventListener('click',()=>{stop();setStatus('적용을 취소했습니다. 원본 파일은 바뀌지 않았습니다.')});
 file.addEventListener('change',reset);radios.forEach(r=>r.addEventListener('change',reset));
 window.addEventListener('pagehide',stop);
 window.addEventListener('pageshow',event=>{if(event.persisted){stop();reset()}});
 if(!supported){setBusy(false);setStatus('이 브라우저에서는 적용기를 실행할 수 없습니다. PC에서 ZIP을 내려받아 apply-patch.html을 열어 주세요.')}
 if(location.protocol==='file:'){start.disabled=true;setStatus('이 통합 웹 적용기는 HTTP/HTTPS에서 사용합니다. 파일을 직접 연 경우에는 배포 ZIP의 apply-patch.html을 이용해 주세요.')}
})();
