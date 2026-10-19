'use strict';
(() => {
 const dialog = document.querySelector('#image-viewer');
 let opener;
 if(dialog && typeof dialog.showModal === 'function') {
  const pic=dialog.querySelector('img'), label=dialog.querySelector('#image-title');
  document.querySelectorAll('a[data-image]').forEach(a=>a.addEventListener('click',event=>{
   event.preventDefault(); opener=a; pic.src=a.href; pic.alt=a.querySelector('img').alt; label.textContent=pic.alt; dialog.showModal();
  }));
  dialog.querySelector('button').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  dialog.addEventListener('close',()=>{pic.removeAttribute('src');opener?.focus()});
 }
 const search=document.querySelector('#manual-search');
 if(search){
  const sections=[...document.querySelectorAll('.manualSection')], links=[...document.querySelectorAll('.toc a')];
  const norm=t=>t.normalize('NFKC').toLowerCase().replace(/\s+/g,' ').trim();
  const apply=()=>{
   const terms=norm(search.value).split(' ').filter(Boolean); let count=0;
   sections.forEach(s=>{const match=terms.every(t=>norm(s.textContent).includes(t));s.hidden=!match;if(match)count++});
   links.forEach(a=>{a.hidden=!!document.querySelector(a.getAttribute('href'))?.hidden});
   document.querySelector('#search-status').textContent=terms.length?`${count}개 항목을 찾았습니다. 아래 안내에서 확인하세요.`:'메뉴 이름, 버튼, 날짜, GPS 등으로 찾아보세요.';
   document.querySelector('#no-results').hidden=count>0;
  };
  search.addEventListener('input',apply);
  document.querySelector('#clear-search').addEventListener('click',()=>{search.value='';apply();search.focus()});
  search.addEventListener('keydown',e=>{if(e.key==='Escape'){search.value='';apply()}});
  links.forEach(a=>a.addEventListener('click',()=>{const s=document.querySelector(a.hash);if(s)s.hidden=false}));
  if('IntersectionObserver'in window){const ob=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.hash===`#${e.target.id}`))})},{rootMargin:'-15% 0px -65% 0px'});sections.forEach(s=>ob.observe(s))}
 }
})();
