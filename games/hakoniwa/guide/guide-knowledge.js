/* Practical routes complement the approved Korean game text in game-reference.js. */
const GUIDE_SOURCES = {
 game: {label:'Switch판 게임 내 도감·브라미 힌트', href:'#guide-sources', note:'한글화된 Switch판 기준'},
 animals: {label:'포터블 공략 위키 · 동물',href:'https://wikiwiki.jp/hitujimura/動物',note:'PSP판 공략'},
 products: {label:'포터블 공략 위키 · 축산·가공',href:'https://wikiwiki.jp/hitujimura/畜産・加工',note:'PSP판 공략'},
 residents: {label:'포터블 공략 위키 · 주민',href:'https://wikiwiki.jp/hitujimura/村人',note:'PSP판의 주민·동상 정보'},
 feeding: {label:'포터블 공략 위키 · 가축·먹이표',href:'https://wikiwiki.jp/hitujimura/家畜',note:'PSP판 먹이표. 어린 개체·수유 상태에 주의'},
 remake: {label:'양을 얻기까지의 진행 기록 (2023)',href:'https://xn--p8j7a4jn57j.com/entry/20230618/1687073011',note:'PC 리메이크판 플레이 기록 · 수확 전 순무와 포도·와인 운용'},
 switch: {label:'箱庭牧場 ひつじ村 플레이 기록 (2023)',href:'https://systemfake.com/?p=2151',note:'Switch판 플레이 후기'},
 existing: {label:'이 공략의 작물·가축 상세표',href:'#livestock',note:'작물과 가축의 생산 정보'}
};
const RESIDENTS = [
 {name:'클레어',role:'잼 만들기',unlock:'토마토 팻말 입수',effect:'방문한 클레어 곁에 베리·포도·토마토·당근·호박을 두어 잼을 만든다.',use:'잼은 저장고에서 약 일 년 동안 보관할 수 있다.',links:['클레어상','토마토 팻말','베리잼','포도잼','토마토잼','당근잼','호박잼'],art:'claire',quote:'TXT_EVENT:0238'},
 {name:'카이',role:'새끼 몫을 남기는 젖 짜기',unlock:'소젖 치즈 만들기',effect:'새끼가 먹을 젖을 남기면서 젖을 짜고, 젖이 나오는 기간도 늘려 준다.',use:'보통 직접 젖을 짤 때는 새끼가 다 자랄 때까지 기다린다. 카이의 방문 효과를 이용하면 새끼 몫을 남길 수 있다.',links:['카이상','소젖 치즈','수유 중인 염소','수유 중인 야크','수유 중인 소'],art:'kai',quote:'TXT_EVENT:0239'},
 {name:'마샤',role:'악천후 방지',unlock:'호박 수확',effect:'목장에 머무는 동안 악천후를 막아 준다.',use:'중요한 수확철에 유용하다. 주민 방문 중 발동.',links:['마샤상','호박'],art:'masha',quote:'TXT_EVENT:0240'},
 {name:'레이먼드',role:'작물 성장 돕기',unlock:'콩 수확',effect:'목장에 방문해 작물이 자라는 것을 돕는다.',use:'작물 재배에 유용하다. 성장 단축 일수·효과 범위 불명.',links:['레이먼드상','콩','콩 씨앗'],art:'raymond',quote:'TXT_EVENT:0241'},
 {name:'헬렌',role:'털 재생 돕기',unlock:'알파카 털 깎기',effect:'털을 깎은 동물의 털이 다시 잘 자라도록 돌봐 준다.',use:'털 생산을 반복할 때 유용하다. 평소에는 토끼→양배추, 양→수확 전 순무, 라마→토마토, 야크→감자, 알파카→호박을 준비한다.',links:['헬렌상','알파카 털','야크 털','양털','토끼털'],art:'helen',quote:'TXT_EVENT:0242'},
 {name:'샘슨',role:'고기 보관 돕기',unlock:'소고기 입수',effect:'고기가 오래 보관되도록 손봐 준다.',use:'방문한 샘슨에게 고기를 가져간다. 보관 연장 일수 불명.',links:['샘슨상','소고기','자투리 고기'],art:'samson',quote:'TXT_EVENT:0243'},
 {name:'모건',role:'동물에게 살아갈 힘 주기',unlock:'사냥 교환품인 괭이 입수',effect:'목장 동물들에게 살아갈 힘을 준다.',use:'늙은 동물을 기다리는 고양이 이벤트와 함께 관리할 때 참고한다. 수명 연장 수치 불명.',links:['모건상','괭이','늙은 당나귀','늙은 고양이'],art:'morgan',quote:'TXT_EVENT:0247'},
 {name:'소피아',role:'유해동물에게서 목장 지키기',unlock:'사냥 교환품에서 소피아상 입수',effect:'목장에 머무는 동안 유해동물에게서 목장을 지킨다.',use:'사냥 파트너를 준비하도록 안내하는 주민이기도 하다. 늙은 고양이 보답 이벤트는 보스 사냥 재도전과 연결된다.',links:['소피아상','비밀 청동상','어린 테리어'],art:'sophia',quote:'TXT_EVENT:0245'},
 {name:'메릴',role:'동물 털 색 바꾸기',unlock:'신마 사냥 성공',effect:'동물의 털을 염색하는 주민이다.',use:'털 색 수집에 활용한다. 색상별 확률·세부 발동조건 불명.',links:['메릴상','알파카 털','앙고라토끼 털'],art:'meryl'}
];
const GUIDE_EVENTS = [
 {id:'squirrel',title:'새끼 다람쥐를 발견했다면',lead:'우선 주워서 소지하고, 도토리 달에 어미 다람쥐를 찾아 주세요.',when:'어린 양 입수 후 포도 달에 새끼 출현 · 어미는 도토리 달 이후',art:'masha',steps:['새끼 다람쥐를 발견하면 주워서 소지한다. 어미를 기다리는 동안 바닥에 방치하지 않는다.','도토리 달이 되면 목장에 어미 다람쥐가 왔는지 살펴본다. 어미와 새끼는 각각 출현한다.','어미를 찾으면 새끼를 내려놓아 서로 붙여 둔다. 고양이가 접근하지 못하도록 주변을 정리한다.','날짜를 넘긴 뒤 콩 씨앗이 남았는지 확인한다. 재회 보상은 콩 씨앗 2개.'],warning:'새끼와 어미는 고양이에게 먹힐 수 있다. 작은 새끼는 울타리를 통과할 수 있으므로 울타리만으로 보호하려 하지 않는다. 정확한 출현일·확률 불명.',links:['새끼 다람쥐','어미 다람쥐','콩 씨앗','어린 양'],sources:['game','animals','switch']},
 {id:'cat',title:'고양이의 보답 → 집고양이',lead:'겨울꽃 팬지로 방문을 유도하고, 늙은 고양이의 부탁을 순서대로 해결합니다.',when:'겨울꽃 팬지 개화 → 고양이 방문 → 늙은 고양이',art:'claire',steps:['겨울꽃 팬지를 피워 어린 고양이의 방문을 기다린다.','관심거리를 두어 목장에 머무르게 한다. 계절별 관심거리는 민들레·포도 달의 연못, 도토리 달의 분수, 풀 없는 달의 난로다.','늙은 고양이가 되면 늙은 닭 → 늙은 개 → 늙은 당나귀 순으로 부탁을 해결한다. 다음에 원하는 것은 고양이의 설명을 확인한다.','보답인 비밀 청동상을 새로 방문한 어린 고양이 곁에 두고 변화를 기다린다. 집고양이의 암수와 새끼 수집으로 이어진다.'],warning:'늙은 개·늙은 당나귀를 준비하는 데 오래 걸리므로 일찍부터 길러 둔다. 고양이의 노화까지 약 2~3년.',links:['어린 고양이','늙은 고양이','비밀 청동상','어린 집고양이','겨울꽃 팬지 씨앗'],sources:['game','animals','switch']},
 {id:'truffle',title:'트러플로 돼지 루트 열기',lead:'암컷 멧돼지를 도토리 달의 침엽수 근처에 둡니다.',when:'도토리 달 · 암컷 멧돼지 · 침엽수',art:'grapes',steps:['암컷 멧돼지를 확보한다. 수컷 멧돼지의 고기 교환과는 다른 기능이다.','도토리 달에 침엽수 근처로 데려간다. 주변에 먹이를 두면 나무 근처에 머무르게 하기 편하다.','나무 주변의 트러플을 확인해 회수한다. 트러플은 어린 돼지를 얻는 교환 재료다.'],warning:'처음부터 목장에 있던 침엽수를 남겨 두고 이용한다. 새로 심은 나무의 발동조건 불명.',links:['암컷 멧돼지','침엽수','트러플','어린 돼지'],sources:['game','switch']},
 {id:'silk',title:'누에알 → 고치 → 명주실',lead:'누에는 스스로 이동하지 못하므로 큰 풀 옆으로 옮겨 줍니다.',when:'민들레 달 부화 · 포도 달 고치',art:'crops',steps:['누에알을 풀 근처에 놓고 민들레 달의 부화를 기다린다.','누에가 되면 먹을 수 있는 큰 풀 옆으로 옮겨 준다.','포도 달에 고치가 되면 항아리로 수확해 명주실을 얻는다.','나방도 수집하려면 고치를 일부 남겨 둔다. 고치를 계속 두면 나방이 되고 다시 누에알을 낳는다.'],warning:'PSP판 공략과 도구 사용법이 다르다. 이 공략은 한글화된 Switch판을 따른다. 고치 수확에는 항아리를 사용한다.',links:['누에알','누에','고치','명주실','나방'],sources:['game']}
];

function enrichGuideData(DB, flows, livestock, exchanges){
 const ref=window.HAKO_REFERENCE;
 const flat=s=>String(s||'').replace(/\n/g,' ').trim();
 const findRef=(name)=>ref.reference.find(x=>x.name===name);
 const names=(...a)=>a.flat().filter(Boolean);
 const recipe=(r,obtain,actions,related,warning='')=>Object.assign(r,{obtain,effect:obtain+' '+actions.map(x=>x[0]+' → '+x[1]).join(' / '),tags:actions.map(x=>x[0]).join(' · '),disposal:actions[0]?`${actions[0][0]} → ${actions[0][1]}`:'',actions:actions.map(x=>({action:x[0],result:x[1],note:x[2]||''})),relatedNames:related,warning:warning||r.warning,sources:['game']});
 // Reuse exact translated diary text, retaining original keys and line breaks.
 for(const r of DB){
  if(r.gameText?.length && /성장 단계 중 하나|생산물 또는 재료|목장에 나타나는 야생 생물|이벤트에 등장하는/.test(r.effect))r.effect=flat(r.gameText[0].text);
  r.sources=r.gameText?.length?['game']:[];
 }
 const alias={'풀꽃':'화초'};
 for(const crop of flows){
  for(const stage of crop.stages){
   stage.name=alias[stage.name]||stage.name;
   const r=DB.find(x=>x.nameKo===stage.name && (x.category==='작물·식물'||x.category==='축산·가공·재료'));
   if(!r)continue;
   const next=stage.result.replace(/으로 성장$/,'');
   r.effect=`${stage.name}: ${stage.action} → ${next}. ${stage.note||''}`;
   r.actions=[...(r.actions||[]),{action:stage.action,result:next,note:stage.note||''}].filter((a,i,arr)=>arr.findIndex(b=>b.action===a.action&&b.result===a.result)===i);
   r.obtain=r.obtain||`${crop.name} 재배 중의 ${stage.name} 단계.`;
   r.relatedNames=names(crop.stages.map(s=>alias[s.name]||s.name));
   r.season=crop.timing?.sprout;
   r.sources=[...new Set([...r.sources,'existing'])];
  }
 }
 // Every animal state receives its own next action, plus its family's production route.
 const wool={토끼:['양배추','토끼털'],양:['수확 전 순무','양털'],라마:['토마토','라마 털'],야크:['감자','야크 털'],알파카:['호박','알파카 털'],앙고라토끼:['당근','앙고라토끼 털'],오리:['메밀 씨앗 또는 밀 씨앗','오리털']};
 const milk={염소:'염소젖',야크:'야크 우유',소:'우유'};
 const familyOf=r=>livestock.slice().sort((a,b)=>b.ja.length-a.ja.length).find(x=>r.nameJa.includes(x.ja)||(!r.nameKo.includes('고양이')&&r.nameKo.includes(x.name)))||livestock.find(x=>x.name===({'ヒヨコ':'닭','ウリボウ':'멧돼지'}[r.nameJa]));
 for(const r of DB.filter(x=>x.category==='가축·동물 상태')){
  const f=familyOf(r);if(!f)continue;
  r.family=f.name;r.obtain=f.get;r.production=f.produce;r.sources=['game','existing'];
  const d=findRef(f.name);if(d && !r.gameText.some(x=>x.key===d.key))r.gameText.push({key:d.key,text:d.text});
  const w=wool[f.name],m=milk[f.name];
  let state='';
  if(r.nameKo==='병아리')state='달걀에서 부화한 닭의 새끼. 씨앗을 먹여 어린 닭으로 키운다.';
  else if(/새끼|子/.test(r.nameKo+r.nameJa))state='새끼 단계. 어미 곁에서 자라도록 돌본다. 포유류 새끼는 수유 중인 어미가 필요하다.';
  else if(/어린/.test(r.nameKo))state='어린 개체. 먹이를 주어 성체로 키운 뒤 성별과 생산 상태를 확인한다.';
  else if(/젖이 차는/.test(r.nameKo))state='젖을 다시 채우는 상태. 먹이를 주고 다음 수유 상태를 기다린다.';
  else if(/수유 중/.test(r.nameKo))state=m?`출산 후 수유 중인 상태. 새끼가 다 자란 뒤 항아리로 ${m}를 얻는다.`:'출산 후 새끼를 기르는 상태. 새끼와 어미를 함께 둔다.';
  else if(/임신/.test(r.nameKo))state='번식 중인 상태. 출산·산란 후 새끼를 돌볼 먹이와 공간을 마련한다.';
  else if(/늙은/.test(r.nameKo))state='나이 든 개체. 일반 성체와 교환 가능한 항목이 다를 수 있으므로 현재 교환 목록을 확인한다.';
  else if(/털 깎인|깃털 없는/.test(r.nameKo))state=w?`털을 깎은 뒤의 상태. ${w[0]}를 준비해 다음 털 생산을 기다린다.`:'털을 깎은 뒤의 상태.';
  else if(/털 난|깃털 난/.test(r.nameKo))state=w?`털이 자란 상태. 가위로 ${w[1]}를 얻는다.`:'털이 자란 상태.';
  else if(/살찐 수거위/.test(r.nameKo))state='밀 씨앗·메밀 씨앗을 먹고 살찐 수거위. 시장에서 푸아그라와 교환한다.';
  else if(/알$|달걀/.test(r.nameKo))state='부화용 알. 해당 암컷 곁에 두어 부화를 기다린다. 무정란과 구별한다.';
  else state=`${r.nameKo}. ${f.special}`;
  r.effect=state;
  if(w){
   r.food=w[0];r.production=`${f.name} 성체 → ${w[0]} 먹이기 → 털이 자란 상태 → 가위 → ${w[1]}`;
   r.actions=[{action:w[0]+' 먹이기',result:'털이 자란 상태',note:f.name==='양'?'땅에서 자라는 순무를 먹여야 한다. 수확한 순무로는 털이 자라지 않는다.':''},{action:'털이 자란 뒤 가위',result:w[1],note:'시장의 가축 교환과 직접 털 깎기는 별개다.'}];
   r.relatedNames=names(w[0].split(' 또는 '),w[1],m,'헬렌');
  }
  if(f.name==='야크'){
   r.dailyFood='건초·마른 풀·풀·벤 풀(소). 털을 기르는 생산용 먹이는 감자다.';
   r.gameText.push({key:'TXT_ITBRAM:0130',text:ref.hints['TXT_ITBRAM:0130']});
  }
  if(m){r.milk=`수유 중인 ${f.name} → 항아리 → ${m}. 새끼가 다 자란 뒤 짠다. 카이는 새끼 몫을 남기면서 젖을 짜고 수유 기간을 늘린다.`;r.relatedNames=names(r.relatedNames,m,'카이');}
  if(f.name==='소')r.production+=' · 감자를 먹여도 야크처럼 털이 자라지는 않는다.';
  if(f.name==='멧돼지'&&/암컷/.test(r.nameKo)){r.production+=' · 도토리 달에 침엽수 근처에서 트러플을 찾는다.';r.event='truffle';r.relatedNames=['트러플','침엽수','어린 돼지'];}
 }
 const dogWork={테리어:'암컷이 양배추를 양배추 보관대로 운반한다. 수컷은 두더지굴을 부수려 한다.',바셋:'말린 밀을 밀 보관대로 운반한다.',닥스훈트:'감자를 감자 보관대로 운반한다.',휘핏:'토마토를 토마토 보관대로 운반한다.',리트리버:'건초를 건초 창고로 운반한다.',시바견:'말린 메밀을 메밀 보관대로 운반한다.',코기:'햄을 햄 보관대로 운반한다.',셸티:'양털을 양털 보관대로 운반한다.',셰퍼드:'치즈를 치즈 보관대로 운반한다.',포인터:'와인을 와인 보관대로 운반한다.',마스티프:'강한 사냥 파트너로 활용한다. 고기를 먹는다.',푸아트뱅:'여러 기술을 활용하는 사냥 파트너다. 고기를 먹는다.'};
 for(const r of DB.filter(x=>x.category==='개·반려동물 상태')){
  const f=Object.keys(dogWork).find(n=>r.nameKo.includes(n));if(!f)continue;
  const d=findRef(f);if(d)r.gameText=[{key:d.key,text:d.text}];
  const state=/어린/.test(r.nameKo)?'어린 개체를 성견으로 키운 뒤 사육장에서 사냥 파트너로 등록할 수 있다.':/늙은/.test(r.nameKo)?'늙은 개. 늙은 고양이의 두 번째 부탁에 필요한 개체이므로 해당 이벤트 중에는 남겨 둔다.':/수유/.test(r.nameKo)?'새끼에게 젖을 먹이는 개체. 새끼가 자랄 수 있도록 함께 둔다.':/임신/.test(r.nameKo)?'임신한 개체. 새끼를 돌볼 준비를 한다.':`${r.nameKo} 상태. 사냥에 데려가려면 사육장에서 파트너로 등록한다.`;
  r.effect=state;r.production=dogWork[f];r.relatedNames=['사육장','늙은 고양이'];r.sources=['game','animals'];
 }
 const get=n=>DB.find(r=>r.nameKo===n);
 const set=(n,obtain,actions,related,warning)=>{const r=get(n);if(r)recipe(r,obtain,actions,related,warning);};
 set('갓 벤 메밀','완전히 자란 메밀에 낫을 사용해 얻는다.',[['목장 바닥에 놓고 날짜 넘기기','말린 메밀','건조 일수 불명.']],['메밀','말린 메밀','벤 풀(소)'],'곡식이 목적이면 바닥에 두어 말린다. 낫 재사용 결과 불명.');
 set('갓 벤 밀','완전히 자란 밀을 낫으로 벤다.',[['바닥에 놓고 날짜 넘기기','말린 밀']],['밀','말린 밀']);
 set('말린 메밀','갓 벤 메밀을 목장 바닥에서 말린다.',[['항아리','메밀 씨앗 ×2'],['시장 교환','깔판 등','전체 교환 목록을 아래에서 확인한다.']],['갓 벤 메밀','메밀 씨앗','깔판']);
 set('말린 밀','갓 벤 밀을 목장 바닥에서 말린다.',[['항아리','밀 씨앗 ×2'],['시장 교환','어린 오리·어린 거위 등']],['갓 벤 밀','밀 씨앗','어린 오리','어린 거위']);
 set('벤 풀(소)','풀싹·어린 풀 등 작은 식물을 낫으로 베어 얻는다.',[['먹이로 배치','짧은 풀을 먹는 가축의 먹이'],['시장 교환','풀 씨앗']],['풀싹','어린 풀','풀 씨앗']);
 set('벤 풀','다 자란 풀·화초를 낫으로 베어 얻는다.',[['먹이로 배치','짧은 풀을 먹는 가축의 먹이'],['낫으로 잘게 베기','벤 풀(소)'],['시장 교환','목초 씨앗']],['풀','화초','벤 풀(소)','목초 씨앗']);
 set('벤 목초','목초꽃이 되기 전 목초를 낫으로 벤다.',[['바닥에 놓고 날짜 넘기기','건초']],['목초','목초꽃','건초']);
 set('건초','벤 목초를 바닥에 놓아 말린다.',[['먹이로 배치','겨울철 가축 먹이'],['시장 교환','어린 마멋 등']],['벤 목초','어린 마멋','건초 창고']);
 set('벤 유채','시든 유채꽃에 낫을 사용한다.',[['바닥에 놓고 날짜 넘기기','말린 유채']],['시든 유채꽃','말린 유채']);
 set('말린 유채','벤 유채를 바닥에서 말린다.',[['항아리','유채씨 ×2'],['시장 교환','유채기름']],['벤 유채','유채씨','유채기름']);
 set('유채기름','말린 유채를 시장에서 교환한다.',[['나포트 시장 교환','겨울꽃 팬지 씨앗 등']],['말린 유채','겨울꽃 팬지 씨앗']);
 set('발효 중인 와인','포도를 와인통 옆에 놓아 가공을 시작한 상태.',[['와인통 옆에서 기다리기','와인','발효가 끝날 때까지 주변에 둔다.']],['포도','와인통','와인']);
 set('와인','포도 → 와인통 옆에 두기 → 발효 중인 와인 → 완성.',[['시장 교환','어린 양 등']],['포도','와인통','발효 중인 와인','어린 양']);
 for(const [animal,raw,cheese] of [['염소','염소젖','치즈'],['야크','야크 우유','야크 치즈'],['소','우유','소젖 치즈']]){
  set(raw,`수유 중인 ${animal}에게 항아리를 사용한다.`,[['치즈 선반 곁에 놓고 기다리기',cheese,'숙성에 약 열흘.']],['수유 중인 '+animal,'치즈 선반',cheese,'카이'],'새끼가 자랄 때까지 젖을 남겨 둔다.');
  set(cheese,`${raw}를 치즈 선반 곁에 놓고 숙성시킨다.`,[['숙성 완료 후 시장 교환',cheese==='야크 치즈'?'어린 소':cheese==='소젖 치즈'?'어린 소·어린 마스티프 등':'어린 멧돼지·어린 페럿 등']],['치즈 선반',raw]);
 }
 set('숙성 전 치즈','젖을 치즈 선반 곁에 두어 가공을 시작한 미완성 상태.',[['치즈 선반 옆에 두고 기다리기','숙성된 치즈']],['치즈 선반','치즈','야크 치즈','소젖 치즈']);
 for(const [animal,food,product] of [['토끼','양배추','토끼털'],['양','수확 전 순무','양털'],['라마','토마토','라마 털'],['야크','감자','야크 털'],['알파카','호박','알파카 털'],['앙고라토끼','당근','앙고라토끼 털'],['오리','메밀 씨앗 또는 밀 씨앗','오리털']]){
  set(product,`${animal} 성체에게 ${food}를 먹여 털을 기른 뒤 가위로 깎는다.`,[['가위로 털 깎기',product],...(product==='양털'?[['목수 도구','털실']]:product==='앙고라토끼 털'?[['목수 도구','앙고라 울']]:[])],[food.replace('수확 전 ',''),`어린 ${animal}`,'헬렌',...(product==='양털'?['털실']:product==='앙고라토끼 털'?['앙고라 울']:[])],product==='야크 털'?'야크 모피와 다르다. 감자를 주어 기른 털을 가위로 얻는 생산물이다.':'');
 }
 set('털실','양털에 목수 도구를 사용해 가공한다.',[['시장 교환','어린 라마·어린 야크·어린 당나귀 등']],['양털','어린 라마','어린 야크','어린 당나귀']);
 set('앙고라 울','앙고라토끼 털에 목수 도구를 사용한다.',[['시장 교환','어린 앙고라토끼·어린 흰뺨검둥오리 등']],['앙고라토끼 털','어린 흰뺨검둥오리']);
 set('명주실','누에가 만든 고치를 항아리로 수확한다.',[['시장 교환','순무 씨앗·어린 염소·어린 멧돼지 등']],['고치','누에','누에알','순무 씨앗'],'Switch판은 항아리로 고치를 수확한다.');
 set('고치','누에가 큰 풀을 먹고 포도 달에 만든다.',[['항아리','명주실'],['수확하지 않고 기다리기','나방']],['누에','나방','명주실']);
 set('누에알','포도를 시장에 가져가 교환하거나 나방이 낳은 알을 얻는다.',[['풀 근처에 두고 민들레 달까지 기다리기','누에']],['누에','고치','포도']);
 set('누에','누에알이 민들레 달에 부화한다.',[['큰 풀 옆에 옮겨 주기','포도 달에 고치','누에는 스스로 이동하지 못한다.']],['누에알','풀','고치']);
 set('나방','고치를 수확하지 않고 남겨 둔다.',[['그대로 두기','누에알']],['고치','누에알']);
 for(const n of ['누에알','누에','고치','명주실','나방'])get(n).event='silk';
 for(const [raw,unfinished,product] of [['멧돼지고기','숙성 전 햄','햄'],['돼지고기','숙성 전 돼지햄','돼지햄']]){
  set(unfinished,`${raw}를 햄 건조함 곁에 두어 가공을 시작한 상태.`,[['건조함 옆에 두고 숙성 기다리기',product,'숙성에 약 열흘.']],['햄 건조함',raw,product]);
  set(product,`${raw} → 햄 건조함 곁 → ${unfinished} → ${product}.`,[['완성 후 시장 교환','씨앗·동물 등']],['햄 건조함',raw,unfinished]);
  const r=get(raw);if(r){r.actions=[{action:'햄 건조함 곁에 두고 기다리기',result:product,note:'고기를 건조함 곁에 배치한다.'}];r.relatedNames=[product,'햄 건조함'];}
 }
 set('소시지','멧돼지고기를 시장에서 교환해 얻는다.',[['시장 교환','새고기·토끼고기·어린 바셋·어린 리트리버 등']],['멧돼지고기','어린 바셋','어린 리트리버'],'햄처럼 건조함에 놓아 만드는 품목이 아니다.');
 set('돼지 소시지','돼지고기를 시장에서 교환해 얻는다.',[['시장 교환','유채씨·여러 고기 등']],['돼지고기','유채씨']);
 set('푸아그라','수거위에게 메밀 씨앗·밀 씨앗을 먹여 살찌운 뒤 시장에 가져간다.',[['살찐 수거위를 시장 교환','푸아그라']],['살찐 수거위','메밀 씨앗','밀 씨앗'],'완성된 푸아그라도 오래 두면 자투리 고기가 된다.');
 for(const [material,jam] of [['베리','베리잼'],['포도','포도잼'],['토마토','토마토잼'],['당근','당근잼'],['호박','호박잼']])set(jam,`방문한 클레어 곁에 ${material}를 둔다.`,[['클레어 곁에 원재료 배치',jam],['완성 후 저장고 보관','약 일 년 보관']],['클레어',material,'저장고','수상한 색 잼']);
 set('수상한 색 잼','잼을 너무 오래 보관해 변한 상태.',[['항아리로 수확','비료','PSP판 처리법.']],['베리잼','비료'],'정상적인 잼 교환용 재료로 남겨 두지 않는다.');
 set('꿀','꽃에서 꿀을 모은 벌이 벌통에 꿀을 모으면 항아리로 수확한다.',[['벌통에 꿀이 찬 뒤 항아리','꿀']],['벌','꿀을 모은 벌','벌통']);
 set('야크 모피','야크를 시장에 가져가 모피로 교환한다.',[['시장 교환','어린 멧돼지·어린 코기·와인 등']],['어린 야크','야크 털','와인'],'털을 깎아 얻는 야크 털과는 다른 품목이다.');
 set('페럿 모피','페럿을 시장에서 교환하거나 염소젖 교환으로 얻는다.',[['시장 교환','치즈 선반·어린 염소 등']],['어린 페럿','치즈 선반','염소젖']);
 set('자투리 고기','고기를 오래 두어 변한 자투리.',[['먹을 수 있는 동물에게 주기','먹이로 이용','대상 동물과 크기에 따른 차이를 확인한다.']],['샘슨','소고기']);
 set('채소 자투리','순무·양배추 등 채소를 수확할 때 남는 부분.',[['동물에게 배치','토끼 등 채소 자투리를 먹는 동물의 먹이']],['순무','양배추','어린 토끼']);
 set('모아 둔 알','타마미가 알을 모아 둔 알 창고에 항아리를 사용한다.',[['시장 교환','씨앗·시설·어린 닭 등']],['타마미','알 창고','어린 닭']);
 for(const n of ['닭 무정란','거위 무정란','흰뺨검둥오리 무정란'])set(n,'해당 암컷이 낳은 무정란.',[['시장 교환','씨앗·울타리 등']],['타마미','알 창고'],'무정란에서는 새끼가 태어나지 않는다. 부화용 알과 구별한다.');
 for(const n of ['새끼 다람쥐','어미 다람쥐']){
  const r=get(n);r.event='squirrel';r.effect=n==='새끼 다람쥐'?'포도 달에 찾아오는 길 잃은 새끼. 주워서 소지한 뒤 도토리 달에 어미와 만나게 한다.':'도토리 달 이후 새끼를 찾으러 오는 어미. 새끼 다람쥐를 붙여 두면 콩 씨앗을 받는 이벤트로 이어진다.';r.relatedNames=['새끼 다람쥐','어미 다람쥐','콩 씨앗'];r.sources=['game','animals','switch'];r.warning='고양이에게 먹힐 수 있다. 출현 확률 불명.';
 }
 get('트러플').event='truffle';get('트러플').obtain='도토리 달에 암컷 멧돼지를 침엽수 근처에 두면 찾아낸다.';
 get('트러플').effect='암컷 멧돼지가 찾아내는 생산물. 어린 돼지로 교환하는 중요한 시작 재료다.';
 const harvestedPotato=DB.find(x=>x.nameJa==='ジャガイモ');
 Object.assign(harvestedPotato,{effect:'항아리로 수확한 감자. 야크에게 먹이면 털을 기르는 데 쓰인다.',obtain:'다 자란 감자에 항아리를 사용한다.',production:'야크 → 감자 먹이기 → 털이 난 야크 → 가위 → 야크 털',relatedNames:['어린 야크','야크 털','씨감자'],sources:['game'],gameText:[{key:'TXT_ITBRAM:0025',text:ref.hints['TXT_ITBRAM:0025']}]});
 get('감자').production='수확한 감자를 야크에게 먹이면 털이 자란다.';
 for(const r of DB.filter(x=>x.nameKo.includes('집고양이'))){
  r.effect=/새끼/.test(r.nameKo)?'목장에 정착한 집고양이의 새끼. 수유 중인 어미 곁에서 자란다.':/임신/.test(r.nameKo)?'목장에 정착해 새끼를 밴 집고양이. 출산 후 어미와 새끼를 함께 둔다.':/수유/.test(r.nameKo)?'새끼에게 젖을 먹이는 집고양이. 새끼가 자랄 때까지 곁에 둔다.':/늙은/.test(r.nameKo)?'목장에 정착한 집고양이가 나이 든 상태. 방문객인 늙은 고양이의 부탁 이벤트와 구별한다.':/어린/.test(r.nameKo)?'어린 고양이를 비밀 청동상으로 길들인 뒤 목장에 정착한 상태.':'목장에 정착한 집고양이 성체. 암수를 함께 길러 새끼 집고양이로 이어 간다.';
  r.relatedNames=['비밀 청동상','어린 고양이','새끼 집고양이'];r.event='cat';r.sources=['game','switch'];
 }
 get('주인공').effect='목장을 운영하는 플레이어. 도구를 사용해 수확·가공·가축 돌보기를 하고 물물교환으로 목장을 넓힌다.';
 for(const n of ['어린 고양이','고양이','늙은 고양이','어린 집고양이','비밀 청동상']){const r=get(n);if(r){r.event='cat';r.sources=['game','animals','switch'];}}
 get('늙은 고양이').effect='늙은 닭 → 늙은 개 → 늙은 당나귀 순으로 부탁을 들어주면 비밀 청동상을 받는 보답 이벤트로 이어진다.';
 get('어린 고양이').effect='겨울꽃 팬지가 피면 방문할 수 있다. 관심거리가 있어야 목장에 머문다. 비밀 청동상은 집고양이로 길들이는 데 쓴다.';
 get('고양이').effect='관심거리가 있는 동안 머무는 야생 고양이. 계절별 관심거리를 준비하며 늙은 고양이 보답 이벤트로 이어 간다.';
 get('감자')?.relatedNames?.push('야크 털');
 // One resident profile is reused in the resident card, NPC DB entry and statue DB entry.
 for(const p of RESIDENTS){
  for(const r of DB.filter(x=>x.nameKo===p.name||x.nameKo===p.name+'상')){
   r.resident=p.name;r.obtain=p.unlock+' 후 방문·동상 이벤트 (PSP판 참고).';r.effect=p.effect;r.production=p.use;r.relatedNames=p.links.concat(p.name);r.sources=['game','residents'];
   if(p.quote)r.gameText=[{key:p.quote,text:ref.events[p.quote]}];
  }
 }
 for(const r of DB){
  const exchangeNames=exchanges.filter(e=>e.give===r.nameKo||e.get===r.nameKo).flatMap(e=>[e.give,e.get]).filter(n=>n!==r.nameKo);
  if(exchangeNames.length)r.relatedNames=[...new Set([...(r.relatedNames||[]),...exchangeNames])];
  if(r.disposal==='가공·교환 루트에 따라 보관/사용')r.disposal='상세 창의 실제 시장 교환 목록을 확인한 뒤 필요한 교환 재료로 남긴다.';
  r.aliases=[r.aliases==='—'?'':r.aliases,r.nameKo.replace(/\s+/g,'')].filter(Boolean).join(' / ');
  // Remaining game-specific diary entries still replace category-wide placeholders.
  if(/생산물 또는 재료/.test(r.effect)){
   const text=r.gameText?.[0];
   r.effect=text?flat(text.text):`${r.nameKo}의 가공 조건 불명. 사용처는 아래 시장 교환 목록 참고.`;
  }
  r.searchText=[r.obtain,r.production,r.food,r.milk,r.season,...(r.actions||[]).map(a=>a.action+' '+a.result),...(r.gameText||[]).map(x=>x.text)].filter(Boolean).join(' ');
 }
 for(const n of ['수상한 색 잼','소시지','돼지 소시지','모아 둔 알'])get(n).sources.push('products');
}
