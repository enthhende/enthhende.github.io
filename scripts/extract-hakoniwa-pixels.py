"""Extract verified Switch sprites through exact item/resource/animation mappings.
Requires UnityPy and Pillow; pass the read-only translation-project root.
"""
import csv, hashlib, json, re, struct, sys
from collections import defaultdict
from pathlib import Path
import UnityPy
from PIL import Image, ImageDraw
from UnityPy.enums import TextureFormat
from UnityPy.export.Texture2DConverter import parse_image_data
from UnityPy.helpers import TextureSwizzler as swizzle
ROOT=Path(__file__).resolve().parents[1]
SOURCE=Path(sys.argv[1]);GUIDE=ROOT/'games/hakoniwa/guide';ASSETS=GUIDE/'assets';OUT=ASSETS/'pixels'
DATA=SOURCE/'10_extract/romfs_v1_3/Data';SETUP=DATA/'StreamingAssets/DAT/_Export/rule/SPC_SETUP'
ib=(SETUP/'ITEMDATA.DAT').read_bytes();rb=(SETUP/'ITEMRES.DAT').read_bytes()
db=json.loads(re.search(r'id="dbData">(.*?)</script>',(GUIDE/'index.html').read_text(),re.S)[1])
names={r['id']:r for r in db};by_name={r['nameKo']:r['id'] for r in db}
def u16(b,p):return struct.unpack_from('<H',b,p)[0]
def u32(b,p):return struct.unpack_from('<I',b,p)[0]
def offsets(b,base):return [base+x for x in struct.unpack_from('<'+'I'*u32(b,base),b,base+4)]
def aligned_string(b,p):
 n=u32(b,p);assert n<4096
 return b[p+4:p+4+n].decode(),(p+4+n+3)&~3
def read_sheet(obj):
 b=obj.get_raw_data();name,p=aligned_string(b,28);magic,p=aligned_string(b,p);filename,p=aligned_string(b,p)
 if magic!='WGET':return None
 nf,na,_,count=struct.unpack_from('<4I',b,p);p+=16;assert count==nf
 frames={}
 for _ in range(count):
  key,p=aligned_string(b,p);w,h,x,y,right,bottom,px,py=struct.unpack_from('<8i',b,p);p+=32
  assert right-x==w and bottom-y==h and w>0 and h>0
  frames[key]=[x,y,right,bottom]
 count=u32(b,p);p+=4;assert count==na;animations={}
 for _ in range(count):
  key,p=aligned_string(b,p);_,n,length=struct.unpack_from('<3I',b,p);p+=12;assert n==length;keys=[]
  for _ in range(length):
   index=u32(b,p);p+=4;frame,p=aligned_string(b,p);values=struct.unpack_from('<5I',b,p);p+=20
   assert frame in frames;keys.append(frame)
  p+=4;animations[key]=keys
 assert p+4==len(b)
 return name,dict(frames=frames,animations=animations,objectId=obj.path_id)
env=UnityPy.load(str(DATA/'sharedassets1.assets'));sheets={};textures={}
for obj in env.objects:
 if obj.type.name=='Texture2D':
  d=obj.read();textures[d.m_Name]=(obj,d)
 elif obj.type.name=='MonoBehaviour':
  try:
   value=read_sheet(obj)
   if value:sheets[value[0]]=value[1]
  except (AssertionError,ValueError,UnicodeError,struct.error):pass
# Native action order, not a guessed atlas frame.
actions=re.findall(r'\[\s*"([^"]+)"\s*,\s*"([^"]+)"\s*\]',(SETUP/'SPC_ITRES.DAT').read_text())
res=offsets(rb,u32(rb,0));strings=[rb[p:rb.index(0,p)].decode() for p in offsets(rb,u32(rb,4))]
records=defaultdict(list)
for group in offsets(ib,u32(ib,4)):
 native=u16(ib,group+4)
 for state in range(u16(ib,group+10)):
  p=group+12+state*60;item_id=f'item-{u16(ib,p):04d}';ri=u16(ib,p+16)
  if item_id not in names or ri>=len(res):continue
  r=res[ri];tx=u16(rb,r+26)
  if tx>=len(strings):continue
  texture=strings[tx];idle=offsets(rb,r+28)[0]
  if not u32(rb,idle):continue
  action=u32(rb,idle+4)
  if action>=len(actions):continue
  records[item_id].append(dict(itemId=item_id,name=names[item_id]['nameKo'],nativeId=native,state=state,itemOffset=p,resourceIndex=ri,resourceOffset=r,texture=texture,palette=ib[p+19],animation=actions[action][1],upAnimation=actions[action][0]))
decoded={}
def decode(name):
 if name in decoded:return decoded[name]
 obj,d=textures[name];fmt=TextureFormat(d.m_TextureFormat)
 assert obj.platform==38 and d.m_PlatformBlob
 # GOB height one is still block-linear; UnityPy currently skips it.
 gob=swizzle.get_switch_gobs_per_block(d.m_PlatformBlob);block=swizzle.TEXTURE_FORMAT_BLOCK_SIZE_MAP[fmt]
 w,h=swizzle.get_padded_texture_size(d.m_Width,d.m_Height,*block,gob)
 linear=swizzle.deswizzle(d.get_image_data(),w,h,*block,gob)
 im=parse_image_data(linear,w,h,fmt,obj.version,0,flip=False)
 im=im.crop((0,0,d.m_Width,d.m_Height)).transpose(Image.Transpose.FLIP_TOP_BOTTOM)
 decoded[name]=im;return im
proofs=[]
def save(slug,record,up=False):
 sheet=sheets[record['texture']];animation=record['upAnimation'] if up else record['animation']
 frame=sheet['animations'][animation][0];rect=sheet['frames'][frame];tex=f"{record['texture']}_{record['palette']}"
 image=decode(tex);x,y,right,bottom=rect
 assert 0<=x<right<=image.width and 0<=y<bottom<=image.height
 cropped=image.crop(rect);assert cropped.getbbox()
 canvas=Image.new('RGBA',(cropped.width+8,cropped.height+8));canvas.paste(cropped,(4,4))
 canvas.save(OUT/f'{slug}.png',optimize=True)
 proofs.append(dict(record,file=f'pixels/{slug}.png',textureObjectId=textures[tex][0].path_id,textureName=tex,animation=animation,frameName=frame,crop=rect,sheetObjectId=sheet['objectId'],padding=4,outputSha256=hashlib.sha256((OUT/f'{slug}.png').read_bytes()).hexdigest()))
 return slug
def explicit(slug,name,native=None,up=False):
 candidates=records[by_name[name]]
 if native is not None:candidates=[r for r in candidates if r['nativeId']==native]
 assert candidates,(slug,name)
 return save(slug,candidates[0],up)
if '--review-only' in sys.argv:
 # A separate human review catalog. Never change production mappings/assets.
 review_root=ROOT/'games/hakoniwa/sprite-review'
 OUT=review_root/'assets/pixels';OUT.mkdir(parents=True,exist_ok=True)
 used=json.loads((ASSETS/'provenance.json').read_text())['assets']
 used_hashes={p.get('outputSha256') for p in used}
 groups=defaultdict(list)
 for item_id,rows in records.items():
  for row in rows:groups[(row['texture'],row['palette'],row['animation'])].append(row)
 catalog={};unresolved=[]
 for key,rows in sorted(groups.items()):
  slug='review-'+hashlib.sha256(json.dumps(key).encode()).hexdigest()[:16]
  try:save(slug,rows[0])
  except (KeyError,AssertionError,IndexError) as error:
   unresolved.append(dict(texture=key[0],palette=key[1],animation=key[2],reason=type(error).__name__));continue
  proof=proofs[-1];sha=proof['outputSha256']
  if sha not in catalog:
   catalog[sha]=dict(id='dot-'+sha[:16],sha256=sha,image='assets/'+proof['file'],used=sha in used_hashes,candidates=[])
  entry=catalog[sha]
  for row in rows:
   candidate=dict(itemId=row['itemId'],name=row['name'],category=names[row['itemId']]['category'],nativeId=row['nativeId'],state=row['state'])
   if candidate not in entry['candidates']:entry['candidates'].append(candidate)
  if entry['image']!='assets/'+proof['file']:
   (OUT/f'{slug}.png').unlink()
   proof['file']=entry['image'].removeprefix('assets/')
 entries=sorted(catalog.values(),key=lambda r:(r['used'],r['candidates'][0]['itemId'],r['id']))
 payload=dict(version=1,catalogId=hashlib.sha256(''.join(sorted(catalog)).encode()).hexdigest(),entries=entries)
 (review_root/'catalog.js').write_text('window.SPRITE_CATALOG = '+json.dumps(payload,ensure_ascii=False,indent=2)+';\n')
 (review_root/'asset-proof.json').write_text(json.dumps(dict(assets=proofs,unresolved=unresolved),ensure_ascii=False,indent=2)+'\n')
 keep={Path(r['image']).name for r in entries}
 for f in OUT.glob('*.png'):
  if f.name not in keep:f.unlink()
 print(f'Review catalog: {len(entries)} unique transparent sprites; {sum(not r["used"] for r in entries)} not in guide; {len(unresolved)} unresolved resources. Production guide unchanged.')
 sys.exit(0)
categories={
 'all':explicit('category-all','타네미',up=True),
 'crops':explicit('category-crops','양배추',native=55),
 'livestock':explicit('category-livestock','털 난 암양'),
 'dogs':explicit('category-dogs','수컷 테리어'),
 'products':explicit('category-products','우유'),
 'furniture':explicit('category-furniture','씨앗 창고'),
 'brammy':explicit('category-brammy','시자미',up=True),
 'hunt':explicit('category-hunt','수컷 멧돼지'),
 'wild':explicit('category-wild','활엽수'),
 'people':explicit('category-people','클레어'),
 'materials':explicit('category-materials','통나무')}
seasons={k:explicit('season-'+k,n,native) for k,n,native in [('spring','민들레',125),('summer','포도',1090),('autumn','밤',1030),('winter','눈사람',2300)]}
decoration={k:explicit(k,n,native,up) for k,n,native,up in [('grass','풀',15,False),('marmot','수컷 마멋',None,False),('cabbage','양배추',55,False),('rabbit','수컷 토끼',None,False),('brammy','타네미',None,True),('flowers','민들레',125,False),('sheep','털 난 암양',None,False)]}
residents={n:explicit('resident-'+by_name[n][5:],n) for n in ['클레어','카이','마샤','레이먼드','헬렌','샘슨','모건','소피아','메릴']}
# Only exact, unambiguous IDs enter item cards. Animal-state art remains off
# until individually reviewed. Mixed standing/harvested crop records are omitted.
eligible={'작물·식물','축산·가공·재료','야생·자연','목장 설비·보관','재료·울타리','주민상·특수','인물·기타','브라미족','인물·브라미'}
mapping={};omitted={}
for item_id,item in names.items():
 if item['category'] not in eligible:continue
 candidates=records[item_id];signatures={(r['texture'],r['palette'],r['animation']) for r in candidates}
 if len(signatures)!=1:
  omitted[item_id]='No unique resource/palette/idle mapping';continue
 try:mapping[item_id]=save(item_id,candidates[0])
 except (KeyError,AssertionError,IndexError):omitted[item_id]='Unresolved animation/texture/frame'
families={n:explicit('overview-'+by_name[r][5:],r) for n,r in [('마멋','수컷 마멋'),('토끼','수컷 토끼'),('양','털 난 암양'),('야크','수컷 야크'),('라마','수컷 라마'),('알파카','수컷 알파카'),('멧돼지','암컷 멧돼지')]}
payload=dict(items=mapping,categories=categories,seasons=seasons,residents=residents,families=families,decoration=decoration)
(GUIDE/'sprite-map.js').write_text('// Exact-ID sprite map. No family fallback.\nwindow.HAKO_SPRITES = '+json.dumps(payload,ensure_ascii=False,indent=2)+';\n')
manifest=json.loads((ASSETS/'provenance.json').read_text());manifest['assets']=[r for r in manifest['assets'] if r['file'] in ['title-ko.png','pasture.png']]+proofs
manifest['omittedItemSprites']=omitted;manifest['mappingSources']={n:hashlib.sha256((SETUP/n).read_bytes()).hexdigest() for n in ['ITEMDATA.DAT','ITEMRES.DAT','SPC_ITRES.DAT']}
manifest['note']='Exact item ID -> native state -> resource -> palette -> idle animation -> WGET rectangle. All Switch GOB heights explicitly deswizzled.'
(ASSETS/'provenance.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
keep={Path(p['file']).name for p in proofs}
for f in OUT.glob('*.png'):
 if f.name not in keep:f.unlink()
review=Path('/tmp/hako-verified-sprites');review.mkdir(exist_ok=True)
for page in range(0,len(proofs),60):
 sheet=Image.new('RGB',(1200,900),'#fff8e8');draw=ImageDraw.Draw(sheet)
 for j,p in enumerate(proofs[page:page+60]):
  x=j%10*120;y=j//10*150;im=Image.open(ASSETS/p['file']);im.thumbnail((104,106),Image.Resampling.NEAREST);sheet.paste(im,(x+(120-im.width)//2,y+30),im)
  draw.text((x+4,y+4),Path(p['file']).stem,fill='#444');draw.text((x+4,y+132),p['textureName'][:18],fill='#666')
 sheet.save(review/f'page-{page//60}.png')
print(f'Exact sprites: {len(mapping)} cards; {len(omitted)} omitted. Review: {review}')
approved_review=ROOT/'scripts/data/hakoniwa-sprite-review.json'
if approved_review.exists():
 import subprocess
 subprocess.run([sys.executable,str(ROOT/'scripts/apply-hakoniwa-sprite-review.py')],check=True)
