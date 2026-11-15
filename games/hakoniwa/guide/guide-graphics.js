// Only exact, statically traced mappings from sprite-map.js are rendered.
const GUIDE_ANIMAL_PIXELS=window.HAKO_SPRITES.families;
const GUIDE_RESIDENT_PIXELS=window.HAKO_SPRITES.residents;
function guidePixel(slug,cls=''){
 if(!slug)return '';
 return `<img class="game-pixel ${cls}" src="assets/pixels/${slug}.png" width="64" height="64" alt="" loading="lazy">`;
}
function guideSpriteFor(r,kind=''){
 if(kind){const variant=window.HAKO_SPRITES.variants?.[r.id]?.find(x=>x.kind===kind);if(variant)return variant.sprite;}
 return window.HAKO_SPRITES.items[r.id]||null;
}
function guideSpriteGallery(r){
 const variants=window.HAKO_SPRITES.variants?.[r.id]||[];
 if(variants.length>1)return `<div class="sprite-variants" aria-label="${esc(r.nameKo)}의 상태별 모습">${variants.map(v=>`<figure>${guidePixel(v.sprite)}<figcaption>${esc(v.caption||r.nameKo)}</figcaption></figure>`).join('')}</div>`;
 const sprite=guideSpriteFor(r);
 return sprite?`<div class="detail-pixel">${guidePixel(sprite)}${variants[0]?.caption?`<span>${esc(variants[0].caption)}</span>`:''}</div>`:'';
}
function guideCategoryPixel(id){
 return guidePixel(window.HAKO_SPRITES.categories[id]);
}
