function guideSources(ids=[]){
 return [...new Set(ids)].map(id=>GUIDE_SOURCES[id]).filter(Boolean).map(s=>`<a href="${esc(s.href)}" ${s.href.startsWith('https:')?'target="_blank" rel="noopener noreferrer"':''}>${esc(s.label)}</a><small>${esc(s.note)}</small>`).join('');
}
function guideRelated(names=[]){
 const ids=new Set();
 return names.map(name=>{
  const r=DB.find(x=>x.nameKo===name)||DB.find(x=>x.nameKo==='어린 '+name);
  if(!r||ids.has(r.id))return '';ids.add(r.id);
  return `<button type="button" class="guide-item-link" data-guide-item="${esc(r.id)}">${esc(r.nameKo)}</button>`;
 }).join('');
}
function guideDetailHtml(r){
 const actions=(r.warning?`<p class="event-warning">${esc(r.warning)}</p>`:'')+(r.actions?.length?`<section class="detail-section"><h4>이 상태에서 할 수 있는 일</h4><div class="action-list">${r.actions.map(a=>`<div><strong>${esc(a.action)}</strong><span aria-hidden="true">→</span><b>${esc(a.result)}</b>${a.note?`<small>${esc(a.note)}</small>`:''}</div>`).join('')}</div></section>`:'');
 const summary=[['실제 기능·효과',r.effect],['얻는 방법',r.obtain],['평소 먹이',r.dailyFood],['생산용 먹이',r.food],['생산 흐름·부가 기능',r.production],['젖 짜기',r.milk],['발아 계절',r.season]].filter(x=>x[1]);
 const event=GUIDE_EVENTS.find(x=>x.id===r.event);
 const person=RESIDENTS.find(x=>x.name===r.resident);
 const quotes=r.gameText?.length?`<details class="game-quote"><summary>게임 내 설명</summary>${r.gameText.map(q=>`<blockquote>${esc(q.text)}</blockquote>`).join('')}</details>`:'';
 const routes=EXCHANGES.filter(e=>e.give===r.nameKo||e.get===r.nameKo);
 const market=routes.length?`<details class="detail-section" ${routes.length<=4?'open':''}><summary>시장 교환 ${routes.length}건</summary><div class="detail-market">${routes.map(e=>`<div>${exWordCard(e.give,e.giveQty)} <span>→</span> ${exWordCard(e.get,e.getQty)}<small>${esc(e.market||'시장 불명')}${e.note?' · '+esc(e.note):''}</small></div>`).join('')}</div></details>`:'';
 return `${guideSpriteGallery(r)}${summary.length?`<div class="practical-detail">${summary.map(([k,v])=>`<div><strong>${esc(k)}</strong><p>${esc(v)}</p></div>`).join('')}</div>`:''}${actions}${event?`<a class="event-callout" href="#event-${event.id}" data-close-guide>관련 이벤트: ${esc(event.title)} <span>진행 순서 보기 →</span></a>`:''}${person?'<a class="event-callout" href="#residents" data-close-guide>주민 방문·동상 조건 모아 보기 →</a>':''}${r.relatedNames?.length?`<section class="detail-section"><h4>연결된 항목</h4><div class="related-links">${guideRelated(r.relatedNames)}</div></section>`:''}${market}${quotes}<div class="evidence-sources">${guideSources(r.sources)}</div>`;
}
function renderGuideSections(){
 document.querySelector('#eventGrid').innerHTML=GUIDE_EVENTS.map((e,i)=>`<article class="event-guide" id="event-${e.id}"><div class="event-heading"><span class="guide-index">${String(i+1).padStart(2,'0')}</span><div><p class="eyebrow">${esc(e.when)}</p><h3>${esc(e.title)}</h3></div></div><p class="event-lead">${esc(e.lead)}</p><ol>${e.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p class="event-warning">${esc(e.warning)}</p><div class="related-links">${guideRelated(e.links)}</div><details class="event-source"><summary>조건의 출처 확인</summary><div class="evidence-sources">${guideSources(e.sources)}</div></details></article>`).join('');
 document.querySelector('#residentGrid').innerHTML=RESIDENTS.map(p=>`<article class="resident-card"><div class="resident-pixel">${guidePixel(GUIDE_RESIDENT_PIXELS[p.name])}</div><div class="resident-copy"><p class="eyebrow">${esc(p.role)}</p><h3>${esc(p.name)}</h3><dl><dt>방문·동상 해금 조건</dt><dd>${esc(p.unlock)} <small>PSP판 참고</small></dd><dt>방문 효과와 활용</dt><dd>${esc(p.effect)} ${esc(p.use)}</dd></dl><div class="related-links">${guideRelated([p.name,p.name+'상'])}</div></div></article>`).join('');
 const quick=[['갓 벤 메밀','베기 → 말리기 → 씨앗·교환'],['야크 털','감자 → 털이 자람 → 가위'],['양털','수확 전 순무 → 가위 → 털실'],['햄','멧돼지고기 → 햄 건조함 → 숙성']];
 document.querySelector('#productionQuick').innerHTML=quick.map(([name,route])=>{const r=DB.find(x=>x.nameKo===name);return `<button type="button" class="production-shortcut" data-guide-item="${esc(r.id)}"><span class="production-pixel">${guidePixel(guideSpriteFor(r))}</span><span><strong>${esc(name)}</strong><small>${esc(route)}</small><b>상세 사용법 보기 →</b></span></button>`}).join('');
 document.querySelector('#guideSourceList').innerHTML=Object.entries(GUIDE_SOURCES).filter(([id])=>!['game','existing'].includes(id)).map(([,s])=>`<div class="source"><a href="${esc(s.href)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}</a><p>${esc(s.note)}</p></div>`).join('');
}
document.addEventListener('click',e=>{
 const item=e.target.closest('[data-guide-item]');if(item){showDetail(item.dataset.guideItem);return;}
 if(e.target.closest('[data-close-guide]'))close();
});
renderGuideSections();
