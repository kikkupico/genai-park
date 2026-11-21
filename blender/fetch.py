"""Download CC0 assets from Poly Haven (https://polyhaven.com) for the park scene.
Models: .blend at 1k with their texture includes. Ground/wood textures: individual maps at 2k. HDRI: 4k .hdr.
Usage: python3 fetch.py [--dry]"""
import json,os,sys,urllib.request
UA={'User-Agent':'genai-park-scene-builder'}
MODELS=['island_tree_01','island_tree_02','island_tree_03','jacaranda_tree','tree_small_02',
 'shrub_01','shrub_02','shrub_03','shrub_04','grass_medium_01','grass_medium_02','grass_bermuda_01',
 'fern_02','dandelion_01','celandine_01','periwinkle_plant','nettle_plant',
 'boulder_01','rock_moss_set_01','tree_stump_01','painted_wooden_bench','street_lamp_01']
TEXTURES={'park_dirt':'2k','leafy_grass':'2k','weathered_brown_planks':'1k','grass_path_2':'2k'}
MAPS=['Diffuse','nor_gl','Rough','Displacement']
HDRIS={'qwantani_late_afternoon_puresky':'4k','kloofendal_misty_morning_puresky':'2k','qwantani_dusk_2_puresky':'2k',
       'qwantani_sunset_puresky':'2k','qwantani_night_puresky':'2k'}
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'assets')
CAP=3_000_000_000
def api(p): return json.load(urllib.request.urlopen(urllib.request.Request('https://api.polyhaven.com/'+p,headers=UA)))
plan=[]  # (url, local path, size)
for m in MODELS:
    f=api('files/'+m)['blend']['1k']['blend'];d=os.path.join(ROOT,'models',m)
    plan.append((f['url'],os.path.join(d,os.path.basename(f['url'])),f['size']))
    for rel,inc in f.get('include',{}).items(): plan.append((inc['url'],os.path.join(d,rel),inc['size']))
for t,res in TEXTURES.items():
    f=api('files/'+t)
    for mp in MAPS:
        if mp not in f: continue
        fmt='jpg' if 'jpg' in f[mp][res] else ('png' if 'png' in f[mp][res] else list(f[mp][res])[0])
        e=f[mp][res][fmt];plan.append((e['url'],os.path.join(ROOT,'textures',t,os.path.basename(e['url'])),e['size']))
for h,res in HDRIS.items():
    e=api('files/'+h)['hdri'][res]['hdr'];plan.append((e['url'],os.path.join(ROOT,'hdri',os.path.basename(e['url'])),e['size']))
total=sum(s for *_,s in plan);print(f'{len(plan)} files, {total/1e6:.0f} MB')
assert total<CAP,'over the size cap'
if '--dry' in sys.argv: sys.exit()
for url,path,size in plan:
    if os.path.exists(path) and os.path.getsize(path)==size: continue
    os.makedirs(os.path.dirname(path),exist_ok=True)
    with urllib.request.urlopen(urllib.request.Request(url,headers=UA)) as r,open(path,'wb') as o: o.write(r.read())
    print('got',os.path.relpath(path,ROOT))
man={'source':'Poly Haven, https://polyhaven.com','license':'CC0 1.0','models':MODELS,'textures':list(TEXTURES),'hdris':list(HDRIS),
     'urls':['https://polyhaven.com/a/'+a for a in MODELS+list(TEXTURES)+list(HDRIS)]}
json.dump(man,open(os.path.join(os.path.dirname(ROOT),'assets.json'),'w'),indent=1);print('done')
