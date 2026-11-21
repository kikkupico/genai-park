"""Make web-sized copies of a render: python3 export_web.py renders/park_2560x1440.png"""
import sys,os
from PIL import Image
src=sys.argv[1];im=Image.open(src).convert('RGB');base=os.path.splitext(src)[0]
for w,q in ((2560,80),(1600,80)):
    r=im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
    for ext,kw in (('webp',dict(quality=q,method=6)),('jpg',dict(quality=q,optimize=True,progressive=True))):
        out=f'{base}_{w}.{ext}';r.save(out,**kw);print(out,os.path.getsize(out)//1024,'KB')
