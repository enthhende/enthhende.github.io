// Layout proposals use established production routes and separate vulnerable crops.
const FARM_LAYOUTS=[
 {id:'turnip',name:'순무 · 양',animal:'양',crop:'순무',field:'순무 씨앗 → 순무 싹 → 어린 순무',ready:'다 자란 순무',product:'양털',mode:'graze',
  good:'다 자란 순무 + 양',avoid:'씨앗·싹·어린 순무 + 방목 동물',
  protect:'순무밭을 따로 둘러 발아·성장 중의 작물을 보호한다. 양은 옆 가축칸에서 기른다.',
  use:'순무가 완성되면 양을 밭으로 옮긴다. 순무를 뽑지 않고 땅에 심긴 상태로 먹여야 털이 자란다.',
  reset:'털이 자란 양은 가축칸으로 돌려보내 가위로 깎는다. 다음 씨앗을 놓기 전에 순무밭에서 동물을 모두 빼낸다.',
  note:'PSP판 먹이표에는 양도 작물의 싹과 어린 풀을 먹는 것으로 정리되어 있다. 이 배치안은 완성된 순무부터 양을 합류시키는 방식이다.',
  links:['순무 씨앗','순무','갉아먹힌 순무','양털'],sources:['game','feeding','remake']},
 {id:'cabbage',name:'양배추 · 토끼',animal:'토끼',crop:'양배추',field:'씨앗 → 싹 → 어린 양배추',ready:'양배추 수확',product:'토끼털',mode:'deliver',
  good:'토끼 우리 + 수확한 양배추',avoid:'토끼 + 재배 중인 양배추밭',
  protect:'토끼 우리와 양배추밭을 분리한다. 토끼가 먹는 어린 풀·작물 싹을 밭 안에 그대로 노출하지 않는다.',
  use:'양배추가 완성되면 수확해서 토끼 우리로 가져간다. 양과 순무의 조합처럼 밭에 심긴 상태를 유지할 필요는 없다.',
  reset:'털이 자란 토끼를 가위로 깎는다. 양배추밭은 토끼를 들이지 않은 채 다음 재배를 시작한다.',
  note:'나비 대책도 별도로 필요하다. 꽃 화분을 양배추밭과 떨어뜨려 둔다.',
  links:['양배추 씨앗','양배추','토끼털','나비'],sources:['game','feeding']},
 {id:'potato',name:'감자 · 야크',animal:'야크',crop:'감자',field:'씨감자 → 싹 → 어린 감자 → 감자꽃',ready:'감자 수확',product:'야크 털',mode:'deliver',
  good:'야크 우리 + 수확한 감자',avoid:'야크·멧돼지·돼지 + 씨감자 보관칸',
  protect:'씨감자와 재배밭은 가축 우리 밖에 둔다. 야크를 감자밭에 풀어 놓아 씨감자를 먹이는 방식으로 시작하지 않는다.',
  use:'감자를 수확해 야크에게 먹인다. 털이 자라면 가위로 야크 털을 얻는다.',
  reset:'재파종용 씨감자는 먹이용 감자와 분리해 남긴다. 야크의 평소 먹이도 우리 안에 계속 준비한다.',
  note:'씨감자는 먹는 동물이 많다. 파종용 재고를 먹이 구역에 두지 않는다.',
  links:['씨감자','감자','야크 털'],sources:['game','feeding']},
 {id:'tomato',name:'토마토 · 라마',animal:'라마',crop:'토마토',field:'씨앗 → 싹 → 어린 토마토 → 풋토마토',ready:'빨갛게 익은 토마토 수확',product:'라마 털',mode:'deliver',
  good:'라마 우리 + 수확한 토마토',avoid:'가축 + 씨앗·풋토마토 재배 구역',
  protect:'토마토는 수확까지 보호칸에서 기른다. 풋토마토 단계에서 동물에게 맡기지 않는다.',
  use:'빨갛게 익은 토마토를 수확해 라마에게 먹인다. 털이 자란 뒤 가위로 깎는다.',
  reset:'재파종용 씨앗과 생산용 토마토를 따로 둔다. 밭을 유지한 채 수확물만 우리로 옮긴다.',
  note:'라마 우리와 토마토밭을 이웃하게 두면 수확물을 옮기는 동선이 짧아진다.',
  links:['토마토 씨앗','풋토마토','토마토','라마 털'],sources:['game']},
 {id:'pumpkin',name:'호박 · 알파카',animal:'알파카',crop:'호박',field:'씨앗 → 싹 → 어린 호박 → 호박꽃',ready:'호박 수확',product:'알파카 털',mode:'deliver',
  good:'알파카 우리 + 수확한 호박',avoid:'가축 + 호박 씨앗·성장 중인 밭',
  protect:'호박은 꽃이 진 뒤 수확 단계까지 보호칸에서 기른다. 호박꽃을 베어 정리하지 않는다.',
  use:'수확한 호박을 알파카에게 먹인다. 털이 자라면 가위로 알파카 털을 얻는다.',
  reset:'호박이 계속 공급될 만큼만 알파카를 기른다. 새 씨앗은 가축 우리와 떨어진 밭에 놓는다.',
  note:'양에게 순무를 먹일 때와 달리, 밭 안으로 알파카를 옮길 필요는 없다.',
  links:['호박 씨앗','호박꽃','호박','알파카 털'],sources:['game']},
 {id:'grape',name:'포도 · 와인',animal:'',crop:'포도',field:'포도 씨앗 → 싹 → 어린 포도 → 포도나무',ready:'포도 수확',product:'와인',mode:'process',
  good:'보호한 포도밭 + 바깥쪽 와인 가공칸',avoid:'포도밭·수확물 + 멧돼지·돼지·염소·당나귀 등',
  protect:'포도밭은 동물을 넣지 않는 재배 전용 구역으로 둔다. 씨앗과 어린 줄기뿐 아니라 수확한 포도도 보호한다.',
  use:'수확한 포도를 와인통 곁의 가공칸에 놓는다. 포도나무는 밭에 남겨 다음 수확을 준비한다.',
  reset:'수확 뒤 휴면 포도나무를 베어 없애지 않는다. 발효 중인 와인과 완성된 와인도 통행·먹이 구역에서 분리한다.',
  note:'포도는 자라는 데 오래 걸린다. 수확용 밭을 가축의 평소 먹이터로 겸용하지 않는 배치다.',
  links:['포도 씨앗','포도나무','포도','휴면 포도나무','와인통','와인'],sources:['game','feeding','remake']},
 {id:'truffle',name:'침엽수 · 멧돼지',animal:'멧돼지',crop:'침엽수',field:'어린 나무는 가축과 분리',ready:'목장에 있던 침엽수 · 도토리 달',product:'트러플',mode:'tree',
  good:'기존 침엽수 + 암컷 멧돼지',avoid:'멧돼지·돼지 + 다른 작물밭·새 파종 구역',
  protect:'처음부터 목장에 있던 침엽수를 남겨 둔다. 다른 작물밭과 나무 둘레를 울타리로 구분한다.',
  use:'도토리 달에 암컷 멧돼지를 침엽수 근처에 둔다. 주변에 먹이를 놓아 나무 근처에 머무르게 한다.',
  reset:'나무 주변의 트러플을 회수한다. 다른 밭까지 멧돼지가 돌아다니지 않도록 구획을 유지한다.',
  note:'트러플 생산은 암컷 멧돼지의 기능이다. 수컷만 배치하지 않는다.',
  links:['침엽수','암컷 멧돼지','트러플','어린 돼지'],sources:['game','switch']}
];
// Explicit planting states from the reviewed exact-ID sprites.
const FARM_PLANTINGS={
 turnip:{protect:[['순무 씨앗'],['순무 싹'],['어린 순무']],use:[['순무','standing']],reset:[['순무 씨앗'],['순무 싹']]},
 cabbage:{protect:[['양배추 씨앗'],['어린 양배추'],['양배추','standing']],use:[['양배추','standing']],reset:[['양배추 씨앗'],['양배추 싹']]},
 potato:{protect:[['씨감자'],['어린 감자'],['감자꽃']],use:[['감자꽃']],reset:[['씨감자'],['감자 싹']]},
 tomato:{protect:[['토마토 씨앗'],['어린 토마토'],['토마토','standing']],use:[['토마토','standing']],reset:[['토마토 씨앗'],['토마토 싹']]},
 pumpkin:{protect:[['호박 씨앗'],['어린 호박'],['호박','standing']],use:[['호박','standing']],reset:[['호박 씨앗'],['호박 싹']]},
 grape:{protect:[['포도 씨앗'],['어린 포도'],['포도나무']],use:[['포도','standing']],reset:[['휴면 포도나무']]},
 truffle:{protect:[['침엽수']],use:[['침엽수','','도토리 달']],reset:[['침엽수']]}
};
function layoutPlanting(plan,stage){
 const plants=FARM_PLANTINGS[plan.id][stage].map(([name,kind='',caption=''])=>{
  const item=DB.find(x=>x.nameKo===name);
  const variant=caption?window.HAKO_SPRITES.variants?.[item?.id]?.find(x=>x.caption===caption):null;
  return {name,sprite:variant?.sprite||(item?guideSpriteFor(item,kind):null)};
 });
 const count=plan.mode==='tree'?2:6;
 return `<div class="layout-planting ${plan.mode==='tree'?'trees':''}" role="img" aria-label="${esc(plants.map(x=>x.name).join(' · '))} 재배 모습">${Array.from({length:count},(_,i)=>{const plant=plants[i%plants.length];return `<span class="layout-plant" title="${esc(plant.name)}">${guidePixel(plant.sprite)}</span>`}).join('')}</div>`;
}
let layoutCurrent='turnip',layoutStage='protect';
function renderFarmLayout(){
 const plan=FARM_LAYOUTS.find(x=>x.id===layoutCurrent);
 const stage=layoutStage;
 document.querySelector('#layoutTabs').innerHTML=FARM_LAYOUTS.map(x=>`<button type="button" class="${x.id===plan.id?'active':''}" data-layout="${x.id}" aria-pressed="${x.id===plan.id}">${esc(x.name)}</button>`).join('');
 document.querySelector('#layoutStages').innerHTML=[['protect','1. 발아·성장'],['use','2. 생산'],['reset','3. 다음 재배']].map(([id,label])=>`<button type="button" class="${id===stage?'active':''}" data-layout-stage="${id}" aria-pressed="${id===stage}">${label}</button>`).join('');
 const grazing=stage==='use'&&(plan.mode==='graze'||plan.mode==='tree');
 const crop=DB.find(x=>x.nameKo===plan.crop);
 const harvestSprite=crop&&stage==='use'&&(plan.mode==='deliver'||plan.mode==='process')?guideSpriteFor(crop,'harvested'):null;
 const animalSprite=GUIDE_ANIMAL_PIXELS[plan.animal];
 const left=grazing?`${plan.ready} + ${plan.animal}`:stage==='use'?plan.ready:plan.field;
 const right=plan.mode==='process'?'와인통 · 포도 · 와인':`${plan.animal} 우리`;
 const action=stage==='protect'?plan.protect:stage==='use'?plan.use:plan.reset;
 const caption=stage==='use'?(grazing?'동물을 다 자란 작물·나무 쪽으로 옮기기':plan.mode==='process'?'수확한 포도만 가공칸으로 옮기기':'수확물만 가축 우리로 옮기기'):'울타리는 고정하고 재배칸을 보호하기';
 document.querySelector('#layoutDetail').innerHTML=`<div class="layout-title"><div><p class="eyebrow">공략 추천 배치</p><h3>${esc(plan.name)}</h3></div><span>${esc(plan.product)} 생산</span></div>
 <div class="layout-diagram" aria-label="${esc(plan.name)} 구역 배치 예시"><div class="layout-pen ${grazing?'shared':''}"><strong>${plan.mode==='tree'?'나무 구역':'작물 보호칸'}</strong><div class="layout-field-scene">${layoutPlanting(plan,stage)}${grazing?`<div class="layout-grazing">${guidePixel(animalSprite)}</div>`:''}</div><p>${esc(left)}</p><small>${grazing?'생산할 때만 합류':'재배 중 동물 분리'}</small></div><div class="layout-path"><span>작업 통로</span><b>${stage==='use'?(grazing?'←':'→'):'│'}</b></div><div class="layout-pen animal"><strong>${plan.mode==='process'?'가공칸':'가축칸'}</strong><div class="layout-dots">${!grazing?guidePixel(animalSprite):''}${guidePixel(harvestSprite)}${plan.mode==='process'?guidePixel(window.HAKO_SPRITES.items[DB.find(x=>x.nameKo==='와인통')?.id]):''}</div><p>${esc(right)}</p><small>${plan.mode==='process'?'포도를 와인통 곁에 놓기':'평소 먹이 · 돌보기 공간'}</small></div></div>
 <div class="layout-action"><strong>${esc(caption)}</strong><p>${esc(action)}</p></div><div class="layout-pairs"><div><strong>생산 단계에서 함께 둘 조합</strong><p>${esc(plan.good)}</p></div><div><strong>분리할 조합</strong><p>${esc(plan.avoid)}</p></div></div><p class="layout-note">${esc(plan.note)}</p><div class="related-links">${guideRelated(plan.links)}</div><details class="event-source"><summary>배치 기준·참고 자료</summary><p>먹이와 생산 조건을 바탕으로 만든 추천 배치입니다. 배치도는 구역 구성 예시이며 실제 목장의 칸 수·통행 범위를 뜻하지 않습니다.</p><div class="evidence-sources">${guideSources(plan.sources)}</div></details>`;
}
document.querySelector('#farm-layout').addEventListener('click',e=>{
 const tab=e.target.closest('[data-layout]'),stage=e.target.closest('[data-layout-stage]');
 if(tab){layoutCurrent=tab.dataset.layout;layoutStage='protect';renderFarmLayout();}
 else if(stage){layoutStage=stage.dataset.layoutStage;renderFarmLayout();}
});
renderFarmLayout();
