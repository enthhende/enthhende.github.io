'use strict';
const catalog=window.SPRITE_CATALOG;
const entries=catalog.entries;
const byId=new Map(entries.map(e=>[e.id,e]));
const storageKey='hakoniwa-sprite-review-v1';
const statuses=new Set(['pending','named','unsure','skip']);
const pageSize=48;
const answers={};
let page=0,visible=[],saveTimer;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const blank=()=>({name:'',note:'',status:'pending'});
const answer=e=>answers[e.id]||blank();
function message(text,error=false){$('#saveState').textContent=text;$('#saveState').classList.toggle('error',error);}
function cleanRecord(row){
 const entry=byId.get(row?.id);
 if(!entry||entry.sha256!==row.sha256)return null;
 if(typeof row.name!=='string'||row.name.length>100||typeof row.note!=='string'||row.note.length>1000||!statuses.has(row.status))throw new Error('이름·메모·상태의 형식이 올바르지 않습니다.');
 if(row.status==='named'&&!row.name.trim())throw new Error('이름 확인 상태에 이름이 없습니다.');
 if(typeof row.updatedAt!=='string'||!Number.isFinite(Date.parse(row.updatedAt)))throw new Error('저장 날짜가 올바르지 않습니다.');
 return {id:entry.id,sha256:entry.sha256,name:row.name,note:row.note,status:row.status,updatedAt:row.updatedAt};
}
function records(){return entries.filter(e=>answers[e.id]).map(e=>({...answers[e.id],id:e.id,sha256:e.sha256}));}
function persist(){
 clearTimeout(saveTimer);
 try{localStorage.setItem(storageKey,JSON.stringify({version:1,entries:records()}));message('이 브라우저에 저장됨 · '+new Date().toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit'}));}
 catch{message('브라우저 저장 불가 · 검수 파일을 저장해 주세요.',true);}
}
try{
 const saved=JSON.parse(localStorage.getItem(storageKey)||'null');
 if(saved?.version===1&&Array.isArray(saved.entries))for(const row of saved.entries){const cleaned=cleanRecord(row);if(cleaned)answers[cleaned.id]=cleaned;}
 if(Object.keys(answers).length)message('이 브라우저에 저장된 내용을 불러왔습니다.');
}catch{message('브라우저 저장 내용을 읽을 수 없습니다. 검수 파일로 이어서 작업해 주세요.',true);}
const categories=[...new Set(entries.flatMap(e=>e.candidates.map(c=>c.category)))].sort((a,b)=>a.localeCompare(b,'ko'));
$('#category').innerHTML+categories.map(c=>`<option>${esc(c)}</option>`).join('');
$('#gameNames').innerHTML=[...new Set(entries.flatMap(e=>e.candidates.map(c=>c.name)))].sort((a,b)=>a.localeCompare(b,'ko')).map(n=>`<option value="${esc(n)}"></option>`).join('');
function updateProgress(){
 const rows=Object.values(answers),named=rows.filter(a=>a.status==='named').length,unsure=rows.filter(a=>a.status==='unsure').length,skip=rows.filter(a=>a.status==='skip').length;
 $('#progress').textContent=`이름 작성 ${named} · 구분 어려움 ${unsure} · 제외 ${skip} / 전체 ${entries.length}`;
}
function render(){
 const query=$('#search').value.trim().toLocaleLowerCase('ko'),status=$('#status').value,category=$('#category').value;
 visible=entries.filter((e,index)=>{
  const a=answer(e);
  return (!$('#unused').checked||!e.used)&&(!category||e.candidates.some(c=>c.category===category))&&(status==='all'||a.status===status)&&(!query||[String(index+1).padStart(3,'0'),a.name,a.note,...e.candidates.map(c=>c.name)].some(s=>s.toLocaleLowerCase('ko').includes(query)));
 });
 page=Math.max(0,Math.min(page,Math.ceil(visible.length/pageSize)-1));
 $('#grid').innerHTML=visible.slice(page*pageSize,(page+1)*pageSize).map(e=>{
  const a=answer(e),number=String(entries.indexOf(e)+1).padStart(3,'0'),names=[...new Set(e.candidates.map(c=>c.name))];
  return `<article class="sprite-card ${a.status}" data-id="${e.id}"><div class="card-head"><span class="dot-number">#${number}</span><span class="usage ${e.used?'used':''}">${e.used?'공략 사용 중':'공략 미적용'}</span></div><div class="sprite-stage"><img src="${e.image}" alt="도트 ${number}" width="136" height="136" loading="lazy"></div><div class="card-body"><label class="name-label" for="name-${e.id}">이 도트의 이름<input id="name-${e.id}" data-field="name" value="${esc(a.name)}" maxlength="100" list="gameNames" placeholder="예: 갓 벤 메밀" autocomplete="off"></label><label>검수 상태<select data-field="status" aria-label="도트 ${number} 검수 상태">${[['pending','아직 작성하지 않음'],['named','이름 작성함'],['unsure','구분 어려움'],['skip','사용하지 않음']].map(([value,label])=>`<option value="${value}" ${a.status===value?'selected':''}>${label}</option>`).join('')}</select></label><label>특징·메모<textarea data-field="note" maxlength="1000" placeholder="성장 단계, 성별, 구별할 특징">${esc(a.note)}</textarea></label><details class="candidate-list"><summary>게임 명칭 후보 ${names.length}개</summary><p>${names.map(esc).join(' · ')}</p>${names.length===1?`<button type="button" data-use-name="${esc(names[0])}">이 후보명을 입력</button>`:'<p>여러 항목이 함께 쓰는 그림일 수 있습니다.</p>'}</details></div></article>`;
 }).join('');
 $('#empty').hidden=visible.length>0;
 $('#results').textContent=visible.length?`${visible.length}개 중 ${page*pageSize+1}–${Math.min((page+1)*pageSize,visible.length)}`:'0개';
 $('#pageInfo').textContent=`${visible.length?page+1:0} / ${Math.ceil(visible.length/pageSize)} 페이지`;
 $('#prev').disabled=page===0;$('#next').disabled=(page+1)*pageSize>=visible.length;
 updateProgress();
}
function edit(card,field,value){
 const entry=byId.get(card.dataset.id),a={...answer(entry),[field]:value};
 if(field==='name')a.status=value.trim()?'named':'pending';
 if(a.status==='named'&&!a.name.trim()){a.status='pending';message('이름을 먼저 적어 주세요.',true);}
 if(a.status==='pending'&&!a.name&&!a.note)delete answers[entry.id];
 else answers[entry.id]={...a,updatedAt:new Date().toISOString()};
 card.className='sprite-card '+a.status;card.querySelector('[data-field="status"]').value=a.status;
 updateProgress();clearTimeout(saveTimer);saveTimer=setTimeout(persist,250);
}
$('#grid').addEventListener('input',e=>{if(e.target.dataset.field)edit(e.target.closest('.sprite-card'),e.target.dataset.field,e.target.value);});
$('#grid').addEventListener('click',e=>{const button=e.target.closest('[data-use-name]');if(!button)return;const card=button.closest('.sprite-card'),input=card.querySelector('[data-field="name"]');input.value=button.dataset.useName;edit(card,'name',input.value);input.focus();});
for(const id of ['search','category','status','unused'])$('#'+id).addEventListener(id==='search'?'input':'change',()=>{page=0;render();});
for(const [id,delta] of [['prev',-1],['next',1]])$('#'+id).addEventListener('click',()=>{page+=delta;render();$('.controls').scrollIntoView({block:'start'});});
document.querySelectorAll('[data-bg]').forEach(button=>button.addEventListener('click',()=>{document.body.classList.remove('bg-cream','bg-dark');if(button.dataset.bg!=='checker')document.body.classList.add('bg-'+button.dataset.bg);document.querySelectorAll('[data-bg]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
$('#size').addEventListener('input',e=>document.documentElement.style.setProperty('--size',e.target.value+'px'));
$('#export').addEventListener('click',()=>{
 persist();
 const payload={format:'hakoniwa-sprite-review',version:1,catalogId:catalog.catalogId,exportedAt:new Date().toISOString(),entries:records().map(r=>({...r,image:byId.get(r.id).file||byId.get(r.id).image,candidates:byId.get(r.id).candidates}))};
 const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='hakoniwa-dot-review-'+new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')+'.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),10000);
});
$('#import').addEventListener('click',()=>$('#importFile').click());
$('#importFile').addEventListener('change',async e=>{
 const file=e.target.files[0];if(!file)return;
 try{
  if(file.size>5*1024*1024)throw new Error('파일이 너무 큽니다.');
  const payload=JSON.parse(await file.text());
  if(payload.format!=='hakoniwa-sprite-review'||payload.version!==1||!Array.isArray(payload.entries))throw new Error('양마을 도트 검수 JSON 파일을 선택해 주세요.');
  const cleaned=payload.entries.map(cleanRecord);let imported=0,skipped=0;
  for(const row of cleaned){if(!row||answers[row.id]&&Date.parse(answers[row.id].updatedAt)>Date.parse(row.updatedAt)){skipped++;continue;}answers[row.id]=row;imported++;}
  persist();render();message(`${imported}개 불러옴${skipped?' · 이전 내용 또는 다른 도트 '+skipped+'개 유지':''}`);
 }catch(error){message('불러오기 실패: '+(error instanceof SyntaxError?'JSON 파일 형식을 확인해 주세요.':error.message),true);}
 e.target.value='';
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&saveTimer)persist();});
render();
