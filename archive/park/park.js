(()=>{
const REGK='genai-park-reg',THMK='genai-park-theme';
const LBL={
  "leads somewhere real":"true","leads nowhere":"false","passes as human ✓":"high likelihood ✓",
  "the judge sees only the footprints":"the score sees only the text",
  "where the walks ended, which the judge never checks":"whether it is true, which the score never checks",
  "the ground: word vectors":"embedding space","worn in by many walkers":"seen often in training",
  "no walker has been here":"never seen in training","carried over: similar ground":"generalized: similar embeddings",
  "random seed":"z ~ N(0, I)",
  "a painter: the product is the canvas, not the footprints":"image generator: the output is an image, not a sequence",
  "one stroke, no drafts":"one forward pass","source road (French)":"encoder input (French)",
  "the walk (English)":"decoder output (English)",
  "road laid by the user: two examples and a cue":"prompt: two examples and a cue",
  "every footprint leaves a draft":"each step: xₜ → xₜ₋₁, less noisy",
  "glances lightly":"w = 1 (unamplified)","glances hard":"high guidance scale",
  "a request":"prompt","✓ ended well":"✓ high reward","✗ ended badly":"✗ low reward",
  "the leash: stay near the old trails":"− β·KL(π ‖ π_ref): stay near the pretrained model",
  "the walker takes whole walks":"sample complete outputs",
  "a judge marks where each one ended":"a reward model scores each: r(x, y)",
  "the trails are re-worn toward good endings":"the policy is updated toward high reward",
  "but held near the old trails":"with a KL penalty toward the original model",
  "scouting: used to reach the answer, then set aside":"reasoning tokens: computed, then discarded",
  "the product":"final answer","laid by a search tool":"inserted tool output","waiting…":"tool running…",
  "same spot, different road: a different heading, a different blaze":"same last token, different context: different state, different distribution",
  "Road 1: “in wildness is the”":"Context 1: “in wildness is the”",
  "Road 2: “I went to the”":"Context 2: “I went to the”",
  "Shannon’s walker sees only the last word":"bigram model: p(xₜ | xₜ₋₁) only",
  "road 1 reaches “the”":"context 1 ends in “the”","road 2 reaches “the”":"context 2 ends in “the”",
  "both roads, one junction: same heading, same blaze":"same last token: same distribution",
  "typed by the user":"user input",
  "paths cut by hand: which sound may follow which":"designed topology: allowed state transitions",
  "how worn each one gets: learned from recordings":"transition probabilities: estimated with Baum–Welch",
  "cut by hand: features engineers chose":"hand-engineered features + classifier",
  "worn in: features learned from a million photos":"learned convolutional features, trained end to end",
  "26% wrong":"26.2% top-5 error","15% wrong":"15.3% top-5 error",
  "how far off the blaze is":"log L (test loss)","walkers × ground (log) →":"log C (compute) →",
  "forecast, before it was built":"extrapolated before training",
  "each step: ten times more walkers, finer ground":"each point: 10× more compute",
  "trained on human footprints":"trained on human data",
  "after “in wildness is the”, the blaze:":"p(xₜ | “in wildness is the”):",
  "the blaze here is just this wear":"p̂(xₜ | the) = c(the, xₜ) / c(the)",
  "in view:":"context window:","the pack":"hₜ (hidden state)","sniffs per step →":"tokens attended per step →",
  "Done: every word cost a full run":"Done: each token attended over all before it",
  "this dog’s nose: ":"this head’s query: ",
  "what is the walk about?":"what is the topic?",
  "of what?":"governor of “of”?",
  "what came right before?":"adjacent tokens?",
  "few walkers, coarse ground":"small model, little compute",
  "many walkers, fine ground":"large model, much compute","more walkers, finer ground":"more compute",
  "clue A →":"x₁ →","clue B":"x₂","clue A":"x₁",
  "weigh two clues, split the ground":"one perceptron: threshold a weighted sum of two inputs",
  "head for the pond":"class 1","head for the gate":"class 0",
  "wrong turn: nudge the trails":"mistake: w ← w + η(y − ŷ)x","every spot sorted":"converged: no mistakes",
  "pond if exactly one clue holds":"XOR: 1 if exactly one input is on",
  "no straight line sorts these":"not linearly separable",
  "either clue":"h₁ ≈ OR","both clues":"h₂ ≈ AND","exactly one":"y = XOR",
  "hidden clearings: no walker sees them":"hidden layer",
  "forward: trails carry clues from row to row":"forward pass: each unit takes a weighted sum of the layer before",
  "back: blame splits along each trail by its width":"backward pass: the chain rule gives ∂E/∂w for every weight",
  "the middle clearings found these clues on their own":"the hidden units learned these features unaided",
  "… thousands of walks later":"… thousands of gradient steps later",
  "✗ wrong way":"✗ high error","✓ right way":"✓ low error",
  "solid: heed it · dashed: do the opposite":"solid: positive weight · dashed: negative weight",
  "where it says pond":"predicted class 1"
};
const RLBL=Object.fromEntries(Object.entries(LBL).map(([a,b])=>[b,a]));
const reg=()=>document.body.dataset.reg||'i';
const isM=()=>reg()==='m';
const hasMath=()=>reg()!=='i';
const T=s=>isM()?(LBL[s]??s):s;
const L=(i,m)=>isM()?m:i;
const NS='http://www.w3.org/2000/svg';
const ROADC={road:['ru'],givenroad:['gu']};let RID=0;
const el=(tag,a={},p)=>{if(SK&&tag==='path'&&ROADC[a.class])a={...a,class:'mroad'+(a.class==='givenroad'?' given':'')};const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);
  if(p){const rc=tag==='path'&&ROADC[a.class];if(rc){e.id='rd'+(++RID);el('use',{href:'#'+e.id,class:rc[0]},p)}p.appendChild(e);}return e};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const seg=(t,a,b)=>clamp((t-a)/(b-a));
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const lerp=(a,b,u)=>a+(b-a)*u;
const W=['in','wildness','is','the','preservation','of','the','world'];
const DX=84,X0=104,Y0=146,AMP=12;
let SK=false;
const R=s=>({x:X0+s*DX,y:Y0+(SK?0:AMP*Math.sin(s*1.1))});
const f1=n=>n.toFixed(1);
function roadD(a,b,F=R){if(b<=a+1e-3)return 'M0 0';let d='';const n=Math.max(2,Math.ceil((b-a)/.08));for(let k=0;k<=n;k++){const p=F(a+(b-a)*k/n);d+=(k?'L':'M')+f1(p.x)+' '+f1(p.y)}return d}
function place(e,x,y,flip=1){e.setAttribute('transform',`translate(${f1(x)} ${f1(y)}) scale(${flip} 1)`);if(e.gait)e.gait(x,y)}
function tufts(g,seed){if(SK){el('rect',{x:0,y:0,width:800,height:400,class:'mbg'},g);return}let s=seed;const r=()=>(s=(s*16807)%2147483647)/2147483647;
  el('rect',{x:0,y:0,width:800,height:400,fill:'url(#glow)'},g);
  for(let i=0;i<52;i++){const x=r()*800,y=r()*260,k=.75+r()*.6;if(Math.abs(y-Y0)<26&&x<720)continue;
    el('path',{d:`M${f1(x-3*k)} ${f1(y)}q.4 -3 ${f1(2*k)} ${f1(-5*k)}M${f1(x)} ${f1(y)}v${f1(-6.5*k)}M${f1(x+3*k)} ${f1(y)}q-.4 -3 ${f1(-2*k)} ${f1(-5*k)}`,class:'tuft'},g);
    if(r()<.16){const c=['flA','flB','flC'][Math.floor(r()*3)];el('circle',{cx:f1(x+(r()-.5)*6),cy:f1(y-7*k-1.5),r:1.9,class:'fl '+c},g)}}}
function gate(g){if(SK)return;const one=(x,y,o)=>{const e=el('path',{d:`M${x-11} ${y+14}V${y-18}M${x+11} ${y+14}V${y-18}M${x-14} ${y-13}H${x+14}M${x-14} ${y-4}H${x+14}`,class:'gate'},g);e.style.opacity=o};
  const p=R(-1);one(p.x,p.y,1);[-58,58].forEach(dy=>{const y=p.y+dy;one(p.x,y,.45);el('path',{d:`M${p.x+14} ${y}q28 ${f1(-dy*.06)} 60 ${f1(-dy*.22)}`,class:'worn','stroke-width':5,'stroke-opacity':.4},g)})}
function opts_pmax(o){return Math.max(...o.map(x=>x[1]))}
function foot(g,p,ang,side,c){const f=el('g',{transform:`translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(ang)}) translate(0 ${side*3}) scale(1.3)`},g);
  el('path',{d:'M-.5 -3.4C3.4 -3.6 6.2 -1.6 6.2 .2S3.4 3.7 -.4 3.4C-2.6 3.2 -2.9 -3.2 -.5 -3.4Z',class:'fp '+c},f);
  el('ellipse',{cx:-5.4,cy:0,rx:2.4,ry:2.6,class:'fp '+c},f);return f}
function posts(g,words=W,F=R,cls=[],dy=[]){return words.map((w,i)=>{const p=F(i),a=F(i-.15),b=F(i+.15);const c=cls[i]||'';const gg=el('g',{},g);
  if(SK)el('circle',{cx:f1(p.x),cy:f1(p.y),r:3.2,class:'mnode '+c},gg);else foot(gg,p,Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI,i%2?1:-1,c);
  const off=dy[i];const ty=p.y+(SK?(off<0?-14:26):(off??38));
  const t=el('text',{x:p.x,y:ty,class:'word '+c,'text-anchor':'middle'},gg);t.textContent=w;gg.style.opacity=0;return gg})}
const rev=(s,i)=>clamp((s-i)/.12+1);
function walker(g){const w=el('g',{},g);
  if(SK){el('path',{d:'M0 -9V-34M-5 -34H5',class:'mcur'},w);w.gait=()=>{};return w}
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
  if(SK){el('path',{d:'M0 -27l5 5l-5 5l-5 -5z',class:'mdog'},d);d.legs=[];d.tail=el('path',{d:'M0 0'},d);return d}
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
function fan(g,o,to,opts,L=110){if(SK)return mfan(g,o,opts);const base=Math.atan2(to.y-o.y,to.x-o.x),angs=[base,base-.55,base+.55];
  const pm=opts_pmax(opts);const items=opts.map(([w,p],i)=>{const a=angs[i],e={x:o.x+L*Math.cos(a),y:o.y+L*Math.sin(a)};const gg=el('g',{},g);
    const line=el('path',{d:`M${f1(o.x)} ${f1(o.y)}L${f1(e.x)} ${f1(e.y)}`,class:'fan','stroke-width':f1(3+14*p),'stroke-opacity':f1(.2+.8*p/pm),'stroke-dasharray':`${L} ${L+60}`,'stroke-dashoffset':L},gg);
    const lab=el('text',{x:f1(e.x+14*Math.cos(a)+4),y:f1(e.y+14*Math.sin(a)+6),class:'flabel'},gg);lab.append(w);
    const pr=el('tspan',{class:'prob',dx:5},lab);pr.textContent=p.toFixed(2);return{gg,line,lab}});
  return{set(grow,label,choose,gone){items.forEach((it,i)=>{it.line.setAttribute('stroke-dashoffset',f1(L*(1-grow)));it.line.style.visibility=grow>0?'visible':'hidden';it.lab.style.opacity=label;it.gg.style.opacity=(i===0?1:1-.8*choose)*(1-gone)})}}}
function mfan(g,o,opts){const pm=opts_pmax(opts),BW=220,x0=Math.min(o.x+20,770-(100+BW*pm+40));
  const items=opts.map(([w,p],i)=>{const y=o.y+54+i*21,gg=el('g',{},g);const lab=txt(gg,x0+92,y+4,'flabel','end');lab.textContent=w;
    const bar=el('rect',{x:x0+100,y:y-6,width:0,height:11,class:i?'mbar':'mbar top'},gg);const pr=txt(gg,x0+106,y+4,'prob');pr.textContent=p.toFixed(2);return{gg,lab,bar,pr,w:BW*p}});
  return{set(grow,label,choose,gone){items.forEach((it,i)=>{const w=it.w*ease(grow);it.bar.setAttribute('width',f1(w));it.pr.setAttribute('x',f1(x0+106+w));it.lab.style.opacity=label;it.pr.style.opacity=label;it.gg.style.opacity=grow>0?(i===0?1:1-.75*choose)*(1-gone):0})}}}
function layers(svg,seed){const bg=el('g',{},svg);tufts(bg,seed);const road=el('path',{class:SK?'mroad':'road',d:'M0 0'},bg);gate(bg);return{bg,road,mid:el('g',{},svg),top:el('g',{},svg)}}
function txt(g,x,y,cls,anchor='start'){return el('text',{x,y,class:cls,'text-anchor':anchor},g)}

/* ---- painting helpers ---- */
const lerpC=(a,b,u)=>a.map((x,i)=>x+(b[i]-x)*clamp(u));
function scene(u,v){let c=lerpC([150,190,228],[236,214,178],v/.65);
  if(Math.hypot(u-.78,(v-.24)*1.6)<.1)c=[246,200,90];
  const hill=.66+.07*Math.sin(u*3.4+.4);if(v>hill)c=lerpC([110,158,78],[70,112,52],(v-hill)/(1-hill));
  if(Math.abs(u-.3)<.025&&v>.42&&v<hill+.03)c=[112,82,52];
  if(Math.hypot(u-.3,(v-.36)*1.25)<.12)c=[58,112,62];
  return c}
function uncondScene(u,v){
  const sky=lerpC([172,178,186],[198,192,182],clamp(v/.62));
  const grd=lerpC([148,146,132],[122,120,108],clamp((v-.62)/.38));
  return v>.62?grd:sky;
}
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
  H.br.forEach((b,i)=>{b.line.setAttribute('stroke-width',f1(2+18*p[i]));b.line.setAttribute('stroke-opacity',f1(.14+.86*p[i]/pm));b.line.style.opacity=vis;
    b.lab.style.opacity=.35+.65*vis*(p[i]/pm);b.pr.textContent=vis>.01?p[i].toFixed(2):''});
  const r=th*Math.PI/180,S=H.S,L=46,e={x:S.x+L*Math.cos(r),y:S.y+L*Math.sin(r)};
  H.arrow.setAttribute('d',`M${S.x} ${S.y}L${f1(e.x)} ${f1(e.y)}M${f1(e.x-9*Math.cos(r-.5))} ${f1(e.y-9*Math.sin(r-.5))}L${f1(e.x)} ${f1(e.y)}L${f1(e.x-9*Math.cos(r+.5))} ${f1(e.y-9*sinOff(r,.5))}`);H.arrow.style.opacity=vis}
function sinOff(r,d){return Math.sin(r+d)}

const NEWFIGS={
/* 1950 · judge */
judge:{dur:9,hold:2.8,init(svg){const bg=el('g',{},svg);tufts(bg,101);
    const RA=s=>({x:120+s*92,y:74}),RB=s=>({x:120+s*92,y:176});this.RA=RA;this.RB=RB;
    el('path',{class:'road',d:roadD(-.7,4.3,RA)},bg);el('path',{class:'road',d:roadD(-.7,4.3,RB)},bg);
    this.pa=posts(bg,['Walking','was','written','by','Thoreau'],RA);this.pb=posts(bg,['Walking','was','written','by','Emerson'],RB);
    [...this.pa,...this.pb].forEach(p=>p.style.opacity=1);
    const ea=RA(4.75),eb=RB(4.75);
    this.endA=el('g',{},svg);if(!SK)el('path',{d:`M${ea.x-12} ${ea.y+9}v-15l12 -11l12 11v15z`,class:'house'},this.endA);
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
    if(SK){el('rect',{x:220,y:152,width:76,height:40,rx:6,class:'plaza'},bg);const gl=txt(bg,258,177,'flabel','middle');gl.textContent='G_θ(z)'}
    const cid='wipeclip'+(++RID);const cp=el('clipPath',{id:cid},svg);this.clip=el('rect',{x:380,y:30,width:0,height:180},cp);
    shadow(bg,380,30,300,180);el('rect',{x:380,y:30,width:300,height:180,class:'panel'},bg);
    const cg=el('g',{'clip-path':`url(#${cid})`},bg);const cv=canvasGrid(cg,380,30,300,180,30,18,false);cv.set(draft(30,18,1,0,noiseArr(540,3)));
    el('rect',{x:380,y:30,width:300,height:180,class:'frame'},bg);
    this.w=SK?null:walker(svg);
    this.arr=SK?el('path',{class:'heading',d:'M0 0'},svg):null;
    this.hud=txt(svg,24,30,'hud');this.hud.textContent='a painter: the product is the canvas, not the footprints';
    this.lab=txt(svg,530,240,'hand','middle');this.lab.textContent='one stroke, no drafts'},
  draw(t){const u=ease(seg(t,.8,1.7));
    if(this.w){const x=lerp(160,350,u),y=220-Math.sin(u*Math.PI)*70;place(this.w,x,y);this.road.setAttribute('d',`M150 220L${f1(lerp(150,350,u))} 220`)}
    else if(this.arr){const x2=lerp(144,372,u);this.arr.setAttribute('d',u>.02?`M144 172H${f1(Math.min(216,x2))}${x2>300?`M300 172H${f1(x2)}M${f1(x2-7)} 167L${f1(x2)} 172L${f1(x2-7)} 177`:''}`:'M0 0')}
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

/* 2021 · guidance (with live CFG scale w!) */
guide:{dur:6.6,hold:3,wScale:7.5,init(svg){const bg=el('g',{},svg);tufts(bg,139);
    shadow(bg,290,12,220,40,8);el('rect',{x:290,y:12,width:220,height:40,rx:8,class:'card'},bg);const c=onPanel(txt(bg,400,39,'note','middle'));c.textContent='a tree on a hill, sunny';c.style.fontSize='23px';
    this.nz=noiseArr(160,5);this.blocks=[16,8,4,2,1,1];this.amt=[1,.7,.45,.25,.1,0];
    const cfgFn=w=>(u,v)=>{const u0=uncondScene(u,v),c1=lerpC(u0,scene(u,v),.23);return u0.map((x,i)=>clamp(x+w*(c1[i]-x),0,255))};
    this.cfgFn=cfgFn;
    this.dL=this.blocks.map((b,k)=>draft(16,10,b,this.amt[k],this.nz,cfgFn(1)));
    this.rebuildR=()=>{this.dR=this.blocks.map((b,k)=>draft(16,10,b,this.amt[k],this.nz,cfgFn(this.wScale)));this.k=-1};
    this.rebuildR();
    this.cL=canvasGrid(bg,70,78,176,110,16,10);this.cR=canvasGrid(bg,554,78,176,110,16,10);
    const a=txt(bg,158,214,'hand','middle');a.textContent='glances lightly';
    this.bLab=txt(bg,642,214,'hand','middle');
    this.gL=el('path',{d:SK?'M246 124L340 54':'M282 196L360 54',class:'glance'},bg);
    this.gR=el('path',{d:SK?'M554 124L460 54':'M518 196L440 54',class:'glance','stroke-width':3},bg);
    if(!SK){this.wL=walker(svg);place(this.wL,282,236);this.wR=walker(svg);place(this.wR,518,236,-1)}
    this.k=-1},
  draw(t){const k=Math.min(5,Math.max(0,Math.floor((t-.4)/1.05)));if(k!==this.k){this.k=k;this.cL.set(this.dL[k]);this.cR.set(this.dR[k])}
    const w=this.wScale,ph=((t-.4)/1.05)%1,g=t>.4&&k<5?1-clamp(ph/.5):0;
    this.gL.style.opacity=.55*g;
    this.gR.setAttribute('stroke-width',f1(.8+Math.min(4.2,w*.38)));
    this.gR.style.opacity=w<.05?0:clamp(.3+w/8)*g;
    const desc=w<.1?L('ignores card (w = 0)','w = 0 (unconditional)'):w<1.5?L(`glances lightly (w = ${w})`,`w = ${w} (standard)`):w<10?L(`glances hard (w = ${w})`,`w = ${w} (strong guidance)`):L(`stares too hard (w = ${w})`,`w = ${w} (oversaturated)`);
    this.bLab.textContent=desc}},

/* 2022 · human feedback */
rlhf:{dur:7,hold:3,init(svg){const bg=el('g',{},svg);tufts(bg,149);
    const J={x:190,y:140},C={x:350,y:140};this.J=J;
    el('path',{d:`M20 ${J.y}H${J.x}`,class:'givenroad'},bg);const rq=txt(bg,30,J.y-22,'hand');rq.textContent='a request';
    this.E=[42,104,176,238].map(y=>({x:640,y}));this.w0=[7,10,8,5];this.w1=[15,4,12,2];this.ok=[true,false,true,false];
    this.E.forEach((E,i)=>el('path',{d:roadD(0,1,u=>bez(J,C,E,u)),class:'oldtrail','stroke-width':this.w0[i]},bg));
    this.tr=this.E.map((E,i)=>el('path',{d:roadD(0,1,u=>bez(J,C,E,u)),class:'worn','stroke-width':this.w0[i]},bg));
    this.ink=this.E.map(E=>el('path',{d:roadD(0,1,u=>bez(J,C,E,u)),class:'inkline','stroke-dasharray':'520 600','stroke-dashoffset':520},bg));
    this.st=this.E.map((E,i)=>stampT(bg,E.x+14,E.y+7,this.ok[i],this.ok[i]?'✓ ended well':'✗ ended badly'));
    if(!SK)el('path',{d:`M${J.x-60} ${J.y+4}v-22`,class:'gate'},bg);
    this.leash=el('path',{d:`M${J.x-60} ${J.y-14}Q${J.x-30} ${J.y-2} ${J.x+6} ${J.y-22}`,class:'leash'},bg);
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
    B.path.setAttribute('d',t>3.6?roadD(-1,sb,B.R):'M0 0');
    /* avoid double-drawing 'the' at the shared junction once A's 'the' is already placed */
    B.p.forEach((p,i)=>p.style.opacity=t>3.6?(i===3?0:rev(sb,i)):0);
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
    const cut=(d,w)=>{el('path',{d,class:'cutedge','stroke-width':w+4},bg);el('path',{d,class:'cutfill','stroke-width':w},bg)};
    cut(`M100 ${YT}H${X1}`,12);
    ['edge detector','corner detector','color histogram'].forEach((w,i)=>{el('circle',{cx:SX[i],cy:YT,r:14,class:'plaza'},bg);const t=txt(bg,SX[i],YT+36,'sign','middle');t.textContent=w});
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

/* 2023 · collapse (with interactive human-data retention toggle!) */
collapse:{dur:8.4,hold:2.6,keepHuman:false,init(svg){const bg=el('g',{},svg);tufts(bg,163);
    const J={x:220,y:140},C={x:380,y:140};el('path',{d:`M24 ${J.y}H${J.x}`,class:'road'},bg);
    const lt=txt(bg,40,J.y-22,'note');lt.textContent='the wild …';lt.style.fontSize='22px';
    this.E=[44,108,172,236].map(y=>({x:640,y}));this.words=['world','west','rose','geese'];
    this.rebuild=()=>{
      const p0=[.45,.30,.15,.10];let p=[...p0];this.gens=[p];
      for(let g=1;g<5;g++){const q=p.map(x=>Math.pow(x,1.8)),z=q.reduce((a,b)=>a+b),ps=q.map(x=>x/z);
        p=this.keepHuman?ps.map((v,i)=>.8*v+.2*p0[i]):ps;this.gens.push(p)}
    };
    this.rebuild();
    this.br=this.E.map(E=>el('path',{d:roadD(0,1,u=>bez(J,C,E,u)),class:'worn'},bg));
    this.lb=this.E.map((E,i)=>{const t=txt(bg,E.x+26,E.y+6,'flabel');t.append(this.words[i]);const s=el('tspan',{class:'prob',dx:6},t);return{t,s}});
    this.hud=txt(svg,24,30,'hudb');this.hud2=txt(svg,24,48,'hud')},
  draw(t){const x=clamp((t-.8)/1.6,0,4),g=Math.floor(x),u=ease(clamp((x-g)/.55));const a=this.gens[g],b=this.gens[Math.min(4,g+1)];
    const p=a.map((v,i)=>lerp(v,b[i],u));
    const pmx=Math.max(...p);this.br.forEach((e,i)=>{e.setAttribute('stroke-width',f1(2+26*p[i]));e.setAttribute('stroke-opacity',f1(.15+.85*p[i]/pmx));e.style.opacity=clamp(p[i]*14)});
    this.lb.forEach((l,i)=>{l.s.textContent=p[i]<.005?'gone':Math.round(p[i]*100)+'%';l.t.style.opacity=.35+.65*clamp(p[i]*12)});
    const G=Math.round(x)+1;this.hud.textContent=`Generation ${G}`;
    this.hud2.textContent=G===1?T('trained on human footprints'):this.keepHuman?L(`80% gen ${G-1}’s footprints + 20% human: rare trails survive`,`80% gen ${G-1}’s samples + 20% human data: tails survive`):L(`trained on generation ${G-1}’s footprints`,`trained on generation ${G-1}’s outputs`)}},

/* 1958 · perceptron */
perceptron:{dur:9.8,hold:2.6,init(svg){const bg=el('g',{},svg);tufts(bg,151);
    const B={x0:40,x1:440,y0:62,y1:222};this.B=B;
    const P=[[-.8,.6],[-.5,.85],[-.75,-.05],[-.35,.4],[-.05,.8],[-.85,-.65],[.15,.75],[.35,-.45],[.75,.2],[.45,-.85],[.85,-.4],[.15,-.5],[.45,.85],[.4,0]];
    const Y=P.map(([u,v])=>v>1.1*u-.05?1:-1);
    let w=[.9,.3],b=.1;const st=[[w[0],w[1],b,-1]];
    for(let ep=0;ep<30&&st.length<9;ep++){let m=0;P.forEach(([u,v],i)=>{if(st.length>=9)return;const s=w[0]*u+w[1]*v+b;if((s>0?1:-1)!==Y[i]){w[0]+=.6*Y[i]*u;w[1]+=.6*Y[i]*v;b+=.6*Y[i];st.push([w[0],w[1],b,i]);m++}});if(!m)break}
    this.st=st;this.K=st.length-1;
    el('rect',{x:B.x0,y:B.y0,width:B.x1-B.x0,height:B.y1-B.y0,rx:4,class:'frame'},bg);
    this.tint=el('path',{d:'M0 0',class:'side'},bg);this.line=el('path',{d:'M0 0',class:'heading'},bg);
    const X=u=>lerp(B.x0,B.x1,(u+1)/2),Yp=v=>lerp(B.y1,B.y0,(v+1)/2);this.X=X;this.Yp=Yp;
    const mark=(g,x,y,c)=>c>0?el('circle',{cx:x,cy:y,r:6.5,class:'vdot'},g):el('rect',{x:x-6,y:y-6,width:12,height:12,rx:1.5,class:'house'},g);
    this.pts=P.map(([u,v],i)=>{mark(bg,X(u),Yp(v),Y[i]);return el('circle',{cx:X(u),cy:Yp(v),r:13,class:'ring','stroke-opacity':0},bg)});
    const ax=txt(bg,B.x1,B.y1+14,'prob','end');ax.textContent='clue A →';
    const ay=txt(bg,B.x0-8,B.y0+4,'prob','end');ay.textContent='clue B';
    this.h1=txt(svg,24,30,'hudb');this.h1.textContent='weigh two clues, split the ground';
    const lg=el('g',{},svg);mark(lg,46,246,1);const l1=txt(lg,58,250,'prob');l1.textContent='head for the pond';
    mark(lg,190,246,-1);const l2=txt(lg,202,250,'prob');l2.textContent='head for the gate';
    el('rect',{x:322,y:240,width:12,height:12,rx:1.5,class:'side',style:'opacity:.45'},lg);const l3=txt(lg,340,250,'prob');l3.textContent='where it says pond';
    this.nudge=txt(svg,B.x0+6,B.y0-8,'hand');this.nudge.textContent='wrong turn: nudge the trails';
    this.done=stampT(svg,B.x0+6,B.y0-6,true,'every spot sorted');
    const C={x0:528,x1:760,y0:92,y1:222};this.C=C;
    this.xg=el('g',{},svg);
    el('rect',{x:C.x0,y:C.y0,width:C.x1-C.x0,height:C.y1-C.y0,rx:4,class:'frame'},this.xg);
    this.xt=el('path',{d:'M0 0',class:'side'},this.xg);this.xl=el('path',{d:'M0 0',class:'heading'},this.xg);
    const XQ=[[-.6,-.6,-1],[.6,.6,-1],[-.6,.6,1],[.6,-.6,1]];this.XQ=XQ;
    const XX=u=>lerp(C.x0,C.x1,(u+1)/2),XY=v=>lerp(C.y1,C.y0,(v+1)/2);this.XX=XX;this.XY=XY;
    this.xr=XQ.map(([u,v,c])=>{mark(this.xg,XX(u),XY(v),c);return el('circle',{cx:XX(u),cy:XY(v),r:13,class:'ring','stroke-opacity':0},this.xg)});
    const x1=txt(this.xg,C.x0,C.y0-34,'hudb');x1.textContent='pond if exactly one clue holds';
    this.xs=stampT(this.xg,C.x0,C.y0-10,false,'no straight line sorts these');
    this.xc=txt(this.xg,C.x1,C.y1+18,'prob','end')},
  half(w0,w1,b,BX,FX,FY){const box=[[-1,-1],[1,-1],[1,1],[-1,1]],f=([u,v])=>w0*u+w1*v+b,out=[],seg=[];
    for(let i=0;i<4;i++){const p=box[i],q=box[(i+1)%4],fp=f(p),fq=f(q);if(fp>0)out.push(p);
      if((fp>0)!==(fq>0)){const s=fp/(fp-fq),r=[p[0]+(q[0]-p[0])*s,p[1]+(q[1]-p[1])*s];out.push(r);seg.push(r)}}
    const d=a=>a.map((p,i)=>(i?'L':'M')+f1(FX(p[0]))+' '+f1(FY(p[1]))).join('');
    return{tint:out.length>2?d(out)+'Z':'M0 0',line:seg.length===2?d(seg):'M0 0'}},
  draw(t){const st=this.st,T0=.6,per=.95;const k=Math.min(this.K,Math.max(0,Math.floor((t-T0)/per)));
    const ph=(t-T0)/per-k;let a=st[k],bb=a;
    if(t>=T0&&(t-T0)/per<this.K){bb=st[k+1];const u=ease(seg(ph,.45,1));a=a.map((x,i)=>i<3?lerp(x,bb[i],u):x)}else if(t>=T0)a=st[this.K];
    const h=this.half(a[0],a[1],a[2],this.B,this.X,this.Yp);this.tint.setAttribute('d',h.tint);this.line.setAttribute('d',h.line);
    const active=t>=T0&&(t-T0)/per<this.K;
    this.pts.forEach((r,i)=>r.setAttribute('stroke-opacity',active&&bb[3]===i?f1(Math.sin(Math.PI*seg(ph,0,.9))):'0'));
    this.nudge.style.opacity=active?1:0;this.done.style.opacity=seg(t,T0+this.K*per+.1,T0+this.K*per+.5);
    const X0=5.6;this.xg.style.opacity=seg(t,X0-.4,X0);
    const th=lerp(.3,.3+Math.PI*1.25,ease(seg(t,X0,X0+3.6))),off=.45*Math.sin(2.3*(t-X0));
    const w0=Math.cos(th),w1=Math.sin(th),b=off;
    let err=this.XQ.map(([u,v,c])=>((w0*u+w1*v+b)>0?1:-1)!==c),s=1;
    if(err.filter(Boolean).length>2){err=err.map(e=>!e);s=-1}
    const hx=this.half(s*w0,s*w1,s*b,this.C,this.XX,this.XY);
    this.xt.setAttribute('d',hx.tint);this.xl.setAttribute('d',hx.line);
    this.xr.forEach((r,i)=>r.setAttribute('stroke-opacity',t>X0&&err[i]?'.9':'0'));
    const n=err.filter(Boolean).length;this.xc.textContent=t>X0?L(`wrong: ${n}`,`errors: ${n}`):'';
    this.xs.style.opacity=seg(t,X0+3.7,X0+4.1)}},

/* 1986 · backpropagation */
backprop:{dur:9.4,hold:3,init(svg){const bg=el('g',{},svg);tufts(bg,171);
    const N={a:[130,96],b:[130,192],h:[400,96],g:[400,192],o:[660,144]};this.N=N;
    this.E=[['a','h'],['b','h'],['a','g'],['b','g'],['h','o'],['g','o']];
    this.w0=[.35,-.25,.2,.3,-.3,.25];this.w1=[1,1,1,1,1,-1];
    this.paths=this.E.map(([p,q])=>el('path',{d:`M${N[p][0]} ${N[p][1]}L${N[q][0]} ${N[q][1]}`,class:'worn'},bg));
    this.neg=this.E.map(([p,q])=>el('path',{d:`M${N[p][0]} ${N[p][1]}L${N[q][0]} ${N[q][1]}`,class:'leash'},bg));
    Object.values(N).forEach(([x,y])=>el('circle',{cx:x,cy:y,r:19,class:'plaza'},bg));
    const lab=(x,y,s,c='flabel',a='middle')=>{const e=txt(bg,x,y,c,a);e.textContent=s;return e};
    lab(N.a[0]-30,N.a[1]+7,'clue A','flabel','end');lab(N.b[0]-30,N.b[1]+7,'clue B','flabel','end');
    this.q1=lab(N.h[0],N.h[1]-30,'?');this.q2=lab(N.g[0],N.g[1]+40,'?');
    this.m1=lab(N.h[0],N.h[1]-30,'either clue');this.m2=lab(N.g[0],N.g[1]+40,'both clues');
    lab(N.o[0]+30,N.o[1]+7,'exactly one','flabel','start');
    lab(N.h[0],254,'hidden clearings: no walker sees them','prob');
    this.dots=this.E.map(()=>el('circle',{r:5.5,class:'ghost'},bg));
    this.bdots=this.E.map(()=>el('circle',{r:5,class:'blame'},bg));
    this.h1=txt(svg,24,30,'hudb');this.h1.textContent='forward: trails carry clues from row to row';
    this.h2=txt(svg,24,30,'hudb');this.h2.textContent='back: blame splits along each trail by its width';
    this.h3=txt(svg,24,30,'hudb');this.h3.textContent='the middle clearings found these clues on their own';
    this.later=txt(svg,400,144,'hand','middle');this.later.textContent='… thousands of walks later';
    this.bad=stampT(svg,N.o[0]-34,N.o[1]-34,false,'✗ wrong way');this.good=stampT(svg,N.o[0]-34,N.o[1]-34,true,'✓ right way');
    const lg=txt(svg,776,254,'prob','end');lg.textContent='solid: heed it · dashed: do the opposite'},
  draw(t){const N=this.N,E=this.E;
    const at=(e,u,back)=>{const[p,q]=E[e],A=N[back?q:p],B2=N[back?p:q];return[lerp(A[0],B2[0],u),lerp(A[1],B2[1],u)]};
    const run=(d,t0,back)=>{E.forEach((e,i)=>{const l2=i>=4,s=back?(l2?t0:t0+1):(l2?t0+1:t0),u=seg(t,s,s+1);const on=t>s&&t<s+1;
      d[i].style.opacity=on?(back?.95:.85):0;if(on){const[x,y]=at(i,ease(u),back);d[i].setAttribute('cx',f1(x));d[i].setAttribute('cy',f1(y))}})};
    const F1=.5,BK=3.2,F2=6.1;
    if(t<BK)run(this.dots,F1,false);else run(this.dots,F2,false);run(this.bdots,BK,true);
    const u2=seg(t,BK,BK+1),u1=seg(t,BK+1,BK+2),uL=ease(seg(t,BK+2.2,F2-.1));
    E.forEach((e,i)=>{const nudged=lerp(this.w0[i],this.w0[i]+.25*(this.w1[i]-this.w0[i]),i>=4?u2:u1),w=lerp(nudged,this.w1[i],uL);
      const sw=f1(2+6*Math.abs(w));this.paths[i].setAttribute('stroke-width',sw);this.paths[i].style.opacity=w>0?.9:0;
      this.neg[i].style.opacity=w<0?1:0;this.neg[i].style.strokeWidth=f1(1.6+3*Math.abs(w))+'px'});
    this.h1.style.opacity=t<BK-.1?seg(t,.2,.5):(t>=F2&&t<F2+2.3?1:0);this.h2.style.opacity=t>=BK-.1&&t<F2?1:0;this.h3.style.opacity=seg(t,F2+2.3,F2+2.6);
    this.later.style.opacity=seg(t,BK+2.2,BK+2.5)*(1-seg(t,F2-.2,F2));
    this.bad.style.opacity=seg(t,F1+2,F1+2.3)*(1-seg(t,BK+2.2,BK+2.5));this.good.style.opacity=seg(t,F2+2,F2+2.3);
    const m=seg(t,F2+2.3,F2+2.8);this.m1.style.opacity=this.m2.style.opacity=m;this.q1.style.opacity=this.q2.style.opacity=1-m}}
};

const HEAD_PRESETS=[
  {color:DOGC[1],q:'what is the walk about?',wts:[.03,.30,.04,.03,.40,.08,.12],bub:[['preservation',21],['wildness',17],['the',12]],opts:[['world',.55],['wild',.25],['end',.20]]},
  {color:DOGC[0],q:'of what?',wts:[.03,.08,.04,.05,.52,.22,.06],bub:[['preservation',22],['of',17],['wildness',12]],opts:[['world',.48],['life',.30],['man',.22]]},
  {color:DOGC[2],q:'what came right before?',wts:[.01,.02,.03,.05,.09,.28,.52],bub:[['the',22],['of',18],['preservation',12]],opts:[['world',.42],['woods',.33],['earth',.25]]}
];

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
    this.w=walker(svg);this.hud=txt(svg,24,30,'hud')},
  draw(t){const V=300,S1=276,S2=470,J=this.J;const cnt=[0,0,0];
    for(const g of this.gh){const d=(t-g.t0)*V;if(d<0){g.c.style.opacity=0;continue}let p;
      if(d<S1)p={x:J.x-S1+d,y:J.y};else{cnt[g.b]++;const u=(d-S1)/S2;if(u>=1){g.c.style.opacity=0;continue}p=this.Bz(g.b,u)}
      g.c.setAttribute('cx',f1(p.x));g.c.setAttribute('cy',f1(p.y-6));g.c.style.opacity=.42}
    this.br.forEach((b,i)=>{b.setAttribute('stroke-width',f1(2+cnt[i]*.42));b.setAttribute('stroke-opacity',f1(.15+.85*Math.min(1,cnt[i]/26)))});
    const end=seg(t,8.6,9.4);this.lbl.forEach(l=>l.style.opacity=end);this.w.style.opacity=end;place(this.w,J.x-14,J.y);
    this.hud.textContent=t<8.6?L(`walkers so far: ${cnt[0]+cnt[1]+cnt[2]}`,`training examples so far: ${cnt[0]+cnt[1]+cnt[2]}`):T('the blaze here is just this wear')}},

/* 4 · n-gram (with interactive n = 1, 2, 3, 4 selector!) */
ngram:{dur:9.2,hold:2.4,nOrder:3,init(svg){const L=layers(svg,41);this.L=L;this.cone=el('path',{class:'cone',d:'M0 0'},L.mid);this.p=posts(L.mid);this.w=walker(L.top);
    this.hud=txt(L.top,24,32,'hud');this.hud.append('in view:');this.hudb=el('tspan',{class:'hudb',dx:6},this.hud)},
  draw(t){const s=walkS(t,1.1,-1,7),win=this.nOrder-1,sb=win<=0?s+.5:s-(win-.28);this.L.road.setAttribute('d',roadD(-1,s));
    this.p.forEach((p,i)=>p.style.opacity=rev(s,i)*(win>0&&i>=sb-.05?1:.18));const q=R(s),b=R(Math.max(sb,-1));
    this.cone.setAttribute('d',(win<=0||s<-.2)?'M0 0':`M${f1(q.x-2)} ${f1(q.y-34)}L${f1(b.x-6)} ${f1(b.y-30)}L${f1(b.x-6)} ${f1(b.y+52)}L${f1(q.x-2)} ${f1(q.y+4)}Z`);
    place(this.w,q.x,q.y,-1);
    const seen=win<=0?[]:W.filter((_,i)=>i<=s+.02&&i>=sb-.05);
    this.hudb.textContent=win<=0?L('nothing (unigram counts only)','∅ (unigram p(xₜ))'):'“'+seen.join(' ')+'”'}},

/* 5 · pack (with Plain RNN vs Gated LSTM toggle!) */
pack:{dur:9.2,hold:2.4,gated:false,init(svg){const L=layers(svg,53);this.L=L;this.cells=null;
    if(SK){const D=16,cw=18;this.cells=Array.from({length:D},(_,k)=>el('rect',{x:256+k*cw,y:30,width:cw-3,height:28,rx:1.5,class:'mcell'},L.mid));
      this.vec=W.map((_,i)=>Array.from({length:D},(_,k)=>{const v=Math.sin(i*12.9898+k*78.233)*43758.5453;return 2*(v-Math.floor(v))-1}));
      const lab=txt(L.mid,240,49,'hud','end');lab.textContent='the pack';const dl=txt(L.mid,256+D*cw,74,'prob','end');dl.textContent='d = 16';
      this.strap=el('path',{class:'strap',d:'M0 0'},L.mid);this.p=posts(L.mid);this.w=walker(L.top);return}
    shadow(L.mid,250,16,300,56,12);el('rect',{x:250,y:16,width:300,height:56,rx:12,class:'pack'},L.mid);
    const cid='packclip'+(++RID);const cp=el('clipPath',{id:cid},svg);el('rect',{x:252,y:18,width:296,height:52,rx:11},cp);
    this.chips=onPanel(el('g',{'clip-path':`url(#${cid})`},L.mid));this.ch=W.map(w=>{const t=txt(this.chips,0,52,'flabel','end');t.textContent=w;return t});
    const lab=txt(L.mid,240,49,'hud','end');lab.textContent='the pack';
    this.strap=el('path',{class:'strap',d:'M0 0'},L.mid);this.p=posts(L.mid);this.w=walker(L.top)},
  draw(t){const s=walkS(t,1.1,-1,7);this.L.road.setAttribute('d',roadD(-1,s));
    this.p.forEach((p,i)=>p.style.opacity=rev(s,i)*(i>s-.55?1:.14));
    const sal=[0,1,0,0,1,0,0,1]; /* content words gated strongly in LSTM */
    if(this.cells){const h=this.cells.map((_,k)=>this.vec.reduce((a,v,i)=>{if(s<i-.02)return a;const age=Math.max(0,s-i),dec=this.gated?Math.pow(sal[i]?.96:.52,age):Math.pow(.55,age);return a+v[k]*dec*rev(s,i)},0));
      this.cells.forEach((c,k)=>{c.style.fillOpacity=f1(.08+.85*clamp(Math.abs(h[k])/1.3));c.classList.toggle('neg',h[k]<0)})}
    else{let right=540;for(let j=W.length-1;j>=0;j--){const c=this.ch[j],age=s-j;if(age<-.02){c.style.opacity=0;continue}
      const a=Math.max(age,0),keep=this.gated&&sal[j];
      const sc=keep?Math.max(.78,Math.pow(.96,a)):Math.max(.5,Math.pow(.86,a));
      const op=(keep?Math.max(.82,Math.pow(.96,a)):Math.pow(this.gated?.45:.6,a))*rev(s,j);
      c.setAttribute('x',f1(right));c.style.fontSize=f1(24*sc)+'px';c.style.opacity=op;
      if(op>.12)right-=(W[j].length*9.5+12)*sc*clamp(age+1)*(keep?1:this.gated?.55:1)}}
    const q=R(s);place(this.w,q.x,q.y);this.strap.setAttribute('d',`M${f1(q.x-2)} ${f1(q.y-28)}Q${f1((q.x+400)/2)} ${f1(q.y-70)} 400 72`)}},

/* 6 · the dog (fixed staircase bar k=1 so total 1+2+3+4+5+6+7 = 28!) */
dog:{hold:2.8,init(svg){const L=layers(svg,67);this.L=L;
    this.pf=W.map(()=>el('circle',{class:'puff',r:0,style:`--dc:${DOGC[0]}`},L.mid));
    this.bars=W.map((_,k)=>{const x=R(k).x;const g=el('g',{style:`--dc:${DOGC[0]}`},L.mid);const r=el('rect',{x:x-7,width:14,y:250,height:0,rx:2,class:'bar'},g);const tl=txt(g,x,246,'barlab','middle');g.style.opacity=0;return{g,r,tl,k}});
    /* position 1 ('wildness') is already placed at t=0 and attended to 1 previous token ('in') */
    this.bars[1].g.style.opacity=1;this.bars[1].r.setAttribute('y','245');this.bars[1].r.setAttribute('height','5');this.bars[1].tl.setAttribute('y','241');this.bars[1].tl.textContent='1';
    const bl=txt(L.mid,22,250,'barlab');bl.textContent='sniffs per step →';
    this.p=posts(L.mid);this.w=walker(L.top);this.d=dog(L.top,DOGC[0]);
    const tr=new Trip(.8,1-.24);this.steps=[];
    for(let k=2;k<=7;k++){const r0=tr.t;tr.go(-.4,430,true).go(k-1-.24,430);const a=tr.t;tr.go(k-.24,DX/.7);this.steps.push({k,r0,a,b:tr.t});tr.wait(.35)}
    this.tr=tr;this.dur=tr.t+.2;this.hud=txt(L.top,24,32,'hudb');this.hud2=txt(L.top,24,50,'hud')},
  draw(t){let s=1,cur=null,total=1;
    for(const st of this.steps){if(t>=st.r0)total+=st.k;if(t>=st.b){s=st.k;continue}cur=st;if(t>st.a)s=st.k-1+ease(seg(t,st.a,st.b));break}
    this.L.road.setAttribute('d',roadD(-1,s));this.p.forEach((p,i)=>p.style.opacity=rev(s,i));
    const q=R(s);place(this.w,q.x,q.y);const d=this.tr.at(t),dp=R(d.s);setDog(this.d,dp.x,dp.y+8,d.dir,d.mv,t);
    this.pf.forEach((c,i)=>{const p=R(i);puff(c,p.x,p.y-2,this.tr.last(i,t),t,13,.5)});
    for(const st of this.steps){const b=this.bars[st.k];const u=seg(t,st.r0,st.a);b.g.style.opacity=u>0?1:0;const h=st.k*5*u;b.r.setAttribute('y',f1(250-h));b.r.setAttribute('height',f1(h));b.tl.setAttribute('y',f1(246-h));b.tl.textContent=st.k}
    if(cur){this.hud.textContent=L(`Writing word ${cur.k+1}: the dog sniffs all ${cur.k} footprints first`,`Token ${cur.k+1}: attends to all ${cur.k} previous tokens`)}else this.hud.textContent=T('Done: every word cost a full run');
    this.hud2.textContent=L(`sniffs so far: ${total}`,`attention reads so far: ${total}`)}},

/* 7 · the nose (with multi-head switcher!) */
nose:{hold:2.6,headIdx:0,init(svg){const hp=HEAD_PRESETS[this.headIdx]||HEAD_PRESETS[0];
    const L=layers(svg,71);this.L=L;this.wts=hp.wts;
    this.fan=fan(L.mid,R(6),R(7),hp.opts,95);
    this.pf=W.map(()=>el('circle',{class:'puff',r:0,style:`--dc:${hp.color}`},L.mid));
    this.bars=this.wts.map((w,i)=>{const p=R(i);const g=el('g',{style:`--dc:${hp.color}`},L.mid);el('rect',{x:p.x-6,width:12,y:p.y-98,height:38,rx:2,class:'track'},g);const r=el('rect',{x:p.x-6,width:12,y:p.y-60,height:0,rx:2,class:'bar'},g);return{r,base:p.y-60,h:w*92}});
    this.p=posts(L.mid);this.w=walker(L.top);this.d=dog(L.top,hp.color);
    this.bub=onPanel(el('g',{style:`--dc:${hp.color}`},L.top));if(!SK)shadow(this.bub,-96,-50,192,30,15);el('rect',{x:-96,y:-50,width:192,height:30,rx:SK?3:15,class:'bubble'},this.bub);
    const bt=txt(this.bub,0,-29,'flabel','middle');hp.bub.forEach(([w,sz],i)=>{const sp=el('tspan',{dx:i?6:0},bt);sp.textContent=w;sp.style.fontSize=(SK?sz*.72:sz)+'px'});
    const tr=new Trip(.7,6-.24);tr.go(-.4,250,true);this.turn=tr.t;tr.go(6-.24,330);this.back=tr.t;tr.wait(2.6);tr.go(7-.24,DX/.8);this.tr=tr;this.dur=this.back+4.1;
    this.hud=txt(L.top,24,32,'hud');this.hud.append('this dog’s nose: ');const hb=el('tspan',{class:'hudb'},this.hud);hb.textContent=hp.q},
  draw(t){const B=this.back;const s=6+ease(seg(t,B+2.6,B+3.4));this.L.road.setAttribute('d',roadD(-1,s));this.p.forEach((p,i)=>p.style.opacity=rev(s,i));
    const d=this.tr.at(t),dp=R(d.s);setDog(this.d,dp.x,dp.y+8,d.dir,d.mv,t);
    this.pf.forEach((c,i)=>{const p=R(i),w=this.wts[i]||0;puff(c,p.x,p.y-2,this.tr.last(i,t),t,6+40*w,.25+1.1*w,1.1)});
    this.bars.forEach((b,i)=>{const e=this.tr.last(i,t);const h=e?b.h*ease(seg(t,e.t,e.t+.5)):0;b.r.setAttribute('y',f1(b.base-h));b.r.setAttribute('height',f1(h))});
    const bo=seg(t,this.turn,this.turn+.3)*(1-seg(t,B+.1,B+.5));this.bub.style.opacity=bo;place(this.bub,clamp(dp.x,110,690),dp.y);
    this.fan.set(ease(seg(t,B+.2,B+1)),seg(t,B+.9,B+1.4),seg(t,B+2,B+2.4),seg(t,B+3.3,B+3.9));const q=R(s);place(this.w,q.x,q.y)}}
};
Object.assign(FIGS,NEWFIGS);

/* ---- SVG icons for play/pause ---- */
const ICO_PLAY='<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 1.8L10.2 6L2.5 10.2Z"/></svg>';
const ICO_PAUSE='<svg viewBox="0 0 12 12" aria-hidden="true"><rect x="2.2" y="1.8" width="2.8" height="8.4" rx=".6"/><rect x="7" y="1.8" width="2.8" height="8.4" rx=".6"/></svg>';

const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const live=[];
const inSK=(st,f)=>{SK=st.sk;st.svg.classList.toggle('msk',SK);try{return f()}finally{SK=false}};

function syncPlayer(st){
  if(!st.scrub)return;
  const t=clamp(st.curT,0,st.def.dur),pct=(t/st.def.dur)*100;
  st.scrub.value=t.toFixed(2);
  st.scrub.style.setProperty('--p',pct.toFixed(1)+'%');
  st.ftime.textContent=t.toFixed(1)+'s';
  if(st.lastPlay!==st.playing){
    st.lastPlay=st.playing;
    st.pbtn.innerHTML=(st.playing?ICO_PAUSE:ICO_PLAY)+'<span>'+(st.playing?'Pause':'Play')+'</span>';
    st.pbtn.setAttribute('aria-label',st.playing?'Pause animation':'Play animation');
  }
}
function seekTo(st,t,play=false){
  st.curT=clamp(t,0,st.def.dur);
  st.playing=play;
  st.start=performance.now()-st.curT*1000;
  inSK(st,()=>st.def.draw(st.curT));
  syncPlayer(st);
}

/* interactive parameter controls for key pedagogical figures */
const FIG_CONTROLS={
  ngram(st,bar){
    bar.innerHTML='<span class="clab"><span class="i">How far back the walker glances:</span><span class="m">Markov order n:</span></span>';
    [[1,'Unigram (n = 1)'],[2,'Bigram (n = 2)'],[3,'Trigram (n = 3)'],[4,'4-gram (n = 4)']].forEach(([n,label])=>{
      const b=document.createElement('button');b.type='button';b.className='cpill';b.textContent=label;
      b.setAttribute('aria-pressed',String(st.def.nOrder===n));
      b.onclick=()=>{
        st.def.nOrder=n;
        bar.querySelectorAll('.cpill').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
        if(!st.playing&&st.curT>=st.def.dur-.15)seekTo(st,4.35,false);
        else inSK(st,()=>st.def.draw(st.curT));
      };
      bar.appendChild(b);
    });
  },
  pack(st,bar){
    bar.innerHTML='<span class="clab"><span class="i">Pack memory:</span><span class="m">Recurrent architecture:</span></span>';
    [[false,'Plain RNN (fades fast)'],[true,'LSTM (gated memory)']].forEach(([g,label])=>{
      const b=document.createElement('button');b.type='button';b.className='cpill';b.textContent=label;
      b.setAttribute('aria-pressed',String(st.def.gated===g));
      b.onclick=()=>{
        st.def.gated=g;
        bar.querySelectorAll('.cpill').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
        inSK(st,()=>st.def.draw(st.curT));
      };
      bar.appendChild(b);
    });
  },
  nose(st,bar){
    bar.innerHTML='<span class="clab"><span class="i">Try different dogs (attention heads):</span><span class="m">Inspect attention head:</span></span>';
    ['Head 1 · Topic','Head 2 · Relation','Head 3 · Local'].forEach((label,idx)=>{
      const b=document.createElement('button');b.type='button';b.className='cpill';b.textContent=label;
      b.setAttribute('aria-pressed',String(st.def.headIdx===idx));
      b.onclick=()=>{
        st.def.headIdx=idx;
        bar.querySelectorAll('.cpill').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
        st.svg.replaceChildren();inSK(st,()=>st.def.init(st.svg));relabel(st.svg);
        seekTo(st,0,true);
        document.fonts.ready.then(()=>cull(st));
      };
      bar.appendChild(b);
    });
  },
  guide(st,bar){
    bar.innerHTML='<span class="clab"><span class="i">Right painter’s guidance scale:</span><span class="m">Guidance scale w:</span></span>';
    const rng=document.createElement('input');rng.type='range';rng.min='0';rng.max='14';rng.step='0.5';rng.value=String(st.def.wScale);
    rng.setAttribute('aria-label','Guidance scale w');
    const val=document.createElement('span');val.className='cval';val.textContent='w = '+st.def.wScale;
    const apply=w=>{
      st.def.wScale=w;rng.value=String(w);val.textContent='w = '+w;
      bar.querySelectorAll('.cpill').forEach(p=>p.setAttribute('aria-pressed',String(Number(p.dataset.w)===w)));
      st.def.rebuildR();inSK(st,()=>st.def.draw(st.curT));
    };
    rng.oninput=()=>apply(Number(rng.value));
    bar.append(rng,val);
    [0,1,7.5,14].forEach(w=>{
      const b=document.createElement('button');b.type='button';b.className='cpill';b.dataset.w=String(w);
      b.textContent=w===0?'0 (none)':w===1?'1':w===7.5?'7.5':'14 (too high)';
      b.setAttribute('aria-pressed',String(st.def.wScale===w));
      b.onclick=()=>apply(w);
      bar.appendChild(b);
    });
  },
  collapse(st,bar){
    bar.innerHTML='<span class="clab"><span class="i">Training mix per generation:</span><span class="m">Recursive data mix:</span></span>';
    [[false,'100% previous generation'],[true,'Keep 20% human data']].forEach(([kh,label])=>{
      const b=document.createElement('button');b.type='button';b.className='cpill';b.textContent=label;
      b.setAttribute('aria-pressed',String(st.def.keepHuman===kh));
      b.onclick=()=>{
        st.def.keepHuman=kh;
        bar.querySelectorAll('.cpill').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
        st.def.rebuild();
        seekTo(st,0,true);
      };
      bar.appendChild(b);
    });
  }
};

document.querySelectorAll('svg[data-fig]').forEach(svg=>{
  const key=svg.dataset.fig,def=FIGS[key];if(!def)return;
  const st={key,def,svg,start:performance.now(),curT:reduce?def.dur:0,vis:false,playing:!reduce,lastPlay:null,sk:isM()};
  live.push(st);
  inSK(st,()=>def.init(svg));
  const figWrap=svg.closest('.fig'),figEl=svg.closest('figure'),cap=figEl.querySelector('figcaption');
  if(FIG_CONTROLS[key]){
    const ctl=document.createElement('div');ctl.className='figctl';
    figWrap.insertBefore(ctl,svg);
    FIG_CONTROLS[key](st,ctl);
  }
  const rep=cap.querySelector('.replay');
  const bar=document.createElement('div');bar.className='figbar';
  const pbtn=document.createElement('button');pbtn.type='button';pbtn.className='pbtn';
  const scrub=document.createElement('input');scrub.type='range';scrub.className='scrub';
  scrub.min='0';scrub.max=def.dur.toFixed(2);scrub.step='0.02';scrub.setAttribute('aria-label','Scrub animation timeline');
  const ftime=document.createElement('span');ftime.className='ftime';
  st.pbtn=pbtn;st.scrub=scrub;st.ftime=ftime;
  bar.append(pbtn,scrub,ftime);
  if(rep){bar.appendChild(rep);rep.onclick=()=>seekTo(st,0,true)}
  cap.insertBefore(bar,cap.firstChild);

  const toggle=()=>{
    if(st.playing){st.playing=false;syncPlayer(st)}
    else{if(st.curT>=st.def.dur-.05)st.curT=0;st.start=performance.now()-st.curT*1000;st.playing=true;syncPlayer(st)}
  };
  pbtn.onclick=toggle;
  svg.addEventListener('click',toggle);
  scrub.addEventListener('input',()=>seekTo(st,Number(scrub.value),false));
  figWrap.tabIndex=0;
  figWrap.addEventListener('keydown',e=>{
    if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON')return;
    if(e.key===' '){e.preventDefault();toggle()}
    else if(e.key==='ArrowRight'){e.preventDefault();seekTo(st,st.curT+.25,false)}
    else if(e.key==='ArrowLeft'){e.preventDefault();seekTo(st,st.curT-.25,false)}
  });
  new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting&&!st.vis&&st.playing){st.start=performance.now()-st.curT*1000}
    st.vis=e.isIntersecting;
  }),{threshold:.25}).observe(svg);
  inSK(st,()=>def.draw(def.dur));
  syncPlayer(st);
});

function frame(now){
  for(const st of live){
    if(!st.vis||!st.playing)continue;
    const D=st.def.dur+st.def.hold;
    let t=(now-st.start)/1000;
    if(reduce){if(t>=D){st.playing=false;t=st.def.dur}}
    else t%=D;
    st.curT=Math.min(t,st.def.dur);
    inSK(st,()=>st.def.draw(st.curT));
    syncPlayer(st);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

function cull(st){const svg=st.svg,M=svg.getScreenCTM();if(!M||!M.a)return;let I;try{I=M.inverse()}catch(e){return}
  const pt=(x,y)=>new DOMPoint(x,y).matrixTransform(I),saved=st.curT;
  inSK(st,()=>st.def.draw(st.def.dur));const boxes=[];
  svg.querySelectorAll('text').forEach(t=>{if(!t.textContent.trim())return;const r=t.getBoundingClientRect();if(!r.width)return;const a=pt(r.left,r.top),b=pt(r.right,r.bottom);boxes.push([a.x-4,a.y-3,b.x+4,b.y+3])});
  svg.querySelectorAll('.tuft,.fl').forEach(e=>{const b=e.getBBox();if(boxes.some(q=>b.x<q[2]&&b.x+b.width>q[0]&&b.y<q[3]&&b.y+b.height>q[1]))e.remove()});
  inSK(st,()=>st.def.draw(saved))}
document.fonts.ready.then(()=>live.forEach(cull));

/* ---- Interactive Sandbox on index.html: Temperature & Sampling ---- */
const sandbacks=[];
document.querySelectorAll('[data-sandbox="temp"]').forEach(box=>{
  const cand=[
    {w:'preservation',logit:2.45,y:34},
    {w:'world',logit:2.05,y:76},
    {w:'end',logit:1.40,y:118},
    {w:'woods',logit:0.75,y:160},
    {w:'magic',logit:-0.15,y:202}
  ];
  let tau=1.0,counts=[0,0,0,0,0],lastPick=-1;
  box.innerHTML=`
    <div class="sb-head">
      <p class="sb-title"><span class="i">Try it · Reshape the blaze with temperature</span><span class="m">Interactive · Softmax temperature τ and sampling</span></p>
      <div class="sb-controls">
        <label><span>τ =</span><span class="sb-val">1.00</span><input type="range" min="0.05" max="2.40" step="0.05" value="1.00" aria-label="Temperature tau"></label>
        <button type="button" class="cpill" data-tau="0.05"><span class="i">Greedy</span><span class="m">τ → 0</span></button>
        <button type="button" class="cpill" data-tau="0.6">0.6</button>
        <button type="button" class="cpill" data-tau="1" aria-pressed="true">1.0</button>
        <button type="button" class="cpill" data-tau="2">2.0</button>
      </div>
    </div>
    <div class="sb-body"><svg viewBox="0 0 800 232" role="img" aria-label="Interactive next-token probability fan reshaped by temperature"></svg></div>
    <div class="sb-foot">
      <div class="sb-btns">
        <button type="button" class="sb-btn pri" data-act="one"><span class="i">Take 1 step</span><span class="m">Sample 1 token</span></button>
        <button type="button" class="sb-btn" data-act="many"><span class="i">Send 40 walkers</span><span class="m">Sample 40×</span></button>
        <button type="button" class="sb-btn" data-act="reset">Reset</button>
      </div>
      <span class="sb-stat"></span>
    </div>`;
  const svg=box.querySelector('svg'),rng=box.querySelector('input[type="range"]'),valEl=box.querySelector('.sb-val'),stat=box.querySelector('.sb-stat');
  let els=null;
  const probs=()=>{
    const mx=Math.max(...cand.map(c=>c.logit/tau)),ex=cand.map(c=>Math.exp(c.logit/tau-mx)),s=ex.reduce((a,b)=>a+b);
    return ex.map(x=>x/s);
  };
  const build=()=>{
    svg.replaceChildren();
    const sk=isM();svg.classList.toggle('msk',sk);
    SK=sk;
    try{
      const bg=el('g',{},svg);tufts(bg,89);
      const J={x:235,y:118},C={x:365,y:118};
      el('path',{d:`M26 ${J.y}H${J.x}`,class:'road'},bg);
      const ctx=txt(bg,34,J.y-22,'note');ctx.textContent='in wildness is the …';ctx.style.fontSize=sk?'15px':'21px';
      const w=walker(svg);place(w,J.x-10,J.y);
      els=cand.map((c,i)=>{
        const E={x:515,y:c.y};
        const br=el('path',{d:roadD(0,1,u=>bez(J,C,E,u)),class:'worn'},bg);
        const hi=el('circle',{cx:E.x,cy:E.y,r:7,class:'ring'},bg);hi.style.opacity=0;
        const lab=txt(bg,E.x+16,E.y+5,'flabel');lab.textContent=c.w;
        const barBg=el('rect',{x:628,y:E.y-6,width:96,height:11,rx:3,class:'mbar',style:'opacity:.16'},bg);
        const bar=el('rect',{x:628,y:E.y-6,width:0,height:11,rx:3,class:'mbar top'},bg);
        const pr=txt(bg,732,E.y+4,'prob');
        return{br,hi,lab,bar,pr,barBg};
      });
    }finally{SK=false}
    render();
  };
  const render=()=>{
    const p=probs(),pm=Math.max(...p),tot=counts.reduce((a,b)=>a+b,0);
    valEl.textContent=tau.toFixed(2);
    box.querySelectorAll('.cpill[data-tau]').forEach(b=>b.setAttribute('aria-pressed',String(Math.abs(Number(b.dataset.tau)-tau)<.02)));
    els.forEach((it,i)=>{
      it.br.setAttribute('stroke-width',f1(1.8+20*p[i]));
      it.br.setAttribute('stroke-opacity',f1(.14+.86*(p[i]/pm)));
      it.bar.setAttribute('width',f1(96*p[i]));
      it.pr.textContent=(p[i]*100).toFixed(0)+'%'+(tot?` (${counts[i]})`:'');
      it.hi.style.opacity=lastPick===i?1:0;
      it.lab.style.fontWeight=lastPick===i?'700':'500';
    });
    if(!tot){
      stat.textContent=tau<=.12?L('Nearly greedy: almost every walker takes “preservation”.','τ → 0 concentrates mass on arg max (“preservation”).'):
        tau>=1.6?L('High temperature: faint side trails open up.','High τ flattens logits toward a uniform distribution.'):
        L('As worn in training: likely ways wide, rare ways still possible.','τ = 1 samples directly from the learned distribution.');
    }else{
      const lastW=lastPick>=0?cand[lastPick].w:'';
      stat.textContent=L(`${tot} ${tot===1?'step':'walkers'} sampled · latest: “${lastW}”`,`${tot} ${tot===1?'draw':'draws'} · latest sample: “${lastW}”`);
    }
  };
  const drawOne=()=>{const p=probs();let r=Math.random(),acc=0;for(let i=0;i<p.length;i++){acc+=p[i];if(r<=acc)return i}return p.length-1};
  rng.addEventListener('input',()=>{tau=Number(rng.value);render()});
  box.querySelectorAll('.cpill[data-tau]').forEach(b=>b.addEventListener('click',()=>{tau=Number(b.dataset.tau);rng.value=String(tau);render()}));
  box.querySelector('[data-act="one"]').onclick=()=>{lastPick=drawOne();counts[lastPick]++;render()};
  box.querySelector('[data-act="many"]').onclick=()=>{for(let k=0;k<40;k++){lastPick=drawOne();counts[lastPick]++}render()};
  box.querySelector('[data-act="reset"]').onclick=()=>{counts=[0,0,0,0,0];lastPick=-1;render()};
  build();
  sandbacks.push({build,render});
});

/* ---- Visual mini-icons for "Seven words for the whole field" ---- */
const WORD_ICONS=[
  '<svg class="wicon" viewBox="0 0 26 16" aria-hidden="true"><ellipse cx="7" cy="10" rx="3.2" ry="2" class="fp"/><ellipse cx="18" cy="6" rx="3.2" ry="2" class="fp"/></svg>',
  '<svg class="wicon" viewBox="0 0 26 16" aria-hidden="true"><path d="M2 8L22 3M2 8L23 8M2 8L21 13" stroke="var(--wear)" stroke-linecap="round" fill="none" stroke-width="2.4"/></svg>',
  '<svg class="wicon" viewBox="0 0 26 16" aria-hidden="true"><path d="M2 10Q13 5 24 9" stroke="var(--road)" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="9" cy="8" r="2" class="ghost" opacity=".55"/><circle cx="17" cy="8" r="2" class="ghost" opacity=".55"/></svg>',
  '<svg class="wicon" viewBox="0 0 26 16" aria-hidden="true"><circle cx="7" cy="6" r="2.6" class="vdot"/><circle cx="13" cy="9" r="2.6" class="vdot"/><circle cx="20" cy="5" r="2.2" fill="var(--muted)"/></svg>',
  '<svg class="wicon" viewBox="0 0 26 16" aria-hidden="true"><circle cx="7" cy="8" r="3.5" class="plaza"/><circle cx="19" cy="8" r="3.5" class="plaza"/><path d="M10.5 8H15.5" stroke="var(--wear)" stroke-width="2"/></svg>',
  '<svg class="wicon" viewBox="0 0 26 16" aria-hidden="true"><path d="M11 14V3" stroke="var(--fp)" stroke-width="2" stroke-linecap="round"/><path d="M6 3.5H18L21 6L18 8.5H6Z" fill="var(--gravel)" stroke="var(--cutEdge)" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  '<svg class="wicon" viewBox="0 0 26 16" aria-hidden="true"><rect x="2" y="4.5" width="22" height="7" fill="var(--gravel)" stroke="var(--cutEdge)" stroke-width="1.6"/></svg>',
  '<svg class="wicon" viewBox="0 0 26 16" aria-hidden="true"><path d="M2 9H24" stroke="var(--blaze)" stroke-width="2.2" stroke-dasharray="4 3" stroke-linecap="round"/></svg>'
];
document.querySelectorAll('.words li').forEach((li,idx)=>{
  if(!WORD_ICONS[idx])return;
  li.querySelectorAll('b').forEach(b=>b.insertAdjacentHTML('afterbegin',WORD_ICONS[idx]));
});

/* ---- Interactive Timeline & Card Theme Filter on index.html ---- */
(()=>{
  const nav=document.querySelector('nav.tl'),cards=document.querySelector('ol.cards');
  if(!nav||!cards)return;
  const legend=nav.querySelector('.legend');if(!legend)return;
  const tlItems=[...nav.querySelectorAll('ol > li')];
  const cardItems=[...cards.querySelectorAll(':scope > li')];
  const getTh=el=>{const a=el.querySelector('a')||el;return(a.getAttribute('style')||'').match(/--th-[a-z]+/)?.[0]||''};
  let active='';
  const spans=[...legend.querySelectorAll(':scope > span')];
  const allBtn=document.createElement('button');
  allBtn.type='button';allBtn.className='fbtn';allBtn.setAttribute('aria-pressed','true');
  allBtn.textContent='All 20';
  legend.insertBefore(allBtn,legend.firstChild);
  const btns=spans.map(sp=>{
    const th=(sp.getAttribute('style')||'').match(/--th-[a-z]+/)?.[0]||'';
    const b=document.createElement('button');b.type='button';b.className='fbtn';
    b.setAttribute('style',sp.getAttribute('style')||'');
    b.setAttribute('aria-pressed','false');
    b.dataset.th=th;
    b.innerHTML=sp.innerHTML;
    sp.replaceWith(b);
    return b;
  });
  const apply=th=>{
    active=th;
    allBtn.setAttribute('aria-pressed',String(!active));
    btns.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.th===active)));
    tlItems.forEach(li=>li.classList.toggle('dim',Boolean(active&&getTh(li)!==active)));
    cardItems.forEach(li=>{li.hidden=Boolean(active&&getTh(li)!==active)});
  };
  allBtn.onclick=()=>apply('');
  btns.forEach(b=>b.onclick=()=>apply(active===b.dataset.th?'':b.dataset.th));
})();

/* ---- Sticky Topbar shadow, Theme Switcher, and 20-Paper Jumper ---- */
const ENTRIES=[
  ['1948-count-the-footprints','1948','--th-trails','Count the footprints','n-gram language models'],
  ['1950-judge-the-footprints','1950','--th-trails','Judge the footprints','The imitation game'],
  ['1958-wear-the-rule-from-mistakes','1958','--th-trails','Wear the rule from mistakes','The perceptron'],
  ['1966-cut-the-paths-by-hand','1966','--th-trails','Cut the paths by hand','Rule-based dialogue'],
  ['1986-pass-the-blame-back','1986','--th-ground','Pass the blame back','Backpropagation and hidden layers'],
  ['1989-a-garden-worn-in','1989','--th-ground','A garden, worn in','Hidden Markov models'],
  ['1990-carry-a-pack','1990','--th-sight','Carry a pack','Recurrent neural networks and LSTM'],
  ['2000-similar-words-similar-ground','2000','--th-ground','Similar words, similar ground','Neural language models and word embeddings'],
  ['2012-ground-for-pictures','2012','--th-ground','Ground for pictures, worn in','Deep convolutional networks (AlexNet)'],
  ['2013-paint-in-one-stroke','2013','--th-brush','Paint in one stroke','Variational autoencoders and GANs'],
  ['2014-a-dog-on-the-other-road','2014','--th-sight','A dog on the other road','Sequence-to-sequence models and attention'],
  ['2017-drop-the-pack-keep-the-dog','2017','--th-sight','Drop the pack, keep the dog','The transformer'],
  ['2018-hand-over-the-road','2018','--th-hand','Hand over the road','Generative pretraining and in-context learning'],
  ['2020-more-walkers-on-a-straight-line','2020','--th-trails','More walkers, on a straight line','Neural scaling laws'],
  ['2020-paint-in-drafts','2020','--th-brush','Paint in drafts','Diffusion models'],
  ['2021-name-the-destination','2021','--th-hand','Name the destination','Classifier-free guidance'],
  ['2022-judge-where-walks-end','2022','--th-trails','Judge where walks end','Reinforcement learning from human feedback'],
  ['2022-scout-before-answering','2022','--th-scout','Scout before answering','Chain-of-thought and reasoning models'],
  ['2023-let-other-hands-lay-road','2023','--th-hand','Other hands lay road','Retrieval augmentation and tool use'],
  ['2023-trails-worn-by-walkers','2023','--th-trails','Trails worn by walkers','Model collapse']
];
(()=>{
  const topbar=document.querySelector('.topbar');if(!topbar)return;
  const onScroll=()=>topbar.classList.toggle('stuck',scrollY>14);
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  /* upgrade "Entry X of 20" into a clickable 20-entry jumper menu */
  const right=topbar.querySelector('.right');
  const entrySpan=right&&[...right.children].find(e=>e.tagName==='SPAN'&&/^Entry \d+ of 20$/.test(e.textContent.trim()));
  if(entrySpan){
    const wrap=document.createElement('div');wrap.className='jumpwrap';
    const btn=document.createElement('button');btn.type='button';btn.className='jumpbtn';
    btn.setAttribute('aria-expanded','false');btn.setAttribute('aria-haspopup','true');
    btn.innerHTML=`<span>${entrySpan.textContent.trim()}</span><span class="chev">▾</span>`;
    const menu=document.createElement('div');menu.className='jumpmenu';menu.hidden=true;
    const curSlug=ENTRIES.find(([s])=>location.pathname.includes(s))?.[0]||'';
    menu.innerHTML=ENTRIES.map(([slug,yr,th,ti,tm])=>
      `<a href="${slug}.html" style="--th:var(${th})"${slug===curSlug?' aria-current="page"':''}><span class="dot"></span><b>${yr}</b><span><span class="i">${ti}</span><span class="m">${tm}</span></span></a>`
    ).join('');
    wrap.append(btn,menu);
    entrySpan.replaceWith(wrap);
    const close=()=>{menu.hidden=true;btn.setAttribute('aria-expanded','false')};
    btn.onclick=e=>{e.stopPropagation();const open=menu.hidden;menu.hidden=!open;btn.setAttribute('aria-expanded',String(open));
      if(open){const cur=menu.querySelector('[aria-current="page"]');if(cur)cur.scrollIntoView({block:'nearest'})}};
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }

  /* light/dark theme toggle */
  if(right){
    const tbtn=document.createElement('button');tbtn.type='button';tbtn.className='themebtn';
    const SUN='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>';
    const MOON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z"/></svg>';
    const isDark=()=>{const dt=document.documentElement.dataset.theme;return dt?dt==='dark':matchMedia('(prefers-color-scheme: dark)').matches};
    const syncTheme=()=>{const dk=isDark();tbtn.innerHTML=dk?SUN:MOON;tbtn.title=dk?'Switch to light theme':'Switch to dark theme';tbtn.setAttribute('aria-label',tbtn.title)};
    tbtn.onclick=()=>{const next=isDark()?'light':'dark';document.documentElement.dataset.theme=next;try{localStorage.setItem(THMK,next)}catch(e){}syncTheme()};
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change',syncTheme);
    syncTheme();
    right.appendChild(tbtn);
  }

  /* keyboard navigation [ and ] for prev/next paper */
  document.addEventListener('keydown',e=>{
    if(e.metaKey||e.ctrlKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)||document.querySelector('dialog[open]'))return;
    if(e.key==='['){const a=document.querySelector('.pager .prev');if(a)location.href=a.href}
    else if(e.key===']'){const a=document.querySelector('.pager .next');if(a)location.href=a.href}
  });
})();

/* ---- the register switch (Allegory 'i' | Bridge 'b' | Math 'm') ---- */
function relabel(svg){const w=document.createTreeWalker(svg,NodeFilter.SHOW_TEXT);let n;
  while((n=w.nextNode())){const o=RLBL[n.nodeValue]??n.nodeValue;const v=T(o);if(v!==n.nodeValue)n.nodeValue=v}}
function setReg(r,keep){
  if(!['i','b','m'].includes(r))r='i';
  const a=keep?[...document.querySelectorAll('main h1,main h2,main h3,main p,main figure,main li')].find(e=>{const b=e.getBoundingClientRect();return b.height>0&&b.bottom>innerHeight*.25}):null;
  const y0=a?a.getBoundingClientRect().top:0;
  document.body.dataset.reg=r;
  const tt=document.querySelector('title');if(tt&&tt.dataset.m){tt.dataset.i??=tt.textContent;document.title=r==='m'?tt.dataset.m:tt.dataset.i}
  document.querySelectorAll('.segb').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.reg===r)));
  document.querySelectorAll('[data-al-m]').forEach(e=>{e.dataset.alI??=e.getAttribute('aria-label');e.setAttribute('aria-label',r==='m'?e.dataset.alM:e.dataset.alI)});
  for(const st of live){
    const sk=r==='m';
    if(sk!==st.sk){st.sk=sk;st.svg.replaceChildren();inSK(st,()=>st.def.init(st.svg))}
    relabel(st.svg);
    inSK(st,()=>st.def.draw(st.curT));
    syncPlayer(st);
  }
  for(const sb of sandbacks)sb.build();
  if(a){const d=a.getBoundingClientRect().top-y0;if(d)scrollTo({top:scrollY+d,behavior:'instant'})}
}
document.querySelectorAll('.segb').forEach(b=>b.addEventListener('click',()=>{
  setReg(b.dataset.reg,true);
  try{localStorage.setItem(REGK,b.dataset.reg)}catch(e){}
  document.fonts.ready.then(()=>live.forEach(cull));
}));
setReg(reg(),false);

/* ---- notation cheatsheet dialog (Bridge & Math registers) ---- */
const NOTATION=[
['Sequences',[
 ['x_{1:T}','a sequence of tokens \\(x_1,\\dots,x_T\\)'],['x_t','the token at position \\(t\\)'],['x_{<t}','the context: every token before position \\(t\\)'],
 ['V,\\ |V|','the vocabulary, and its size'],['y,\\ \\hat y','a target or label, and the model\u2019s prediction of it']]],
['Models and training',[
 ['\\theta','the model\u2019s parameters (weights)'],['p_\\theta(\\cdot\\mid x_{<t})','the model\u2019s probability for each next token, given the context'],
 ['\\hat p,\\ c(\\cdot)','an estimated probability; a count in a corpus'],['\\mathcal{L}(\\theta)','the training loss, to be made small'],
 ['\\eta,\\ \\nabla_\\theta','the learning rate; the gradient with respect to \\(\\theta\\)'],['h_t \\in \\mathbb{R}^d','the hidden state: a vector of \\(d\\) numbers summarizing the context'],
 ['W,\\ b','a weight matrix and a bias vector'],['z','a latent variable: random noise, or a hidden code']]],
['Probability',[
 ['a \\sim p','\\(a\\) is drawn at random from \\(p\\)'],['\\mathbb{E}[\\cdot]','the expected (average) value'],['\\mathcal{N}(\\mu,\\Sigma)','a Gaussian with mean \\(\\mu\\) and covariance \\(\\Sigma\\)'],
 ['\\mathrm{KL}(p\\,\\|\\,q)','how far \\(q\\) is from \\(p\\): zero only when they are equal'],['\\propto','proportional to'],['\\arg\\max_x f(x)','the \\(x\\) that makes \\(f\\) largest']]],
['Functions',[
 ['\\sigma(u)','the sigmoid \\(1/(1+e^{-u})\\): squashes any number into \\((0,1)\\)'],['\\operatorname{softmax}(u)_v','\\(e^{u_v}/\\sum_w e^{u_w}\\): turns scores into probabilities'],
 ['\\mathbb{1}[\\cdot]','1 if the condition holds, otherwise 0'],['u^\\top v','the dot product of two vectors'],['u\\odot v','element-wise product']]],
['Symbols that recur in later entries',[
 ['q,\\ k,\\ v;\\ \\alpha','query, key and value vectors; attention weights (2014, 2017)'],['\\varepsilon,\\ \\varepsilon_\\theta','added noise, and the network\u2019s prediction of it (2020, 2021)'],
 ['\\pi_\\theta,\\ \\pi_{\\text{ref}}','a model seen as a policy, and the model it started from (2022)'],['r_\\phi,\\ \\beta','a learned reward model, and the weight on the KL penalty (2022)'],
 ['c','overloaded: a count (1948), a context vector (2014), conditioning such as a prompt (2021)']]]];
(()=>{const bar=document.querySelector('.topbar .right');if(!bar)return;
  const btn=document.createElement('button');btn.type='button';btn.className='notebtn m';btn.textContent='Notation';btn.setAttribute('aria-haspopup','dialog');
  bar.insertBefore(btn,bar.querySelector('.regseg'));
  const dlg=document.createElement('dialog');dlg.className='notedlg';dlg.setAttribute('aria-labelledby','notedlg-h');
  dlg.innerHTML='<div class="notehead"><h2 id="notedlg-h">Notation</h2><button type="button" class="noteclose" aria-label="Close">\u00d7</button></div>'+'<p class="notetip">Click or tap any formula on the page for its symbols in plain English.</p>'+
    NOTATION.map(([h,rows])=>`<h3>${h}</h3><dl>`+rows.map(([s,e])=>`<dt>\\(${s.replace(/</g,'&lt;')}\\)</dt><dd>${e.replace(/</g,'&lt;')}</dd>`).join('')+'</dl>').join('');
  document.body.appendChild(dlg);let typeset=false;
  btn.addEventListener('click',()=>{if(!typeset&&window.renderMathInElement){renderMathInElement(dlg,{delimiters:[{left:'\\(',right:'\\)',display:false}],throwOnError:false});typeset=true}dlg.showModal()});
  dlg.querySelector('.noteclose').addEventListener('click',()=>dlg.close());
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()})})();

/* ---- formula gloss popover (works in both Bridge and Math modes!) ---- */
const GLOSS={"gc":[
  ["x_\\{<t\\}","x_{<t}","the context: every token before position t"],
  ["x_\\{1:T\\}","x_{1:T}","a whole sequence of T tokens"],
  ["x_\\{1:t\\}|x_\\{\\\\le t\\}","x_{1:t}","the tokens up to and including position t"],
  ["x_\\{t-n\\+1:t-1\\}|x_\\{t-k\\+1:t\\}","x_{t-n+1:t-1}","the window of previous tokens in context"],
  ["y_\\{<i\\}|y_\\{<t\\}","y_{<i}","the output tokens generated so far"],
  ["p_\\{\\\\text\\{data\\}\\}","p_{\\text{data}}","the true data distribution: real text or real images"],
  ["p_\\{?\\\\theta(?![_a-zA-Z])","p_\\theta","the model's probability distribution"],
  ["\\\\pi_\\{\\\\text\\{(?:ref|SFT)\\}\\}","\\pi_{\\text{ref}}","the reference model the policy started from"],
  ["\\\\pi_\\\\theta","\\pi_\\theta","the model, seen as a policy that chooses outputs"],
  ["r_\\\\phi","r_\\phi","the learned reward model"],
  ["\\\\theta\\^\\\\star","\\theta^\\star","the optimal parameters"],
  ["\\\\hat ?\\{?y\\}?","\\hat y","the model's prediction"],
  ["\\\\hat ?\\{?p\\}?","\\hat p","an estimated probability"],
  ["\\\\tilde ?\\\\varepsilon(?:_\\\\theta)?","\\tilde\\varepsilon","the guided noise prediction"],
  ["\\\\varepsilon_\\\\theta","\\varepsilon_\\theta","the network's prediction of the noise"],
  ["\\\\bar ?\\\\alpha_t","\\bar\\alpha_t","how much of the original image survives after t steps"],
  ["\\\\sigma'","\\sigma'","the slope (derivative) of the sigmoid"],
  ["d_k","d_k","the dimension of the query and key vectors"],
  ["\\\\mathcal\\{L\\}_\\{\\\\text\\{simple\\}\\}","\\mathcal{L}_{\\text{simple}}","DDPM's simplified noise-prediction loss"],
  ["\\\\mathcal\\{L\\}","\\mathcal{L}","the loss: lower is better"],
  ["\\\\mathcal\\{D\\}","\\mathcal{D}","the dataset of prompts"],
  ["\\\\mathbb\\{R\\}(?:\\^\\{?[a-zA-Z0-9]+\\}?)?","\\mathbb{R}^d","space of d-dimensional real vectors"],
  ["\\\\mathcal\\{N\\}","\\mathcal{N}","a Gaussian (normal) distribution"],
  ["\\\\mathbb\\{E\\}","\\mathbb{E}","the expected value (average)"],
  ["\\\\mathbb\\{1\\}","\\mathbb{1}[\\cdot]","1 if the condition inside holds, otherwise 0"],
  ["\\\\mathrm\\{KL\\}","\\mathrm{KL}","KL divergence: how far one distribution is from another"],
  ["\\\\mathrm\\{JSD\\}","\\mathrm{JSD}","Jensen–Shannon divergence: a symmetric distance between distributions"],
  ["\\\\operatorname\\{softmax\\}","\\operatorname{softmax}","turns scores into probabilities that sum to 1"],
  ["\\\\operatorname\\{mean\\}","\\operatorname{mean}","the average"],
  ["\\\\operatorname\\{std\\}","\\operatorname{std}","the standard deviation"],
  ["\\\\operatorname\\{diag\\}","\\operatorname{diag}","a diagonal matrix with these entries"],
  ["\\\\operatorname\\{Attention\\}","\\operatorname{Attention}","scaled dot-product attention"],
  ["\\\\operatorname\\{MultiHead\\}","\\operatorname{MultiHead}","multi-head attention output"],
  ["\\\\operatorname\\{LayerNorm\\}","\\operatorname{LayerNorm}","layer normalization"],
  ["\\\\tanh","\\tanh","squashes any number into (−1, 1)"],
  ["\\\\log","\\log","natural logarithm"],
  ["\\\\exp","\\exp","the exponential function"],
  ["\\\\arg\\\\max","\\arg\\max","the input value that makes the expression largest"],
  ["\\\\arg\\\\min","\\arg\\min","the input value that makes the expression smallest"],
  ["\\\\max|\\\\min","\\max,\\ \\min","maximize or minimize"],
  ["\\\\sum","\\textstyle\\sum","sum of terms over the index shown"],
  ["\\\\prod","\\textstyle\\prod","product of terms over the index shown"],
  ["\\\\partial","\\partial","partial derivative: rate of change with respect to a variable"],
  ["\\\\nabla","\\nabla","gradient: direction of steepest increase"],
  ["\\\\leftarrow","\\leftarrow","update: replace the left side with the right side"],
  ["\\\\mapsto","\\mapsto","maps to"],
  ["\\\\sim","\\sim","is drawn at random from"],
  ["\\\\propto","\\propto","proportional to"],
  ["\\\\approx","\\approx","approximately equal to"],
  ["\\\\lor","\\lor","logical OR (at least one holds)"],
  ["\\\\land","\\land","logical AND (both hold)"],
  ["\\\\lnot","\\lnot","logical NOT"],
  ["\\\\succ","\\succ","is preferred to"],
  ["\\^\\\\top","^\\top","transpose; between two vectors, a dot product"],
  ["\\\\odot","\\odot","element-wise product"],
  ["\\\\circ","\\circ","composition: apply one function after another"],
  ["\\\\mid","\\mid","given (conditioned on)"],
  ["\\\\varnothing","\\varnothing","the null prompt: no conditioning"],
  ["\\\\varepsilon","\\varepsilon","Gaussian noise"],
  ["\\\\theta","\\theta","the model's parameters"],
  ["\\\\eta","\\eta","the learning rate: step size of each update"],
  ["\\\\sigma","\\sigma","the sigmoid 1/(1 + e⁻ᵘ), squashing into (0, 1)"],
  ["\\\\chi\\^2","\\chi^2","a chi-squared random variable"],
  ["O\\(","O(\\cdot)","asymptotic growth rate"],
  ["\\\\infty","\\infty","infinity; after softmax, −∞ gives weight zero"]
],
"gl":[
  ["x","x","a token, or the input"],["t","t","position in the sequence"],["T","T","the sequence length"],
  ["V","V","the vocabulary; |V| is its size"],["v","v","a token from the vocabulary"],
  ["h","h","a hidden state: a vector summarizing the input so far"],["d","d","the dimension of a vector"],
  ["y","y","the target or output"],["z","z","a latent variable: random noise or a hidden code"],
  ["W","W","a weight matrix"],["b","b","a bias"],["w","w","a weight vector"],
  ["N","N","the number of training examples"],["p","p","a probability distribution"]
],
"p":{
  "index":{
    "c":[["\\\\tau","\\tau","temperature: higher flattens the distribution, lower sharpens it"],["\\\\ell_v","\\ell_v","logit: raw score for token v before softmax"],["\\\\beta","\\beta","KL-penalty weight"]],
    "l":[["e","e_v","the output embedding of token v"],["f","f_\\theta","the network"],["u","u","another token, summed over"],["N","N","the number of training sequences"],["n","n","training sequence index"]]
  },
  "1948-count-the-footprints":{
    "c":[],"l":[["c","c(\\cdot)","count: how often that sequence occurs in the corpus"],["n","n","the n in n-gram: the model looks back n−1 tokens"],["w","w","a word"],["u","u","the previous word"],["p","p","the true probability"],["a","a","a token"],["b","b","the token that comes right after a"]]
  },
  "1950-judge-the-footprints":{
    "c":[["10\\^9","10^9","one billion bits of storage (about 125 megabytes)"]],"l":[["x","x","a whole text"],["T","T","the number of tokens in the text"],["D","D","the discriminator"]]
  },
  "1958-wear-the-rule-from-mistakes":{
    "c":[["\\\\gamma","\\gamma","the margin: how cleanly the best hyperplane separates the classes"],["\\\\tau","\\tau","the fixed firing threshold"]],
    "l":[["x","x","the input vector"],["w","w","the learned weights"],["b","b","the bias"],["y","y","the true label (0 or 1)"],["R","R","radius: maximum norm of any input"],["u","u","a unit vector separating the classes"]]
  },
  "1966-cut-the-paths-by-hand":{
    "c":[],"l":[["x","x","the user's input"],["d","d","decomposition pattern splitting the input into segments"],["r","r","reassembly template building the reply"],["y","y","the reply"],["k","k","the matched keyword"],["s","s_1,\\dots,s_m","segments cut out of the input"],["m","m","number of segments"]]
  },
  "1986-pass-the-blame-back":{
    "c":[["\\\\delta","\\delta","error signal: ∂L/∂z, how much the loss changes with a unit's weighted input"],["\\\\alpha","\\alpha","momentum: fraction of the previous weight update to carry forward"]],
    "l":[["x","x_1, x_2","binary input features"],["h","h_1, h_2","hidden units"],["z","z_j","a unit's weighted input"],["a","a_j","a unit's activation (output)"],["w","w_{ij}","weight from unit i to unit j"],["y","y","target output"],["o","o","output unit index"],["t","t","update step"],["j","j","current unit"],["i","i","unit in the layer below j"],["k","k","unit in the layer above j"]]
  },
  "1989-a-garden-worn-in":{
    "c":[["\\\\alpha","\\alpha_t(j)","forward variable: probability of the first t frames, ending in state j"],["\\\\lambda","\\lambda","the HMM parameters (A, B, π) together"],["\\\\pi","\\pi","initial state distribution"],["\\\\mu","\\mu","Gaussian mean"],["\\\\Sigma","\\Sigma","Gaussian covariance matrix"],["\\\\alpha_t","\\alpha_t(j)","forward probability of observations 1..t ending in state j"],["\\\\gamma_t","\\gamma_t(i)","posterior probability of being in state i at time t"],["\\\\xi_t","\\xi_t(i,j)","posterior probability of transitioning i → j at time t"]],
    "l":[["N","N","number of hidden states in the word model"],["T","T","number of acoustic frames in the recording"],["o","o_t","acoustic observation (frame) at time t"],["s","s_t","hidden state at time t"],["a","a_{ij}","transition probability from state i to state j"],["b","b_j(o)","emission density of observation o in state j"],["c","c_{jm}","mixture weight of Gaussian m in state j"],["m","m","mixture component index"],["t","t","time frame"],["i","i, j","hidden states"],["j","j","hidden state"],["w","w","candidate word"]]
  },
  "1990-carry-a-pack":{
    "c":[["\\\\tilde ?c","\\tilde c_t","candidate new memory content"],["f(?:_\\\\theta)?\\(","f_\\theta","the recurrent update: one learned function applied at every step"]],
    "l":[["h","h_t","hidden state after token t"],["W","W","input-to-hidden weights"],["U","U","recurrent hidden-to-hidden weights"],["V","V","output weights mapping h_t to logits"],["c","c_t","LSTM memory cell"],["f","f_t","forget gate: fraction of old cell state kept"],["i","i_t","input gate: fraction of new candidate added"],["o","o_t","output gate: fraction of cell exposed as h_t"],["k","k","number of steps back"],["s","s","step index in the product"]]
  },
  "2000-similar-words-similar-ground":{
    "c":[["u_\\{?o'?\\}?","u_o","output vector of a context word o"],["v_\\{?[a-zA-Z]+\\}?","v_w","embedding vector of word w"]],
    "l":[["C","C(w)","embedding table: C(w) is word w's learned vector"],["w","w","a word in the vocabulary"],["o","o","a neighbouring context word"],["v","v","concatenated embeddings of the previous n−1 words"],["H","H","hidden-layer weights"],["U","U","hidden-to-output weights"],["W","W","direct input-to-output weights"],["d","d","hidden-layer bias"],["k","k","context window radius"],["j","j","offset within the context window"],["n","n","the n in n-gram"],["m","m","embedding dimension"]]
  },
  "2012-ground-for-pictures":{
    "c":[["\\\\phi","\\phi","hand-designed feature extractor (e.g. SIFT, HOG)"]],
    "l":[["x","x","input image"],["y","y","class label (1 of 1,000)"],["f","f_\\theta","deep convolutional network (8 learned layers)"],["K","K","learned convolutional filter"],["X","X","image or feature map"],["u","u, v","horizontal and vertical offsets inside the filter"],["v","v","vertical offset inside the filter"],["i","i, j","spatial row and column in the feature map"],["j","j","spatial column"],["k","k","offset within the filter's window"],["w","w_k","the filter's weights, shared across positions"],["z","z","pre-activation value passed into ReLU"],["h","h","layer activations"],["m","m","random Bernoulli(0.5) dropout mask"],["g","g_\\theta","learned classifier head"]]
  },
  "2013-paint-in-one-stroke":{
    "c":[["q_\\\\phi","q_\\phi(z\\mid x)","encoder: approximate posterior over latent codes"],["p_G","p_G","distribution of images produced by the generator"]],
    "l":[["x","x","an image"],["z","z","latent code vector"],["G","G_\\theta","generator / decoder network"],["D","D","discriminator (critic) network"],["I","I","identity covariance matrix"]]
  },
  "2014-a-dog-on-the-other-road":{
    "c":[["\\\\alpha","\\alpha_{ij}","attention weight on source word j when writing target word i"],["[WUv]_a","W_a, U_a, v_a","learned weights of the alignment network"]],
    "l":[["x","x","source sentence"],["y","y","target translation"],["v","v","fixed-size summary vector in plain seq2seq"],["h","h_j","encoder annotation for source word j"],["s","s_i","decoder recurrent state at step i"],["c","c_i","attention context vector for step i"],["e","e_{ij}","unnormalized alignment score"],["a","a","alignment score function"],["f","f","decoder state update"],["g","g","output word distribution"],["i","i","target word position"],["j","j","source word position"],["k","k","source index summed in softmax"]]
  },
  "2017-drop-the-pack-keep-the-dog":{
    "c":[["\\\\alpha","\\alpha_{tj}","attention weight: how much position t draws from position j"],["\\\\ell","\\ell","layer index"],["W(?:_i)?\\^[QKV]|W\\^O","W^Q, W^K, W^V, W^O","learned query, key, value and output projection matrices"],["PE","PE","sinusoidal positional encoding"]],
    "l":[["Q","Q","matrix of query vectors"],["K","K","matrix of key vectors"],["V","V","matrix of value vectors"],["q","q","a token's query vector: what it looks for"],["k","k","an earlier token's key vector: what it offers"],["v","v","an earlier token's value vector: what it passes back"],["M","M","causal mask (−∞ on future tokens j > t)"],["h","h^{(\\ell)}","token representation at layer ℓ (or number of heads)"],["F","F_\\ell","attention or feed-forward sublayer"],["n","n","sequence length"],["t","t","current token position"],["j","j","attended token position"]]
  },
  "2018-hand-over-the-road":{
    "c":[["\\\\lambda","\\lambda","weight on the auxiliary language-modelling loss"]],
    "l":[["c","c","prompt / context text"],["y","y","sampled continuation or task label"],["x","x","task input"],["L","L_1, L_2, L_3","pretraining, task and combined objectives"],["K","K","number of few-shot examples in the prompt"]]
  },
  "2020-more-walkers-on-a-straight-line":{
    "c":[["[NDC]_c","N_c, D_c, C_c","fitted scale constants"],["\\\\alpha(?:_[NDC])?","\\alpha","power-law scaling exponent"],["H\\(","H(p_{\\text{data}})","irreducible entropy of human text"]],
    "l":[["L","L","cross-entropy test loss"],["N","N","number of non-embedding parameters"],["D","D","dataset size in tokens"],["C","C","training compute (≈ 6ND FLOPs)"],["a","a","compute-optimal exponent for model size N"],["b","b","compute-optimal exponent for dataset size D"]]
  },
  "2020-paint-in-drafts":{
    "c":[["\\\\bar ?\\\\alpha_t","\\bar\\alpha_t","signal fraction remaining after t noise steps"],["\\\\beta_t","\\beta_t","noise variance added at step t"],["\\\\alpha_t","\\alpha_t","1 − β_t"],["\\\\sigma_t","\\sigma_t","reverse-step noise scale"]],
    "l":[["x","x_t","image at noise step t (x₀ is clean, x_T is pure noise)"],["t","t","noise step (1 to T)"],["T","T","total number of diffusion steps"],["q","q","fixed forward noising process"],["z","z","fresh standard Gaussian noise"],["I","I","identity matrix"]]
  },
  "2021-name-the-destination":{
    "c":[["\\\\tilde p","\\tilde p","the guided distribution that sampling approximately follows"],["\\\\tilde\\\\varepsilon","\\tilde\\varepsilon","the guided noise prediction actually used for the step"],["\\\\bar ?\\\\alpha_t","\\bar\\alpha_t","signal fraction remaining at step t"],["p_\\\\phi","p_\\phi(c\\mid x_t)","separate noisy-image classifier"],["w'","w'","original paper's guidance weight (w = 1 + w')"]],
    "l":[["x","x_t","noisy image at step t"],["t","t","denoising step"],["c","c","conditioning prompt or class"],["w","w","guidance scale (w = 1 is unguided conditional)"],["s","s","classifier guidance scale"],["p","p","probability distribution"]]
  },
  "2022-judge-where-walks-end":{
    "c":[["\\\\beta","\\beta","KL-penalty coefficient (strength of the leash)"],["y_w","y_w","preferred ('winning') response in a human comparison"],["y_l","y_l","dispreferred ('losing') response in a human comparison"]],
    "l":[["P","P","probability"],["x","x","input prompt"],["y","y","complete generated response"],["t","t","token step during generation"]]
  },
  "2022-scout-before-answering":{
    "c":[],"l":[["i","i","index of one sampled answer in the group"],["q","q","input question"],["z","z","intermediate reasoning tokens (chain of thought)"],["a","a","final answer"],["r","r_i","verifiable reward for sampled output i"],["A","A_i","group-normalized advantage in GRPO"],["G","G","group size: number of outputs sampled per question"]]
  },
  "2023-let-other-hands-lay-road":{
    "c":[["\\\\tau_f","\\tau_f","loss-improvement threshold to keep a tool call"],["\\\\eta","\\eta","retriever parameters"],["E_D","E_D","document encoder"],["E_Q","E_Q","query encoder"]],
    "l":[["x","x","input query or context"],["y","y","generated output"],["d","d","retrieved document or spliced tool output"],["k","k","number of retrieved passages"],["L","L^+_i,\\ L^-_i","loss on later tokens with vs. without the tool result"],["i","i","token position"]]
  },
  "2023-trails-worn-by-walkers":{
    "c":[["\\\\lambda","\\lambda","fraction of the training data that is model-generated"],["\\\\theta_\\{?n(?:\\+1)?\\}?","\\theta_n","parameters of generation n"],["\\\\sigma_\\{?[0n]\\}?\\^2","\\sigma_n^2","fitted variance at generation n"]],
    "l":[["i","i","sample index"],["x","x","a generated sample"],["n","n","generation number"],["M","M","number of samples drawn per generation"],["k","k","generation index in the product"]]
  }
}};

function glossOf(src){
  const slug=Object.keys(GLOSS.p).find(s=>s!=='index'&&location.pathname.includes(s))||'index',pg=GLOSS.p[slug];
  let w=src;const hits=[],seen=new Set();
  const take=(re,tex,en)=>{let m,first=-1;re.lastIndex=0;while((m=re.exec(w))){if(!m[0].length){re.lastIndex++;continue}if(first<0)first=m.index;w=w.slice(0,m.index)+' '.repeat(m[0].length)+w.slice(m.index+m[0].length)}
    if(first>=0&&!seen.has(tex)){seen.add(tex);hits.push([first,tex,en])}};
  for(const[re,tex,en]of[...pg.c,...GLOSS.gc])take(new RegExp(re,'g'),tex,en);
  w=w.replace(/\\(?:text|mathrm|operatorname|mathbb|mathcal|begin|end)\{[^}]*\}/g,m=>' '.repeat(m.length)).replace(/\\[a-zA-Z]+/g,m=>' '.repeat(m.length));
  const L=new Map(GLOSS.gl.map(e=>[e[0],e]));for(const e of pg.l)L.set(e[0],e);
  for(const[ch,tex,en]of L.values())take(new RegExp('(?<![a-zA-Z])'+ch+'(?![a-zA-Z])','g'),tex,en);
  return hits.sort((a,b)=>a[0]-b[0]);
}

(()=>{let pop=null,cur=null;
  const close=()=>{if(pop){pop.remove();pop=null;cur=null}};
  const open=k=>{if(cur===k){close();return}close();const ann=k.querySelector('annotation');if(!ann||!window.katex)return;
    const g=glossOf(ann.textContent),box=k.closest('.eqx'),say=box&&box.dataset.say;if(!g.length&&!say)return;
    pop=document.createElement('div');pop.className='mpop';pop.setAttribute('role','dialog');pop.setAttribute('aria-label','What this formula says');
    pop.innerHTML=`<div class="mpop-head"><span class="mpop-tag">Formula in plain English</span><button type="button" class="mpop-x" aria-label="Close">\u00d7</button></div>`+
      (say?`<p class="say">${say.replace(/</g,'&lt;')}</p>`:'')+
      (g.length?'<dl>'+g.map(([,t,e])=>`<dt>${katex.renderToString(t,{throwOnError:false})}</dt><dd>${e.replace(/</g,'&lt;')}</dd>`).join('')+'</dl>':'');
    pop.querySelector('.mpop-x').onclick=close;
    document.body.appendChild(pop);cur=k;
    const r=(box||k).getBoundingClientRect(),pw=pop.offsetWidth,ph=pop.offsetHeight;
    pop.style.left=Math.max(10,Math.min(scrollX+r.left,scrollX+document.documentElement.clientWidth-pw-10))+'px';
    const below=r.bottom+8+ph<innerHeight||r.top<ph+16;
    pop.style.top=(below?scrollY+r.bottom+8:scrollY+r.top-ph-8)+'px'};
  document.addEventListener('click',e=>{if(!hasMath())return close();const k=e.target.closest('main .katex');if(k&&!e.target.closest('a'))open(k);else if(!e.target.closest('.mpop'))close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close();const b=e.target.closest&&e.target.closest('.eqx');if(b&&(e.key==='Enter'||e.key===' ')){e.preventDefault();const k=b.querySelector('.katex');if(k)open(k)}});
  let vw=innerWidth;addEventListener('resize',()=>{if(innerWidth!==vw){vw=innerWidth;close()}})})();

/* ---- typeset math reliably regardless of defer script load order ---- */
let mathDone=false;
const math=()=>{
  if(mathDone||!window.renderMathInElement)return;
  mathDone=true;
  renderMathInElement(document.querySelector('main'),{delimiters:[{left:'\\[',right:'\\]',display:true},{left:'\\(',right:'\\)',display:false}],throwOnError:false,ignoredClasses:['i']});
  document.querySelectorAll('main .eqx').forEach(e=>{e.tabIndex=0;e.setAttribute('role','button');e.setAttribute('aria-label','Explain this formula: '+e.dataset.say)});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',math);else math();
addEventListener('load',math);
})();
