(()=>{
const REGK='genai-park-reg';
const LBL={"leads somewhere real": "true", "leads nowhere": "false", "passes as human ✓": "high likelihood ✓", "the judge sees only the footprints": "the score sees only the text", "where the walks ended, which the judge never checks": "whether it is true, which the score never checks", "the ground: word vectors": "embedding space", "worn in by many walkers": "seen often in training", "no walker has been here": "never seen in training", "carried over: similar ground": "generalized: similar embeddings", "random seed": "latent z ~ N(0, I)", "a painter: the product is the canvas, not the footprints": "image generator: the output is an image, not a sequence", "one stroke, no drafts": "one forward pass", "source road (French)": "encoder input (French)", "the walk (English)": "decoder output (English)", "road laid by the user: two examples and a cue": "prompt: two examples and a cue", "every footprint leaves a draft": "each step: a less noisy image", "glances lightly": "low guidance scale", "glances hard": "high guidance scale", "a request": "prompt", "✓ ended well": "✓ high reward", "✗ ended badly": "✗ low reward", "the leash: stay near the old trails": "KL penalty: stay near the pretrained model", "the walker takes whole walks": "sample complete outputs", "a judge marks where each one ended": "a reward model scores each one", "the trails are re-worn toward good endings": "the policy is updated toward high reward", "but held near the old trails": "with a KL penalty toward the original model", "scouting: used to reach the answer, then set aside": "reasoning tokens: computed, then discarded", "the product": "final answer", "laid by a search tool": "inserted tool output", "waiting…": "tool running…", "same spot, different road: a different heading, a different blaze": "same last token, different context: different state, different distribution", "Road 1: “in wildness is the”": "Context 1: “in wildness is the”", "Road 2: “I went to the”": "Context 2: “I went to the”", "Shannon’s walker sees only the last word": "bigram model: conditions only on the last token", "road 1 reaches “the”": "context 1 ends in “the”", "road 2 reaches “the”": "context 2 ends in “the”", "both roads, one junction: same heading, same blaze": "same last token: same distribution", "typed by the user": "user input", "paths cut by hand: which sound may follow which": "designed topology: allowed state transitions", "how worn each one gets: learned from recordings": "transition probabilities: estimated with Baum–Welch", "cut by hand: features engineers chose": "hand-engineered features + classifier", "worn in: features learned from a million photos": "learned convolutional features, trained end to end", "26% wrong": "26.2% top-5 error", "15% wrong": "15.3% top-5 error", "how far off the blaze is": "test loss (log)", "walkers × ground (log) →": "compute (log) →", "forecast, before it was built": "extrapolated before training", "each step: ten times more walkers, finer ground": "each point: 10× more compute", "trained on human footprints": "trained on human data", "after “in wildness is the”, the blaze:": "P(next token | “in wildness is the”):", "the blaze here is just this wear": "the distribution is just these counts", "in view:": "context window:", "the pack": "hidden state", "sniffs per step →": "tokens attended per step →", "Done: every word cost a full run": "Done: each token attended over all before it", "this dog’s nose: ": "this head’s query: ", "few walkers, coarse ground": "small model, little compute", "many walkers, fine ground": "large model, much compute", "more walkers, finer ground": "more compute", "what is the walk about?": "what is the topic?"};
const RLBL=Object.fromEntries(Object.entries(LBL).map(([a,b])=>[b,a]));
const isM=()=>document.body.dataset.reg==='m';
const T=s=>isM()?(LBL[s]??s):s;
const L=(i,m)=>isM()?m:i;
const NS='http://www.w3.org/2000/svg';
const ROADC={road:['ru'],givenroad:['gu']};let RID=0;
const el=(tag,a={},p)=>{const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);
  if(p){const rc=tag==='path'&&ROADC[a.class];if(rc){e.id='rd'+(++RID);el('use',{href:'#'+e.id,class:rc[0]},p)}p.appendChild(e);}return e};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const lerp=(a,b,u)=>a+(b-a)*u;
const W=['in','wildness','is','the','preservation','of','the','world'];
const DX=84,X0=104,Y0=146,AMP=12;
const R=s=>({x:X0+s*DX,y:Y0+AMP*Math.sin(s*1.1)});
const f1=n=>n.toFixed(1);
function roadD(a,b,F=R){if(b<=a+1e-3)return 'M0 0';let d='';const n=Math.max(2,Math.ceil((b-a)/.08));for(let k=0;k<=n;k++){const p=F(a+(b-a)*k/n);d+=(k?'L':'M')+f1(p.x)+' '+f1(p.y)}return d}
function place(e,x,y,flip=1){e.setAttribute('transform',`translate(${f1(x)} ${f1(y)}) scale(${flip} 1)`);if(e.gait)e.gait(x,y)}
function tufts(g,seed){let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;
  el('rect',{x:0,y:0,width:800,height:400,fill:'url(#glow)'},g);
  for(let i=0;i<52;i++){const x=r()*800,y=r()*260,k=.75+r()*.6;if(Math.abs(y-Y0)<26&&x<720)continue;
    el('path',{d:`M${f1(x-3*k)} ${f1(y)}q.4 -3 ${f1(2*k)} ${f1(-5*k)}M${f1(x)} ${f1(y)}v${f1(-6.5*k)}M${f1(x+3*k)} ${f1(y)}q-.4 -3 ${f1(-2*k)} ${f1(-5*k)}`,class:'tuft'},g);
    if(r()<.16){const c=['flA','flB','flC'][Math.floor(r()*3)];el('circle',{cx:f1(x+(r()-.5)*6),cy:f1(y-7*k-1.5),r:1.9,class:'fl '+c},g)}}}
function gate(g){const one=(x,y,o)=>{const e=el('path',{d:`M${x-11} ${y+14}V${y-18}M${x+11} ${y+14}V${y-18}M${x-14} ${y-13}H${x+14}M${x-14} ${y-4}H${x+14}`,class:'gate'},g);e.style.opacity=o};
  const p=R(-1);one(p.x,p.y,1);[-58,58].forEach(dy=>{const y=p.y+dy;one(p.x,y,.45);el('path',{d:`M${p.x+14} ${y}q28 ${f1(-dy*.06)} 60 ${f1(-dy*.22)}`,class:'worn','stroke-width':5,'stroke-opacity':.4},g)})}
function opts_pmax(o){return Math.max(...o.map(x=>x[1]))}
function foot(g,p,ang,side,c){const f=el('g',{transform:`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(ang)}) translate(0 ${side*3}) scale(1.3)`},g);
  el('path',{d:'M-.5 -3.4C3.4 -3.6 6.2 -1.6 6.2 .2S3.4 3.7 -.4 3.4C-2.6 3.2 -2.9 -3.2 -.5 -3.4Z',class:'fp '+c},f);
  el('ellipse',{cx:-5.4,cy:0,rx:2.4,ry:2.6,class:'fp '+c},f);return f}
function posts(g,words=W,F=R,cls=[],dy=[]){return words.map((w,i)=>{const p=F(i),a=F(i-.15),b=F(i+.15);const c=cls[i]||'';const gg=el('g',{},g);
  foot(gg,p,Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI,i%2?1:-1,c);const t=el('text',{x:p.x,y:p.y+(dy[i]??38),class:'word '+c,'text-anchor':'middle'},gg);t.textContent=w;gg.style.opacity=0;return gg})}
const rev=(s,i)=>clamp((s-i)/.12+1);
function walker(g){const w=el('g',{},g);
  el('ellipse',{cx:0,cy:1,rx:9,ry:2.4,class:'shade'},w);
  const body=el('g',{},w);
  const arm=el('path',{class:'limb',d:'M0 -26L-3 -16'},body),la=el('path',{class:'limb'},body),lb=el('path',{class:'limb'},body);
  el('path',{d:'M0 -15V-31',class:'limb'},body);
  el('path',{d:'M0 -26L8 -20',class:'limb'},body);
  let lx=null,amp=0;
  const legs=(th,lift)=>{const L=15.4,f=(a,up)=>`M0 -15L${f1(L*Math.sin(a))} ${f1(-15+L*Math.cos(a)-up)}`;la.setAttribute('d',f(th,th>0?0:lift));lb.setAttribute('d',f(-th,th>0?lift:0))};
  w.gait=(x,y)=>{const dx=lx==null?0:Math.hypot(x-lx,y-w.ly);lx=x;w.ly=y;
    const tgt=dx>60?0:clamp(dx/1.6);amp+=(tgt-amp)*(tgt>amp?.5:.22);if(amp<.02)amp=0;
    const ph=x/34*2*Math.PI,th=amp*.42*Math.sin(ph);legs(th,amp*2.2*Math.abs(Math.cos(ph)));
    arm.setAttribute('d',`M0 -26L${f1(-3-amp*4*Math.sin(ph))} -16`);
    body.setAttribute('transform',`translate(0 ${f1(-amp*1.3*Math.abs(Math.cos(ph)))})`)};
  legs(0,0);w.ly=0;
  el('rect',{x:6,y:-27,width:8,height:10,rx:1,class:'book'},body);
  el('circle',{cx:0,cy:-36,r:5,class:'head'},body);
  el('path',{d:'M-9 -40H9M-5.5 -40L-4.5 -46H4.5L5.5 -40',class:'hat'},body);
  return w}
function dog(g,color){const d=el('g',{style:`--dc:${color}`},g);
  el('ellipse',{cx:2,cy:1,rx:13,ry:2.3,class:'shade'},d);
  d.legs=[-7,-3,6,10].map(x=>({x,e:el('line',{x1:x,y1:-7,x2:x,y2:0,class:'dleg'},d)}));
  d.tail=el('path',{d:'M-9 -10q-6 -3 -8 -10',class:'dtail'},d);
  el('ellipse',{cx:1.5,cy:-10,rx:11,ry:5.5,class:'dbody'},d);
  el('circle',{cx:13,cy:-16,r:4.8,class:'dbody'},d);
  el('path',{d:'M16 -18l6 2.5l-6 2z',class:'dbody'},d);
  el('path',{d:'M10.5 -20l-2.5 7l4 -2z',class:'dear'},d);
  return d}
function setDog(d,x,y,dir,mv,t){place(d,x,y+(mv?-Math.abs(Math.sin(t*22))*1.2:0),dir);d.legs.forEach((l,i)=>{const a=mv?Math.sin(t*22+(i%2)*Math.PI)*3.2:0;l.e.setAttribute('x2',f1(l.x+a))});
  d.tail.setAttribute('transform',`rotate(${f1(Math.sin(t*(mv?16:9))*(mv?10:16))} -9 -10)`)}
const DOGC=['var(--dogA)','var(--dogB)','var(--dogC)'];
class Trip{
  constructor(t,s){this.t=t;this.s=s;this.dir=1;this.kf=[{t,s,dir:1,mv:false}];this.ev=[];this.tag=0}
  go(s,v,sniff=false,kind='pass'){const t0=this.t,s0=this.s,dt=Math.abs(s-s0)*DX/v;
    if(sniff){const lo=Math.min(s,s0)-.3,hi=Math.max(s,s0)+.3;for(let i=Math.ceil(lo);i<=Math.floor(hi);i++){if(i<0)continue;const u=clamp(Math.abs(s0-i)/Math.abs(s0-s));this.ev.push({post:i,t:t0+u*dt,kind,tag:this.tag})}}
    this.t+=dt;this.s=s;this.dir=s<s0?-1:1;this.kf.push({t:this.t,s,dir:this.dir,mv:true});return this}
  wait(d){if(d>0){this.t+=d;this.kf.push({t:this.t,s:this.s,dir:this.dir,mv:false})}return this}
  sniff(i,kind='slow'){this.ev.push({post:i,t:this.t,kind,tag:this.tag});return this}
  at(t){const k=this.kf;if(t<=k[0].t)return{s:k[0].s,dir:1,mv:false};for(let i=1;i<k.length;i++)if(t<k[i].t){const a=k[i-1],b=k[i];return{s:lerp(a.s,b.s,(t-a.t)/(b.t-a.t)),dir:b.dir,mv:b.mv}}const l=k[k.length-1];return{s:l.s,dir:1,mv:false}}
  last(post,t,tag){let r=null;for(const e of this.ev)if(e.post===post&&e.t<=t&&(tag==null||e.tag===tag)&&(!r||e.t>r.t))r=e;return r}
}
function puff(c,x,y,e,t,maxR,base,life=.8){if(!e){c.style.opacity=0;return}const f=(t-e.t)/life;if(f<0||f>=1){c.style.opacity=0;return}c.setAttribute('cx',f1(x));c.setAttribute('cy',f1(y));c.setAttribute('r',f1(4+maxR*ease(f)));c.style.opacity=base*(1-f)}
function walkS(t,per,s0,s1,move=.62){const n=Math.max(0,t)/per,i=Math.floor(n);return Math.min(s0+i+ease(clamp((n-i)/move)),s1)}
function fan(g,o,to,opts,L=110){const base=Math.atan2(to.y-o.y,to.x-o.x),angs=[base,base-.55,base+.55];
  const pm=opts_pmax(opts);const items=opts.map(([w,p],i)=>{const a=angs[i],e={x:o.x+L*Math.cos(a),y:o.y+L*Math.sin(a)};const gg=el('g',{},g);
    const line=el('path',{d:`M${f1(o.x)} ${f1(o.y)}L${f1(e.x)} ${f1(e.y)}`,class:'fan','stroke-width':f1(3+14*p),'stroke-opacity':f1(.2+.8*p/pm),'stroke-dasharray':`${L} ${L+60}`,'stroke-dashoffset':L},gg);
    const lab=el('text',{x:f1(e.x+14*Math.cos(a)+4),y:f1(e.y+14*Math.sin(a)+6),class:'flabel'},gg);lab.append(w);
    const pr=el('tspan',{class:'prob',dx:5},lab);pr.textContent=p.toFixed(2);return{gg,line,lab}});
  return{set(grow,label,choose,gone){items.forEach((it,i)=>{it.line.setAttribute('stroke-dashoffset',f1(L*(1-grow)));it.line.style.visibility=grow>0?'visible':'hidden';it.lab.style.opacity=label;it.gg.style.opacity=(i===0?1:1-.8*choose)*(1-gone)})}}}
function layers(svg,seed){const bg=el('g',{},svg);tufts(bg,seed);const road=el('path',{class:'road',d:'M0 0'},bg);gate(bg);return{bg,road,mid:el('g',{},svg),top:el('g',{},svg)}}
function txt(g,x,y,cls,anchor='start'){return el('text',{x,y,class:cls,'text-anchor':anchor},g)}


/* ---- painting helpers ---- */
const lerpC=(a,b,u)=>a.map((x,i)=>x+(b[i]-x)*clamp(u));
function scene(u,v){let c=lerpC([150,190,228],[236,214,178],v/.65);
  if(Math.hypot(u-.78,(v-.24)*1.6)<.1)c=[246,200,90];
  const hill=.66+.07*Math.sin(u*3.4+.4);if(v>hill)c=lerpC([110,158,78],[70,112,52],(v-hill)/(1-hill));
  if(Math.abs(u-.3)<.025&&v>.42&&v<hill+.03)c=[112,82,52];
  if(Math.hypot(u-.3,(v-.36)*1.25)<.12)c=[58,112,62];
  return c}
function noiseArr(n,seed){let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;return Array.from({length:n},()=>[r()*255,r()*255,r()*255])}
function draft(nx,ny,block,amt,noise,tf=scene){const out=[];for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
  const bi=Math.min(Math.floor(i/block)*block+block/2,nx-.5),bj=Math.min(Math.floor(j/block)*block+block/2,ny-.5);
  out.push(lerpC(tf(bi/nx,bj/ny),noise[j*nx+i],amt))}return out}
function canvasGrid(g,x,y,w,h,nx,ny,sh=true){const cw=w/nx,ch=h/ny,cells=[];if(sh)shadow(g,x,y,w,h);
  for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){const c=el('rect',{x:f1(x+i*cw),y:f1(y+j*ch),width:f1(cw+.5),height:f1(ch+.5)},g);c.style.fill='var(--panel)';cells.push(c)}
  el('rect',{x,y,width:w,height:h,class:'frame'},g);
  return{set(cols){cells.forEach((c,k)=>{if(!cols){c.style.fill='var(--panel)';return}const q=cols[k];c.style.fill=`rgb(${q[0]|0},${q[1]|0},${q[2]|0})`})}}}
function shadow(g,x,y,w,h,rx=2){return el('rect',{x:x+2,y:y+3,width:w,height:h,rx,class:'shade'},g)}
const onPanel=e=>(e.style.setProperty('--halo','var(--panel)'),e);
function bez(P,C,E,u){return{x:(1-u)**2*P.x+2*(1-u)*u*C.x+u*u*E.x,y:(1-u)**2*P.y+2*(1-u)*u*C.y+u*u*E.y}}
function stampT(g,x,y,ok,label){const t=txt(g,x,y,'stamp '+(ok?'good':'bad'));t.textContent=label;t.style.opacity=0;return t}

function headingSetup(svg,seed){const bg=el('g',{},svg);tufts(bg,seed);const S={x:430,y:140};
  const roads=[{words:['in','wildness','is','the'],R:s=>({x:S.x-(3-s)*96,y:S.y-(3-s)*20}),th:-38},
               {words:['I','went','to','the'],R:s=>({x:S.x-(3-s)*96,y:S.y+(3-s)*24}),th:38}];
  const C=[['preservation',-56],['world',-27],['end',0],['woods',27],['lake',56]];
  const br=C.map(([w,a])=>{const r=a*Math.PI/180,e={x:S.x+150*Math.cos(r),y:S.y+92*Math.sin(r)};
    const line=el('path',{d:`M${S.x} ${S.y}L${f1(e.x)} ${f1(e.y)}`,class:'fan'},bg);line.style.opacity=0;
    const lab=txt(bg,f1(S.x+168*Math.cos(r)),f1(S.y+103*Math.sin(r)+6),'flabel');lab.append(w);const pr=el('tspan',{class:'prob',dx:5},lab);return{line,lab,pr,r}});
  roads.forEach((rd,k)=>{rd.path=el('path',{class:'road',d:'M0 0'},bg);rd.p=posts(bg,rd.words,rd.R,[],k?[38,38,38,48]:[38,38,-20,48])});
  const arrow=el('path',{class:'heading',d:'M0 0'},bg);return{bg,S,roads,C,br,arrow}}
function setBlaze(H,th,vis){const q=H.br.map(b=>Math.exp(3.2*Math.cos(b.r-th*Math.PI/180))),z=q.reduce((a,b)=>a+b),p=q.map(x=>x/z),pm=Math.max(...p);
  H.br.forEach((b,i)=>{b.line.setAttribute('stroke-width',f1(2+18*p[i]));b.line.setAttribute('stroke-opacity',f1(.12+.88*p[i]/pm));b.line.style.opacity=vis;
    b.lab.style.opacity=.35+.65*vis*(p[i]/pm);b.pr.textContent=vis>.01?p[i].toFixed(2):''});
  const r=th*Math.PI/180,S=H.S,L=46,e={x:S.x+L*Math.cos(r),y:S.y+L*Math.sin(r)};
  H.arrow.setAttribute('d',`M${S.x} ${S.y}L${f1(e.x)} ${f1(e.y)}M${f1(e.x-9*Math.cos(r-.5))} ${f1(e.y-9*Math.sin(r-.5))}L${f1(e.x)} ${f1(e.y)}L${f1(e.x-9*Math.cos(r+.5))} ${f1(e.y-9*Math.sin(r+.5))}`);H.arrow.style.opacity=vis}

const NEWFIGS={
/* 1950 · judge */
judge:{dur:9,hold:2.8,init(svg){const bg=el('g',{},svg);tufts(bg,101);
    const RA=s=>({x:120+s*92,y:74}),RB=s=>({x:120+s*92,y:176});this.RA=RA;this.RB=RB;
    el('path',{class:'road',d:roadD(-.7,4.3,RA)},bg);el('path',{class:'road',d:roadD(-.7,4.3,RB)},bg);
    this.pa=posts(bg,['Walking','was','written','by','Thoreau'],RA);this.pb=posts(bg,['Walking','was','written','by','Emerson'],RB);
    [...this.pa,...this.pb].forEach(p=>p.style.opacity=1);
    const ea=RA(4.75),eb=RB(4.75);
    this.endA=el('g',{},svg);el('path',{d:`M${ea.x-12} ${ea.y+9}v-15l12 -11l12 11v15z`,class:'house'},this.endA);
    const ta=txt(this.endA,ea.x+22,ea.y+6,'stamp good');ta.textContent='leads somewhere real';
    this.endB=el('g',{},svg);el('path',{d:`M${eb.x-14} ${eb.y}h26`,class:'leash'},this.endB);
    const tb=txt(this.endB,eb.x+22,eb.y+6,'stamp bad');tb.textContent='leads nowhere';
    this.endA.style.opacity=0;this.endB.style.opacity=0;
    this.sA=stampT(svg,26,RA(0).y-30,true,'passes as human ✓');this.sB=stampT(svg,26,RB(0).y-30,true,'passes as human ✓');
    this.mag=el('g',{},svg);el('circle',{cx:0,cy:0,r:19,class:'ring'},this.mag);el('path',{d:'M13 13l12 12',class:'ring','stroke-width':4},this.mag);
    this.hud=txt(svg,780,30,'hud','end');this.hud.textContent='the judge sees only the footprints'},
  draw(t){let p;
    if(t<3.4){p=this.RA(clamp((t-.4)/2.8)*4)}else{p=this.RB(clamp((t-3.8)/2.8)*4)}
    place(this.mag,p.x,p.y-2);this.mag.style.opacity=1-seg(t,6.8,7.2);
    this.sA.style.opacity=seg(t,3.1,3.4);this.sB.style.opacity=seg(t,6.5,6.8);
    this.endA.style.opacity=seg(t,7.2,7.8);this.endB.style.opacity=seg(t,7.6,8.2);
    this.hud.textContent=T(t<7.2?'the judge sees only the footprints':'where the walks ended, which the judge never checks')}},

/* 2000 · ground */
ground:{dur:6.2,hold:2.8,init(svg){const bg=el('g',{},svg);tufts(bg,107);
    shadow(bg,20,20,226,220,12);el('rect',{x:20,y:20,width:226,height:220,rx:12,class:'panel'},bg);
    const lab=onPanel(txt(bg,34,42,'hud'));lab.textContent='the ground: word vectors';
    const V={dog:[118,112,-17],cat:[150,132,17],horse:[92,166,8],car:[196,70,8],truck:[212,94,-8],happy:[62,210,8],sad:[132,204,8]};this.V=V;
    this.vd={};for(const k in V){const [x,y,o]=V[k];el('circle',{cx:x,cy:y,r:4.5,class:'vdot'},bg);const t=onPanel(txt(bg,x+o,y+5,'vlab',o<0?'end':'start'));t.textContent=k}
    this.ringD=el('circle',{cx:V.dog[0],cy:V.dog[1],r:12,class:'ring'},bg);this.ringC=el('circle',{cx:V.cat[0],cy:V.cat[1],r:12,class:'ring'},bg);
    this.link=el('path',{d:`M${V.dog[0]} ${V.dog[1]}L${V.cat[0]} ${V.cat[1]}`,class:'glance'},bg);
    const RT=s=>({x:310+s*80,y:68}),RB=s=>({x:310+s*80,y:192});
    el('path',{class:'road',d:roadD(-.5,2,RT)},bg);this.bRoad=el('path',{class:'road',d:roadD(-.5,2,RB)},bg);
    this.pt=posts(bg,['the','dog','was'],RT);this.pb=posts(bg,['the','cat','was'],RB);this.pt.forEach(p=>p.style.opacity=1);
    const opts=[['asleep',.45],['hungry',.35],['lost',.20]];
    this.ft=fan(bg,RT(2),RT(3),opts,78);this.fb=fan(bg,RB(2),RB(3),opts,78);
    this.hT=txt(bg,RT(-.5).x,RT(0).y-26,'hand');this.hT.textContent='worn in by many walkers';
    this.hB=txt(bg,RB(-.5).x,RB(0).y-26,'hand');
    this.q=txt(bg,RB(2).x+22,RB(2).y+7,'note');this.q.textContent='?'},
  draw(t){const bOn=seg(t,1.2,1.8);this.bRoad.style.opacity=bOn;this.pb.forEach(p=>p.style.opacity=bOn);
    this.ft.set(ease(seg(t,.2,1)),seg(t,.8,1.2),0,0);
    const hl=seg(t,2.1,2.6);this.ringD.style.opacity=hl;this.ringC.style.opacity=seg(t,2.5,3);this.link.style.opacity=seg(t,2.8,3.2);
    const fb=ease(seg(t,3.4,4.6));this.fb.set(fb,seg(t,4.4,4.9),0,0);
    this.q.style.opacity=bOn*(1-seg(t,3.3,3.6));
    this.hB.textContent=T(t<3.4?'no walker has been here':'carried over: similar ground');this.hB.style.opacity=bOn}},

/* 2013 · one stroke */
stroke:{dur:3.6,hold:3,init(svg){const bg=el('g',{},svg);tufts(bg,113);
    this.road=el('path',{class:'road',d:'M0 0'},bg);
    const seed=canvasGrid(bg,92,150,44,44,4,4);seed.set(noiseArr(16,7));const sl=txt(bg,114,214,'hand','middle');sl.textContent='random seed';
    const cp=el('clipPath',{id:'wipeclip'},svg);this.clip=el('rect',{x:380,y:30,width:0,height:180},cp);
    shadow(bg,380,30,300,180);el('rect',{x:380,y:30,width:300,height:180,class:'panel'},bg);
    const cg=el('g',{'clip-path':'url(#wipeclip)'},bg);const cv=canvasGrid(cg,380,30,300,180,30,18,false);cv.set(draft(30,18,1,0,noiseArr(540,3)));
    el('rect',{x:380,y:30,width:300,height:180,class:'frame'},bg);
    this.w=walker(svg);this.hud=txt(svg,24,30,'hud');this.hud.textContent='a painter: the product is the canvas, not the footprints';
    this.lab=txt(svg,530,240,'hand','middle');this.lab.textContent='one stroke, no drafts'},
  draw(t){const u=ease(seg(t,.8,1.7));const x=lerp(160,350,u),y=220-Math.sin(u*Math.PI)*70;place(this.w,x,y);
    this.road.setAttribute('d',`M150 220L${f1(lerp(150,350,u))} 220`);
    this.clip.setAttribute('width',f1(300*ease(seg(t,1.5,2.1))));this.lab.style.opacity=seg(t,2.2,2.7)}},

/* 2014 · align */
align:{hold:2.8,init(svg){const bg=el('g',{},svg);tufts(bg,127);
    const RS=s=>({x:330+s*130,y:72}),RT=s=>({x:330+s*130,y:186});this.RS=RS;this.RT=RT;
    el('path',{class:'givenroad',d:roadD(-.6,2.7,RS)},bg);this.road=el('path',{class:'road',d:'M0 0'},bg);
    const a=txt(bg,30,77,'hud');a.textContent='source road (French)';const b=txt(bg,30,191,'hud');b.textContent='the walk (English)';
    this.Wt=[[.80,.10,.10],[.06,.14,.80],[.10,.80,.10]];
    this.lines=this.Wt.map(()=>[0,1,2].map(()=>el('path',{class:'align',d:'M0 0'},bg)));
    this.ps=posts(bg,['le','monde','sauvage'],RS,['given','given','given']);this.ps.forEach(p=>p.style.opacity=1);
    this.pt=posts(bg,['the','wild','world'],RT);
    this.pf=[0,1,2].map(()=>el('circle',{class:'puff',r:0,style:`--dc:${DOGC[1]}`},bg));
    this.w=walker(svg);this.d=dog(svg,DOGC[1]);
    const tr=new Trip(.6,2.6);this.steps=[];
    for(let k=0;k<3;k++){tr.tag=k;const r0=tr.t;tr.go(-.4,330,true).go(2.6,420);const a2=tr.t;this.steps.push({k,r0,a:a2,b:a2+.7});tr.wait(1.05)}
    this.tr=tr;this.dur=tr.t+.2},
  draw(t){let s=-1;for(const st of this.steps){if(t>=st.b){s=st.k;continue}if(t>st.a)s=st.k-1+ease(seg(t,st.a,st.b));break}
    this.road.setAttribute('d',roadD(-1,s,this.RT));this.pt.forEach((p,i)=>p.style.opacity=rev(s,i));
    const q=this.RT(s);place(this.w,q.x,q.y);const d=this.tr.at(t),dp=this.RS(d.s);setDog(this.d,dp.x,dp.y+8,d.dir,d.mv,t);
    this.pf.forEach((c,i)=>{const e=this.tr.last(i,t);const w=e?this.Wt[e.tag][i]:0;const p=this.RS(i);puff(c,p.x,p.y-2,e,t,6+34*w,.25+1*w,1)});
    this.lines.forEach((row,k)=>row.forEach((ln,i)=>{const on=seg(t,this.steps[k].b-.1,this.steps[k].b+.4);const A=this.RT(k),B=this.RS(i);const w=this.Wt[k][i];
      ln.setAttribute('d',`M${A.x} ${A.y-12}L${B.x} ${B.y+12}`);ln.setAttribute('stroke-width',f1(.5+7*w));ln.style.opacity=on*(.15+.75*w)}))}},

/* 2018 · prompt */
prompt:{dur:6.8,hold:2.6,init(svg){const L=layers(svg,131);this.L=L;
    this.given=el('path',{class:'givenroad',d:'M0 0'},L.bg);
    this.fan=fan(L.mid,R(4),R(5),[['chat',.70],['chien',.18],['cheval',.12]],100);
    this.p=posts(L.mid,['cheese','fromage','dog','chien','cat','chat'],R,['given','given','given','given','given','']);
    const x0=R(-.6).x,x1=R(4.3).x;this.br=el('path',{d:`M${x0} 70v-8H${x1}v8`,class:'leash'},L.mid);
    this.hl=txt(L.mid,(x0+x1)/2,52,'hand','middle');this.hl.textContent='road laid by the user: two examples and a cue';
    this.w=walker(L.top)},
  draw(t){const g=t<.3?-1:Math.min(4.3,-1+(t-.3)/.45);this.given.setAttribute('d',roadD(-1,g));
    const s=4+ease(seg(t,5.3,6.1));this.L.road.setAttribute('d',s>4.01?roadD(4,s):'M0 0');
    this.p.forEach((p,i)=>{if(i<5){const u=seg(t,.3+i*.45,.6+i*.45);p.style.opacity=u;p.setAttribute('transform',`translate(0 ${f1(-12*(1-u))})`)}else p.style.opacity=rev(s,i)});
    this.br.style.opacity=this.hl.style.opacity=seg(t,1.8,2.4);
    this.fan.set(ease(seg(t,3.1,4)),seg(t,3.9,4.4),seg(t,4.8,5.1),seg(t,6.1,6.6));
    const q=R(s);place(this.w,q.x,q.y);this.w.style.opacity=seg(t,2.5,2.9)}},

/* 2020 · diffusion */
diffusion:{dur:6.6,hold:3,init(svg){const bg=el('g',{},svg);tufts(bg,137);
    const RD=s=>({x:130+s*118,y:206});this.RD=RD;this.road=el('path',{class:'road',d:'M0 0'},bg);
    this.p=posts(bg,['pure noise','','','','','done'],RD);
    const nz=noiseArr(160,11),blocks=[16,8,4,2,1,1],amt=[1,.7,.45,.25,.1,0];
    this.th=blocks.map((b,k)=>{const c=RD(k);const g=el('g',{},bg);const cv=canvasGrid(g,c.x-48,52,96,60,16,10);cv.set(draft(16,10,b,amt[k],nz));
      el('path',{d:`M${c.x} 116V${c.y-30}`,class:'leash'},g);g.style.opacity=0;return g});
    this.w=walker(svg);this.hud=txt(svg,24,30,'hud');this.hud.textContent='every footprint leaves a draft'},
  draw(t){const s=walkS(t,1.05,-1,5);this.road.setAttribute('d',roadD(-1,s,this.RD));this.p.forEach((p,i)=>p.style.opacity=rev(s,i));
    this.th.forEach((g,k)=>{const u=rev(s,k);g.style.opacity=u});const q=this.RD(s);place(this.w,q.x,q.y)}},

/* 2021 · guidance */
guide:{dur:6.6,hold:3,init(svg){const bg=el('g',{},svg);tufts(bg,139);
    shadow(bg,290,12,220,40,8);el('rect',{x:290,y:12,width:220,height:40,rx:8,class:'card'},bg);const c=onPanel(txt(bg,400,39,'note','middle'));c.textContent='a tree on a hill, sunny';c.style.fontSize='23px';
    const nz=noiseArr(160,5);const mute=(u,v)=>lerpC(scene(u,v),[150,148,140],.5);
    const boost=(u,v)=>{const s=scene(u,v),m=(s[0]+s[1]+s[2])/3;return s.map(x=>clamp(m+(x-m)*1.45,0,255))};
    const blocks=[16,8,4,2,1,1],amt=[1,.7,.45,.25,.1,0];
    this.dL=blocks.map((b,k)=>draft(16,10,b,amt[k],nz,mute));this.dR=blocks.map((b,k)=>draft(16,10,b,amt[k],nz,boost));
    this.cL=canvasGrid(bg,70,78,176,110,16,10);this.cR=canvasGrid(bg,554,78,176,110,16,10);
    const a=txt(bg,158,214,'hand','middle');a.textContent='glances lightly';const b=txt(bg,642,214,'hand','middle');b.textContent='glances hard';
    this.gL=el('path',{d:'M282 196L360 54',class:'glance'},bg);this.gR=el('path',{d:'M518 196L440 54',class:'glance','stroke-width':3},bg);
    this.wL=walker(svg);place(this.wL,282,236);this.wR=walker(svg);place(this.wR,518,236,-1);this.k=-1},
  draw(t){const k=Math.min(5,Math.max(0,Math.floor((t-.4)/1.05)));if(k!==this.k){this.k=k;this.cL.set(this.dL[k]);this.cR.set(this.dR[k])}
    const ph=((t-.4)/1.05)%1;const g=t>.4&&k<5?1-clamp(ph/.5):0;this.gL.style.opacity=.6*g;this.gR.style.opacity=g}},

/* 2022 · human feedback */
rlhf:{dur:7,hold:3,init(svg){const bg=el('g',{},svg);tufts(bg,149);
    const J={x:190,y:140},C={x:350,y:140};this.J=J;
    el('path',{d:`M20 ${J.y}H${J.x}`,class:'givenroad'},bg);const rq=txt(bg,30,J.y-22,'hand');rq.textContent='a request';
    this.E=[42,104,176,238].map(y=>({x:640,y}));this.w0=[7,10,8,5];this.w1=[15,4,12,2];this.ok=[true,false,true,false];
    this.E.forEach((E,i)=>el('path',{d:roadD(0,1,u=>bez(J,C,E,u)),class:'oldtrail','stroke-width':this.w0[i]},bg));
    this.tr=this.E.map((E,i)=>el('path',{d:roadD(0,1,u=>bez(J,C,E,u)),class:'worn','stroke-width':this.w0[i]},bg));
    this.ink=this.E.map(E=>el('path',{d:roadD(0,1,u=>bez(J,C,E,u)),class:'inkline','stroke-dasharray':'520 600','stroke-dashoffset':520},bg));
    this.st=this.E.map((E,i)=>stampT(bg,E.x+14,E.y+7,this.ok[i],this.ok[i]?'✓ ended well':'✗ ended badly'));
    el('path',{d:`M${J.x-60} ${J.y+4}v-22`,class:'gate'},bg);this.leash=el('path',{d:`M${J.x-60} ${J.y-14}Q${J.x-30} ${J.y-2} ${J.x+6} ${J.y-22}`,class:'leash'},bg);
    this.ll=txt(bg,24,236,'hand');this.ll.textContent='the leash: stay near the old trails';
    this.w=walker(svg);place(this.w,J.x,J.y);this.hud=txt(svg,24,30,'hud')},
  draw(t){this.ink.forEach((p,i)=>{p.setAttribute('stroke-dashoffset',f1(520*(1-ease(seg(t,.4+i*.5,1.2+i*.5)))));p.style.opacity=.75*(1-seg(t,5.6,6.2))});
    this.st.forEach((s,i)=>s.style.opacity=seg(t,3+i*.25,3.3+i*.25));
    const m=ease(seg(t,4.2,5.6));this.tr.forEach((p,i)=>{const w=lerp(this.w0[i],this.w1[i],m);p.setAttribute('stroke-width',f1(w));p.setAttribute('stroke-opacity',f1(.15+.85*w/15))});
    const l=seg(t,5.8,6.4);this.leash.style.opacity=l;this.ll.style.opacity=l;
    this.hud.textContent=T(t<2.9?'the walker takes whole walks':t<4.2?'a judge marks where each one ended':t<5.8?'the trails are re-worn toward good endings':'but held near the old trails')}},

/* 2022 · scouting */
scout:{dur:7.4,hold:2.8,init(svg){const bg=el('g',{},svg);tufts(bg,151);
    const RK=s=>({x:90+s*152,y:146+8*Math.sin(s*1.2)});this.RK=RK;
    el('path',{class:'givenroad',d:roadD(-.5,0,RK)},bg);this.road=el('path',{class:'road',d:'M0 0'},bg);this.sr=el('path',{class:'scoutroad',d:'M0 0'},bg);
    this.p=posts(bg,['17 × 24 =','17 × 20 = 340','17 × 4 = 68','340 + 68 =','408'],RK,['given','scout','scout','scout','strong']);this.p[0].style.opacity=1;
    const x0=RK(.6).x,x1=RK(3.4).x;this.br=el('path',{d:`M${x0} 88v-8H${x1}v8`,class:'leash'},bg);
    this.bl=txt(bg,(x0+x1)/2,70,'hand','middle');this.bl.textContent='scouting: used to reach the answer, then set aside';
    this.al=txt(bg,RK(4).x,RK(4).y-56,'hand','middle');this.al.textContent='the product';
    this.w=walker(svg)},
  draw(t){const s=walkS(t-.6,1.05,0,4);this.road.setAttribute('d',roadD(0,s,this.RK));this.sr.setAttribute('d',s>.25?roadD(.2,Math.min(s,3),this.RK):'M0 0');
    const fade=seg(t,5.6,6.4);this.p.forEach((p,i)=>{if(!i)return;p.style.opacity=rev(s,i)*(i<4?1-.65*fade:1)});this.sr.style.opacity=1-.6*fade;
    this.br.style.opacity=this.bl.style.opacity=fade;this.al.style.opacity=seg(t,6.2,6.8);const q=this.RK(s);place(this.w,q.x,q.y)}},

/* 2023 · tools */
tools:{dur:8.2,hold:2.6,init(svg){const L=layers(svg,157);this.L=L;
    this.given=el('path',{class:'givenroad',d:roadD(3.45,4.55)},L.bg);this.road2=el('path',{class:'road',d:'M0 0'},L.bg);
    this.p=posts(L.mid,['Walking','appeared','in','[search]','→ 1862','1862'],R,['','','','','given','strong']);
    this.hl=txt(L.mid,R(4).x,R(4).y-58,'hand','middle');this.hl.textContent='laid by a search tool';
    this.wait=txt(L.mid,R(3).x,R(3).y-58,'hand','middle');this.wait.textContent='waiting…';
    this.w=walker(L.top)},
  draw(t){let s;if(t<4.4)s=walkS(t,1.1,-1,3);else if(t<5.9)s=3;else if(t<6.6)s=3+ease(seg(t,5.9,6.6));else s=4+ease(seg(t,6.9,7.6));
    this.L.road.setAttribute('d',roadD(-1,Math.min(s,3.45)));this.road2.setAttribute('d',s>4.5?roadD(4.55,s):'M0 0');
    const g=seg(t,5,5.6);this.given.style.opacity=g;
    this.p.forEach((p,i)=>{if(i===4){p.style.opacity=g;p.setAttribute('transform',`translate(0 ${f1(-12*(1-g))})`)}else p.style.opacity=rev(s,i)});
    this.hl.style.opacity=g;this.wait.style.opacity=seg(t,4.4,4.6)*(1-seg(t,5,5.3));const q=R(s);place(this.w,q.x,q.y)}},

/* heading & merge share a compass */
heading:{dur:15.4,hold:1.2,init(svg){this.H=headingSetup(svg,171);this.w=walker(svg);this.d=dog(svg,DOGC[0]);
    this.trs=this.H.roads.map((rd,k)=>{const tr=new Trip(k*7.7+3.3,2.78);tr.go(-.3,420,true).go(2.78,420);return tr});
    this.hud=txt(svg,24,30,'hudb');this.hud2=txt(svg,24,48,'hud');this.hud2.textContent='same spot, different road: a different heading, a different blaze'},
  draw(t){const k=t<7.7?0:1,u=t-k*7.7,H=this.H,rd=H.roads[k],o=H.roads[1-k];
    const s=walkS(u,.8,-1,3),fade=k?1:1-seg(u,7.1,7.6);
    rd.path.setAttribute('d',roadD(-1,s,rd.R));rd.path.style.opacity=fade;rd.p.forEach((p,i)=>p.style.opacity=rev(s,i)*fade);
    o.path.style.opacity=0;o.p.forEach(p=>p.style.opacity=0);
    const q=rd.R(s);place(this.w,q.x,q.y);this.w.style.opacity=fade;
    const tr=this.trs[k],d=tr.at(t),dp=rd.R(d.s);setDog(this.d,dp.x,dp.y+8,d.dir,d.mv,t);this.d.style.opacity=(t>=tr.kf[0].t&&t<=tr.t+.05)?1:0;
    const base=Math.atan2(rd.R(3).y-rd.R(2).y,rd.R(3).x-rd.R(2).x)*180/Math.PI;
    setBlaze(H,lerp(base,rd.th,ease(seg(u,4.7,5.4))),seg(u,4.7,5.3)*fade);
    this.hud.textContent=T(k?'Road 2: “I went to the”':'Road 1: “in wildness is the”')}},

merge:{dur:7.6,hold:2.6,init(svg){this.H=headingSetup(svg,173);this.wa=walker(svg);this.wb=walker(svg);this.hud=txt(svg,24,30,'hudb');this.hud2=txt(svg,24,48,'hud');this.hud.textContent='Shannon’s walker sees only the last word'},
  draw(t){const H=this.H,[A,B]=H.roads;const sa=walkS(t,.75,-1,3),sb=walkS(t-3.6,.75,-1,3);
    A.path.setAttribute('d',roadD(-1,sa,A.R));A.p.forEach((p,i)=>p.style.opacity=rev(sa,i));
    B.path.setAttribute('d',t>3.6?roadD(-1,sb,B.R):'M0 0');B.p.forEach((p,i)=>p.style.opacity=t>3.6?rev(sb,i):0);
    let q=A.R(sa);place(this.wa,q.x,q.y);this.wa.style.opacity=1-seg(t,6.3,6.6);q=B.R(sb);place(this.wb,q.x,q.y);this.wb.style.opacity=seg(t,3.6,3.9);
    setBlaze(H,0,Math.max(seg(t,3.05,3.4)*(1-seg(t,3.6,3.9)),seg(t,6.6,7)));
    this.hud2.textContent=T(t<6.6?(t<3.6?'road 1 reaches “the”':'road 2 reaches “the”'):'both roads, one junction: same heading, same blaze')}},

/* 1966 · ELIZA */
eliza:{dur:8.4,hold:2.8,init(svg){const bg=el('g',{},svg);tufts(bg,181);const Y=150,J={x:300,y:Y};
    const cut=(d,w)=>{el('path',{d,class:'cutedge','stroke-width':w+4},bg);el('path',{d,class:'cutfill','stroke-width':w},bg)};
    cut(`M${J.x} ${Y}L${J.x+60} ${Y-66}H560`,12);cut(`M${J.x} ${Y}L${J.x+60} ${Y+66}H560`,12);cut(`M${J.x-6} ${Y}H770`,20);
    const RU=s=>({x:70+s*80,y:Y});el('path',{class:'givenroad',d:roadD(-.6,2.6,RU)},bg);
    this.pu=posts(bg,['I','am','sad'],RU,['given','given','given']);
    this.hu=txt(bg,150,Y-30,'hand','middle');this.hu.textContent='typed by the user';
    const s1=txt(bg,372,Y-86,'sign');s1.textContent='“… my mother …” → Tell me about your family.';
    const s2=txt(bg,372,Y+94,'sign');s2.textContent='anything else → Please go on.';
    this.rule=txt(bg,24,34,'hudb');this.rule.textContent='rule matched:  I am ___  →  How long have you been ___?';
    this.ring=el('circle',{cx:J.x,cy:Y,r:16,class:'ring'},bg);
    const RM=s=>({x:350+s*76,y:Y});this.RM=RM;this.pm=posts(bg,['How','long','have','you','been','sad?'],RM);
    this.r1=el('circle',{cx:RU(2).x,cy:Y,r:13,class:'ring'},bg);this.r2=el('circle',{cx:RM(5).x,cy:Y,r:13,class:'ring'},bg);
    this.w=walker(svg)},
  draw(t){this.pu.forEach((p,i)=>p.style.opacity=seg(t,.2+i*.4,.5+i*.4));this.hu.style.opacity=seg(t,1,1.4);
    const r=seg(t,1.7,2.1);this.rule.style.opacity=r;this.ring.style.opacity=r;
    const s=walkS(t-2.3,.8,-1,5);this.pm.forEach((p,i)=>p.style.opacity=rev(s,i));const q=this.RM(s);place(this.w,q.x,q.y);this.w.style.opacity=seg(t,2,2.3);
    const c=seg(t,6.5,6.9);this.r1.style.opacity=c;this.r2.style.opacity=c}},

/* 1989 · HMM garden */
hmm:{dur:8.6,hold:2.6,init(svg){const bg=el('g',{},svg);tufts(bg,191);
    const st=['s','p','ee','ch'],X=i=>150+i*165,Y=168;
    const cut=(d,w)=>{el('path',{d,class:'cutedge','stroke-width':w+4},bg);el('path',{d,class:'cutfill','stroke-width':w},bg)};
    const loopD=i=>`M${X(i)-12} ${Y-14}C${X(i)-46} ${Y-100} ${X(i)+46} ${Y-100} ${X(i)+12} ${Y-14}`;
    const fwdD=i=>i<3?`M${X(i)+18} ${Y}H${X(i+1)-18}`:`M${X(3)+18} ${Y}H780`;
    cut(`M30 ${Y}H${X(0)-18}`,12);for(let i=0;i<4;i++){cut(loopD(i),9);cut(fwdD(i),12)}
    this.pl=[.7,.55,.8,.6];this.wl=[];this.wf=[];
    for(let i=0;i<4;i++){this.wl.push(el('path',{d:loopD(i),class:'worn','stroke-width':6,'stroke-opacity':0},bg));this.wf.push(el('path',{d:fwdD(i),class:'worn','stroke-width':8,'stroke-opacity':0},bg))}
    st.forEach((w,i)=>{el('circle',{cx:X(i),cy:Y,r:19,class:'plaza'},bg);const t=txt(bg,X(i),Y+7,'flabel','middle');t.textContent=w});
    this.lab=[];for(let i=0;i<4;i++){const a=txt(bg,X(i),Y-94,'prob','middle');a.textContent=`stay ${this.pl[i].toFixed(2)}`;const b=txt(bg,X(i)+82,Y+26,'prob','middle');b.textContent=`next ${(1-this.pl[i]).toFixed(2)}`;this.lab.push(a,b)}
    let sd=9;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;this.gh=[];
    for(let g=0;g<14;g++){const pts=[[30,Y]];
      for(let i=0;i<4;i++){pts.push([X(i),Y]);let n=0;while(r()<this.pl[i]&&n<2){n++;for(let k=1;k<=12;k++){const u=k/12,P=[X(i),Y],c1=[X(i)-46,Y-100],c2=[X(i)+46,Y-100];
        pts.push([0,1].map(j=>(1-u)**3*P[j]+3*(1-u)**2*u*c1[j]+3*(1-u)*u*u*c2[j]+u**3*P[j]))}}}
      pts.push([780,Y]);const cum=[0];for(let k=1;k<pts.length;k++)cum.push(cum[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]));
      this.gh.push({t0:.9+g*.26,pts,cum,c:el('circle',{r:4,class:'ghost'},bg)})}
    this.h1=txt(svg,24,30,'hand');this.h1.textContent='paths cut by hand: which sound may follow which';
    this.h2=txt(svg,24,52,'hand');this.h2.textContent='how worn each one gets: learned from recordings'},
  draw(t){for(const g of this.gh){const d=(t-g.t0)*420,L=g.cum[g.cum.length-1];if(d<0||d>=L){g.c.style.opacity=0;continue}
      let k=1;while(g.cum[k]<d)k++;const u=(d-g.cum[k-1])/((g.cum[k]-g.cum[k-1])||1),a=g.pts[k-1],b=g.pts[k];
      g.c.setAttribute('cx',f1(lerp(a[0],b[0],u)));g.c.setAttribute('cy',f1(lerp(a[1],b[1],u)-5));g.c.style.opacity=.45}
    const w=seg(t,1.2,7.2);this.wl.forEach((e,i)=>e.setAttribute('stroke-opacity',f1(w*this.pl[i])));this.wf.forEach((e,i)=>e.setAttribute('stroke-opacity',f1(w*(1-this.pl[i]))));
    this.h2.style.opacity=seg(t,1.4,1.9);this.lab.forEach(l=>l.style.opacity=seg(t,7.2,7.7))}},

/* 2012 · AlexNet */
alexnet:{dur:8.4,hold:3,init(svg){const bg=el('g',{},svg);tufts(bg,211);
    const YT=74,YB=186,SX=[250,400,550],X1=600;this.YB=YB;this.X1=X1;
    const photo=y=>{const g=el('g',{},bg);canvasGrid(g,24,y-23,70,46,14,9).set(draft(14,9,1,0,noiseArr(126,2)));return g};
    photo(YT);photo(YB);
    const c1=txt(bg,24,36,'hudb');c1.textContent='cut by hand: features engineers chose';
    const c2=txt(bg,24,146,'hudb');c2.textContent='worn in: features learned from a million photos';
    /* top lane: crisp cut path through hand-built detectors */
    const cut=(d,w)=>{el('path',{d,class:'cutedge','stroke-width':w+4},bg);el('path',{d,class:'cutfill','stroke-width':w},bg)};
    cut(`M100 ${YT}H${X1}`,12);
    ['edge detector','corner detector','color histogram'].forEach((w,i)=>{el('circle',{cx:SX[i],cy:YT,r:14,class:'plaza'},bg);const t=txt(bg,SX[i],YT+36,'sign','middle');t.textContent=w});
    /* bottom lane: worn trail through learned layers */
    this.trail=el('path',{d:`M100 ${YB}H${X1}`,class:'worn','stroke-width':2,'stroke-opacity':.15},bg);
    let sd=5;const r=()=>(sd=(sd*16807)%2147483647)/2147483647;this.gh=[];
    for(let i=0;i<34;i++)this.gh.push({t0:1.1+i*.15,dy:(r()-.5)*8,c:el('circle',{r:3.6,class:'ghost'},bg)});
    const ink={class:'heading','stroke-width':1.6};
    const tiles=[
      [g=>el('path',{d:'M-6 0H6',...ink},g),g=>el('path',{d:'M-5 5L5 -5',...ink},g),g=>el('path',{d:'M0 -6V6',...ink},g)],
      [g=>el('path',{d:'M-6 -4H6M-6 0H6M-6 4H6',...ink,'stroke-width':1.1},g),g=>[[-3,-3],[3,-3],[-3,3],[3,3],[0,0]].forEach(([x,y])=>el('circle',{cx:x,cy:y,r:1.3,class:'head'},g)),g=>el('path',{d:'M-6 2q2 -5 4 0t4 0t4 0',...ink,'stroke-width':1.3},g)],
      [g=>el('circle',{cx:0,cy:0,r:5.5,class:'vdot'},g),g=>el('rect',{x:-2,y:-6,width:4,height:12,rx:1,class:'house'},g),g=>el('path',{d:'M-7 5Q0 -5 7 5Z',class:'vdot'},g)]];
    this.st=SX.map((x,i)=>{const g=el('g',{},bg);shadow(g,x-32,YB-14,64,28,6);el('rect',{x:x-32,y:YB-14,width:64,height:28,rx:6,class:'panel'},g);
      const ts=tiles[i].map((f,j)=>{const tg=el('g',{transform:`translate(${x-19+j*19} ${YB})`},g);el('rect',{x:-8,y:-8,width:16,height:16,rx:2,class:'frame','stroke-opacity':.35},tg);f(tg);tg.style.opacity=0;return tg});
      const l=txt(bg,x,YB+38,'barlab','middle');l.textContent=['layer 1: edges','layer 3: textures','layer 5: parts'][i];return ts});
    this.lt=txt(bg,X1+14,YT+6,'flabel');this.lt.textContent='tree?';this.lt.style.fill='var(--muted)';
    this.lb=txt(bg,X1+14,YB+6,'flabel');this.lb.textContent='tree';
    this.sT=stampT(bg,X1+14,YT+34,false,'26% wrong');this.sB=stampT(bg,X1+14,YB+34,true,'15% wrong')},
  draw(t){const V=320,L=this.X1-100;let n=0;
    for(const g of this.gh){const d=(t-g.t0)*V;if(d<0||d>L){g.c.style.opacity=0;if(d>L)n++;continue}g.c.setAttribute('cx',f1(100+d));g.c.setAttribute('cy',f1(this.YB-5+g.dy));g.c.style.opacity=.4}
    const w=n/this.gh.length;this.trail.setAttribute('stroke-width',f1(2+12*w));this.trail.setAttribute('stroke-opacity',f1(.15+.85*w));
    this.st.forEach((ts,i)=>ts.forEach((tg,j)=>tg.style.opacity=seg(t,1.8+i*1.3+j*.25,2.3+i*1.3+j*.25)));
    this.lb.style.opacity=seg(t,6.4,6.9);this.sT.style.opacity=seg(t,7,7.4);this.sB.style.opacity=seg(t,7.3,7.7)}},

/* 2020 · scaling laws */
scaling:{dur:8.6,hold:3,init(svg){const bg=el('g',{},svg);tufts(bg,199);
    const J={x:150,y:140},C={x:220,y:140};this.E=[62,140,218].map(y=>({x:290,y}));this.words=['preservation','world','end'];
    this.p0=[.36,.33,.31];this.p1=[.60,.30,.10];
    el('path',{d:`M24 ${J.y}H${J.x}`,class:'road'},bg);
    const lt=txt(bg,30,J.y-22,'note');lt.textContent='in wildness is the …';lt.style.fontSize='20px';
    this.br=this.E.map(E=>el('path',{d:roadD(0,1,u=>bez(J,C,E,u)),class:'worn'},bg));
    this.lb=this.E.map((E,i)=>{const t=txt(bg,E.x+14,E.y+6,'flabel');t.append(this.words[i]);const s=el('tspan',{class:'prob',dx:5},t);return s});
    this.cap=txt(bg,30,J.y+46,'hand');
    /* chart */
    const X0=500,Y1=206,P=k=>({x:X0+18+k*44,y:58+k*25});this.P=P;
    shadow(bg,468,18,312,226,10);el('rect',{x:468,y:18,width:312,height:226,rx:10,class:'panel'},bg);
    el('path',{d:`M${X0} 34V${Y1}H768`,class:'frame'},bg);
    const yl=onPanel(txt(bg,X0+8,38,'hud'));yl.textContent='how far off the blaze is';
    const xl=onPanel(txt(bg,768,236,'hud','end'));xl.textContent='walkers × ground (log) →';
    ['1','10','100','1k','10k'].forEach((v,k)=>{const q=onPanel(txt(bg,P(k).x,Y1+14,'barlab','middle'));q.textContent=v});
    this.ln=el('path',{d:`M${P(0).x} ${P(0).y}L${P(4).x} ${P(4).y}`,class:'inkline','stroke-dasharray':'240 400','stroke-dashoffset':240},bg);
    const F=P(5.2);this.ext=el('path',{d:`M${P(4).x} ${P(4).y}L${F.x} ${F.y}`,class:'leash'},bg);
    this.dots=[0,1,2,3,4].map(k=>el('circle',{cx:P(k).x,cy:P(k).y,r:4.5,class:'vdot'},bg));
    this.ring=el('circle',{cx:F.x,cy:F.y,r:9,class:'ring'},bg);
    this.fc=onPanel(txt(bg,F.x-24,F.y+10,'hand','end'));this.fc.style.fontSize='18px';this.fc.textContent='forecast, before it was built';
    this.hud=txt(svg,24,30,'hudb');this.hud.textContent='each step: ten times more walkers, finer ground'},
  draw(t){const x=clamp((t-.6)/1.25,0,4),k=Math.floor(x),u=ease(clamp((x-k)/.5)),K=Math.min(4,k+u);
    const f=K/4,p=this.p0.map((v,i)=>lerp(v,this.p1[i],f)),pm=Math.max(...p);
    this.br.forEach((e,i)=>{e.setAttribute('stroke-width',f1(2+20*p[i]));e.setAttribute('stroke-opacity',f1(.2+.8*p[i]/pm))});
    this.lb.forEach((s,i)=>s.textContent=p[i].toFixed(2));
    this.cap.textContent=T(K<1.5?'few walkers, coarse ground':K<3.5?'more walkers, finer ground':'many walkers, fine ground');
    this.dots.forEach((d,i)=>d.style.opacity=seg(t,.6+i*1.25,.9+i*1.25));
    this.ln.setAttribute('stroke-dashoffset',f1(240*(1-clamp(x/4))));this.ln.style.opacity=seg(t,1.6,2);
    const e=seg(t,6.4,7.2);this.ext.style.opacity=e;this.ring.style.opacity=seg(t,7,7.4);this.fc.style.opacity=seg(t,7.2,7.7)}},

/* 2023 · collapse */
collapse:{dur:8.4,hold:2.6,init(svg){const bg=el('g',{},svg);tufts(bg,163);
    const J={x:220,y:140},C={x:380,y:140};el('path',{d:`M24 ${J.y}H${J.x}`,class:'road'},bg);
    const lt=txt(bg,40,J.y-22,'note');lt.textContent='the wild …';lt.style.fontSize='22px';
    this.E=[44,108,172,236].map(y=>({x:640,y}));this.words=['world','west','rose','geese'];
    let p=[.45,.30,.15,.10];this.gens=[p];for(let g=1;g<5;g++){const q=p.map(x=>Math.pow(x,1.8)),z=q.reduce((a,b)=>a+b);p=q.map(x=>x/z);this.gens.push(p)}
    this.br=this.E.map(E=>el('path',{d:roadD(0,1,u=>bez(J,C,E,u)),class:'worn'},bg));
    this.lb=this.E.map((E,i)=>{const t=txt(bg,E.x+26,E.y+6,'flabel');t.append(this.words[i]);const s=el('tspan',{class:'prob',dx:6},t);return{t,s}});
    this.hud=txt(svg,24,30,'hudb');this.hud2=txt(svg,24,48,'hud')},
  draw(t){const x=clamp((t-.8)/1.6,0,4),g=Math.floor(x),u=ease(clamp((x-g)/.55));const a=this.gens[g],b=this.gens[Math.min(4,g+1)];
    const p=a.map((v,i)=>lerp(v,b[i],u));
    const pmx=Math.max(...p);this.br.forEach((e,i)=>{e.setAttribute('stroke-width',f1(2+26*p[i]));e.setAttribute('stroke-opacity',f1(.15+.85*p[i]/pmx));e.style.opacity=clamp(p[i]*14)});
    this.lb.forEach((l,i)=>{l.s.textContent=p[i]<.005?'gone':Math.round(p[i]*100)+'%';l.t.style.opacity=.35+.65*clamp(p[i]*12)});
    const G=Math.round(x)+1;this.hud.textContent=`Generation ${G}`;this.hud2.textContent=G===1?T('trained on human footprints'):L(`trained on generation ${G-1}’s footprints`,`trained on generation ${G-1}’s outputs`)}}
};

const FIGS={
/* 1 · the walk */
walk:{dur:8.9,hold:2.6,init(svg){const L=layers(svg,11);this.L=L;this.p=posts(L.mid);this.w=walker(L.top);this.note=txt(L.top,400,244,'note','middle')},
  draw(t){const s=walkS(t,1.05,-1,7);this.L.road.setAttribute('d',roadD(-1,s));this.p.forEach((p,i)=>p.style.opacity=rev(s,i));
    const q=R(s);place(this.w,q.x,q.y);this.note.textContent=W.filter((_,i)=>s>=i-.02).join(' ')}},

/* 2 · the blaze */
blaze:{dur:5.4,hold:2.2,init(svg){const L=layers(svg,23);this.L=L;this.fan=fan(L.mid,R(3),R(4),[['preservation',.40],['world',.35],['end',.25]]);this.p=posts(L.mid);this.w=walker(L.top);
    this.hud=txt(L.top,24,32,'hud');this.hud.textContent='after “in wildness is the”, the blaze:'},
  draw(t){const s=3+ease(seg(t,3.2,4.2));this.L.road.setAttribute('d',roadD(-1,s));this.p.forEach((p,i)=>p.style.opacity=rev(s,i));
    this.fan.set(ease(seg(t,.3,1.3)),seg(t,1.1,1.7),seg(t,2.5,2.9),seg(t,4.2,4.9));const q=R(s);place(this.w,q.x,q.y)}},

/* 3 · trails */
trails:{dur:9.8,hold:2.4,init(svg){const bg=el('g',{},svg);tufts(bg,37);this.J={x:300,y:140};const J=this.J;
    this.ends=[{x:622,y:56,w:'preservation',p:.6},{x:634,y:146,w:'world',p:.3},{x:622,y:232,w:'end',p:.1}];
    this.C={x:450,y:140};const Bz=(b,u)=>{const E=this.ends[b],C=this.C;return{x:(1-u)**2*J.x+2*(1-u)*u*C.x+u*u*E.x,y:(1-u)**2*J.y+2*(1-u)*u*C.y+u*u*E.y}};this.Bz=Bz;
    el('path',{d:`M24 ${J.y}H${J.x}`,class:'road'},bg);
    this.br=this.ends.map((E,b)=>el('path',{d:roadD(0,1,u=>Bz(b,u)),class:'worn','stroke-width':2,'stroke-opacity':.15},bg));
    const lab=txt(bg,40,J.y-22,'note');lab.textContent='in wildness is the …';lab.style.fontSize='22px';
    this.lbl=this.ends.map(E=>{const t=txt(bg,E.x+22,E.y+6,'flabel');t.append(E.w);const s=el('tspan',{class:'prob',dx:6},t);s.textContent=Math.round(E.p*100)+'%';t.style.opacity=0;return t});
    const pattern=[0,1,0,0,2,0,1,0,1,0];this.N=44;this.gh=[];
    for(let i=0;i<this.N;i++)this.gh.push({t0:.3+i*.135,b:pattern[(i*7)%10],c:el('circle',{r:4.2,class:'ghost'},svg)});
    this.w=walker(svg);this.hud=txt(svg,24,30,'hud');},
  draw(t){const V=300,S1=276,S2=470,J=this.J;const cnt=[0,0,0];
    for(const g of this.gh){const d=(t-g.t0)*V;if(d<0){g.c.style.opacity=0;continue}let p;
      if(d<S1)p={x:J.x-S1+d,y:J.y};else{cnt[g.b]++;const u=(d-S1)/S2;if(u>=1){g.c.style.opacity=0;continue}p=this.Bz(g.b,u)}
      g.c.setAttribute('cx',f1(p.x));g.c.setAttribute('cy',f1(p.y-6));g.c.style.opacity=.42}
    this.br.forEach((b,i)=>{b.setAttribute('stroke-width',f1(2+cnt[i]*.42));b.setAttribute('stroke-opacity',f1(.15+.85*Math.min(1,cnt[i]/26)))});
    const end=seg(t,8.6,9.4);this.lbl.forEach(l=>l.style.opacity=end);this.w.style.opacity=end;place(this.w,J.x-14,J.y);
    this.hud.textContent=t<8.6?L(`walkers so far: ${cnt[0]+cnt[1]+cnt[2]}`,`training examples so far: ${cnt[0]+cnt[1]+cnt[2]}`):T('the blaze here is just this wear')}},

/* 4 · n-gram */
ngram:{dur:9.2,hold:2.4,init(svg){const L=layers(svg,41);this.L=L;this.cone=el('path',{class:'cone',d:'M0 0'},L.mid);this.p=posts(L.mid);this.w=walker(L.top);
    this.hud=txt(L.top,24,32,'hud');this.hud.append('in view:');this.hudb=el('tspan',{class:'hudb',dx:6},this.hud)},
  draw(t){const s=walkS(t,1.1,-1,7),sb=s-1.72;this.L.road.setAttribute('d',roadD(-1,s));
    this.p.forEach((p,i)=>p.style.opacity=rev(s,i)*(i>=sb-.05?1:.18));const q=R(s),b=R(Math.max(sb,-1));
    this.cone.setAttribute('d',s<-.2?'M0 0':`M${f1(q.x-2)} ${f1(q.y-34)}L${f1(b.x-6)} ${f1(b.y-30)}L${f1(b.x-6)} ${f1(b.y+52)}L${f1(q.x-2)} ${f1(q.y+4)}Z`);
    place(this.w,q.x,q.y,-1);
        this.hudb.textContent='“'+W.filter((_,i)=>i<=s+.02&&i>=sb-.05).join(' ')+'”'}},

/* 5 · pack */
pack:{dur:9.2,hold:2.4,init(svg){const L=layers(svg,53);this.L=L;
    shadow(L.mid,250,16,300,56,12);el('rect',{x:250,y:16,width:300,height:56,rx:12,class:'pack'},L.mid);
    const cp=el('clipPath',{id:'packclip'},svg);el('rect',{x:252,y:18,width:296,height:52,rx:11},cp);
    this.chips=onPanel(el('g',{'clip-path':'url(#packclip)'},L.mid));this.ch=W.map(w=>{const t=txt(this.chips,0,52,'flabel','end');t.textContent=w;return t});
    const lab=txt(L.mid,240,49,'hud','end');lab.textContent='the pack';
    this.strap=el('path',{class:'strap',d:'M0 0'},L.mid);this.p=posts(L.mid);this.w=walker(L.top)},
  draw(t){const s=walkS(t,1.1,-1,7);this.L.road.setAttribute('d',roadD(-1,s));
    this.p.forEach((p,i)=>p.style.opacity=rev(s,i)*(i>s-.55?1:.14));
    let right=540;for(let j=W.length-1;j>=0;j--){const c=this.ch[j],age=s-j;if(age<-.02){c.style.opacity=0;continue}const a=Math.max(age,0),sc=Math.max(.5,Math.pow(.86,a));
      c.setAttribute('x',f1(right));c.style.fontSize=f1(24*sc)+'px';c.style.opacity=Math.pow(.6,a)*rev(s,j);right-=(W[j].length*9.5+12)*sc*clamp(age+1)}
    const q=R(s);place(this.w,q.x,q.y);this.strap.setAttribute('d',`M${f1(q.x-2)} ${f1(q.y-28)}Q${f1((q.x+400)/2)} ${f1(q.y-70)} 400 72`)}},

/* 6 · the dog */
dog:{hold:2.8,init(svg){const L=layers(svg,67);this.L=L;
    this.pf=W.map(()=>el('circle',{class:'puff',r:0,style:`--dc:${DOGC[0]}`},L.mid));
    this.bars=W.map((_,k)=>{const x=R(k).x;const g=el('g',{style:`--dc:${DOGC[0]}`},L.mid);const r=el('rect',{x:x-7,width:14,y:250,height:0,rx:2,class:'bar'},g);const tl=txt(g,x,246,'barlab','middle');g.style.opacity=0;return{g,r,tl,k}});
    const bl=txt(L.mid,22,250,'barlab');bl.textContent='sniffs per step →';
    this.p=posts(L.mid);this.w=walker(L.top);this.d=dog(L.top,DOGC[0]);
    const tr=new Trip(.8,1-.24);this.steps=[];
    for(let k=2;k<=7;k++){const r0=tr.t;tr.go(-.4,430,true).go(k-1-.24,430);const a=tr.t;tr.go(k-.24,DX/.7);this.steps.push({k,r0,a,b:tr.t});tr.wait(.35)}
    this.tr=tr;this.dur=tr.t+.2;this.hud=txt(L.top,24,32,'hudb');this.hud2=txt(L.top,24,50,'hud')},
  draw(t){let s=1,cur=null,total=0;
    for(const st of this.steps){if(t>=st.r0)total+=st.k;if(t>=st.b){s=st.k;continue}cur=st;if(t>st.a)s=st.k-1+ease(seg(t,st.a,st.b));break}
    this.L.road.setAttribute('d',roadD(-1,s));this.p.forEach((p,i)=>p.style.opacity=rev(s,i));
    const q=R(s);place(this.w,q.x,q.y);const d=this.tr.at(t),dp=R(d.s);setDog(this.d,dp.x,dp.y+8,d.dir,d.mv,t);
    this.pf.forEach((c,i)=>{const p=R(i);puff(c,p.x,p.y-2,this.tr.last(i,t),t,13,.5)});
    for(const st of this.steps){const b=this.bars[st.k];const u=seg(t,st.r0,st.a);b.g.style.opacity=u>0?1:0;const h=st.k*5*u;b.r.setAttribute('y',f1(250-h));b.r.setAttribute('height',f1(h));b.tl.setAttribute('y',f1(246-h));b.tl.textContent=st.k}
    if(cur){this.hud.textContent=L(`Writing word ${cur.k+1}: the dog sniffs all ${cur.k} footprints first`,`Token ${cur.k+1}: attends to all ${cur.k} previous tokens`)}else this.hud.textContent=T('Done: every word cost a full run');
    this.hud2.textContent=L(`sniffs so far: ${total}`,`attention reads so far: ${total}`)}},

/* 7 · the nose */
nose:{hold:2.6,init(svg){const L=layers(svg,71);this.L=L;this.wts=[.03,.30,.04,.03,.40,.08,.12];
    this.fan=fan(L.mid,R(6),R(7),[['world',.55],['wild',.25],['end',.20]],95);
    this.pf=W.map(()=>el('circle',{class:'puff',r:0,style:`--dc:${DOGC[1]}`},L.mid));
    this.bars=this.wts.map((w,i)=>{const p=R(i);const g=el('g',{style:`--dc:${DOGC[1]}`},L.mid);el('rect',{x:p.x-6,width:12,y:p.y-98,height:38,rx:2,class:'track'},g);const r=el('rect',{x:p.x-6,width:12,y:p.y-60,height:0,rx:2,class:'bar'},g);return{r,base:p.y-60,h:w*92}});
    this.p=posts(L.mid);this.w=walker(L.top);this.d=dog(L.top,DOGC[1]);
    this.bub=onPanel(el('g',{style:`--dc:${DOGC[1]}`},L.top));shadow(this.bub,-92,-50,184,30,15);el('rect',{x:-92,y:-50,width:184,height:30,rx:15,class:'bubble'},this.bub);
    const bt=txt(this.bub,0,-29,'flabel','middle');[['preservation',21],['wildness',17],['the',12]].forEach(([w,sz],i)=>{const sp=el('tspan',{dx:i?6:0},bt);sp.textContent=w;sp.style.fontSize=sz+'px'});
    const tr=new Trip(.7,6-.24);tr.go(-.4,250,true);this.turn=tr.t;tr.go(6-.24,330);this.back=tr.t;tr.wait(2.6);tr.go(7-.24,DX/.8);this.tr=tr;this.dur=this.back+4.1;
    this.hud=txt(L.top,24,32,'hud');this.hud.append('this dog’s nose: ');const hb=el('tspan',{class:'hudb'},this.hud);hb.textContent='what is the walk about?'},
  draw(t){const B=this.back;const s=6+ease(seg(t,B+2.6,B+3.4));this.L.road.setAttribute('d',roadD(-1,s));this.p.forEach((p,i)=>p.style.opacity=rev(s,i));
    const d=this.tr.at(t),dp=R(d.s);setDog(this.d,dp.x,dp.y+8,d.dir,d.mv,t);
    this.pf.forEach((c,i)=>{const p=R(i),w=this.wts[i]||0;puff(c,p.x,p.y-2,this.tr.last(i,t),t,6+40*w,.25+1.1*w,1.1)});
    this.bars.forEach((b,i)=>{const e=this.tr.last(i,t);const h=e?b.h*ease(seg(t,e.t,e.t+.5)):0;b.r.setAttribute('y',f1(b.base-h));b.r.setAttribute('height',f1(h))});
    const bo=seg(t,this.turn,this.turn+.3)*(1-seg(t,B+.1,B+.5));this.bub.style.opacity=bo;place(this.bub,clamp(dp.x,110,690),dp.y);
    this.fan.set(ease(seg(t,B+.2,B+1)),seg(t,B+.9,B+1.4),seg(t,B+2,B+2.4),seg(t,B+3.3,B+3.9));const q=R(s);place(this.w,q.x,q.y)}},


};
Object.assign(FIGS,NEWFIGS);

const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const live=[];
document.querySelectorAll('svg[data-fig]').forEach(svg=>{const def=FIGS[svg.dataset.fig];def.init(svg);
  const st={def,svg,start:performance.now(),vis:false,playing:!reduce};live.push(st);
  const btn=svg.closest('figure').querySelector('.replay');btn.onclick=()=>{st.start=performance.now();st.playing=true};
  new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting&&!st.vis){st.start=performance.now()}st.vis=e.isIntersecting}),{threshold:.3}).observe(svg);
  def.draw(def.dur)});
function frame(now){for(const st of live){if(!st.vis)continue;const D=st.def.dur+st.def.hold;let t=(now-st.start)/1000;
  if(!st.playing)t=st.def.dur;else if(reduce){if(t>D){st.playing=false;t=st.def.dur}}else t%=D;st.def.draw(Math.min(t,st.def.dur))}
  requestAnimationFrame(frame)}
requestAnimationFrame(frame);
/* clear grass tufts and flowers from under any label, once the fonts have their real widths */
function cull(st){const svg=st.svg,M=svg.getScreenCTM();if(!M)return;const I=M.inverse(),pt=(x,y)=>new DOMPoint(x,y).matrixTransform(I);
  st.def.draw(st.def.dur);const boxes=[];
  svg.querySelectorAll('text').forEach(t=>{if(!t.textContent.trim())return;const r=t.getBoundingClientRect();if(!r.width)return;const a=pt(r.left,r.top),b=pt(r.right,r.bottom);boxes.push([a.x-4,a.y-3,b.x+4,b.y+3])});
  svg.querySelectorAll('.tuft,.fl').forEach(e=>{const b=e.getBBox();if(boxes.some(q=>b.x<q[2]&&b.x+b.width>q[0]&&b.y<q[3]&&b.y+b.height>q[1]))e.remove()})}
document.fonts.ready.then(()=>live.forEach(cull));

/* ---- the register switch ---- */
function relabel(svg){const w=document.createTreeWalker(svg,NodeFilter.SHOW_TEXT);let n;
  while((n=w.nextNode())){const o=RLBL[n.nodeValue]??n.nodeValue;const v=T(o);if(v!==n.nodeValue)n.nodeValue=v}}
function setReg(r,keep){const a=keep?[...document.querySelectorAll('main h1,main h2,main h3,main p,main figure,main li')].find(e=>{const b=e.getBoundingClientRect();return b.height>0&&b.bottom>innerHeight*.3}):null;
  const y0=a?a.getBoundingClientRect().top:0;
  document.body.dataset.reg=r;
  const tt=document.querySelector('title');if(tt.dataset.m){tt.dataset.i??=tt.textContent;document.title=r==='m'?tt.dataset.m:tt.dataset.i}
  document.querySelectorAll('.segb').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.reg===r)));
  document.querySelectorAll('[data-al-m]').forEach(e=>{e.dataset.alI??=e.getAttribute('aria-label');e.setAttribute('aria-label',r==='m'?e.dataset.alM:e.dataset.alI)});
  for(const st of live){relabel(st.svg);if(!st.vis||!st.playing)st.def.draw(st.def.dur)}
  if(a){const d=a.getBoundingClientRect().top-y0;if(d)scrollTo({top:scrollY+d,behavior:'instant'})}}
document.querySelectorAll('.segb').forEach(b=>b.addEventListener('click',()=>{setReg(b.dataset.reg,true);try{localStorage.setItem(REGK,b.dataset.reg)}catch(e){}
  document.fonts.ready.then(()=>live.forEach(cull))}));
setReg(isM()?'m':'i',false);
})();
