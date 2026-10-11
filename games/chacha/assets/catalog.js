'use strict';
(() => {
 const search=document.getElementById('catalogSearch');
 if(!search)return;
 const kind=document.getElementById('catalogKind'), category=document.getElementById('catalogCategory');
 const entries=[...document.querySelectorAll('[data-entry]')];
 let selectedIds=null, effectLabel='';
 const normal=s=>s.normalize('NFKC').toLocaleLowerCase('ko').replace(/\s+/g,' ').trim();
 function filter(){
  const words=normal(search.value).split(' ').filter(Boolean);
  let count=0;
  entries.forEach(row=>{
   const ok=(!selectedIds||selectedIds.includes(row.dataset.id))&&(kind.value==='all'||row.dataset.kind===kind.value)&&(category.value==='all'||row.dataset.category===category.value)&&words.every(w=>normal(row.dataset.search).includes(w));
   row.hidden=!ok;if(ok)count++;
  });
  ['items','skills'].forEach(k=>{document.getElementById(k+'-table').hidden=!entries.some(r=>r.dataset.kind===k&&!r.hidden)});
  document.getElementById('catalogStatus').textContent=`${effectLabel ? effectLabel+' · ' : ''}${entries.length}개 중 ${count}개 항목`;
  document.getElementById('catalogEmpty').hidden=count!==0;
 }
 search.addEventListener('input',()=>{selectedIds=null;effectLabel='';filter();});kind.addEventListener('change',filter);category.addEventListener('change',filter);
 search.addEventListener('keydown',e=>{if(e.key==='Escape'){search.value='';selectedIds=null;effectLabel='';filter();}});
 document.querySelectorAll('[data-effect]').forEach(button=>button.addEventListener('click',()=>{selectedIds=button.dataset.ids ? button.dataset.ids.split(' ') : null;effectLabel=selectedIds ? button.dataset.effect : '';search.value=selectedIds ? '' : button.dataset.effect;kind.value='all';category.value='all';filter();}));
 filter();
})();
