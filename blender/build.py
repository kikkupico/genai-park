"""Build the GenAI Park scene from Poly Haven assets (see assets.json) and save park.blend.

Run:  blender -b --factory-startup -P build.py -- [--preview] [--render out.png] [--res 960x540] [--samples 32]

The scene: a gate at the start of a worn dirt path through a meadow. The path forks
into three branches of decreasing width, the site's "blaze": three ways forward,
worn in proportion to how often they are taken.
"""
import bpy, bmesh, os, re, sys, math, glob, time
import numpy as np
from mathutils import Vector, Euler

HERE = os.path.dirname(os.path.abspath(__file__))
A = os.path.join(HERE, 'assets')
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
def arg(name, default=None):
    return argv[argv.index(name) + 1] if name in argv else default
RNG = np.random.default_rng(7)

# ---------------------------------------------------------------- looks
# sky: HDRI strength; sun: lamp energy; mist: (start m, depth m, colour, amount); paint: Kuwahara size at 2560 px;
# grade: (saturation, wash colour, wash amount) applied after everything else
STYLES = {
 'golden': dict(hdri='qwantani_late_afternoon', sky=0.6, sun=6.0, sun_color=(1.0, 0.82, 0.6), sun_side=78),
 'mist': dict(hdri='kloofendal_misty_morning', sky=1.0, sun=2.2, sun_color=(1.0, 0.93, 0.84), sun_side=60, sun_angle=4,
              mist=(16, 170, (0.86, 0.87, 0.85), 0.7), grade=(0.85, (0.95, 0.94, 0.9), 0.05)),
 'paint': dict(hdri='qwantani_late_afternoon', sky=0.6, sun=6.0, sun_color=(1.0, 0.82, 0.6), sun_side=78,
               mist=(25, 260, (0.82, 0.85, 0.9), 0.45), paint=14, grade=(0.9, (0.96, 0.93, 0.86), 0.06)),
 'storybook': dict(hdri='qwantani_late_afternoon', sky=0.7, sun=6.5, sun_color=(1.0, 0.8, 0.56), sun_side=78,
               mist=(30, 280, (0.86, 0.86, 0.84), 0.4), paint=28, grade=(1.12, (0.98, 0.94, 0.84), 0.07)),
 'pastel': dict(hdri='kloofendal_misty_morning', sky=1.0, sun=3.0, sun_color=(1.0, 0.9, 0.78), sun_side=70, sun_angle=3,
                mist=(14, 150, (0.95, 0.93, 0.88), 0.6), paint=16, grade=(0.7, (0.95, 0.93, 0.87), 0.16)),
 'dusk': dict(hdri='qwantani_dusk_2', sky=0.9, sun=2.5, sun_color=(1.0, 0.55, 0.32), sun_side=55, sun_el=3,
              mist=(20, 220, (0.45, 0.42, 0.52), 0.5), lamp=True),
 'night': dict(hdri='qwantani_night', sky=0.35, sun=0.5, sun_color=(0.62, 0.74, 1.0), sun_side=40, sun_angle=1, sun_el=28,
               mist=(25, 240, (0.03, 0.04, 0.07), 0.45), lamp=True, exposure=-0.6),
}
STYLE = arg('--style', 'golden'); S = STYLES[STYLE]

# ---------------------------------------------------------------- scene reset
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'

# ---------------------------------------------------------------- the path
def catmull(pts, n=24):
    pts = [np.array(p, float) for p in pts]
    P = [pts[0]] + pts + [pts[-1]]
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t ** 3))
    out.append(pts[-1])
    return np.array(out)

TRUNK = catmull([(0.4, -12), (0.9, -3), (-0.3, 6), (-0.9, 13), (-0.3, 19)])
FORK = TRUNK[-1]
BRANCHES = [  # (centerline, width at fork, width far): wide, medium, narrow
    (catmull([FORK, (-3.0, 27), (-9, 42), (-16, 62), (-21, 95), (-26, 150)]), 1.9, 1.5),
    (catmull([FORK, (3.0, 27), (8.5, 39), (13, 56), (17, 85), (22, 130)]), 1.25, 0.9),
    (catmull([FORK, (0.2, 30), (1.4, 42), (0.6, 55), (2.2, 70)]), 0.7, 0.35),
]
PATHS = [(TRUNK, 2.1, 1.95)] + BRANCHES

def path_field(xy):
    """Return (mask in 0..1, signed distance-to-edge) for points xy (N,2)."""
    best = np.full(len(xy), 1e9)
    for line, w0, w1 in PATHS:
        a, b = line[:-1], line[1:]
        seg_len = np.linalg.norm(b - a, axis=1)
        s = np.concatenate([[0], np.cumsum(seg_len)]); s = s / s[-1]
        for i in range(0, len(xy), 200000):
            p = xy[i:i + 200000][:, None, :]
            ab = (b - a)[None]; ap = p - a[None]
            t = np.clip((ap * ab).sum(-1) / np.maximum((ab * ab).sum(-1), 1e-9), 0, 1)
            d = np.linalg.norm(ap - t[..., None] * ab, axis=-1)
            k = d.argmin(1); dmin = d[np.arange(len(k)), k]
            frac = s[k] + (s[k + 1] - s[k]) * t[np.arange(len(k)), k]
            width = w0 + (w1 - w0) * frac
            width = width * (1 + 0.12 * np.sin(frac * 37.0) + 0.06 * np.sin(frac * 91.0))
            best[i:i + 200000] = np.minimum(best[i:i + 200000], dmin - width / 2)
    mask = 1 - np.clip((best + 0.05) / 0.45, 0, 1)
    mask = mask * mask * (3 - 2 * mask)
    return mask, best

def ss(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)

def height(x, y):
    r = np.hypot(x, y - 20)
    near = 0.35 * np.sin(x / 9.0) * np.cos(y / 13.0) + 0.18 * np.sin(x / 4.1 + y / 6.3)
    mid = 1.6 * np.sin(x / 31.0 + 0.7) * np.cos(y / 37.0)
    far = 14 * ss(90, 420, r) * (0.6 + 0.4 * np.sin(x / 140.0) * np.cos(y / 170.0))
    return near * ss(-8, 6, y) + mid * ss(10, 60, r) + far

# ---------------------------------------------------------------- terrain
def warp(n, lo, hi, k):
    u = np.linspace(-1, 1, n)
    return np.sinh(k * u) / np.sinh(k)

def build_terrain():
    nx, ny = 700, 700
    xs = warp(nx, -1, 1, 5.6) * 1600.0
    wy = warp(ny, -1, 1, 5.6)  # dense rows around y = 10, just ahead of the camera
    ys = 10 + np.where(wy < 0, wy * 60.0, wy * 1600.0)
    X, Y = np.meshgrid(xs, ys)
    xy = np.stack([X.ravel(), Y.ravel()], 1)
    mask, dist = path_field(xy)
    Z = height(xy[:, 0], xy[:, 1]) - 0.05 * mask
    verts = np.stack([xy[:, 0], xy[:, 1], Z], 1)
    me = bpy.data.meshes.new('terrain')
    faces = []
    idx = np.arange(nx * ny).reshape(ny, nx)
    q = np.stack([idx[:-1, :-1], idx[:-1, 1:], idx[1:, 1:], idx[1:, :-1]], -1).reshape(-1, 4)
    me.vertices.add(len(verts)); me.vertices.foreach_set('co', verts.ravel().astype(np.float32))
    me.loops.add(len(q) * 4); me.loops.foreach_set('vertex_index', q.ravel().astype(np.int32))
    me.polygons.add(len(q)); me.polygons.foreach_set('loop_start', (np.arange(len(q)) * 4).astype(np.int32))
    me.update(calc_edges=True); me.validate()
    # attributes used by the shader and the scatter
    r_cam = np.hypot(xy[:, 0], xy[:, 1] + 5)
    n1 = 0.5 + 0.5 * np.sin(xy[:, 0] / 6.3 + np.sin(xy[:, 1] / 4.7)) * np.cos(xy[:, 1] / 5.9 + np.sin(xy[:, 0] / 3.1))
    n2 = 0.5 + 0.5 * np.sin(xy[:, 0] / 2.1 + 1.3) * np.cos(xy[:, 1] / 2.7 + 0.4)
    clear = ss(0.0, 0.9, dist)  # 0 on the path, 1 a little off it
    keep = (1 - ss(70, 140, r_cam))  # dense scatter only in the near and middle field
    attrs = {
        'path': mask,
        'grass': clear * keep * (0.55 + 0.45 * n1),
        'grass_far': clear * ss(50, 70, r_cam) * (1 - ss(260, 320, r_cam)),
        'flowers': clear * keep * (0.12 + 0.88 * ss(0.55, 0.85, n2 * 0.7 + n1 * 0.3)),
        'edge': ss(-0.1, 0.25, dist) * (1 - ss(0.4, 1.6, dist)) * keep,  # tufts along the path edges
        'shrub': clear * keep * ss(0.72, 0.9, n2) * ss(4, 9, r_cam),
    }
    for k, v in attrs.items():
        a = me.attributes.new(k, 'FLOAT', 'POINT'); a.data.foreach_set('value', v.astype(np.float32))
    ob = bpy.data.objects.new('terrain', me); scene.collection.objects.link(ob)
    return ob

# ---------------------------------------------------------------- materials
def img(path, non_color=False):
    im = bpy.data.images.load(path, check_existing=True)
    if non_color: im.colorspace_settings.name = 'Non-Color'
    return im

def tex_set(name):
    d = os.path.join(A, 'textures', name)
    f = lambda key: (glob.glob(os.path.join(d, f'*_{key}_*')) or [None])[0]
    return {'diff': f('diff'), 'nor': f('nor_gl'), 'rough': f('rough'), 'disp': f('disp')}

def ground_material():
    m = bpy.data.materials.new('ground'); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; Lk = nt.links; N.clear()
    out = N.new('ShaderNodeOutputMaterial'); bsdf = N.new('ShaderNodeBsdfPrincipled')
    Lk.new(bsdf.outputs[0], out.inputs[0])
    tc = N.new('ShaderNodeTexCoord')
    def layer(tex, scale):
        mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (scale, scale, scale)
        Lk.new(tc.outputs['Object'], mp.inputs[0])
        t = tex_set(tex); res = {}
        for key in ('diff', 'rough', 'nor'):
            n = N.new('ShaderNodeTexImage'); n.image = img(t[key], key != 'diff'); n.projection = 'FLAT'
            Lk.new(mp.outputs[0], n.inputs[0]); res[key] = n
        return res
    g = layer('leafy_grass', 0.45); g2 = layer('grass_path_2', 0.12); d = layer('park_dirt', 0.5)
    attr = N.new('ShaderNodeAttribute'); attr.attribute_name = 'path'
    noise = N.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value = 0.6; Lk.new(tc.outputs['Object'], noise.inputs[0])
    macro = N.new('ShaderNodeTexNoise'); macro.inputs['Scale'].default_value = 0.02; Lk.new(tc.outputs['Object'], macro.inputs[0])
    # path mask, broken up at the edges
    edge = N.new('ShaderNodeMath'); edge.operation = 'MULTIPLY_ADD'
    Lk.new(noise.outputs['Fac'], edge.inputs[0]); edge.inputs[1].default_value = 0.5; edge.inputs[2].default_value = -0.25
    mk = N.new('ShaderNodeMath'); mk.operation = 'ADD'; mk.use_clamp = True
    Lk.new(attr.outputs['Fac'], mk.inputs[0]); Lk.new(edge.outputs[0], mk.inputs[1])
    # two grass textures blended by a macro noise, to hide tiling
    gmix = N.new('ShaderNodeMix'); gmix.data_type = 'RGBA'
    Lk.new(macro.outputs['Fac'], gmix.inputs['Factor']); Lk.new(g['diff'].outputs[0], gmix.inputs[6]); Lk.new(g2['diff'].outputs[0], gmix.inputs[7])
    tint = N.new('ShaderNodeHueSaturation'); tint.inputs['Hue'].default_value = 0.54; tint.inputs['Saturation'].default_value = 1.25; tint.inputs['Value'].default_value = 0.8
    Lk.new(gmix.outputs[2], tint.inputs['Color'])
    cmix = N.new('ShaderNodeMix'); cmix.data_type = 'RGBA'
    Lk.new(mk.outputs[0], cmix.inputs['Factor']); Lk.new(tint.outputs[0], cmix.inputs[6]); Lk.new(d['diff'].outputs[0], cmix.inputs[7])
    Lk.new(cmix.outputs[2], bsdf.inputs['Base Color'])
    rmix = N.new('ShaderNodeMix'); rmix.data_type = 'FLOAT'
    Lk.new(mk.outputs[0], rmix.inputs['Factor']); Lk.new(g['rough'].outputs[0], rmix.inputs[2]); Lk.new(d['rough'].outputs[0], rmix.inputs[3])
    Lk.new(rmix.outputs[0], bsdf.inputs['Roughness'])
    nmix = N.new('ShaderNodeMix'); nmix.data_type = 'RGBA'
    Lk.new(mk.outputs[0], nmix.inputs['Factor']); Lk.new(g['nor'].outputs[0], nmix.inputs[6]); Lk.new(d['nor'].outputs[0], nmix.inputs[7])
    nm = N.new('ShaderNodeNormalMap'); Lk.new(nmix.outputs[2], nm.inputs['Color']); Lk.new(nm.outputs[0], bsdf.inputs['Normal'])
    return m

def wood_material():
    m = bpy.data.materials.new('gate_wood'); m.use_nodes = True
    nt = m.node_tree; N = nt.nodes; Lk = nt.links
    bsdf = N['Principled BSDF']; tc = N.new('ShaderNodeTexCoord'); t = tex_set('weathered_brown_planks')
    mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1.2, 1.2, 1.2); Lk.new(tc.outputs['Object'], mp.inputs[0])
    for key, sock in (('diff', 'Base Color'), ('rough', 'Roughness')):
        n = N.new('ShaderNodeTexImage'); n.image = img(t[key], key != 'diff'); n.projection = 'BOX'; n.projection_blend = 0.3
        Lk.new(mp.outputs[0], n.inputs[0]); Lk.new(n.outputs[0], bsdf.inputs[sock])
    n = N.new('ShaderNodeTexImage'); n.image = img(t['nor'], True); n.projection = 'BOX'; n.projection_blend = 0.3; Lk.new(mp.outputs[0], n.inputs[0])
    nm = N.new('ShaderNodeNormalMap'); Lk.new(n.outputs[0], nm.inputs['Color']); Lk.new(nm.outputs[0], bsdf.inputs['Normal'])
    return m

# ---------------------------------------------------------------- assets
LIB = bpy.data.collections.new('_library'); scene.collection.children.link(LIB)
def load_asset(asset, pattern):
    """Append matching objects from a Poly Haven .blend into a hidden collection; return that collection."""
    path = glob.glob(os.path.join(A, 'models', asset, '*.blend'))[0]
    with bpy.data.libraries.load(path, link=False) as (src, dst):
        dst.objects = [n for n in src.objects if re.search(pattern, n)]
    col = bpy.data.collections.new('lib_' + asset); LIB.children.link(col)
    for o in dst.objects:
        if o is None: continue
        for c in list(o.users_collection): c.objects.unlink(o)
        col.objects.link(o)
        o.location = (0, 0, 0); o.rotation_euler = (0, 0, 0); o.parent = None
        for mod in list(getattr(o, 'modifiers', [])): o.modifiers.remove(mod)
    return col

def place(col, loc, rot=0.0, scale=1.0, name=None):
    e = bpy.data.objects.new(name or ('inst_' + col.name), None)
    e.instance_type = 'COLLECTION'; e.instance_collection = col
    e.location = loc; e.rotation_euler = (0, 0, rot); e.scale = (scale,) * 3
    scene.collection.objects.link(e); return e

def ground_z(x, y):
    m, _ = path_field(np.array([[x, y]], float))
    return float(height(np.array([x]), np.array([y]))[0] - 0.05 * m[0])

# ---------------------------------------------------------------- scatter (geometry nodes)
def scatter(name, terrain, col, attr, density, scale=(0.8, 1.2), seed=0, align=0.0, sink=0.0):
    ob = bpy.data.objects.new(name, bpy.data.meshes.new(name)); scene.collection.objects.link(ob)
    ng = bpy.data.node_groups.new(name, 'GeometryNodeTree')
    ng.interface.new_socket('Geometry', in_out='OUTPUT', socket_type='NodeSocketGeometry')
    N, Lk = ng.nodes, ng.links
    out = N.new('NodeGroupOutput')
    oi = N.new('GeometryNodeObjectInfo'); oi.inputs['Object'].default_value = terrain; oi.transform_space = 'RELATIVE'
    na = N.new('GeometryNodeInputNamedAttribute'); na.data_type = 'FLOAT'; na.inputs['Name'].default_value = attr
    mul = N.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = density
    Lk.new(na.outputs['Attribute'], mul.inputs[0])
    dist = N.new('GeometryNodeDistributePointsOnFaces'); dist.distribute_method = 'RANDOM'
    dist.inputs['Seed'].default_value = seed
    Lk.new(oi.outputs['Geometry'], dist.inputs['Mesh']); Lk.new(mul.outputs[0], dist.inputs['Density'])
    ci = N.new('GeometryNodeCollectionInfo'); ci.inputs['Collection'].default_value = col
    ci.inputs['Separate Children'].default_value = True; ci.inputs['Reset Children'].default_value = True
    rz = N.new('FunctionNodeRandomValue'); rz.data_type = 'FLOAT_VECTOR'
    rz.inputs[0].default_value = (0, 0, 0); rz.inputs[1].default_value = (0, 0, 6.2832); rz.inputs['Seed'].default_value = seed + 1
    al = N.new('FunctionNodeAlignEulerToVector'); al.axis = 'Z'; al.inputs['Factor'].default_value = align
    Lk.new(rz.outputs[0], al.inputs['Rotation']); Lk.new(dist.outputs['Normal'], al.inputs['Vector'])
    rs = N.new('FunctionNodeRandomValue'); rs.data_type = 'FLOAT'
    rs.inputs[2].default_value = scale[0]; rs.inputs[3].default_value = scale[1]; rs.inputs['Seed'].default_value = seed + 2
    pick = N.new('FunctionNodeRandomValue'); pick.data_type = 'INT'
    pick.inputs[4].default_value = 0; pick.inputs[5].default_value = 999; pick.inputs['Seed'].default_value = seed + 3
    inst = N.new('GeometryNodeInstanceOnPoints')
    Lk.new(dist.outputs['Points'], inst.inputs['Points']); Lk.new(ci.outputs[0], inst.inputs['Instance'])
    inst.inputs['Pick Instance'].default_value = True
    Lk.new(pick.outputs[2], inst.inputs['Instance Index'])
    Lk.new(al.outputs[0], inst.inputs['Rotation']); Lk.new(rs.outputs[1], inst.inputs['Scale'])
    if sink:
        tr = N.new('GeometryNodeTranslateInstances'); tr.inputs['Translation'].default_value = (0, 0, -sink)
        Lk.new(inst.outputs[0], tr.inputs['Instances']); Lk.new(tr.outputs[0], out.inputs[0])
    else:
        Lk.new(inst.outputs[0], out.inputs[0])
    mod = ob.modifiers.new(name, 'NODES'); mod.node_group = ng
    return ob

# ---------------------------------------------------------------- the gate
def build_gate(x, y, rot):
    mat = wood_material()
    parts = []
    def box(cx, cy, cz, sx, sy, sz):
        bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.0)
        for v in bm.verts: v.co = Vector((v.co.x * sx + cx, v.co.y * sy + cy, v.co.z * sz + cz))
        bmesh.ops.bevel(bm, geom=list(bm.edges), offset=0.012, segments=2, affect='EDGES')
        me = bpy.data.meshes.new('gate_part'); bm.to_mesh(me); bm.free(); me.materials.append(mat)
        parts.append(me)
    gap = 2.6  # the path runs between the posts
    for sx in (-gap / 2, gap / 2):
        box(sx, 0, 0.62, 0.14, 0.14, 1.5)  # posts
        box(sx, 0, 1.39, 0.2, 0.2, 0.05)   # caps
    # an open leaf, swung back off the path, and short fence runs either side
    for side in (-1, 1):
        x0 = side * (gap / 2 + 0.07)
        for k in range(3):
            px = x0 + side * (1.6 * (k + 1))
            box(px, 0, 0.5, 0.11, 0.11, 1.15)
        L = 4.9
        box(x0 + side * L / 2, 0, 0.95, L, 0.06, 0.12)
        box(x0 + side * L / 2, 0, 0.45, L, 0.06, 0.12)
    obs = []
    for me in parts:
        o = bpy.data.objects.new('gate', me); scene.collection.objects.link(o); obs.append(o)
    # join into one object
    bpy.ops.object.select_all(action='DESELECT')
    for o in obs: o.select_set(True)
    bpy.context.view_layer.objects.active = obs[0]; bpy.ops.object.join()
    g = bpy.context.view_layer.objects.active; g.name = 'gate'
    g.location = (x, y, ground_z(x, y) - 0.02); g.rotation_euler = (0, 0, rot)
    for p in g.data.polygons: p.use_smooth = False
    return g

# ---------------------------------------------------------------- world and light
def world(hdr, cam_yaw):
    w = bpy.data.worlds.new('sky'); scene.world = w; w.use_nodes = True
    N, Lk = w.node_tree.nodes, w.node_tree.links
    bg = N['Background']; env = N.new('ShaderNodeTexEnvironment'); env.image = img(hdr)
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping')
    Lk.new(tc.outputs['Generated'], mp.inputs[0]); Lk.new(mp.outputs[0], env.inputs[0]); Lk.new(env.outputs[0], bg.inputs['Color'])
    bg.inputs['Strength'].default_value = S['sky']
    # find the sun in the HDRI and turn the world so it sits ahead and to the right of the view
    im = env.image; W, H = im.size
    px = np.empty(W * H * 4, np.float32); im.pixels.foreach_get(px)
    lum = px.reshape(H, W, 4)[..., :3].sum(-1); j, i = np.unravel_index(lum.argmax(), lum.shape)
    # Blender's equirect lookup: u = atan2(d.y, -d.x)/2pi + 0.5, so column i has world azimuth pi - phi
    phi = (i / W - 0.5) * 2 * math.pi
    el = (j / H - 0.5) * math.pi            # image rows run bottom to top
    want = cam_yaw - math.radians(S['sun_side'])  # degrees right of the view direction
    rotz = (math.pi - phi) - want           # the mapping rotates lookups, so the world turns by -rotz
    mp.inputs['Rotation'].default_value = (0, 0, rotz)
    sun = bpy.data.lights.new('sun', 'SUN'); sun.angle = math.radians(S.get('sun_angle', 0.6)); sun.energy = S['sun']
    sun.color = S['sun_color']
    if S.get('sun_el') is not None: el = math.radians(S['sun_el'])
    so = bpy.data.objects.new('sun', sun); scene.collection.objects.link(so)
    to_sun = Vector((math.cos(el) * math.cos(want), math.cos(el) * math.sin(want), math.sin(el)))
    so.rotation_euler = to_sun.to_track_quat('Z', 'Y').to_euler()
    return so, math.degrees(el)

# ================================================================ build
t0 = time.time()
terrain = build_terrain(); terrain.data.materials.append(ground_material())
for p in terrain.data.polygons: p.use_smooth = True
print('terrain', len(terrain.data.vertices), 'verts', round(time.time() - t0, 1), 's')

trees = {k: load_asset(k, pat) for k, pat in {
    'island_tree_01': r'^island_tree_01_LOD1$', 'island_tree_02': r'^island_tree_02_LOD1$', 'island_tree_03': r'^island_tree_03_LOD1$',
    'jacaranda_tree': r'^jacaranda_tree_(trunk_)?LOD1$', 'tree_small_02': r'^tree_small_02_(trunk|LOD1)$'}.items()}
grass = load_asset('grass_medium_01', r'^grass_medium_01_(small|mid|large|tall)_[a-z]_LOD1$')
grass2 = load_asset('grass_medium_02', r'^grass_medium_02_[a-e]$')
tiny = load_asset('grass_bermuda_01', r'^grass_bermuda_01_(small|medium|seedling)_[a-z]$')
flowers = bpy.data.collections.new('lib_flowers'); LIB.children.link(flowers)
for a, pat in (('dandelion_01', r'_LOD1$'), ('celandine_01', r'^celandine_01_[a-e]_LOD1$'), ('periwinkle_plant', r'_LOD1$')):
    c = load_asset(a, pat)
    for o in list(c.objects): c.objects.unlink(o); flowers.objects.link(o)
shrubs = load_asset('shrub_02', r'_LOD1$')
small_shrubs = bpy.data.collections.new('lib_small_shrubs'); LIB.children.link(small_shrubs)
for a in ('shrub_01', 'shrub_04', 'nettle_plant', 'fern_02'):
    c = load_asset(a, r'_LOD1$' if a != 'fern_02' else r'^fern_02_[a-d]$')
    for o in list(c.objects): c.objects.unlink(o); small_shrubs.objects.link(o)
rocks = load_asset('rock_moss_set_01', r'rock0[1-6]$')
boulder = load_asset('boulder_01', r'_LOD1$'); stump = load_asset('tree_stump_01', r'^tree_stump_01$')
bench = load_asset('painted_wooden_bench', r'.'); lamp = load_asset('street_lamp_01', r'.')
bpy.context.view_layer.layer_collection.children['_library'].exclude = True
print('assets loaded', round(time.time() - t0, 1), 's')

# trees: framing groups, a big jacaranda as the far anchor, and a distant tree line hiding the terrain edge
TREES = [('jacaranda_tree', -46, 98, 0.4, 0.75), ('island_tree_01', 9.5, 21, 1.1, 1.25), ('island_tree_02', -8.5, 17, 2.0, 1.2),
         ('island_tree_03', -24, 52, 0.3, 1.5), ('island_tree_01', 21, 58, 3.0, 1.6), ('island_tree_02', 30, 36, 4.1, 1.4),
         ('island_tree_03', 7, 78, 5.0, 1.6), ('tree_small_02', -16, 27, 0.9, 1.1), ('tree_small_02', 13, 33, 2.2, 1.0),
         ('island_tree_01', -13, 44, 1.7, 1.3), ('tree_small_02', 4.8, 46, 0.2, 0.9)]
for k, x, y, r, s in TREES:
    place(trees[k], (x, y, ground_z(x, y) - 0.1), r, s)
for i in range(220):  # distant woods along rising ground
    ang = RNG.uniform(-1.3, 1.3); dist = RNG.uniform(95, 230)
    x, y = math.sin(ang) * dist, 20 + math.cos(ang) * dist
    k = ['island_tree_01', 'island_tree_02', 'island_tree_03', 'tree_small_02'][i % 4]
    place(trees[k], (x, y, ground_z(x, y) - 0.2), RNG.uniform(0, 6.28), RNG.uniform(1.8, 3.4))

# props along the path
place(bench, (2.7, 12.5, ground_z(2.7, 12.5)), math.radians(-90), 1.0)
place(lamp, (3.3, 15.2, ground_z(3.3, 15.2)), math.radians(190), 1.0)
place(boulder, (-3.4, 8.5, ground_z(-3.4, 8.5) - 0.25), 0.6, 0.55)
place(stump, (-4.6, 21.0, ground_z(-4.6, 21) - 0.05), 1.1, 0.8)
for x, y, s in ((5.5, 12, 0.35), (-6, 33, 0.45), (7, 40, 0.5), (-3.2, 26.5, 0.22), (4.2, 29, 0.25)):
    place(rocks, (x, y, ground_z(x, y) - 0.3 * s), RNG.uniform(0, 6.28), s)
gate = build_gate(0.45, 0.5, math.radians(3))

# scatter: dense grass, coarse far grass, edge tufts, flowers, shrubs
scatter('grass_near', terrain, grass, 'grass', 140, (1.0, 1.8), seed=1)
scatter('grass_clumps', terrain, grass2, 'grass', 22, (0.9, 1.7), seed=2)
scatter('grass_tiny', terrain, tiny, 'edge', 90, (0.9, 1.4), seed=3)
scatter('grass_far', terrain, grass2, 'grass_far', 7, (2.0, 3.4), seed=4)
scatter('flowers', terrain, flowers, 'flowers', 5, (1.0, 1.6), seed=5)
scatter('small_shrubs', terrain, small_shrubs, 'shrub', 1.2, (1.2, 2.4), seed=6)
scatter('shrubs', terrain, shrubs, 'shrub', 0.06, (0.8, 1.4), seed=7, sink=0.1)
print('scatter set up', round(time.time() - t0, 1), 's')

# camera: low, at the gate, looking down the path toward the fork
cam = bpy.data.cameras.new('cam'); cam.lens = 30; cam.dof.use_dof = True
cam.dof.focus_distance = 14; cam.dof.aperture_fstop = 4.0
co = bpy.data.objects.new('cam', cam); scene.collection.objects.link(co); scene.camera = co
co.location = (1.1, -8.5, ground_z(1.1, -8.5) + 2.4)
target = Vector((-0.6, 34, ground_z(-0.6, 34) + 1.4))
d = target - co.location; co.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()
yaw = math.atan2(d.y, d.x)
if '--ground' in argv:
    # a plain patch of meadow seen straight down, at the figures' 800:260 aspect, for the site's animations to draw on
    cam.type = 'ORTHO'; cam.ortho_scale = float(arg('--width', '20')); cam.dof.use_dof = False
    gx, gy = 0.0, -26.0
    co.location = (gx, gy, ground_z(gx, gy) + 60); co.rotation_euler = (0, 0, 0)
    cam.clip_end = 200
    S = dict(S); S.pop('mist', None)  # mist is measured from the camera, which is now high above
    if 'paint' in S: S['paint'] = 9
    S['exposure'] = S.get('exposure', 0.0) + (1.6 if STYLE == 'night' else float(arg('--lift', '0.35')))
    if STYLE == 'night': S['sun'] = 1.0
sun, el = world(glob.glob(os.path.join(A, 'hdri', S['hdri'] + '_puresky_*.hdr'))[0], yaw)
if S.get('lamp'):  # the lamp is lit at dusk and at night
    lp = bpy.data.lights.new('lamp', 'POINT'); lp.energy = 220; lp.color = (1.0, 0.72, 0.42); lp.shadow_soft_size = 0.08
    lo = bpy.data.objects.new('lamp_light', lp); scene.collection.objects.link(lo); lo.location = (3.3, 15.2, ground_z(3.3, 15.2) + 3.45)
print('sun elevation', round(el, 1))

# render settings
r = scene.render; scene.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'METAL'; prefs.get_devices()
for dv in prefs.devices: dv.use = (dv.type == 'METAL')
scene.cycles.device = 'GPU'
res = arg('--res', '960x540').split('x'); r.resolution_x, r.resolution_y = int(res[0]), int(res[1]); r.resolution_percentage = 100
scene.cycles.samples = int(arg('--samples', '32')); scene.cycles.use_adaptive_sampling = True; scene.cycles.adaptive_threshold = 0.02
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 6; scene.cycles.diffuse_bounces = 3; scene.cycles.glossy_bounces = 2; scene.cycles.transparent_max_bounces = 16
scene.view_settings.view_transform = 'AgX'
for look in ('AgX - Medium High Contrast', 'Medium High Contrast'):
    try: scene.view_settings.look = look; break
    except TypeError: pass
print('look', scene.view_settings.look)
r.image_settings.file_format = 'PNG'
scene.view_settings.exposure = S.get('exposure', 0.0)

def compositor():
    ng = bpy.data.node_groups.new('look_' + STYLE, 'CompositorNodeTree'); scene.compositing_node_group = ng
    ng.interface.new_socket('Image', in_out='OUTPUT', socket_type='NodeSocketColor')
    N, Lk = ng.nodes, ng.links
    rl = N.new('CompositorNodeRLayers'); rl.scene = scene; out = N.new('NodeGroupOutput'); cur = rl.outputs['Image']
    if 'mist' in S:
        st, depth, col, amt = S['mist']
        bpy.context.view_layer.use_pass_mist = True
        scene.world.mist_settings.start = st; scene.world.mist_settings.depth = depth; scene.world.mist_settings.falloff = 'QUADRATIC'
        mul = N.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = amt
        Lk.new(rl.outputs['Mist'], mul.inputs[0])
        mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.inputs[7].default_value = (*col, 1)
        Lk.new(mul.outputs[0], mx.inputs['Factor']); Lk.new(cur, mx.inputs[6]); cur = mx.outputs[2]
    if 'paint' in S:
        k = N.new('CompositorNodeKuwahara'); k.inputs['Size'].default_value = max(2, round(S['paint'] * r.resolution_x / 2560))
        try: k.inputs['Type'].default_value = 'Anisotropic'
        except Exception as e: print('kuwahara type', e)
        Lk.new(cur, k.inputs['Image']); cur = k.outputs['Image']
    if 'grade' in S:
        sat, wash, amt = S['grade']
        hs = N.new('CompositorNodeHueSat'); hs.inputs['Saturation'].default_value = sat; Lk.new(cur, hs.inputs['Image']); cur = hs.outputs['Image']
        mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.inputs['Factor'].default_value = amt; mx.inputs[7].default_value = (*wash, 1)
        Lk.new(cur, mx.inputs[6]); cur = mx.outputs[2]
    Lk.new(cur, out.inputs[0])
if any(k in S for k in ('mist', 'paint', 'grade')): compositor()
print('style', STYLE)

# every image must resolve on disk, or the render goes pink without complaint
missing = [i.filepath for i in bpy.data.images if i.source == 'FILE' and not os.path.exists(bpy.path.abspath(i.filepath))]
print('images', len(bpy.data.images), 'missing', len(missing), missing[:5])
assert not missing

bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'park.blend' if STYLE == 'golden' else f'park_{STYLE}.blend'), relative_remap=True)
print('saved', round(time.time() - t0, 1), 's')
out = arg('--render')
if out:
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    t1 = time.time(); r.filepath = os.path.abspath(out); bpy.ops.render.render(write_still=True)
    print('rendered', out, round(time.time() - t1, 1), 's')
