import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const base=fileURLToPath(new URL('../games/hakoniwa/guide/',import.meta.url));
const html=fs.readFileSync(base+'index.html','utf8');
const context={window:{},console};vm.createContext(context);
for(const file of ['game-reference.js','guide-knowledge.js','sprite-map.js','guide-graphics.js'])vm.runInContext(fs.readFileSync(base+file,'utf8'),context,{filename:file});
for(const id of ['dbData','cropFlowData','livestockData','exchangeData']){
 context[id]=JSON.parse(html.match(new RegExp(`<script type="application/json" id="${id}">([\\s\\S]*?)</script>`))[1]);
}
const canonical=context.window.HAKO_REFERENCE.itemNames;
assert.equal(context.dbData.length,637);
assert.equal(new Set(context.dbData.map(x=>x.id)).size,637);
for(const item of context.dbData.filter(x=>x.id.startsWith('item-')))assert.equal(item.nameKo,canonical['TXT_ITNAME:'+item.id.slice(5)],item.id+' canonical Korean name');
vm.runInContext('enrichGuideData(dbData,cropFlowData,livestockData,exchangeData)',context);
const db=context.dbData;
const get=name=>db.find(x=>x.nameKo===name);
assert.match(get('야크 털').obtain,/감자.*가위/);
assert.match(get('수컷 야크').production,/감자.*가위.*야크 털/);
assert.match(get('양털').obtain,/수확 전 순무/);
assert.match(get('수소').production,/감자.*털이 자라지는 않는다/);
assert.equal(get('갓 벤 메밀').actions[0].result,'말린 메밀');
assert.equal(get('말린 메밀').actions.find(a=>a.action==='항아리').result,'메밀 씨앗 ×2');
assert.match(get('명주실').obtain,/항아리/);
assert.equal(get('새끼 다람쥐').event,'squirrel');
assert.match(get('늙은 고양이').effect,/늙은 닭 → 늙은 개 → 늙은 당나귀/);
assert.equal(get('카이').effect,get('카이상').effect);
assert.match(get('카이').effect,/새끼.*남기/);
assert.equal(get('헬렌').effect,get('헬렌상').effect);
assert.match(get('앙고라토끼 털').obtain,/당근.*가위/);
for(const r of db.filter(x=>x.category==='축산·가공·재료')){
 assert(!r.effect.includes('가축이나 가공을 통해 얻는 생산물'),r.nameKo+' generic product placeholder');
 assert(r.obtain||r.gameText.length,r.nameKo+' missing individual information');
}
assert.equal(vm.runInContext('RESIDENTS.length',context),9);
assert.equal(vm.runInContext('GUIDE_EVENTS.length',context),4);
for(const name of ['GUIDE_EVENTS','RESIDENTS']){
 const rows=vm.runInContext(name,context);
 for(const row of rows)for(const link of row.links)assert(db.some(x=>x.nameKo===link),`${name}: unresolved ${link}`);
}
for(const script of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)])new vm.Script(script[1]);
for(const file of ['guide-enhancements.js','guide-knowledge.js','guide-graphics.js','guide-layout.js'])new vm.Script(fs.readFileSync(base+file,'utf8'));
const assets=JSON.parse(fs.readFileSync(base+'assets/provenance.json','utf8'));
for(const asset of assets.assets)assert(fs.existsSync(base+'assets/'+asset.file));
const sprites=context.window.HAKO_SPRITES;
const proof=slug=>assets.assets.find(a=>a.file===`pixels/${slug}.png`);
assert.equal(proof(sprites.items['item-0400']).textureName,'CRO_124A_0','fresh buckwheat must not use wheat');
assert.equal(proof(sprites.items['item-0402']).textureName,'CRO_123A_0');
assert.equal(proof(sprites.items['item-0401']).textureName,'CRO_124A_1');
assert.equal(proof(sprites.categories.materials).textureName,'GRD_200A_0');
assert.equal(proof(sprites.categories.furniture).textureName,'GRD_270A_0');
assert.equal(proof(sprites.categories.wild).textureName,'PLN_017A_0');
assert.equal(proof(sprites.categories.products).crop.join(','),'0,0,64,64');
assert.equal(proof(sprites.categories.crops).crop.join(','),'0,0,64,48');
assert.equal(proof(sprites.categories.all).itemId,'item-0615');
assert.notEqual(sprites.items['item-0605'],sprites.items['item-0626'],'resident statue must not reuse NPC art');
assert.equal(proof(sprites.items['item-0605']).textureName,'FIG_450A_0');
assert.equal(proof(sprites.items['item-0626']).textureName,'ACT_550A_0');
for(const [id,slug] of Object.entries(sprites.items)){
 assert(proof(slug),id+' missing sprite proof');
 assert(assets.itemSpriteBindings[id].some(b=>b.sha256===proof(slug).outputSha256&&b.candidates.every(c=>c.itemId===id)),id+' missing exact native binding');
}
assert.equal(Object.keys(sprites.items).length,633);
const catalogContext={window:{}};vm.createContext(catalogContext);
vm.runInContext(fs.readFileSync(base+'../sprite-review/catalog.js','utf8'),catalogContext);
for(const e of catalogContext.window.SPRITE_CATALOG.entries)for(const c of e.candidates){
 assert(assets.itemSpriteBindings[c.itemId].some(b=>b.reviewId===e.id&&b.sha256===e.sha256&&b.candidates.some(x=>x.nativeId===c.nativeId&&x.state===c.state)),e.id+' lost candidate link');
}
const human=JSON.parse(fs.readFileSync(new URL('./data/hakoniwa-sprite-review.json',import.meta.url),'utf8'));
assert.equal(human.entries.length,61);
for(const e of human.entries)for(const c of e.candidates)assert(assets.itemSpriteBindings[c.itemId].some(b=>b.reviewId===e.id&&b.humanReviewed),e.id+' lost human review');
assert(vm.runInContext('guideSpriteFor({id:"item-0199",nameKo:"수컷 야크"})',context));
assert.equal(vm.runInContext('guideSpriteFor({id:"unknown",family:"야크",nameKo:"수컷 야크"})',context),null,'no family/name fallback');
assert.equal(sprites.variants['item-0100'].map(v=>v.caption).join(','),'수확 전,수확 후');
assert.notEqual(vm.runInContext('guideSpriteFor({id:"item-0015"},"standing")',context),vm.runInContext('guideSpriteFor({id:"item-0015"},"harvested")',context));
assert.equal(sprites.variants['item-0085'].length,4);
assert.equal(proof(sprites.seasons.spring).textureName,'PLN_012A_0');
assert.equal(proof(sprites.seasons.summer).textureName,'CRO_109A_0');
assert.equal(proof(sprites.seasons.autumn).textureName,'CRO_103A_0');
assert.equal(proof(sprites.seasons.winter).textureName,'GRD_230A_0');
assert(html.includes('id="farm-layout"'));
console.log('PASS: canonical names, production routes, 633 exact sprite bindings, 61 human reviews, all native candidates, crop/season variants, correct category sprites and layout syntax.');
