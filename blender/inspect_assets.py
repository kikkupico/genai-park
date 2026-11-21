import bpy,glob,os
root=os.path.join(os.path.dirname(bpy.data.filepath) if bpy.data.filepath else os.getcwd(),'assets','models')
for f in sorted(glob.glob(os.path.join(root,'*','*.blend'))):
    with bpy.data.libraries.load(f,link=False) as (src,dst): dst.objects=src.objects; dst.collections=src.collections
    objs=[o for o in dst.objects if o]
    dims=[(o.name,o.type,tuple(round(v,2) for v in o.dimensions),len(o.data.polygons) if o.type=='MESH' else 0) for o in objs]
    print('##',os.path.basename(f),'| colls:',[c.name for c in dst.collections if c])
    for d in dims[:8]: print('   ',d)
    if len(dims)>8: print('    ...',len(dims))
    for o in objs: bpy.data.objects.remove(o)
