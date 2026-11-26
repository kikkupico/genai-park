/* GenAI Park · graph view (Math register prototype).
   Two kinds of stage, both plain graphs:
   - 'tok': tokens are nodes; only the path so far and the fan of next tokens are drawn.
   - 'net': units, images and modules are nodes; weights and data flow are edges.
   Every step is an authored state, not a simulation. */
(()=>{
const NS='http://www.w3.org/2000/svg';
const el=(tag,a={},p)=>{const e=document.createElementNS(NS,tag);for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e};
const f1=n=>(+n).toFixed(1);
/* set SVG text, drawing _x or _{xy} as a subscript */
const setT=(t,s)=>{t.replaceChildren();String(s).split(/(_\{[^}]*\}|_[^\s,()|]{1})/).forEach(part=>{if(!part)return;
  if(part[0]==='_'&&part.length>1){const v=part[1]==='{'?part.slice(2,-1):part.slice(1);const sp=document.createElementNS('http://www.w3.org/2000/svg','tspan');sp.setAttribute('class','sub');sp.setAttribute('dy','4');sp.textContent=v;t.appendChild(sp);
    const z=document.createElementNS('http://www.w3.org/2000/svg','tspan');z.setAttribute('dy','-4');z.textContent='\u200b';t.appendChild(z)}
  else t.appendChild(document.createTextNode(part))})};
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const rng=seed=>{let s=seed;return()=>(s=(s*16807)%2147483647)/2147483647};

/* ================= token graph ================= */
const NODES={
  s:{x:50,y:230,l:'⟨s⟩'},the:{x:150,y:230},cat:{x:255,y:135},duck:{x:255,y:325},ran:{x:360,y:230},
  and:{x:465,y:230},it:{x:570,y:230},meowed:{x:690,y:135},flew:{x:690,y:325},e:{x:830,y:230,l:'⟨/s⟩'}
};
const lab=id=>id==='?'?'?':(NODES[id]?.l||id);
const R=27;
/* edges seen in the corpus, with hand-placed bends; any other pair gets a default bend */
const EDGES={
  's>the':0,'the>cat':0,'the>duck':0,'cat>ran':0,'duck>ran':0,'ran>and':0,'and>it':0,
  'it>meowed':0,'it>flew':0,'meowed>e':0,'flew>e':0,
  'meowed>and':[578,92] /* only on the long path: loops back above it */
};
const CORPUS=['s the cat ran and it meowed e','s the duck ran and it flew e'];
const COUNTS={};CORPUS.forEach(s=>{const t=s.split(' ');for(let i=1;i<t.length;i++){const k=t[i-1]+'>'+t[i];COUNTS[k]=(COUNTS[k]||0)+1}});
const BIGRAM={};{const out={};for(const k in COUNTS){const a=k.split('>')[0];out[a]=(out[a]||0)+COUNTS[k]}for(const k in COUNTS)BIGRAM[k]=COUNTS[k]/out[k.split('>')[0]]}

function geom(k){const[a,b]=k.split('>'),A=NODES[a],B=NODES[b];let C=EDGES[k];
  if(C===0||(C==null&&Math.abs(A.x-B.x)<140&&Math.abs(A.y-B.y)<120))C=[(A.x+B.x)/2,(A.y+B.y)/2];
  else if(C==null){const dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy);C=[(A.x+B.x)/2+dy/d*d*.22,(A.y+B.y)/2-dx/d*d*.22]}
  const dir=(P,Q)=>{const dx=Q[0]-P.x,dy=Q[1]-P.y,d=Math.hypot(dx,dy)||1;return[dx/d,dy/d]};
  const u=dir(A,C),v=dir(B,C);
  const S=[A.x+u[0]*R,A.y+u[1]*R],E=[B.x+v[0]*(R+4),B.y+v[1]*(R+4)];
  const d=`M${f1(S[0])} ${f1(S[1])}Q${f1(C[0])} ${f1(C[1])} ${f1(E[0])} ${f1(E[1])}`;
  const at=t=>[(1-t)**2*S[0]+2*(1-t)*t*C[0]+t*t*E[0],(1-t)**2*S[1]+2*(1-t)*t*C[1]+t*t*E[1]];
  const m=at(.5),m2=at(.52),tx=m2[0]-m[0],ty=m2[1]-m[1],tl=Math.hypot(tx,ty)||1;
  return{d,mid:m,nrm:[-ty/tl,tx/tl],bent:EDGES[k]!==0}}

/* ================= images (for the image entries) ================= */
const IW=8,IH=6;
const TARGET=(()=>{const g=[];for(let j=0;j<IH;j++)for(let i=0;i<IW;i++){let c;
  if(j>=4)c=[86+(i*13%30),134+(i*7%20),66];else{const u=j/3;c=[150+86*u,190+24*u,228-50*u]}
  if((i-6)**2+(j-1)**2<=1.2)c=[242,198,74];
  if(i>=1&&i<=3&&j===2)c=[58,108,58];if(i===2&&j===3)c=[108,78,48];g.push(c)}return g})();
const NOISE=s=>{const r=rng(s);return Array.from({length:IW*IH},()=>[r()*255,r()*255,r()*255])};
const MIX=(a,b,u)=>a.map((c,i)=>c.map((x,k)=>x+(b[i][k]-x)*u));
const BLUR=g=>g.map((_,n)=>{const i=n%IW,j=(n/IW)|0;let s=[0,0,0],c=0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){const x=i+di,y=j+dj;if(x<0||y<0||x>=IW||y>=IH)continue;const q=g[y*IW+x];s=s.map((v,k)=>v+q[k]);c++}return s.map(v=>v/c)});
const N1=NOISE(11),N2=NOISE(23);
const DIFF=[0,.3,.55,.8,1].map(u=>MIX(TARGET,N1,u));      /* x0 … x4 */
const GEN=[0,.3,.55,.8,1].map(u=>MIX(TARGET,N2,u));
const VAEOUT=BLUR(BLUR(TARGET)),RAW=MIX(BLUR(TARGET),N2,.85);

/* ================= entries ================= */
const P=(path,o={})=>({path,...o});
const CAT='s the cat ran and it',DUCK='s the duck ran and it',LONG='s the cat ran and it meowed and it';
const UNIFORM={s:.11,cat:.11,duck:.11,ran:.12,and:.11,it:.11,meowed:.11,flew:.11,e:.11};

/* -- net graphs -- */
const PERC={nodes:{x1:{x:150,y:140,l:'x₁'},x2:{x:150,y:290,l:'x₂'},b:{x:150,y:420,l:'1',r:16},y:{x:430,y:270,l:'ŷ',r:30}},
  edges:[['x1','y',.3],['x2','y',.8],['b','y',-.2]]};
const BP={nodes:{x1:{x:120,y:140,l:'x₁'},x2:{x:120,y:380,l:'x₂'},h1:{x:320,y:140,l:'h₁'},h2:{x:320,y:380,l:'h₂'},y:{x:510,y:260,l:'ŷ',r:28}},
  edges:[['x1','h1',.3],['x2','h1',-.2],['x1','h2',.1],['x2','h2',.4],['h1','y',-.3],['h2','y',.2]]};
const BPW={'x1>h1':1,'x2>h1':1,'x1>h2':1,'x2>h2':1,'h1>y':1,'h2>y':-2};
const CNN=(()=>{const nodes={},edges=[];const PX=[.1,.1,.15,.9,.95,.9,.15,.1,.1];
  for(let i=0;i<9;i++)nodes['i'+i]={x:130+i*80,y:470,kind:'px',v:PX[i]};
  for(let j=1;j<8;j++){nodes['c'+j]={x:130+j*80,y:345,r:15};for(let k=-1;k<=1;k++)edges.push(['i'+(j+k),'c'+j,[.6,1,-.6][k+1],{s:k+1}])}
  for(let j=1;j<8;j++)for(let i=0;i<9;i++)if(Math.abs(i-j)>1)edges.push(['i'+i,'c'+j,.15,{g:'dense'}]);
  for(let p=1;p<=3;p++){nodes['p'+p]={x:130+(2*p)*80,y:225,r:15};for(let j=2*p-1;j<=2*p+1;j++)edges.push(['c'+j,'p'+p,.5,{g:'up'}])}
  nodes.out={x:450,y:95,l:'duck?',r:24};for(let p=1;p<=3;p++)edges.push(['p'+p,'out',.6,{g:'up'}]);
  return{nodes,edges}})();
const GENM={nodes:{xin:{x:90,y:120,kind:'img',l:'x'},enc:{x:245,y:120,kind:'box',l:'encoder',w:104},z:{x:390,y:260,kind:'vec',l:'z'},
  dec:{x:545,y:260,kind:'box',l:'decoder / G',w:118},xout:{x:710,y:260,kind:'img',l:'x̂'},
  xr:{x:710,y:440,kind:'img',l:'real x'},D:{x:850,y:350,kind:'box',l:'D',w:56}},
  edges:[['xin','enc',1],['enc','z',1],['z','dec',1],['dec','xout',1],['xout','D',1,{c:[820,270]}],['xr','D',1,{c:[820,440]}]]};
const DIFG={nodes:Object.fromEntries([4,3,2,1,0].map((t,i)=>['x'+t,{x:95+i*177,y:250,kind:'img',l:t===4?'x_T  (noise)':t===0?'x₀  (data)':'x'+'₀₁₂₃'[t]}])),
  edges:[[3,4],[2,3],[1,2],[0,1]].flatMap(([a,b])=>[['x'+a,'x'+b,1,{g:'q',c:[ (95+(4-a)*177+95+(4-b)*177)/2,150]}],['x'+b,'x'+a,1,{g:'p',c:[(95+(4-a)*177+95+(4-b)*177)/2,350]}]])};
const PALL=['x4>x3','x3>x2','x2>x1','x1>x0'],QALL=['x0>x1','x1>x2','x2>x3','x3>x4'];
const AND=[[0,0,0],[1,0,0],[0,1,0],[1,1,1]],XOR=[[0,0,0],[1,0,1],[0,1,1],[1,1,0]];

const ENTRIES=[
 {id:'picture',yr:'',title:'The picture',sub:'Generation as a path through a graph',th:'--th-sight',kind:'tok',steps:[
  P('',{cap:'Each node is a token in the vocabulary $V$.',say:'The vocabulary: the fixed set of tokens the model can write, including a start marker and an end marker.',eq:'V=\\{\\langle s\\rangle,\\ \\text{the},\\ \\text{cat},\\ \\dots,\\ \\langle/s\\rangle\\}'}),
  P(CAT,{fan:{meowed:.92,flew:.08},cap:'Given the path so far, the model draws a fan to every possible next token. Width is probability.',say:'Given the tokens so far, the model gives every token in the vocabulary a probability, and together they add up to one.',eq:'p_\\theta(v\\mid x_{<t}),\\quad \\textstyle\\sum_v p_\\theta(v\\mid x_{<t})=1'}),
  P('s',{fan:{the:1},pick:'the',cap:'Generation starts at $\\langle s\\rangle$. Sample one edge of the fan.',say:'The next token is drawn at random from the model’s distribution, given everything written so far.',eq:'x_t\\sim p_\\theta(\\cdot\\mid x_{<t})'}),
  P('s the',{fan:{cat:.5,duck:.5},pick:'duck',cap:'The path grows by one token, and a new fan is drawn.'}),
  P('s the duck',{fan:{ran:.9,flew:.1},pick:'ran',cap:'Repeat.'}),
  P('s the duck ran',{fan:{and:.45,e:.55},pick:'e',cap:'Stop at $\\langle/s\\rangle$.'}),
  P('s the duck ran e',{cap:'The output is the path, read along the tape.',say:'The probability of a whole text is the product of each token’s probability given the tokens before it.',eq:'p_\\theta(x_{1:T})=\\prod_{t=1}^{T}p_\\theta(x_t\\mid x_{<t})'}),
  P('s the',{fan:UNIFORM,cap:'Before training, the fan is spread almost evenly over the vocabulary.'}),
  P('s the',{fan:{cat:.5,duck:.5},corpus:true,cap:'Training on text pulls the fan toward what follows in the data.',say:'Training picks the parameters that make the training text most likely, by minimising the total negative log-probability of each actual next token.',eq:'\\theta^\\star=\\arg\\min_\\theta\\ -\\textstyle\\sum_t\\log p_\\theta(x_t\\mid x_{<t})'}),
  {cmp:[{path:CAT,fan:{meowed:.92,flew:.08}},{path:DUCK,fan:{meowed:.08,flew:.92}},{path:LONG,fan:{meowed:.9,flew:.1}}],
   cap:'Three paths end at the same node, with three different fans. No route is fixed in advance: the fan is a function of the whole path. Each entry differs in how much of the path it uses.'},
 ]},
 {id:'1948',yr:'1948',title:'n-gram models',sub:'Shannon: count, then normalise',th:'--th-trails',kind:'tok',steps:[
  P('',{table:BIGRAM,counts:true,corpus:true,cap:'Count each adjacent pair in the corpus. Here the edges really are fixed: the table is the model.',say:'Count how many times token a is immediately followed by token b in the corpus.',eq:'c(a,b)'}),
  P('',{table:BIGRAM,probs:true,corpus:true,cap:'Normalise the counts out of each node.',say:'The estimated chance that b follows a is the number of times the pair (a, b) appears, divided by the number of times a appears.',eq:'\\hat p(b\\mid a)=\\dfrac{c(a,b)}{c(a)}'}),
  P('s the cat ran and',{fan:{it:1},win:1,pick:'it',cap:'Generate. The fan is one row of the table: the bracketed last token.'}),
  P(CAT,{fan:{meowed:.5,flew:.5},win:1,cap:'At $\\text{it}$ the fan is 50/50. $\\text{cat}$ is outside the bracket.',say:'A bigram model replaces the whole context with just the previous token.',eq:'p(x_t\\mid x_{<t})\\approx \\hat p(x_t\\mid x_{t-1})'}),
  P(CAT,{fan:{meowed:.5,flew:.5},win:1,pick:'flew',cap:'Half the time it picks $\\text{flew}$.'}),
  P('s the cat ran and it flew',{win:1,bad:[2,6],cap:'A cat that flew. Every adjacent pair is in the corpus; the sentence as a whole is not.'}),
  {cmp:[{path:CAT,fan:{meowed:.5,flew:.5}},{path:DUCK,fan:{meowed:.5,flew:.5}},{path:LONG,fan:{meowed:.5,flew:.5}}],win:1,
   cap:'Change anything outside the bracket and the fan does not move.'},
  P(CAT,{fan:{meowed:.5,flew:.5},win:2,cap:'A trigram widens the bracket to two tokens. Still 50/50.',say:'A trigram model conditions on the previous two tokens.',eq:'\\hat p(x_t\\mid x_{t-2},x_{t-1})'}),
  P(CAT,{fan:{meowed:1},win:4,cap:'A 5-gram reaches $\\text{cat}$, but there are $|V|^{n-1}$ contexts, and almost none appear in any corpus.',say:'With a 50,000-word vocabulary, a 5-gram model has about six quintillion possible four-word contexts to count.',eq:'|V|^{n-1}=50{,}000^{4}\\approx 6\\times10^{18}'}),
 ]},
 {id:'1958',yr:'1958',title:'The perceptron',sub:'Learn the weights from mistakes',th:'--th-trails',kind:'net',net:PERC,steps:[
  {vals:{x1:1,x2:0,b:1},wlab:true,cap:'Inputs are weighted and summed; the unit fires if the sum is positive. Dashed edges are negative weights.',say:'The unit outputs 1 if the weighted sum of its inputs plus the bias is positive, and 0 otherwise.',eq:'\\hat y=\\mathbb{1}\\big[w^\\top x+b>0\\big]'},
  {wlab:true,plane:{pts:AND,lines:[[.3,.8,-.2]]},cap:'The weights draw a line through input space. Target: AND. Two points are on the wrong side.'},
  {wlab:true,vals:{x1:0,x2:1,b:1,y:1},flow:{st:[['x1>y','x2>y','b>y']]},tags:{y:'ŷ=1, want 0'},plane:{pts:AND,lines:[[.3,.8,-.2]],hi:[0,1]},cap:'A mistake on $(0,1)$.'},
  {wlab:true,w:{'x2>y':.3,'b>y':-.7},vals:{x1:0,x2:1,b:1},tags:{y:'nudged'},plane:{pts:AND,lines:[[.3,.3,-.7]]},cap:'Nudge each weight by its input times the error. The line moves.',say:'After each example, move every weight by the learning rate times the error times that weight’s input. When the prediction is right the error is zero, so nothing changes.',eq:'w\\leftarrow w+\\eta\\,(y-\\hat y)\\,x'},
  {wlab:true,w:{'x1>y':.6,'x2>y':.6,'b>y':-.9},plane:{pts:AND,lines:[[.6,.6,-.9]]},cap:'Repeat until no mistakes. If a separating line exists, this is guaranteed to find one.'},
  {wlab:true,w:{'x1>y':.6,'x2>y':.6,'b>y':-.9},plane:{pts:XOR,lines:[[.6,.6,-.9]]},cap:'XOR: no single line separates the classes, so some point is always wrong. One unit is not enough.'},
 ]},
 {id:'1986',yr:'1986',title:'Backpropagation',sub:'Hidden units, and blame passed back',th:'--th-ground',kind:'net',net:BP,steps:[
  {cap:'Add a hidden layer between inputs and output. Weights start random.',say:'Each hidden unit squashes a weighted sum of the inputs; the output squashes a weighted sum of the hidden units.',eq:'h=\\sigma(W_1x+b_1),\\quad \\hat y=\\sigma(w_2^\\top h+b_2)'},
  {vals:{x1:1,x2:0,h1:.57,h2:.52,y:.48},flow:{st:[['x1>h1','x2>h1','x1>h2','x2>h2'],['h1>y','h2>y']]},tags:{y:'ŷ=.48, want 1'},cap:'Forward pass: input $(1,0)$ flows layer by layer to the output.'},
  {vals:{x1:1,x2:0,h1:.57,h2:.52,y:.48},flow:{back:true,st:[['h1>y','h2>y'],['x1>h1','x2>h1','x1>h2','x2>h2']]},tags:{y:'error'},cap:'Backward pass: the error flows back along every edge, split by the weights.',say:'A weight’s gradient is the blame at the unit it feeds times the activity coming in. A unit’s blame is the weighted sum of the blame of the units it feeds, scaled by its own slope.',eq:'\\frac{\\partial \\mathcal{L}}{\\partial w_{ij}}=\\delta_j\\,a_i,\\qquad \\delta_i=\\sigma\'(z_i)\\textstyle\\sum_j w_{ij}\\,\\delta_j'},
  {w:{'x1>h1':.6,'x2>h1':.2,'x1>h2':.4,'x2>h2':.5,'h1>y':.3,'h2>y':-.4},cap:'Every weight takes a small step downhill, hidden ones included.',say:'Every weight takes a small step in the direction that lowers the error.',eq:'w\\leftarrow w-\\eta\\,\\partial \\mathcal{L}/\\partial w'},
  {w:BPW,tags:{h1:'≈ OR',h2:'≈ AND',y:'OR and not AND'},plane:{pts:XOR,lines:[[1,1,-.5],[1,1,-1.5]],region:[[1,1,-.5],[-1,-1,1.5]]},cap:'Thousands of passes later, the hidden units have found their own features. Two lines solve XOR.'},
 ]},
 {id:'1990',yr:'1990',title:'Recurrent networks and LSTM',sub:'Carry a state along the path',th:'--th-sight',kind:'tok',steps:[
  P('s the cat',{state:[{},{},{cat:.9}],cap:'A hidden state $h_t$ is updated at every token and carried forward.',say:'The new state is computed from the previous state and the current token, by the same learned function at every step.',eq:'h_t=f_\\theta(h_{t-1},x_t)'}),
  P(CAT,{state:[{},{},{cat:.9},{cat:.75},{cat:.6},{cat:.5}],fan:{meowed:.8,flew:.2},cap:'At $\\text{it}$ the state still holds $\\text{cat}$, and the fan reads the state.',say:'The next-token distribution is read off the hidden state by a linear map followed by a softmax.',eq:'p_\\theta(\\cdot\\mid x_{<t})=\\operatorname{softmax}(V h_{t-1})'}),
  {cmp:[{path:CAT,fan:{meowed:.8,flew:.2}},{path:DUCK,fan:{meowed:.2,flew:.8}},{path:LONG,fan:{meowed:.55,flew:.45}}],win:'all',
   cap:'Different paths leave different states, so the fan moves. On the long path it has faded back toward 50/50.'},
  P(LONG,{state:[{},{},{cat:.9},{cat:.75},{cat:.6},{cat:.5},{cat:.4},{cat:.3},{cat:.22}],fan:{meowed:.55,flew:.45},cap:'Memory fades with distance, and so does the gradient.',say:'How much an early state affects a later one is a product of one factor per step; over many steps that product tends to shrink toward zero.',eq:'\\frac{\\partial h_t}{\\partial h_k}=\\prod_{s=k+1}^{t}\\frac{\\partial h_s}{\\partial h_{s-1}}\\to 0'}),
  P(LONG,{gate:true,state:[{},{},{cat:.9},{cat:.88},{cat:.86},{cat:.84},{cat:.82},{cat:.8},{cat:.78}],fan:{meowed:.8,flew:.2},cap:'LSTM: a gated cell state is copied forward almost unchanged.',say:'The LSTM cell keeps a forget-gated share of its old contents and adds an input-gated share of new content.',eq:'c_t=f_t\\odot c_{t-1}+i_t\\odot\\tilde c_t'}),
  P(LONG,{chain:true,state:[{},{},{cat:.9},{cat:.88},{cat:.86},{cat:.84},{cat:.82},{cat:.8},{cat:.78}],cap:'But $h_t$ needs $h_{t-1}$: training must walk the path one token at a time.'}),
 ]},
 {id:'2012',yr:'2012',title:'Deep convolutional networks',sub:'AlexNet: local, shared, stacked',th:'--th-ground',kind:'net',net:CNN,steps:[
  {show:/^(i|c)/,groups:['dense'],cap:'An image is a grid of pixels. Wire every pixel to every unit and the weights explode.',say:'Connecting every value of a 224 × 224 colour image to each of 290,400 units would take about 40 billion weights.',eq:'224\\cdot224\\cdot3\\ \\text{inputs}\\times 290{,}400\\ \\text{units}\\approx 4\\times10^{10}'},
  {show:/^(i|c)/,cap:'Local: each unit sees only a small patch (here 3 pixels; 11×11 in AlexNet).'},
  {show:/^(i|c)/,shared:true,vals:{c1:0,c2:.2,c3:.9,c4:0,c5:.9,c6:.2,c7:0},cap:'Shared: the same three weights slide along the image. One small filter finds an edge wherever it is.',say:'Each unit applies the same small set of weights to its own patch of neighbouring inputs, then squashes the result.',eq:'h_j=\\sigma\\Big(\\textstyle\\sum_k w_k\\,x_{j+k}\\Big)'},
  {shared:true,groups:['up'],vals:{c1:0,c2:.2,c3:.9,c4:0,c5:.9,c6:.2,c7:0,p1:.9,p2:.9,p3:.9,out:.85},on:['p1>out','c1>p1','c2>p1','c3>p1','i0>c1','i1>c1','i2>c1','i1>c2','i2>c2','i3>c2','i2>c3','i3>c3','i4>c3'],hl:['p1'],cap:'Stacked: one unit two layers up already sees 5 pixels. Edges become parts, and parts become objects.'},
  {shared:true,groups:['up'],vals:{c1:0,c2:.2,c3:.9,c4:0,c5:.9,c6:.2,c7:0,p1:.9,p2:.9,p3:.9,out:.85},flow:{back:true,st:[['p1>out','p2>out','p3>out'],['c3>p1','c3>p2','c5>p2','c5>p3'],['i2>c3','i3>c3','i4>c3','i4>c5','i5>c5','i6>c5']]},
   cap:'Trained end to end with backprop on 1.2M labelled images, on two GPUs. Top-5 error fell from 26% to 15%.'},
 ]},
 {id:'2013',yr:'2013–14',title:'VAEs and GANs',sub:'From a random seed to an image, in one pass',th:'--th-brush',kind:'net',net:GENM,steps:[
  {show:['z','dec','xout'],imgs:{xout:RAW},cap:'Goal: map a random seed $z$ to an image in a single pass.',say:'Draw a seed from a standard Gaussian, and pass it through the network to get an image.',eq:'z\\sim\\mathcal{N}(0,I),\\qquad x=G_\\theta(z)'},
  {show:['xin','enc','z','dec','xout'],imgs:{xin:TARGET,xout:VAEOUT},flow:{st:[['xin>enc'],['enc>z'],['z>dec'],['dec>xout']]},cap:'VAE: an encoder squeezes an image into $z$; the decoder rebuilds it.',say:'The VAE objective rewards rebuilding the image well from its code, minus a penalty for codes that stray from a standard Gaussian.',eq:'\\mathcal{L}=\\mathbb{E}_{q_\\phi(z\\mid x)}\\big[\\log p_\\theta(x\\mid z)\\big]-\\operatorname{KL}\\big(q_\\phi(z\\mid x)\\,\\|\\,\\mathcal{N}(0,I)\\big)'},
  {show:['z','dec','xout'],imgs:{xout:VAEOUT},tags:{xout:'blurry'},cap:'The KL term keeps codes near $\\mathcal{N}(0,I)$, so a random $z$ decodes to something plausible, but blurry.'},
  {show:['z','dec','xout','xr','D'],imgs:{xout:RAW,xr:TARGET},tags:{D:'fake: 0.97'},flow:{st:[['z>dec'],['dec>xout'],['xout>D','xr>D']]},cap:'GAN: no encoder. A discriminator $D$ learns to tell generated from real.',say:'The discriminator tries to score real images high and generated ones low; the generator tries to make its images score high.',eq:'\\min_G\\max_D\\ \\mathbb{E}\\log D(x)+\\mathbb{E}\\log\\big(1-D(G(z))\\big)'},
  {show:['z','dec','xout','xr','D'],imgs:{xout:TARGET,xr:TARGET},tags:{D:'fake: 0.5'},flow:{back:true,st:[['xout>D'],['dec>xout'],['z>dec']]},cap:'$D$\'s gradient flows back through the image into $G$, until $D$ can no longer tell. Sharp, but training is unstable.'},
  {show:['z','dec','xout'],imgs:{xout:TARGET},cap:'Either way: one pass, no drafts. A mistake made in that pass stays in the image.'},
 ]},
 {id:'2017',yr:'2017',title:'The transformer',sub:'No state: look back at the whole path',th:'--th-sight',kind:'tok',steps:[
  P(CAT,{cap:'No hidden state is carried. The only memory is the path itself.'}),
  P(CAT,{arcs:{1:.06,2:.62,3:.12,4:.08,5:.12},cap:'The new position attends to every earlier token. Arc width is the weight $\\alpha$.',say:'Each attention weight is a softmax, over earlier positions, of how well this position’s query matches that position’s key, scaled by the square root of the key size.',eq:'\\alpha_{tj}=\\operatorname{softmax}_j\\!\\big(q_t^\\top k_j/\\sqrt{d_k}\\big)'}),
  P(CAT,{arcs:{1:.06,2:.62,3:.12,4:.08,5:.12},fan:{meowed:.92,flew:.08},cap:'The weighted blend sets the fan: $\\text{cat}$ means $\\text{meowed}$.',say:'Each position takes a weighted average of value vectors, weighted by a softmax of query–key similarity, with future positions masked out.',eq:'\\operatorname{Attention}(Q,K,V)=\\operatorname{softmax}\\!\\Big(\\tfrac{QK^\\top}{\\sqrt{d_k}}+M\\Big)V'}),
  {cmp:[{path:CAT,fan:{meowed:.92,flew:.08},arcs:{2:.62}},{path:DUCK,fan:{meowed:.08,flew:.92},arcs:{2:.62}},{path:LONG,fan:{meowed:.9,flew:.1},arcs:{2:.55}}],win:'all',
   cap:'Same node, three paths, three fans. Distance does not fade the arc: the long path is as sure as the short one.'},
  P(CAT,{allArcs:true,cap:'Arcs only point back (mask $M$), so in training every position is computed at once.',say:'The mask is minus infinity for every later position, so after the softmax the future gets zero weight.',eq:'M_{tj}=-\\infty\\ \\text{for}\\ j>t'}),
  P(LONG,{allArcs:true,cap:'The price: position $t$ draws $t$ arcs, so a path of length $n$ costs $n^2$.',say:'The cost of attention grows with the square of the sequence length, times the vector size.',eq:'O(n^2 d)'}),
 ]},
 {id:'2020d',yr:'2020',title:'Diffusion models',sub:'Generate in many drafts',th:'--th-brush',kind:'net',net:DIFG,steps:[
  {show:['x0'],imgs:{x0:DIFF[0]},cap:'Start from a real image $x_0$.'},
  {groups:['q'],imgs:{x0:DIFF[0],x1:DIFF[1],x2:DIFF[2],x3:DIFF[3],x4:DIFF[4]},flow:{st:QALL.map(k=>[k])},cap:'Forward: add a little noise at each step until only noise is left. No learning here.',say:'Each forward step shrinks the image slightly and adds a little Gaussian noise, of variance β_t.',eq:'q(x_t\\mid x_{t-1})=\\mathcal{N}\\big(\\sqrt{1-\\beta_t}\\,x_{t-1},\\ \\beta_t I\\big)'},
  {groups:['q','p'],on:['x2>x1'],imgs:{x0:DIFF[0],x1:DIFF[1],x2:DIFF[2],x3:DIFF[3],x4:DIFF[4]},cap:'Train one network to undo one step: predict the noise that was added.',say:'Train the network to predict the noise that was added to a noisy image, scored by squared error.',eq:'\\mathcal{L}=\\mathbb{E}\\,\\big\\|\\varepsilon-\\varepsilon_\\theta(x_t,t)\\big\\|^2'},
  {show:['x4'],imgs:{x4:GEN[4]},cap:'To generate, start from fresh noise $x_T$.'},
  {groups:['p'],imgs:{x0:GEN[0],x1:GEN[1],x2:GEN[2],x3:GEN[3],x4:GEN[4]},flow:{st:PALL.map(k=>[k])},cap:'Apply the denoiser $T$ times. Each draft can fix the last one\'s mistakes.',say:'Generation draws each less-noisy image from the model, given the current noisier one.',eq:'x_{t-1}\\sim p_\\theta(x_{t-1}\\mid x_t)'},
  {groups:['p'],imgs:{x0:GEN[0],x1:GEN[1],x2:GEN[2],x3:GEN[3],x4:GEN[4]},cap:'Many passes instead of one stroke: slower, but stable to train and sharp. Real models use hundreds of steps.'},
 ]},
];
/* ---------- entries drawn as networks of boxes, chips and insets ---------- */
const SKY=j=>{const u=j/3;return[150+86*u,190+24*u,228-50*u]};
const NOSUN=TARGET.map((c,n)=>{const i=n%IW,j=(n/IW)|0;return(i-6)**2+(j-1)**2<=1.2?SKY(j):c});
const LOOSE=BLUR(MIX(NOSUN,N2,.18)),OVER=TARGET.map(c=>c.map(v=>128+(v-128)*2.1));
const bx=(x,y,l,w,o={})=>({x,y,kind:'box',l,w,...o}),tx=(x,y,l)=>({x,y,kind:'txt',l});

const IMIT={nodes:{hum:bx(110,130,'person',100),mac:bx(110,330,'machine',100),t1:bx(430,130,'Walking was written by Thoreau.',270),t2:bx(430,330,'Walking was written by Emerson.',270),J:bx(780,230,'judge',100)},
  edges:[['hum','t1',.3],['mac','t2',.3],['t1','J',.3],['t2','J',.3],['hum','mac',.3,{g:'train',c:[10,230]}]]};
const ELIZA={nodes:{x:bx(450,60,'It seems that you hate me',300),d:bx(450,160,'d:  (0 YOU 0 ME)',230),
  s1:bx(170,265,'1  It seems that',160),s2:bx(355,265,'2  you',90),s3:bx(520,265,'3  hate',100),s4:bx(690,265,'4  me',90),
  r:bx(450,370,'r:  WHAT MAKES YOU THINK I 3 YOU',340),y:bx(450,470,'What makes you think I hate you',340)},
  edges:[['x','d',.3],['d','s1',.25],['d','s2',.25],['d','s3',.25],['d','s4',.25],['s3','r',.3],['r','y',.3],['x','r',.3,{g:'fb',c:[860,215]}]]};
const HMM=(()=>{const nodes={lbl:{x:430,y:70,kind:'none'}},edges=[],ph=['s','p','ee','ch'],A=[.7,.6,.8,.5],V=[.3,.35,.8,.6,.7,.65,.4,.45],AL=[0,0,1,2,2,2,3,3];
  ph.forEach((l,i)=>{nodes['q'+i]={x:190+i*160,y:220,l,r:28};edges.push(['q'+i,'q'+i,A[i],{sw:2.2}]);if(i<3)edges.push(['q'+i,'q'+(i+1),+(1-A[i]).toFixed(1),{sw:2.2}])});
  V.forEach((v,j)=>{nodes['o'+j]={x:120+j*94,y:420,kind:'px',v};edges.push(['q'+AL[j],'o'+j,.25,{g:'emit',nm:1,sw:1.6}])});
  return{nodes,edges,AL}})();
const HMMON=['q0>q0','q0>q1','q1>q2','q2>q2','q2>q3','q3>q3',...HMM.AL.map((q,j)=>'q'+q+'>o'+j)];
const EMB={nodes:{sp:bx(240,245,'',400,{h:390,cls:'region'}),the:{x:100,y:110,l:'the',r:27},a:{x:175,y:80,l:'a',r:27},cat:{x:140,y:300,l:'cat',r:27},dog:{x:215,y:340,l:'dog',r:27},duck:{x:115,y:385,l:'duck',r:27},
  ran:{x:330,y:180,l:'ran',r:27},walked:{x:395,y:230,l:'walked',r:27},
  man:{x:110,y:330,l:'man',r:27},woman:{x:180,y:180,l:'woman',r:27},king:{x:310,y:390,l:'king',r:27},queen:{x:380,y:240,l:'queen',r:27},
  c1:{x:540,y:150,kind:'vec',l:'C(the)'},c2:{x:540,y:330,kind:'vec',l:'C(cat)'},h:bx(670,245,'tanh',80),sm:bx(805,245,'softmax',96)},
  edges:[['the','c1',.3,{g:'in'}],['cat','c2',.3,{g:'in'}],['dog','c2',.3,{g:'in2'}],['c1','h',.3],['c2','h',.3],['h','sm',.3],
    ['man','woman',.3,{g:'an'}],['king','queen',.3,{g:'an'}],['man','king',.15,{g:'an',cls:'faint',nm:1}],['woman','queen',.15,{g:'an',cls:'faint',nm:1}]]};
const EMBROW=Object.fromEntries(['the','a','cat','dog','duck','ran','walked'].map((w,i)=>[w,[62+i*62,245]]));
const WORDS=['the','a','cat','dog','duck','ran','walked'];
const S2S=(()=>{const nodes={v:{x:480,y:245,kind:'vec',l:'v'}},edges=[],src=['la','zone','économique','européenne'],tgt=['the','European','Economic','Area'];
  src.forEach((w,j)=>{const x=80+j*100;nodes['w'+j]=tx(x,420,w);nodes['h'+j]={x,y:330,l:'h'+'₁₂₃₄'[j],r:22};edges.push(['w'+j,'h'+j,.3,{g:'in'}]);if(j)edges.push(['h'+(j-1),'h'+j,.3])});
  tgt.forEach((w,i)=>{const x=590+i*90;nodes['y'+i]=tx(x,150,w);nodes['s'+i]={x,y:245,l:'s'+'₁₂₃₄'[i],r:22};edges.push(['s'+i,'y'+i,.3]);if(i)edges.push(['s'+(i-1),'s'+i,.3,{cls:'dch'}])});
  edges.push(['h3','v',.3,{g:'v'}],['v','s0',.3,{g:'v'}]);
  for(let i=0;i<4;i++)for(let j=0;j<4;j++)edges.push(['h'+j,'s'+i,.2,{g:'a'+i,cls:'att',c:[(80+j*100+590+i*90)/2+40,110]}]);
  return{nodes,edges}})();
const ALN=[[.85,.1,.03,.02],[.02,.06,.12,.8],[.02,.08,.82,.08],[.05,.85,.05,.05]];
const attW=i=>Object.fromEntries(ALN[i].map((a,j)=>['h'+j+'>s'+i,a]));
const attL=i=>Object.fromEntries(ALN[i].map((a,j)=>['h'+j+'>s'+i,a.toFixed(2).replace(/^0/,'')]));
const PRE={nodes:{data:bx(130,110,'raw text: books, web',190),lab:bx(130,370,'labelled task data',190),m:bx(430,240,'p_θ',100,{h:64}),
  f:bx(760,130,'fromage',110),c:bx(760,240,'cheese',110),l:bx(760,350,'loutre',110)},
  edges:[['data','m',.3],['lab','m',.3,{g:'ft'}],['m','f',.4,{g:'fan',cls:'fan'}],['m','c',.3,{g:'fan',cls:'fan'}],['m','l',.2,{g:'fan',cls:'fan'}]]};
const SCL={nodes:{N:bx(95,130,'N  parameters',130),D:bx(95,250,'D  tokens',130),C:bx(95,370,'C ≈ 6ND',130),L:{x:250,y:250,l:'L',r:28}},
  edges:[['N','L',.3],['D','L',.3],['C','L',.3]]};
const PBOX=[380,60,460,360];
const PLAW={box:PBOX,xr:[-.4,6.4],yr:[1.8,4],xl:'compute C  (log scale, 10× per step)',yl:'test loss L  (log scale)',
  pts:[[0,3.82],[1,3.53],[2,3.31],[3,3.04],[4,2.81]]};
const CFG={nodes:{c:bx(115,70,'c: “sun over a hill”',200),xt:{x:115,y:270,kind:'img',l:'x_t'},eu:bx(360,170,'ε_θ(x_t, ∅)',140),ec:bx(360,330,'ε_θ(x_t, c)',140),
  cls:bx(360,465,'classifier p_φ(c | x_t)',210),comb:bx(570,250,'ε̃  guided',110),
  xo:{x:780,y:250,kind:'img',l:'x₀'},xo1:{x:780,y:95,kind:'img',l:'w = 1'},xo3:{x:780,y:405,kind:'img',l:'w = 20'},
  d0:{x:470,y:450,kind:'dot'},d1:{x:560,y:450,kind:'dot'},d2:{x:740,y:450,kind:'dot'}},
  edges:[['c','ec',.3,{c:[230,250]}],['xt','eu',.3],['xt','ec',.3],['xt','cls',.3,{g:'cg'}],['cls','xo',.3,{g:'cg',c:[640,470]}],['ec','xo',.3,{g:'direct',c:[600,330]}],
    ['eu','comb',.3],['ec','comb',.3],['comb','xo',.3],['comb','xo1',.3,{g:'ws'}],['comb','xo3',.3,{g:'ws'}],['d0','d1',.3,{cls:'vecar'}],['d1','d2',.3,{cls:'vecar ext'}]]};
const RLH={nodes:{x:bx(195,60,'x: Explain the moon landing to a 6-year-old.',350),pol:bx(195,185,'π_θ',100),
  y1:bx(530,115,'A short, clear explanation',250),y2:bx(530,195,'More questions about the moon',250),y3:bx(530,275,'A confident falsehood',250),y4:bx(530,355,'A long, flattering non-answer',250),
  rm:bx(820,235,'r_φ',80),hum:bx(820,85,'labellers',110)},
  edges:[['x','pol',.3],['pol','y1',.3],['pol','y2',.3],['pol','y3',.3],['pol','y4',.3,{g:'y4'}],['y1','rm',.3,{g:'rm'}],['y2','rm',.3,{g:'rm'}],['y3','rm',.3,{g:'rm'}],['y4','rm',.3,{g:'y4rm'}],['hum','rm',.3,{g:'h'}]]};
const RB=(v,ref)=>({box:[40,300,290,140],lab:'π_θ(y | x)',vals:true,max:.9,items:['clear','questions','false','flattering'].map((l,i)=>({l,v:v[i],ref:ref?ref[i]:null}))});
const COT={nodes:{L1:bx(450,340,'layer 1',170,{h:40}),L2:bx(450,280,'layer 2',170,{h:40}),L3:bx(450,220,'…',170,{h:40}),L4:bx(450,160,'layer L',170,{h:40}),
  inp:tx(450,405,'tokens so far'),out:tx(450,95,'next token'),
  t0:bx(450,70,'4 9 10 13',110),t1:bx(240,185,'9 10 17',96),t2:bx(450,185,'4 4 10',96),t3:bx(660,185,'3 4 9',96),
  t4:bx(370,300,'4 6',80),t5:bx(530,300,'4 40',80),t6:bx(660,300,'4 12',80),t7:bx(370,405,'24',80)},
  edges:[['inp','L1',.3],['L1','L2',.3],['L2','L3',.3],['L3','L4',.3],['L4','out',.3],['out','inp',.3,{g:'fb',c:[770,250]}],
    ['t0','t1',.3],['t0','t2',.3],['t0','t3',.3],['t2','t4',.3],['t2','t5',.3],['t3','t6',.3],['t4','t7',.3]]};
const COTQ='The cafeteria had 23 apples. They used 20 and bought 6 more. How many apples?';
const RAG={nodes:{q:bx(120,110,'x: Who wrote “Walking”?',200),retr:bx(120,290,'retriever',140),
  d1:bx(430,85,'“Walking”, an essay by Thoreau',240),d2:bx(430,165,'Emerson’s essays, 1841',240),d3:bx(430,245,'Thoreau: life and works',240),d4:bx(430,325,'A guide to hiking boots',240),
  gen:bx(745,200,'generator p_θ',150),tool:bx(745,390,'calculator',130)},
  edges:[['q','retr',.3],['retr','d1',.3,{g:'r'}],['retr','d2',.3,{g:'r'}],['retr','d3',.3,{g:'r'}],['retr','d4',.3,{g:'r'}],
    ['d1','gen',.3,{g:'k'}],['d3','gen',.3,{g:'k'}],['q','gen',.3,{g:'direct'}],['gen','tool',.3,{g:'tool',c:[830,300]}],['tool','gen',.3,{g:'tool',c:[660,300]}]]};
const RSC={'retr>d1':'.91','retr>d2':'.40','retr>d3':'.78','retr>d4':'.05'};
const COL={nodes:{g0:bx(100,75,'human data',140),g1:bx(290,75,'gen 1',100),g2:bx(450,75,'gen 2',100),g3:bx(610,75,'gen 3',100),gn:bx(790,75,'gen n',100)},
  edges:[['g0','g1',.3],['g1','g2',.3],['g2','g3',.3],['g3','gn',.3,{cls:'dots'}],['g0','g2',.25,{g:'keep',c:[275,5]}],['g0','g3',.25,{g:'keep',c:[355,-15]}],['g0','gn',.25,{g:'keep',c:[445,-35]}]]};
const D0=[.02,.05,.11,.19,.26,.19,.11,.05,.02],D1=[.01,.04,.11,.21,.28,.2,.11,.04,0],D5=[0,0,.05,.22,.42,.24,.07,0,0],DMIX=[.01,.04,.1,.2,.29,.2,.11,.04,.01];
const CB=(v,ref,lab)=>({box:[130,190,640,230],max:.44,lab:lab||'outcomes: rare ← common → rare',items:v.map((x,i)=>({v:x,ref:ref?ref[i]:null,l:i===0||i===8?'tail':i===4?'mode':''}))});
const VRUNS=(()=>{const out=[];[3,8,19,41].forEach(sd=>{const r=rng(sd);let v=0;const pts=[[0,0]];for(let n=1;n<=30;n++){const u=r()+r()+r()-1.5;v+=-.11+u*.95;pts.push([n,v])}out.push({pts,cls:'run'})});return out})();

const MORE=[
 {id:'1950',yr:'1950',title:'The imitation game',sub:'Turing: judge a machine by its text alone',th:'--th-trails',kind:'net',net:IMIT,steps:[
  {flow:{st:[['hum>t1','mac>t2'],['t1>J','t2>J']]},tags:{J:'which is which?'},cap:'A person and a machine each send typed text. The judge sees only the text and must say which is which.',say:'In modern terms: given samples from the data distribution and from the model, can any test tell them apart better than chance?',eq:'x\\sim p_{\\text{data}}\\ \\ \\text{vs.}\\ \\ x\\sim p_\\theta'},
  {tags:{J:'right 50% of the time'},cap:'If the judge does no better than chance, the machine passes. "Can machines think?" becomes a question about outputs alone.'},
  {show:['hum','mac'],groups:['train'],flow:{st:[['hum>mac']]},tags:{mac:'fit to human text'},cap:'The modern form of the game is a training objective: make the model’s text distribution match human text.',say:'The best parameters maximise the average log-probability of real data, which is the same as making the model’s distribution as close as possible to the data distribution.',eq:'\\theta^\\star=\\arg\\max_\\theta\\,\\mathbb{E}_{x\\sim p_{\\text{data}}}\\log p_\\theta(x)=\\arg\\min_\\theta\\,\\mathrm{KL}(p_{\\text{data}}\\,\\|\\,p_\\theta)'},
  P(CAT,{kind:'tok',fan:{meowed:.92,flew:.08},pick:'meowed',cap:'Language-model training plays the game at every token: how much of the fan went to the token the human actually wrote? Here 0.92, a loss of $-\\log 0.92\\approx0.08$.',say:'The cross-entropy loss: the average, over positions, of minus the log-probability the model gave to the token that actually came next.',eq:'\\mathcal{L}(\\theta)=-\\frac{1}{T}\\sum_{t=1}^{T}\\log p_\\theta(x_t\\mid x_{<t})'}),
  {cls:{t2:'bad'},tags:{t1:'fluent',t2:'fluent',J:'passes both'},cap:'The score rewards text that looks human, not text that is true. Both sentences are fluent; only one is right.'},
 ]},
 {id:'1966',yr:'1966',title:'Rule-based dialogue',sub:'ELIZA: replies cut and pasted by hand-written rules',th:'--th-hand',kind:'net',net:ELIZA,steps:[
  {show:['x'],tags:{x:'keyword k: YOU'},cap:'A script is a ranked list of keywords. This input contains the keyword YOU.'},
  {show:['x','d','s1','s2','s3','s4'],flow:{st:[['x>d'],['d>s1','d>s2','d>s3','d>s4']]},cap:'A decomposition pattern $d$ splits the input into numbered segments; each 0 matches any run of words.'},
  {on:['s3>r','r>y'],flow:{st:[['s3>r'],['r>y']]},cap:'A reassembly template $r$ builds the reply, copying segment 3 into place.',say:'The reply is the template filled in with the segments that the pattern cut out of the input.',eq:'y=r\\big(d(x)\\big)'},
  {show:['x','r','y'],groups:['fb'],labs:{x:'The weather is nice today',r:'no keyword matches',y:'Please go on.'},cls:{r:'ghost'},cap:'When no keyword matches, the program falls back to a stock line.'},
  {tags:{y:['written by the script author','b']},cap:'No probabilities and no parameters fit to data. Every reply the program can give was, in form, written by hand.',say:'The set of possible replies is exactly the templates filled in, plus the stock fallbacks.',eq:'\\mathcal{Y}=\\{\\,r(d(x))\\,\\}\\cup\\{\\text{fallbacks}\\}'},
 ]},
 {id:'1989',yr:'1989',title:'Hidden Markov models',sub:'Structure by hand, numbers from data',th:'--th-ground',kind:'net',net:HMM,steps:[
  {show:/^q/,tags:{lbl:'hidden states for the word “speech”'},cap:'One hidden state per phone. The designer fixes which transitions exist: stay, or move one to the right.',say:'A transition probability is zero unless it stays in the same state or moves to the next one.',eq:'a_{ij}=0\\ \\ \\text{unless}\\ \\ j\\in\\{i,\\,i+1\\}'},
  {show:/^q/,wlab:'p',tags:{lbl:'transition probabilities: learned'},cap:'The numbers on those edges are estimated from recordings. A self-loop lets a phone last several frames.'},
  {wlab:'p',groups:['emit'],cap:'Each state emits acoustic frames. Its emission density is a mixture of Gaussians over feature vectors.',say:'Each state’s distribution over sounds is a weighted mixture of Gaussians.',eq:'b_j(o)=\\sum_m c_{jm}\\,\\mathcal{N}(o;\\,\\mu_{jm},\\Sigma_{jm})'},
  {groups:['emit'],on:HMMON,tags:{lbl:'only the frames are observed'},cap:'Only the frames are seen. A path through the states, with its frames, has a probability:',say:'The joint probability of the sounds and a hidden state path: the start probability, times, at every step, the probability of moving to the next state and of that state producing the observed sound.',eq:'p(o_{1:T},s_{1:T}\\mid\\lambda)=\\pi_{s_1}b_{s_1}(o_1)\\prod_{t=2}^{T}a_{s_{t-1}s_t}\\,b_{s_t}(o_t)'},
  {groups:['emit'],on:HMMON,cap:'Recognition sums over all paths with the forward recursion, $O(N^2T)$ work instead of $N^T$, and picks the word model that scores highest. Viterbi finds the single best path, the alignment drawn here.',say:'The forward variable: the probability of the first t frames and being in state j, built from the previous step.',eq:'\\alpha_t(j)=\\Big[\\sum_i\\alpha_{t-1}(i)\\,a_{ij}\\Big]\\,b_j(o_t)'},
  {wlab:'p',groups:['emit'],tags:{lbl:'states, topology, features: by hand'},cap:'Baum–Welch re-estimates the numbers from data. The state set, the topology and the acoustic features stay hand-made.',say:'The new transition estimate is the expected number of i-to-j moves divided by the expected number of visits to i.',eq:'\\hat a_{ij}=\\frac{\\sum_t\\xi_t(i,j)}{\\sum_t\\gamma_t(i)}'},
 ]},
 {id:'2000',yr:'2000',title:'Word embeddings',sub:'Similar words, nearby vectors',th:'--th-ground',kind:'net',net:EMB,steps:[
  {show:WORDS,pos:EMBROW,cap:'To an n-gram model every word is its own symbol, unrelated to any other. Nothing learned about $\\text{cat}$ carries over to $\\text{dog}$.',say:'A joint model of ten words over a 100,000-word vocabulary has about 10 to the 50 free parameters.',eq:'|V|^{10}-1\\approx10^{50}'},
  {show:['sp',...WORDS],tags:{sp:'learned space ℝᵐ'},cap:'Give each word a learned vector $C(w)$. Words used in similar contexts end up close together.',say:'Each word is mapped to a vector of m learned numbers; dog and cat get nearby vectors.',eq:'C(w)\\in\\mathbb{R}^m,\\qquad C(\\text{dog})\\approx C(\\text{cat})'},
  {show:['sp',...WORDS,'c1','c2','h','sm'],groups:['in'],flow:{st:[['the>c1','cat>c2'],['c1>h','c2>h'],['h>sm']]},tags:{sm:'p(· | the cat)'},cap:'To predict, look up the vectors of the previous words, concatenate them, and pass them through a small network.',say:'Look up a vector for each of the previous words, concatenate them, pass them through a tanh layer, and turn the result into next-word probabilities with a softmax.',eq:'p_\\theta(x_t\\mid x_{t-n+1:t-1})=\\operatorname{softmax}\\big(b+Wv+U\\tanh(d+Hv)\\big)'},
  {show:['sp',...WORDS,'c1','c2','h','sm'],groups:['in2'],labs:{c2:'C(dog)'},hl:['dog','cat'],flow:{st:[['the>c1','dog>c2'],['c1>h','c2>h'],['h>sm']]},tags:{sm:['≈ p(· | the cat)','b']},cap:'Say $\\text{dog}$ was never seen before $\\text{ran}$. Its vector is close to $\\text{cat}$’s and the network is smooth, so the prediction carries over.',say:'Train the network and the word vectors together, to maximise the log-likelihood of each word given the previous few.',eq:'\\max_{\\theta,\\,C}\\ \\sum_t\\log p_\\theta(x_t\\mid x_{t-n+1:t-1})'},
  {show:['sp','man','woman','king','queen'],groups:['an'],tags:{sp:'word2vec, 2013'},cap:'word2vec (2013) dropped the hidden layer and trained only vectors, on billions of words. Directions in the space carry meaning.',say:'The vector for king, minus man, plus woman, lands close to the vector for queen.',eq:'v_{\\text{king}}-v_{\\text{man}}+v_{\\text{woman}}\\approx v_{\\text{queen}}'},
 ]},
 {id:'2014',yr:'2014',title:'Seq2seq and attention',sub:'Translate through one vector, then look back',th:'--th-sight',kind:'net',net:S2S,steps:[
  {groups:['in','v'],flow:{st:[['w0>h0','w1>h1','w2>h2','w3>h3'],['h0>h1'],['h1>h2'],['h2>h3'],['h3>v'],['v>s0'],['s0>s1'],['s1>s2'],['s2>s3']]},cap:'Sequence to sequence: an encoder LSTM reads the French, and its last state $v$ starts a decoder LSTM that writes the English.',say:'The translation is generated one word at a time, each conditioned on a single fixed vector that summarises the source, and on the words so far.',eq:'p(y\\mid x)=\\prod_{i}p(y_i\\mid v,\\,y_{<i})'},
  {groups:['in','v'],hl:['v'],tags:{v:'one vector, any length'},cap:'Everything about the source has to squeeze through one fixed vector $v$. Quality fell on long sentences.'},
  {show:/^(w|h|s|y)/,groups:['in','a1'],w:attW(1),elab:attL(1),hl:['s1'],cap:'Attention keeps every encoder state $h_j$. To write $\\text{European}$, the decoder scores each one, and the softmax weights $\\alpha$ set its context $c_i$.',say:'Each output step’s context is a weighted sum of all encoder states, with weights from a softmax over alignment scores.',eq:'c_i=\\sum_j\\alpha_{ij}h_j,\\qquad \\alpha_{ij}=\\operatorname{softmax}_j\\big(a(s_{i-1},h_j)\\big)'},
  {show:/^(w|h|s|y)/,groups:['in','a2'],w:attW(2),elab:attL(2),hl:['s2'],cap:'The weights are recomputed at every output step: $\\text{Economic}$ draws on $\\text{économique}$.'},
  {show:/^(w|h|s|y)/,groups:['in'],mat:{at:[150,40],cell:40,rows:['the','European','Economic','Area'],cols:['la','zone','économique','européenne'],v:ALN,lab:'α: rows sum to 1'},cap:'Stacked, the weights form a soft alignment. The model learned that French puts the adjective after the noun, without being told.'},
  {show:/^(w|h|s|y)/,groups:['in'],on:['s0>s1','s1>s2','s2>s3'],flow:{st:[['s0>s1'],['s1>s2'],['s2>s3']]},cap:'Left open: the decoder still carries its own state, so step $i$ must wait for step $i-1$. Training walks the output one word at a time.',say:'The decoder state is updated from its previous state, the previous output word and the current context.',eq:'s_i=f(s_{i-1},\\,y_{i-1},\\,c_i)'},
 ]},
 {id:'2018',yr:'2018–20',title:'Pretraining and prompting',sub:'One model for every task; the task goes in the text',th:'--th-hand',kind:'net',net:PRE,steps:[
  {show:['data','m'],flow:{st:[['data>m']]},tags:{m:'θ learned'},cap:'Pretrain one transformer on raw text with nothing but next-token prediction.',say:'Pretrain by minimising the negative log-likelihood of each next token over raw text.',eq:'\\min_\\theta\\ -\\sum_t\\log p_\\theta(x_t\\mid x_{<t})'},
  {show:['data','m','lab'],groups:['ft'],flow:{st:[['lab>m']]},tags:{m:'θ updated per task'},cap:'GPT (2018) then fine-tuned a copy on each labelled task, keeping language modelling as an extra loss.',say:'The fine-tuning loss is the task loss plus a weighted language-modelling loss.',eq:'L_3=L_2+\\lambda L_1,\\qquad L_2=-\\sum_{(x,y)}\\log p_\\theta(y\\mid x)'},
  {show:['m','f','c','l'],groups:['fan'],w:{'m>f':.4,'m>c':.33,'m>l':.27},elab:{'m>f':'.40','m>c':'.33','m>l':'.27'},tags:{m:'θ fixed'},tape:[['Translate English to French:',''],['cheese =>',''],['?','q']],cap:'GPT-2 (2019): no fine-tuning at all. Write the task into the text and read the continuation.',say:'Use the model by sampling a continuation of the prompt c.',eq:'y\\sim p_\\theta(\\cdot\\mid c)'},
  {show:['m','f','c','l'],groups:['fan'],w:{'m>f':.9,'m>c':.06,'m>l':.04},elab:{'m>f':'.90','m>c':'.06','m>l':'.04'},tags:{m:'θ still fixed'},tape:[['Translate English to French:',''],['sea otter => loutre de mer',''],['cheese =>',''],['?','q']],cap:'GPT-3 (2020): add a few worked examples to the prompt and the fan sharpens, with no gradient update. This is in-context learning.',say:'The prompt holds a task description and K worked examples, then the new input.',eq:'c=(\\text{task},\\ x_1\\!\\to\\!y_1,\\dots,x_K\\!\\to\\!y_K,\\ x)'},
  {show:['m','f','c','l'],groups:['fan'],w:{'m>f':.9,'m>c':.06,'m>l':.04},on:['m>f'],tape:[['Translate English to French:',''],['sea otter => loutre de mer',''],['cheese =>',''],['fromage','new']],cap:'Adaptation moved from the parameters into the context. Few-shot skill grew with size: 117M, 1.5B, then 175B parameters.'},
 ]},
 {id:'2020s',yr:'2020',title:'Scaling laws',sub:'Loss falls on a straight line',th:'--th-trails',kind:'net',net:SCL,steps:[
  {flow:{st:[['N>L','D>L','C>L']]},cap:'Three knobs: parameters $N$, training tokens $D$, and compute $C$. One outcome: test loss $L$.',say:'Training compute is about six times parameters times tokens.',eq:'C\\approx6ND'},
  {plot:PLAW,cap:'Train many models, each with 10× more compute. On log–log axes the losses fall on a straight line: a power law.',say:'Loss falls as a power of model size: ten times the parameters gives about 16% lower loss.',eq:'L(N)\\approx\\Big(\\frac{N_c}{N}\\Big)^{\\alpha_N},\\qquad \\alpha_N\\approx0.076'},
  {plot:{...PLAW,curves:[{pts:[[0,3.81],[4,2.82]],cls:'fit'},{pts:[[4,2.82],[6,2.33]],cls:'dash'}],pts:[...PLAW.pts,[6,2.33,'pred']],marks:[{x:6,y:2.33,l:'predicted',a:'end',dx:-12,dy:-14}]},cap:'A straight line extrapolates. Fit small runs and predict the loss of a run 100× bigger before paying for it.',say:'Taking logs turns the power law into a straight line with slope minus alpha.',eq:'\\log L=-\\alpha_N\\log N+\\text{const}'},
  {plot:{box:PBOX,xr:[0,6],yr:[2.4,3.4],xl:'model size N at a fixed compute budget  (log)',yl:'test loss L',curves:[{pts:Array.from({length:25},(_,i)=>{const x=i/4;return[x,2.6+.075*(x-3)**2]}),cls:'fit'}],
     pts:[[3,2.6],[4.8,2.84,'pred']],marks:[{x:3,y:2.6,l:'Chinchilla 70B, 1.4T tokens',a:'middle',dx:0,dy:28},{x:4.8,y:2.84,l:'Gopher 280B',dx:12,dy:4}]},
   cap:'Chinchilla (2022): at a fixed budget, loss is U-shaped in model size. The best split grows $N$ and $D$ together, about 20 tokens per parameter.',say:'The compute-optimal model size and data size both grow as about the square root of compute.',eq:'N_{\\text{opt}}\\propto C^{0.5},\\qquad D_{\\text{opt}}\\propto C^{0.5}'},
  {plot:{...PLAW,curves:[{pts:Array.from({length:27},(_,i)=>{const x=i/4;return[x,2.15+1.65*Math.exp(-.24*x)]}),cls:'fit'},{pts:[[-.4,2.15],[6.4,2.15]],cls:'dash'}],pts:[],marks:[{x:6.3,y:2.15,l:'entropy of human text',a:'end',dx:0,dy:22}]},cap:'What falls is fit to human text. Lower loss does not by itself mean more truthful or more helpful.',say:'Cross-entropy is the entropy of the data plus the KL gap between the data and the model.',eq:'L=H(p_{\\text{data}})+\\mathrm{KL}(p_{\\text{data}}\\,\\|\\,p_\\theta)'},
 ]},
 {id:'2021',yr:'2021',title:'Classifier-free guidance',sub:'Push a diffusion model toward the prompt',th:'--th-brush',kind:'net',net:CFG,steps:[
  {show:['c','xt','ec','xo'],groups:['direct'],imgs:{xt:GEN[2],xo:LOOSE},tags:{xo:['where is the sun?','b']},flow:{st:[['c>ec','xt>ec'],['ec>xo']]},cap:'A diffusion model conditioned on a prompt $c$, fed in at every denoising step. Samples often follow it only loosely.'},
  {show:['c','xt','ec','xo','cls'],groups:['direct','cg'],imgs:{xt:GEN[2],xo:LOOSE},tags:{cls:['a second network','b']},cap:'Classifier guidance (2021) nudged each step along the gradient of a separate classifier trained on noisy images.',say:'Classifier guidance adds a scaled gradient of a separately trained classifier’s log-probability of the prompt.',eq:'+\\,s\\,\\nabla_{x_t}\\log p_\\phi(c\\mid x_t)'},
  {show:['c','xt','eu','ec'],imgs:{xt:GEN[2]},tags:{eu:'prompt dropped to ∅',ec:['same network','b']},cap:'Classifier-free: train one network, and replace the prompt with a null token $\\varnothing$ for a small fraction of examples. It learns both predictions.'},
  {show:['c','xt','eu','ec','comb','xo','d0','d1','d2'],imgs:{xt:GEN[2],xo:TARGET},tags:{d0:['ε(∅)','b'],d1:['ε(c)','b'],d2:['ε̃','b']},flow:{st:[['xt>eu','xt>ec'],['eu>comb','ec>comb'],['comb>xo']]},cap:'At each sampling step, run both and extrapolate past the conditional prediction by the guidance scale $w$.',say:'The guided prediction starts from the unconditional prediction and moves w times as far as the conditioning moves it.',eq:'\\tilde\\varepsilon=\\varepsilon_\\theta(x_t,\\varnothing)+w\\,\\big(\\varepsilon_\\theta(x_t,c)-\\varepsilon_\\theta(x_t,\\varnothing)\\big)'},
  {show:['c','xt','eu','ec','comb','xo','xo1','xo3'],groups:['ws'],imgs:{xt:GEN[2],xo:TARGET,xo1:LOOSE,xo3:OVER},labs:{xo:'w = 7.5'},cap:'Higher $w$ follows the prompt more closely with less variety; very high $w$ oversaturates. Image tools default to about 7.5.',say:'Guidance approximately samples from the unconditional distribution reweighted by the implicit classifier’s probability of the prompt, raised to the power w.',eq:'\\tilde p(x_t\\mid c)\\ \\propto\\ p(x_t)\\,p(c\\mid x_t)^{w}'},
 ]},
 {id:'2022r',yr:'2022',title:'RLHF',sub:'Score whole answers by human preference',th:'--th-trails',kind:'net',net:RLH,steps:[
  {show:['x','pol','y1','y2','y3'],bars:RB([.3,.4,.3,0]),cap:'A pretrained model continues text the way the web does: an answer, more questions, or a fluent falsehood.',say:'Find a policy whose outputs people prefer, instead of one that only imitates human text.',eq:'\\pi_\\theta(y\\mid x)'},
  {show:['x','pol','y1','y2','y3'],bars:RB([.55,.25,.2,0],[.3,.4,.3,0]),tags:{pol:['fine-tuned on demonstrations','b']},cap:'Stage 1: fine-tune on answers written by people.'},
  {show:['y1','y3','rm','hum'],groups:['rm','h'],tags:{y1:'preferred'},cls:{y3:'bad'},cap:'Stage 2: sample several answers, have people rank them, and fit a reward model $r_\\phi$ to the comparisons.',say:'The chance that the preferred answer beats the other is a sigmoid of the difference in their rewards.',eq:'P(y_w\\succ y_l\\mid x)=\\sigma\\big(r_\\phi(x,y_w)-r_\\phi(x,y_l)\\big)'},
  {show:['x','pol','y1','y2','y3','rm'],groups:['rm'],elab:{'y1>rm':'+2.1','y2>rm':'−0.6','y3>rm':'−1.4'},bars:RB([.82,.1,.08,0],[.55,.25,.2,0]),flow:{back:true,st:[['y1>rm','y2>rm','y3>rm'],['pol>y1','pol>y2','pol>y3']]},cap:'Stage 3: sample, score whole answers with $r_\\phi$, and shift the policy toward high reward, with a KL penalty to stay near the starting model.',say:'Maximise the expected reward of the model’s outputs, minus a penalty for how far the model’s distribution moves from the reference model.',eq:'\\max_\\theta\\ \\mathbb{E}_{y\\sim\\pi_\\theta}\\big[r_\\phi(x,y)\\big]-\\beta\\,\\mathrm{KL}\\big(\\pi_\\theta\\,\\|\\,\\pi_{\\text{ref}}\\big)'},
  {show:['x','pol','y1','y2','y3','y4','rm'],groups:['rm','y4','y4rm'],elab:{'y1>rm':'+2.1','y4>rm':'+3.0'},bars:RB([.2,.03,.02,.75],[.82,.1,.08,0]),cls:{y4:'bad'},tags:{y4:['reward model loves it; people don’t','b','bad']},cap:'Without the KL term the policy finds the reward model’s blind spots: longer, flattering, overconfident text. This is reward hacking.'},
  P(CAT,{kind:'tok',fan:{meowed:.92,flew:.08},win:'all',cap:'Left open: the reward judges finished answers, but generation is unchanged. Each token is still committed in turn, with no look ahead.',say:'Generation still draws each token in turn from the policy, given the prompt and the tokens so far.',eq:'y_t\\sim\\pi_\\theta(\\cdot\\mid x,\\,y_{<t})'}),
 ]},
 {id:'2022c',yr:'2022',title:'Chain of thought',sub:'Write the working before the answer',th:'--th-scout',kind:'net',net:COT,steps:[
  {show:/^(L|inp|out)/,flow:{st:[['inp>L1'],['L1>L2'],['L2>L3'],['L3>L4'],['L4>out']]},tape:[[COTQ,''],['27','bad']],cap:'Asked for the answer straight away, the model must produce it as the next token: one forward pass, a fixed amount of computation. Here it gets it wrong.',say:'A direct answer is sampled straight from the question.',eq:'a\\sim p_\\theta(\\cdot\\mid q)'},
  {show:/^(L|inp|out)/,groups:['fb'],flow:{st:[['inp>L1'],['L1>L2'],['L2>L3'],['L3>L4'],['L4>out'],['out>inp']]},tape:[[COTQ,''],['23 − 20 = 3.','think'],['3 + 6 = 9.','think'],['The answer is 9.','new']],cap:'Chain of thought: show worked examples, and the model writes its reasoning $z$ first. Each token of $z$ is another pass, and its result stays in the context for the passes after it.',say:'First sample a reasoning sequence from the question, then sample the answer given the question and the reasoning.',eq:'z\\sim p_\\theta(\\cdot\\mid q),\\qquad a\\sim p_\\theta(\\cdot\\mid q,z)'},
  {show:/^(L|inp|out)/,groups:['fb'],tape:[[COTQ,''],['23 − 20 = 3.','think'],['3 + 6 = 9.','think'],['The answer is 9.','new']],cap:'The answer now depends on the reasoning, which is sampled too. Sampling several chains and taking a majority vote helps further.',say:'The answer’s probability averages over the reasoning chains the model might write.',eq:'p_\\theta(a\\mid q)=\\sum_z p_\\theta(z\\mid q)\\,p_\\theta(a\\mid q,z)'},
  {show:/^t/,on:['t0>t2','t2>t4','t4>t7'],cls:{t1:'bad',t5:'bad',t6:'bad',t7:'good'},tags:{t1:['impossible','b','bad'],t2:['sure','b'],t3:['maybe','b'],t5:['impossible','b','bad'],t6:['impossible','b','bad']},cap:'Tree of Thoughts (2023): propose several next steps, have the model rate each, then search and backtrack. Make 24 from 4 9 10 13: 4% solved with chain of thought, 74% with search.'},
  {show:/^(L|inp|out)/,groups:['fb'],tags:{out:'reward 1 if the answer checks out'},tape:[[COTQ,''],['23 − 20 = 3.','think'],['3 + 6 = 9.','think'],['Check: 3 + 6 = 9, yes.','think'],['The answer is 9.','new']],cap:'Reasoning models (o1, DeepSeek-R1) are trained by RL to write long chains, rewarded only for a checkable final answer. Chains grew longer, and self-checks appeared.',say:'Each sampled answer’s advantage is its reward minus the group’s mean reward, divided by the group’s standard deviation.',eq:'r=\\mathbb{1}[a\\ \\text{correct}],\\qquad A_i=\\frac{r_i-\\operatorname{mean}(r)}{\\operatorname{std}(r)}'},
 ]},
 {id:'2023r',yr:'2023',title:'Retrieval and tools',sub:'Let other systems write into the context',th:'--th-hand',kind:'net',net:RAG,steps:[
  {show:['q','gen'],groups:['direct'],tags:{gen:['only what θ absorbed','b']},cap:'A model knows only what its parameters absorbed: nothing after its training cutoff, shaky on rare facts, loose with arithmetic.',say:'The model can use only what is in its parameters and in the context.',eq:'p_\\theta(y\\mid x)'},
  {show:['q','retr','d1','d2','d3','d4'],groups:['r'],elab:RSC,hl:['d1','d3'],cap:'Retrieval (RAG, 2020): embed the question and every passage, and take the top $k$ by inner product.',say:'A passage’s retrieval probability is a softmax of the dot product between its embedding and the question’s.',eq:'p_\\eta(d\\mid x)\\propto\\exp\\big(E_D(d)^\\top E_Q(x)\\big)'},
  {show:['q','retr','d1','d2','d3','d4','gen'],groups:['r','k'],elab:RSC,hl:['d1','d3'],tape:[['Who wrote “Walking”?',''],['“Walking”, an essay by Thoreau','doc'],['Thoreau: life and works','doc'],['Thoreau','new']],flow:{st:[['d1>gen','d3>gen']]},cap:'The retrieved passages are placed in the context, and the answer is averaged over them.',say:'The answer’s probability is averaged over the top-k retrieved documents, each weighted by how relevant the retriever finds it.',eq:'p(y\\mid x)\\approx\\sum_{d\\in\\text{top-}k}p_\\eta(d\\mid x)\\,p_\\theta(y\\mid x,d)'},
  {show:['gen','tool'],groups:['tool'],flow:{st:[['gen>tool'],['tool>gen']]},tape:[['Out of 1400 participants, 400 (or',''],['[Calculator(400 / 1400) →','tool'],['0.29]','tool'],['29%) passed the test.','new']],cap:'Toolformer (2023): the model writes an API call into its own text; the call runs, and its result is spliced in before generation continues.'},
  {show:['gen','tool'],groups:['tool'],tags:{tool:['kept only if it helps','b']},tape:[['Out of 1400 participants, 400 (or',''],['[Calculator(400 / 1400) →','tool'],['0.29]','tool'],['29%) passed the test.','new']],cap:'The training data was self-made: a sampled call was kept only if its result lowered the loss on the tokens that followed.',say:'Keep a call if the loss without it, minus the loss with it and its result, is at least a threshold.',eq:'L_i^- - L_i^+\\ \\ge\\ \\tau_f'},
  {show:['q','retr','d1','d3','gen','tool'],groups:['k','tool'],tape:[['question',''],['retrieved passage','doc'],['tool result','tool'],['answer','new']],cap:'Either way, outside information enters only as tokens in the context. The context window became the model’s working memory.'},
 ]},
 {id:'2023m',yr:'2023',title:'Model collapse',sub:'Train on your own output and the tails vanish',th:'--th-trails',kind:'net',net:COL,steps:[
  {show:['g0'],bars:CB(D0),cap:'Generation 0 is fit to human text. Rare outcomes sit in the tails.'},
  {show:['g0','g1'],flow:{st:[['g0>g1']]},bars:CB(D1,D0),cap:'Generation 1 is trained on a finite sample of generation 0’s output. Rare events are often missed, so they get less mass. The outline is the original.',say:'Each generation draws M samples from the previous model and fits the next model to them by maximum likelihood.',eq:'x_{1:M}^{(n)}\\sim p_{\\theta_n},\\qquad \\theta_{n+1}=\\arg\\max_\\theta\\sum_{i=1}^{M}\\log p_\\theta\\big(x_i^{(n)}\\big)'},
  {flow:{st:[['g0>g1'],['g1>g2'],['g2>g3'],['g3>gn']]},bars:CB(D5,D0),cap:'Repeat, and the tails vanish first while the middle piles up. The authors call this model collapse.'},
  {plot:{box:[130,170,640,250],xr:[0,30],yr:[Math.floor(Math.min(...VRUNS.flatMap(r=>r.pts.map(p=>p[1]))))-.5,1.5],xl:'generation n',yl:'log σ²ₙ',curves:[{pts:[[0,0],[30,0]],cls:'dash'},...VRUNS],marks:[{x:30,y:0,l:'σ₀²',a:'end',dx:0,dy:-8}]},cap:'The simplest case: refit a Gaussian to $M$ of its own samples, again and again. Each refit multiplies the variance by a random factor with mean 1 but a negative mean log, so it drifts to zero.',say:'After n generations, the variance is the original variance times n independent random factors, each of which averages one.',eq:'\\sigma_n^2=\\sigma_0^2\\prod_{k=1}^{n}\\frac{\\chi^2_{M-1,k}}{M-1}'},
  {groups:['keep'],bars:CB(DMIX,D0),cap:'Keeping original human data in every generation slows the slide; accumulating synthetic data alongside it, rather than replacing it, largely avoids it.'},
  {groups:['keep'],bars:CB(DMIX,D0),cap:'Self-generated data works when an outside signal filters it, such as a checked answer or a game result. Without one, it collapses. Still open: where future training text will come from.',say:'Future training data is a mix of human text and samples from earlier models.',eq:'p_{\\text{data}}^{(n+1)}=(1-\\lambda)\\,p_{\\text{human}}+\\lambda\\,p_{\\theta_n}'},
 ]},
];
ENTRIES.push(...MORE);
{const ORDER=['picture','1948','1950','1958','1966','1986','1989','1990','2000','2012','2013','2014','2017','2018','2020s','2020d','2021','2022r','2022c','2023r','2023m'];ENTRIES.sort((a,b)=>ORDER.indexOf(a.id)-ORDER.indexOf(b.id))}
const LATER=[];

/* ================= stage ================= */
const svg=document.getElementById('stage');
const defs=el('defs',{},svg);
['base','fan','path','pick','net','on'].forEach(c=>{const m=el('marker',{id:'ah-'+c,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:9,markerHeight:9,markerUnits:'userSpaceOnUse',orient:'auto-start-reverse'},defs);el('path',{d:'M0 0L10 5L0 10z',class:'ah ah-'+c},m)});
{const cp=el('clipPath',{id:'planeclip'},defs);el('rect',{x:610,y:70,width:250,height:250},cp)}
const layTok=el('g',{},svg),layNet=el('g',{},svg);
let timers=[];const clearTimers=()=>{timers.forEach(t=>{clearTimeout(t);clearInterval(t)});timers=[]};

/* ---------- token renderer ---------- */
const gEdges=el('g',{},layTok),gAtt=el('g',{},layTok),gNodes=el('g',{},layTok),gLab=el('g',{},layTok),gTape=el('g',{},layTok),gFx=el('g',{},layTok);
const E={};
const edge=k=>{if(!E[k]){const[a,b]=k.split('>');if(a===b||!NODES[a]||!NODES[b])return null;const g=geom(k);E[k]={g,p:el('path',{d:g.d,class:'edge',style:'opacity:0;stroke-width:1'},gEdges)}}return E[k]};
for(const k in EDGES)edge(k);
const N={};for(const id in NODES){const n=NODES[id],g=el('g',{class:'node',transform:`translate(${n.x} ${n.y})`},gNodes);
  el('circle',{r:R+6,class:'ring'},g);el('circle',{r:R,class:'disc'},g);const t=el('text',{y:6,'text-anchor':'middle',class:'nlab'+(n.l?' sym':'')+(lab(id).length>5?' xlong':lab(id).length>4?' long':'')},g);t.textContent=lab(id);N[id]=g}

const TAPE_Y=488,CH=30;
function chipX(i,n){const w=Math.min(76,(860-20)/Math.max(n,1)),x0=450-(n*w)/2;return{x:x0+i*w+4,w:w-8}}
let cmpI=0;

function renderTok(st,animate){
  const row=st.cmp?st.cmp[cmpI]:st;
  const path=row.path?row.path.split(' '):[],head=path[path.length-1];
  const fan=row.fan,pick=st.pick,arcsIn=row.arcs||st.arcs,winSpec=row.win??st.win;
  const tape=path.slice();let q=-1;
  if(fan&&!pick){q=tape.length;tape.push('?')}
  if(pick)tape.push(pick);
  const nT=tape.length;
  const ctxEnd=pick?nT-1:(q>=0?q:nT);
  const winOf=(spec,end)=>spec==='all'?[0,end]:spec?[Math.max(0,end-spec),end]:null;
  const win=winOf(winSpec,ctxEnd);
  /* edges: the path, the fan, and (only for a table model) the table */
  const want={};
  for(let i=1;i<path.length;i++)want[path[i-1]+'>'+path[i]]={cls:'on',sw:3.4,op:1,m:'path'};
  if(st.table)for(const k in st.table){if(want[k])continue;want[k]={cls:'',sw:st.counts?1+COUNTS[k]*1.6:1.2+st.table[k]*8,op:.75,m:'base'}}
  if(fan)for(const b in fan){const k=head+'>'+b,p=fan[b];const picked=pick===b;
    want[k]={cls:'fan'+(picked?' pick':''),sw:1.2+p*15,op:pick?(picked?1:.22):1,m:picked?'pick':'fan'}}
  for(const k in want)edge(k);
  for(const k in E){const e=E[k].p,w=want[k];
    if(!w){e.style.opacity=0;continue}
    e.setAttribute('class','edge '+w.cls);e.style.strokeWidth=w.sw;e.style.opacity=w.op;e.setAttribute('marker-end',`url(#ah-${w.m})`)}
  /* nodes */
  const inPath=new Set(path),inWin=new Set(win?tape.slice(win[0],win[1]):[]);
  for(const id in N){let c='node';if(inPath.has(id))c+=' visited';if(inWin.has(id))c+=' ctx';if(id===head&&!pick)c+=' head';if(pick===id)c+=' head picked';
    if(fan&&fan[id]&&!pick)c+=' cand';
    if(st.bad&&st.bad.some(i=>tape[i]===id))c+=' bad';N[id].setAttribute('class',c)}
  /* labels */
  gLab.replaceChildren();
  const label=(k,s,cls)=>{const g=E[k].g,off=g.bent?-12:13,x=g.mid[0]+g.nrm[0]*off,y=g.mid[1]+g.nrm[1]*off;
    const t=el('text',{x:f1(x),y:f1(y+4),'text-anchor':'middle',class:'elab '+cls},gLab);t.textContent=s};
  if(st.table)for(const k in st.table)label(k,st.counts?'×'+COUNTS[k]:st.table[k].toFixed(2),st.counts?'c':'p');
  else if(fan&&Object.keys(fan).length<=4)for(const b in fan){const k=head+'>'+b;if(E[k])label(k,fan[b].toFixed(2),'p'+(pick&&b!==pick?' dim':''))}
  /* attention lines in the graph */
  gAtt.replaceChildren();
  if(arcsIn){const best={};for(const i in arcsIn){const id=tape[i];best[id]=Math.max(best[id]||0,arcsIn[i])}
    const H=NODES[head];for(const id in best){if(id===head)continue;const B=NODES[id];const mx=(H.x+B.x)/2,my=Math.min(H.y,B.y)-70;
      el('path',{d:`M${H.x} ${H.y-R}Q${mx} ${my} ${B.x} ${B.y-R}`,class:'attg',style:`stroke-width:${f1(1+best[id]*7)};opacity:${f1(.25+best[id]*.75)}`},gAtt)}}
  /* tape */
  gTape.replaceChildren();
  const tl=(y,s,cls='tapelab')=>{const t=el('text',{x:20,y,class:cls},gTape);t.textContent=s;return t};
  if(st.cmp)tapeCompare(st);
  else if(st.corpus){CORPUS.forEach((s,r)=>{const t=s.split(' ');t.forEach((w,i)=>{const{x,w:cw}=chipX(i,t.length),y=TAPE_Y-18+r*(CH+8);
      const g=el('g',{class:'chip corp'},gTape);el('rect',{x,y,width:cw,height:CH-4,rx:6},g);const tx=el('text',{x:x+cw/2,y:y+18,'text-anchor':'middle'},g);tx.textContent=lab(w)})});
    tl(TAPE_Y-30,'corpus')}
  else if(nT){
    tl(TAPE_Y-30,'x₁…xₜ');
    if(win){const a=chipX(win[0],nT),b=chipX(win[1]-1,nT);el('rect',{x:a.x-5,y:TAPE_Y-6,width:b.x+b.w-a.x+10,height:CH+12,rx:9,class:'win'},gTape)}
    const qi=q>=0?q:nT-1;
    const arcs=[];if(arcsIn)for(const i in arcsIn)arcs.push([qi,+i,arcsIn[i]]);
    if(st.allArcs)for(let a=1;a<nT;a++)for(let b=0;b<a;b++)arcs.push([a,b,.35]);
    arcs.forEach(([a,b,w])=>{const A=chipX(a,nT),B=chipX(b,nT),ax=A.x+A.w/2,bx=B.x+B.w/2,h=Math.min(78,18+Math.abs(ax-bx)*.22);
      el('path',{d:`M${f1(ax)} ${TAPE_Y}C${f1(ax)} ${f1(TAPE_Y-h)} ${f1(bx)} ${f1(TAPE_Y-h)} ${f1(bx)} ${TAPE_Y}`,class:'arc'+(st.allArcs?' all':''),style:`stroke-width:${f1(st.allArcs?1:1+w*9)};opacity:${f1(st.allArcs?.35:.2+w*.8)}`},gTape)});
    tape.forEach((w,i)=>{const{x,w:cw}=chipX(i,nT);let c='chip';if(i===q)c+=' q';if(pick&&i===nT-1)c+=' new';if(st.bad&&st.bad.includes(i))c+=' bad';
      const g=el('g',{class:c},gTape);el('rect',{x,y:TAPE_Y,width:cw,height:CH,rx:7},g);const t=el('text',{x:x+cw/2,y:TAPE_Y+20,'text-anchor':'middle'},g);t.textContent=lab(w);
      if(st.state&&st.state[i]){const s=st.state[i],bw=cw-10;['cat','duck'].forEach(k=>{if(s[k]==null)return;
        el('rect',{x:x+5,y:TAPE_Y+CH+7,width:bw,height:7,rx:2,class:'hbg'},gTape);
        el('rect',{x:x+5,y:TAPE_Y+CH+7,width:f1(bw*s[k]),height:7,rx:2,class:'hbar '+k},gTape)})}
      if(st.chain&&i<nT-1&&i>0){const n=chipX(i+1,nT);el('path',{d:`M${f1(x+cw+1)} ${TAPE_Y+CH/2}H${f1(n.x-2)}`,class:'chainar','marker-end':'url(#ah-path)'},gTape)}});
    if(st.state){tl(TAPE_Y+CH+14,st.gate?'c':'h');
      const dk=Object.keys(st.state.find(s=>s&&Object.keys(s).length)||{})[0];
      if(dk){const t2=el('text',{x:880,y:TAPE_Y+CH+14,'text-anchor':'end',class:'tapelab '+dk},gTape);t2.textContent='remembers '+dk}}
  }
  /* pick: a dot runs along the chosen edge */
  gFx.replaceChildren();
  if(pick&&animate&&!RM){const k=head+'>'+pick;if(E[k]){
    const c=el('circle',{r:7,class:'mover'},gFx);const am=el('animateMotion',{dur:'.7s',fill:'freeze',path:E[k].g.d,begin:'indefinite',calcMode:'spline',keySplines:'.4 0 .2 1',keyTimes:'0;1'},c);
    requestAnimationFrame(()=>{try{am.beginElement()}catch(e){}});timers.push(setTimeout(()=>c.remove(),900))}}
}
/* compare: several paths stacked on the tape, each with its own small fan */
function tapeCompare(st){
  const rows=st.cmp,cw=50,gap=4,x0=70,rh=34,y0=448;
  const maxN=Math.max(...rows.map(r=>r.path.split(' ').length))+1;
  const bx=x0+maxN*(cw+gap)+18;
  const t=el('text',{x:bx,y:y0-10,class:'tapelab'},gTape);t.textContent='fan at the last node';
  rows.forEach((r,ri)=>{const toks=r.path.split(' ').concat('?'),y=y0+ri*rh,g=el('g',{class:'crow'+(ri===cmpI?' on':'')},gTape);
    el('rect',{x:x0-10,y:y-4,width:860-x0+16,height:rh-2,rx:8,class:'crowbg'},g);
    const wn=r.win??st.win,end=toks.length-1;const w=wn==='all'?[0,end]:wn?[end-wn,end]:null;
    if(w){const a=x0+w[0]*(cw+gap),b=x0+(w[1]-1)*(cw+gap)+cw;el('rect',{x:a-3,y:y-1,width:b-a+6,height:rh-8,rx:7,class:'win'},g)}
    toks.forEach((tk,i)=>{const x=x0+i*(cw+gap),c=el('g',{class:'chip sm'+(tk==='?'?' q':'')},g);el('rect',{x,y:y+2,width:cw,height:rh-14,rx:5},c);
      const tx=el('text',{x:x+cw/2,y:y+16,'text-anchor':'middle'},c);tx.textContent=lab(tk)});
    Object.entries(r.fan).forEach(([k,p],j)=>{const xx=bx+j*112;const tl=el('text',{x:xx,y:y+16,class:'fbl'},g);tl.textContent=lab(k);
      el('rect',{x:xx+30,y:y+6,width:70,height:10,rx:3,class:'hbg'},g);el('rect',{x:xx+30,y:y+6,width:f1(70*p),height:10,rx:3,class:'fbar'},g)});
    g.style.cursor='pointer';g.addEventListener('click',()=>{clearTimers();cmpI=ri;renderTok(st,true)})});
}

/* ---------- network renderer ---------- */
let netOf=null,NN={},NE={};
const gNE=el('g',{},layNet),gNL=el('g',{},layNet),gNN=el('g',{},layNet),gNX=el('g',{},layNet),gPlane=el('g',{},layNet),gNF=el('g',{},layNet);
const CS=14;
function size(n){if(n.kind==='txt'||n.kind==='none'||n.kind==='dot')return null;if(n.kind==='img')return[IW*CS,IH*CS];if(n.kind==='box')return[n.w||100,n.h||52];if(n.kind==='vec')return[22,70];if(n.kind==='px')return[34,34];return null}
function trim(n,to,pad=3){const dx=to[0]-n.x,dy=to[1]-n.y,d=Math.hypot(dx,dy)||1,s=size(n);
  if(!s){const r=(n.kind==='txt'?14:n.kind==='dot'?8:n.kind==='none'?2:(n.r||24))+pad;return[n.x+dx/d*r,n.y+dy/d*r]}
  const hw=s[0]/2+pad,hh=s[1]/2+pad,t=Math.min(hw/Math.abs(dx||1e-9),hh/Math.abs(dy||1e-9));return[n.x+dx*t,n.y+dy*t]}
const rgb=c=>`rgb(${c.map(v=>Math.round(Math.max(0,Math.min(255,v)))).join(',')})`;
function buildNet(G){
  [gNE,gNL,gNN,gNX,gPlane,gNF].forEach(g=>g.replaceChildren());NN={};NE={};netOf=G;
  for(const[a,b,w,o={}]of G.edges){const A=G.nodes[a],B=G.nodes[b];let d,mid;
    if(a===b){const r=A.r||24,x=A.x,y=A.y;d=`M${f1(x-r*.55)} ${f1(y-r*.85)}C${f1(x-r*1.6)} ${f1(y-r*3)} ${f1(x+r*1.6)} ${f1(y-r*3)} ${f1(x+r*.55)} ${f1(y-r*.95)}`;mid=[x,y-r*2.45]}
    else{const C=o.c||[(A.x+B.x)/2,(A.y+B.y)/2];
    const S=trim(A,C),T=trim(B,C,5);d=`M${f1(S[0])} ${f1(S[1])}Q${f1(C[0])} ${f1(C[1])} ${f1(T[0])} ${f1(T[1])}`;
    mid=[.25*S[0]+.5*C[0]+.25*T[0],.25*S[1]+.5*C[1]+.25*T[1]]}
    NE[a+'>'+b]={w,o,d,mid,p:el('path',{d,class:'nedge'},gNE)}}
  for(const id in G.nodes){const n=G.nodes[id],g=el('g',{class:'nnode'},gNN),s=size(n),it={g,n};g.style.transform=`translate(${n.x}px,${n.y}px)`;
    if(n.kind==='txt'){it.lab=el('text',{y:5,'text-anchor':'middle',class:'tlab'},g);it.lab.textContent=n.l}
    else if(n.kind==='none'){}
    else if(n.kind==='dot'){el('circle',{r:7,class:'dotn'},g)}
    else if(!s){const r=n.r||24;el('circle',{r:r+6,class:'ring'},g);el('circle',{r,class:'disc'},g);it.fill=el('circle',{r,class:'act'},g);
      if(n.l){const t=el('text',{y:6,'text-anchor':'middle',class:'nlab'+(n.l.length>5?' xlong':n.l.length>3?' long':'')},g);t.textContent=n.l;it.lab=t}}
    else if(n.kind==='px'){it.px=el('rect',{x:-17,y:-17,width:34,height:34,rx:4,class:'px'},g)}
    else if(n.kind==='box'){el('rect',{x:-s[0]/2,y:-s[1]/2,width:s[0],height:s[1],rx:10,class:'box'},g);const t=el('text',{y:5,'text-anchor':'middle',class:'blab'},g);t.textContent=n.l;it.lab=t}
    else if(n.kind==='vec'){const r=rng(5);for(let k=0;k<5;k++){const v=r();el('rect',{x:-11,y:-35+k*14,width:22,height:14,class:'zc',style:`opacity:${f1(.25+v*.75)}`},g)}
      const t=el('text',{y:56,'text-anchor':'middle',class:'nlab'+(n.l.length>2?' vl':'')},g);t.textContent=n.l;it.lab=t}
    else if(n.kind==='img'){el('rect',{x:-s[0]/2-3,y:-s[1]/2-3,width:s[0]+6,height:s[1]+6,rx:5,class:'imgf'},g);it.cells=[];
      for(let j=0;j<IH;j++)for(let i=0;i<IW;i++)it.cells.push(el('rect',{x:-s[0]/2+i*CS,y:-s[1]/2+j*CS,width:CS+.4,height:CS+.4},g));
      const t=el('text',{y:s[1]/2+22,'text-anchor':'middle',class:'nlab'},g);t.textContent=n.l;it.lab=t}
    NN[id]=it}
}
function renderNet(e,st,animate){
  if(netOf!==e.net)buildNet(e.net);
  const vis=id=>!st.show||(st.show instanceof RegExp?st.show.test(id):st.show.includes(id));
  for(const id in NN){const it=NN[id],n=it.n;it.g.style.opacity=vis(id)?1:0;
    const ps=(st.pos&&st.pos[id])||[n.x,n.y];it.g.style.transform=`translate(${ps[0]}px,${ps[1]}px)`;
    if(it.lab){const L=st.labs&&st.labs[id];setT(it.lab,L!=null?L:(n.l||''))}
    it.g.setAttribute('class','nnode'+(n.cls?' '+n.cls:'')+(st.cls&&st.cls[id]?' '+st.cls[id]:''));
    const v=(st.vals&&st.vals[id]!=null)?st.vals[id]:(n.v??null);
    if(it.fill)it.fill.style.opacity=v==null?0:v*.85;
    if(it.px)it.px.style.fill=rgb([1,1,1].map(()=>40+v*200));
    if(it.cells){const im=st.imgs&&st.imgs[id];it.cells.forEach((c,i)=>c.setAttribute('fill',im?rgb(im[i]):'transparent'))}
    it.g.classList.toggle('hl',!!(st.hl&&st.hl.includes(id)))}
  const groups=st.groups||[];
  gNL.replaceChildren();
  for(const k in NE){const E2=NE[k],[a,b]=k.split('>');const g=E2.o.g;
    const show=vis(a)&&vis(b)&&(g?groups.includes(g):true);
    const w=(st.w&&st.w[k]!=null)?st.w[k]:E2.w;
    let cls='nedge';if(w<0)cls+=' neg';if(st.shared&&E2.o.s!=null)cls+=' s'+E2.o.s;if(g)cls+=' g-'+g;if(E2.o.cls)cls+=' '+E2.o.cls;const isFan=/fan/.test(E2.o.cls||'');
    if(st.on)cls+=st.on.includes(k)?' on':' dim';
    E2.p.setAttribute('class',cls);E2.p.style.opacity=show?'':0;
    E2.p.style.strokeWidth=E2.o.sw?E2.o.sw:isFan?f1(1.2+Math.abs(w)*12):g==='dense'?1:(E2.o.s!=null||g==='up'||g==='q'||g==='p')?(g==='p'||g==='q'?2.4:2):f1(1+Math.abs(w)*5);
    E2.p.setAttribute('marker-end',(g==='dense'||E2.o.s!=null||g==='up'||E2.o.nm)?'':`url(#ah-${isFan?'fan':st.on&&st.on.includes(k)?'on':'net'})`);
    const lt=st.elab&&st.elab[k]!=null?st.elab[k]:st.wlab?(st.wlab==='p'?w.toFixed(1).replace(/^0/,''):(w>0?'+':'')+w.toFixed(1)):null;
    if(show&&lt!=null){const t=el('text',{x:f1(E2.mid[0]),y:f1(E2.mid[1]-8),'text-anchor':'middle',class:'elab w'+(isFan?' f':'')},gNL);t.textContent=lt}}
  /* tags */
  gNX.replaceChildren();
  if(st.tags)for(const id in st.tags){const n=e.net.nodes[id],s=size(n),tg=st.tags[id],txt=Array.isArray(tg)?tg[0]:tg,below=Array.isArray(tg)&&tg[1]==='b';
    const ps=(st.pos&&st.pos[id])||[n.x,n.y],hh=s?s[1]/2:n.kind==='dot'?8:n.kind==='txt'?10:n.kind==='none'?-4:(n.r||24)+6;
    const y=below?ps[1]+hh+(s&&n.kind==='img'?40:20):n.kind==='none'?ps[1]:ps[1]-hh-12;
    const t=el('text',{x:ps[0],y,'text-anchor':'middle',class:'ntag'+(Array.isArray(tg)&&tg[2]?' '+tg[2]:'')},gNX);t.textContent=txt}
  /* group labels for diffusion arrows */
  if(e.net===DIFG){if(groups.includes('q')){const t=el('text',{x:450,y:118,'text-anchor':'middle',class:'ntag q'},gNX);t.textContent='q: add noise  →'}
    if(groups.includes('p')){const t=el('text',{x:450,y:395,'text-anchor':'middle',class:'ntag p'},gNX);t.textContent='←  p_θ: remove noise (learned)'}}
  /* plane inset */
  gPlane.replaceChildren();if(st.plane)plane(st.plane);if(st.plot)plot(st.plot);if(st.bars)bars(st.bars);if(st.mat)mat(st.mat);if(st.tape)tapeN(st.tape);
  /* flow: dots stage by stage */
  gNF.replaceChildren();
  if(st.flow&&animate&&!RM){const run=()=>{gNF.replaceChildren();st.flow.st.forEach((keys,si)=>timers.push(setTimeout(()=>keys.forEach(k=>{const E2=NE[k];if(!E2)return;
      const c=el('circle',{r:6,class:'flow'+(st.flow.back?' back':'')},gNF);
      const am=el('animateMotion',{dur:'.6s',fill:'freeze',path:E2.d,begin:'indefinite',keyPoints:st.flow.back?'1;0':'0;1',keyTimes:'0;1',calcMode:'linear'},c);
      try{am.beginElement()}catch(_){}timers.push(setTimeout(()=>c.remove(),650))}),si*650)))};
    run();timers.push(setInterval(run,st.flow.st.length*650+1400))}
}
function plane(P){const X0=620,Y0=80,S=230,lo=-.3,hi=1.3,M=(u,v)=>[X0+(u-lo)/(hi-lo)*S,Y0+S-(v-lo)/(hi-lo)*S];
  const g=el('g',{class:'plane'},gPlane);el('rect',{x:X0,y:Y0,width:S,height:S,rx:8,class:'pframe'},g);
  const clip=(poly,[a,b,c])=>{const out=[];for(let i=0;i<poly.length;i++){const p=poly[i],q=poly[(i+1)%poly.length],fp=a*p[0]+b*p[1]+c,fq=a*q[0]+b*q[1]+c;if(fp>=0)out.push(p);if((fp>=0)!==(fq>=0)){const t=fp/(fp-fq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t])}}return out};
  let poly=[[lo,lo],[hi,lo],[hi,hi],[lo,hi]];for(const c of(P.region||P.lines.slice(0,1)))poly=clip(poly,c);
  if(poly.length)el('polygon',{points:poly.map(p=>M(...p).map(f1).join(',')).join(' '),class:'pos'},g);
  for(const[a,b,c]of P.lines){let p1,p2;if(Math.abs(b)>Math.abs(a)){p1=[lo,-(a*lo+c)/b];p2=[hi,-(a*hi+c)/b]}else{p1=[-(b*lo+c)/a,lo];p2=[-(b*hi+c)/a,hi]}
    const A=M(...p1),B=M(...p2);el('line',{x1:f1(A[0]),y1:f1(A[1]),x2:f1(B[0]),y2:f1(B[1]),class:'pline','clip-path':'url(#planeclip)'},g)}
  const region=P.region||P.lines.slice(0,1),inside=(u,v)=>region.every(([a,b,c])=>a*u+b*v+c>0);
  P.pts.forEach(([u,v,y],i)=>{const[x,yy]=M(u,v),wrong=inside(u,v)!==!!y;
    el('circle',{cx:f1(x),cy:f1(yy),r:9,class:'pt '+(y?'one':'zero')+(wrong?' wrong':'')+(P.hi&&P.hi.includes(i)?' hi':'')},g)});
  const t=el('text',{x:X0+S/2,y:Y0+S+22,'text-anchor':'middle',class:'tapelab'},g);t.textContent='input space: ● = 1, ○ = 0, shaded = fires';}

/* log-log or plain plot: curves are point lists in data units */
function plot(P){const[x,y,w,h]=P.box,[x0,x1]=P.xr,[y0,y1]=P.yr,M=(u,v)=>[x+(u-x0)/(x1-x0)*w,y+h-(v-y0)/(y1-y0)*h];
  const g=el('g',{class:'plot'},gPlane);el('rect',{x:x-14,y:y-14,width:w+28,height:h+28,rx:10,class:'pframe'},g);
  el('path',{d:`M${x} ${y}V${y+h}H${x+w}`,class:'axis'},g);
  const xl=el('text',{x:x+w/2,y:y+h+40,'text-anchor':'middle',class:'tapelab'},g);xl.textContent=P.xl;
  const yl=el('text',{x:0,y:0,'text-anchor':'middle',class:'tapelab',transform:`translate(${x-26} ${y+h/2}) rotate(-90)`},g);yl.textContent=P.yl;
  const cl=(u,v)=>M(Math.max(x0,Math.min(x1,u)),Math.max(y0,Math.min(y1,v)));
  (P.curves||[]).forEach(c=>el('polyline',{points:c.pts.map(p=>cl(...p).map(f1).join(',')).join(' '),class:'pcurve '+(c.cls||'')},g));
  (P.pts||[]).forEach(p=>{const[a,b]=M(p[0],p[1]);el('circle',{cx:f1(a),cy:f1(b),r:7,class:'ppt '+(p[2]||'')},g)});
  (P.marks||[]).forEach(m=>{const[a,b]=M(m.x,m.y);const t=el('text',{x:f1(a+(m.dx??10)),y:f1(b+(m.dy??-10)),'text-anchor':m.a||'start',class:'ntag '+(m.cls||'')},g);t.textContent=m.l})}
/* bar chart of a distribution; ref draws an outline of an earlier one */
function bars(B){const[x,y,w,h]=B.box,n=B.items.length,bw=w/n,mx=B.max||Math.max(...B.items.map(i=>Math.max(i.v,i.ref||0)));
  const g=el('g',{class:'bars'},gPlane);el('line',{x1:x,y1:y+h,x2:x+w,y2:y+h,class:'axis'},g);
  if(B.lab){const t=el('text',{x,y:y-26,class:'tapelab'},g);setT(t,B.lab)}
  B.items.forEach((it,i)=>{const bx=x+i*bw+bw*.18,ww=bw*.64;
    if(it.ref!=null)el('rect',{x:f1(bx),y:f1(y+h-it.ref/mx*h),width:f1(ww),height:f1(it.ref/mx*h),class:'bref'},g);
    el('rect',{x:f1(bx),y:f1(y+h-it.v/mx*h),width:f1(ww),height:f1(Math.max(.5,it.v/mx*h)),rx:2,class:'bar '+(it.cls||'')},g);
    if(it.l){const t=el('text',{x:f1(bx+ww/2),y:y+h+18,'text-anchor':'middle',class:'blab2'},g);t.textContent=it.l}
    if(B.vals){const t=el('text',{x:f1(bx+ww/2),y:f1(y+h-Math.max(it.v,it.ref||0)/mx*h-6),'text-anchor':'middle',class:'elab w'},g);t.textContent=it.v.toFixed(2).replace(/^0/,'')}})}
/* a matrix of weights, rows × columns, shade = value */
function mat(M){const[x,y]=M.at,c=M.cell||40,g=el('g',{class:'mat'},gPlane);
  M.rows.forEach((r,i)=>{const t=el('text',{x:x-10,y:y+i*c+c/2+5,'text-anchor':'end',class:'blab2'},g);t.textContent=r;
    M.cols.forEach((_,j)=>{const v=M.v[i][j];el('rect',{x:x+j*c,y:y+i*c,width:c-2,height:c-2,rx:4,class:'mcell',style:`fill-opacity:${f1(.06+v*.94)}`},g)})});
  M.cols.forEach((cl,j)=>{const t=el('text',{x:0,y:0,'text-anchor':'end',class:'blab2',transform:`translate(${x+j*c+c/2+4} ${y+M.rows.length*c+10}) rotate(-35)`},g);t.textContent=cl});
  if(M.lab){const t=el('text',{x,y:y-12,class:'tapelab'},g);t.textContent=M.lab}}
/* a tape of text chips under a network stage; items are strings or [text, class] */
function tapeN(T){const items=T.map(t=>typeof t==='string'?[t,'']:t),g=el('g',{class:'ntape'},gPlane);
  const W=t=>Math.max(28,t.length*7.3+18),gap=6,maxW=840,rows=[[]];let w=0;
  items.forEach(it=>{const cw=W(it[0]);if(w+cw>maxW&&rows[rows.length-1].length){rows.push([]);w=0}rows[rows.length-1].push([it,cw]);w+=cw+gap});
  const y0=548-rows.length*34;
  rows.forEach((r,ri)=>{const tot=r.reduce((a,[,cw])=>a+cw+gap,-gap);let xx=450-tot/2;
    r.forEach(([[txt,cls],cw])=>{const c=el('g',{class:'chip nt '+cls},g);el('rect',{x:f1(xx),y:y0+ri*34,width:f1(cw),height:28,rx:6},c);
      const t=el('text',{x:f1(xx+cw/2),y:y0+ri*34+19,'text-anchor':'middle'},c);t.textContent=txt;xx+=cw+gap})})}

/* ================= panel ================= */
const $=s=>document.querySelector(s);
const sel=$('#entry'),stepsEl=$('#steps'),head=$('#ehead');
ENTRIES.forEach(e=>{const o=document.createElement('option');o.value=e.id;o.textContent=(e.yr?e.yr+' · ':'')+e.title;sel.appendChild(o)});
if(LATER.length){const og=document.createElement('optgroup');og.label='Not drawn yet';LATER.forEach(t=>{const o=document.createElement('option');o.disabled=true;o.textContent=t;og.appendChild(o)});sel.appendChild(og)}
let cur=0,step=0,builtFor=-1;
const tex=(s,node)=>{node.replaceChildren();s.split(/(\$[^$]+\$)/).forEach(part=>{const tk=part.match(/^\$\\text\{([^}]*)\}\$$/);if(tk){const sp=document.createElement('span');sp.className='tok';sp.textContent=tk[1];node.appendChild(sp)}
    else if(part.startsWith('$')&&window.katex){const sp=document.createElement('span');katex.render(part.slice(1,-1),sp,{throwOnError:false});node.appendChild(sp)}else node.appendChild(document.createTextNode(part.replace(/\$/g,'')))})};
function buildPanel(){const e=ENTRIES[cur];
  document.documentElement.style.setProperty('--th',`var(${e.th})`);document.body.dataset.kind=e.kind;
  head.innerHTML='';const k=document.createElement('p');k.className='kick';k.textContent=e.yr||'Start here';const h=document.createElement('h2');h.textContent=e.title;const s=document.createElement('p');s.className='esub';s.textContent=e.sub;const ab=document.createElement('button');ab.type='button';ab.className='aboutbtn';ab.textContent='About this idea';ab.onclick=()=>openAbout(cur);head.append(k,h,s,ab);
  stepsEl.replaceChildren();e.steps.forEach((st,i)=>{const li=document.createElement('li');li.tabIndex=0;
    const c=document.createElement('p');c.className='cap';tex(st.cap,c);li.appendChild(c);
    if(st.eq){const q=document.createElement('div');q.className='eq';if(st.say)q.dataset.say=st.say;if(window.katex)katex.render(st.eq,q,{displayMode:true,throwOnError:false});else q.textContent=st.eq;li.appendChild(q)}
    li.onclick=()=>go(cur,i,true);li.onkeydown=ev=>{if(ev.key==='Enter')go(cur,i,true)};stepsEl.appendChild(li)})}
function show(e,st,anim){clearTimers();const kd=st.kind||e.kind;layTok.style.display=kd==='tok'?'':'none';layNet.style.display=kd==='net'?'':'none';document.body.dataset.kind=kd;
  if(kd==='net'){renderNet(e,st,anim);return}
  cmpI=0;renderTok(st,anim);
  if(st.cmp&&!RM)timers.push(setInterval(()=>{cmpI=(cmpI+1)%st.cmp.length;renderTok(st,true)},2400))}
function go(ei,si,anim){about.hidden=true;const changed=builtFor!==ei;cur=ei;builtFor=ei;const e=ENTRIES[cur];step=Math.max(0,Math.min(si,e.steps.length-1));
  if(changed){buildPanel();sel.value=e.id}
  [...stepsEl.children].forEach((li,i)=>{li.classList.toggle('cur',i===step);li.classList.toggle('past',i<step)});
  {const li=stepsEl.children[step],top=li.offsetTop-8,vis=stepsEl.clientHeight;if(top<stepsEl.scrollTop||li.offsetTop+li.offsetHeight>stepsEl.scrollTop+vis)stepsEl.scrollTo({top:Math.max(0,top),behavior:anim?'smooth':'auto'})}
  $('#pos').textContent=`${step+1} / ${e.steps.length}`;
  $('#prev').disabled=cur===0&&step===0;
  const last=step===e.steps.length-1;$('#nextlab').textContent=last?(cur<ENTRIES.length-1?'Next entry':'End'):'Next';$('#next').disabled=last&&cur===ENTRIES.length-1;
  show(e,e.steps[step],anim);
  history.replaceState(null,'',`#${e.id}/${step+1}`)}
const next=()=>{if(!about.hidden){go(cur,0,true);return}const e=ENTRIES[cur];if(step<e.steps.length-1)go(cur,step+1,true);else if(cur<ENTRIES.length-1)openAbout(cur+1)};
const prev=()=>{if(!about.hidden){if(cur>0)go(cur-1,ENTRIES[cur-1].steps.length-1,true);return}if(step>0)go(cur,step-1,true);else openAbout(cur)};
$('#next').onclick=next;$('#prev').onclick=prev;
sel.onchange=()=>openAbout(ENTRIES.findIndex(e=>e.id===sel.value));
addEventListener('keydown',ev=>{if(ev.target.closest('select'))return;if(ev.key===' '&&!about.hidden)return;if(ev.key==='ArrowRight'||ev.key===' '){ev.preventDefault();next()}else if(ev.key==='ArrowLeft'){ev.preventDefault();prev()}});
addEventListener('hashchange',route);

/* ---------- formula gloss popover (symbols from the main site's glossary) ---------- */
const SLUG={picture:'index','1948':'1948-count-the-footprints','1958':'1958-wear-the-rule-from-mistakes','1986':'1986-pass-the-blame-back',
  '1990':'1990-carry-a-pack','2012':'2012-ground-for-pictures','2013':'2013-paint-in-one-stroke','2017':'2017-drop-the-pack-keep-the-dog','2020d':'2020-paint-in-drafts',
  '1950':'1950-judge-the-footprints','1966':'1966-cut-the-paths-by-hand','1989':'1989-a-garden-worn-in','2000':'2000-similar-words-similar-ground','2014':'2014-a-dog-on-the-other-road','2018':'2018-hand-over-the-road',
  '2020s':'2020-more-walkers-on-a-straight-line','2021':'2021-name-the-destination','2022r':'2022-judge-where-walks-end','2022c':'2022-scout-before-answering','2023r':'2023-let-other-hands-lay-road','2023m':'2023-trails-worn-by-walkers'};
function glossOf(src){const G=window.GLOSS;if(!G)return[];const pg=G.p[SLUG[ENTRIES[cur].id]]||G.p.index;
  let w=src;const hits=[],seen=new Set();
  const take=(re,tex,en)=>{let m,first=-1;re.lastIndex=0;while((m=re.exec(w))){if(!m[0].length){re.lastIndex++;continue}if(first<0)first=m.index;w=w.slice(0,m.index)+' '.repeat(m[0].length)+w.slice(m.index+m[0].length)}
    if(first>=0&&!seen.has(tex)){seen.add(tex);hits.push([first,tex,en])}};
  for(const[re,tex,en]of[...pg.c,...G.gc])take(new RegExp(re,'g'),tex,en);
  w=w.replace(/\\(?:text|mathrm|operatorname|mathbb|mathcal|begin|end)\{[^}]*\}/g,m=>' '.repeat(m.length)).replace(/\\[a-zA-Z]+/g,m=>' '.repeat(m.length));
  const L=new Map(G.gl.map(e=>[e[0],e]));for(const e of pg.l)L.set(e[0],e);
  for(const[ch,tex,en]of L.values())take(new RegExp('(?<![a-zA-Z])'+ch+'(?![a-zA-Z])','g'),tex,en);
  return hits.sort((a,b)=>a[0]-b[0])}
(()=>{let pop=null,curK=null;
  let t0=0;const close=()=>{if(pop){pop.remove();pop=null;curK=null}};const softClose=()=>{if(Date.now()-t0>500)close()};
  const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;');
  const open=k=>{if(curK===k){close();return}close();const ann=k.querySelector('annotation');if(!ann||!window.katex)return;
    const g=glossOf(ann.textContent),box=k.closest('.eq'),say=box&&box.dataset.say;if(!g.length&&!say)return;
    pop=document.createElement('div');pop.className='mpop';pop.setAttribute('role','dialog');pop.setAttribute('aria-label','What this formula says');
    pop.innerHTML=`<div class="mpop-head"><span class="mpop-tag">${say?'Formula in plain English':'What the symbols mean'}</span><button type="button" class="mpop-x" aria-label="Close">×</button></div>`+
      (say?`<p class="say">${esc(say)}</p>`:'')+
      (g.length?'<dl>'+g.map(([,t,e])=>`<dt>${katex.renderToString(t,{throwOnError:false})}</dt><dd>${esc(e)}</dd>`).join('')+'</dl>':'');
    pop.querySelector('.mpop-x').onclick=close;document.body.appendChild(pop);curK=k;t0=Date.now();
    const r=(box||k).getBoundingClientRect(),pw=pop.offsetWidth,ph=pop.offsetHeight,vw=document.documentElement.clientWidth;
    pop.style.left=Math.max(10,Math.min(r.left,vw-pw-10))+'px';
    const below=r.bottom+8+ph<innerHeight||r.top<ph+16;pop.style.top=Math.max(8,below?r.bottom+8:r.top-ph-8)+'px'};
  document.addEventListener('click',e=>{const k=e.target.closest('.steps .katex,.aboutin .katex');
    if(k){e.stopPropagation();const li=k.closest('.steps li');if(li&&!li.classList.contains('cur')){li.click();setTimeout(()=>open(k),420)}else open(k)}else if(!e.target.closest('.mpop'))close()},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  ['scroll','resize'].forEach(ev=>addEventListener(ev,softClose,true));
})();

/* ---------- about page ---------- */
const about=$('#about'),aboutIn=$('#aboutin');
function snap(e,i){const saved=e.steps[i];show(e,saved,false);clearTimers();const c=svg.cloneNode(true);c.removeAttribute('id');c.classList.add('snap');
  c.querySelectorAll('[id]').forEach(n=>n.removeAttribute('id'));return c}
function openAbout(ei){const e=ENTRIES[ei],A=(window.ABOUT||{})[e.id];if(!A){go(ei,0,true);return}
  cur=ei;sel.value=e.id;document.documentElement.style.setProperty('--th',`var(${e.th})`);document.body.dataset.kind=e.kind;
  aboutIn.replaceChildren();const mk=(t,c,txt)=>{const n=document.createElement(t);if(c)n.className=c;if(txt!=null)tex(txt,n);return n};
  aboutIn.append(mk('p','kick',e.yr||'Start here'),mk('h1','',e.title),mk('p','lede',A.lede));
  A.sections.forEach(sec=>{const s=document.createElement('section');s.append(mk('h2','',sec.h));(sec.p||[]).forEach(t=>s.append(mk('p','',t)));
    if(sec.eq){const q=document.createElement('div');q.className='eq';if(sec.say)q.dataset.say=sec.say;if(window.katex)katex.render(sec.eq,q,{displayMode:true,throwOnError:false});else q.textContent=sec.eq;s.append(q)}
    if(sec.fig){const f=document.createElement('figure');f.append(snap(e,sec.fig.step),mk('figcaption','',sec.fig.cap));
      const b=document.createElement('button');b.type='button';b.className='figgo';b.textContent=`Open step ${sec.fig.step+1} →`;b.onclick=()=>go(ei,sec.fig.step,true);f.append(b);s.append(f)}
    aboutIn.append(s)});
  const go1=document.createElement('div');go1.className='startrow';
  const sb=document.createElement('button');sb.type='button';sb.className='pb main';sb.textContent=`Start the walkthrough · ${e.steps.length} steps →`;sb.onclick=()=>go(ei,0,true);go1.append(sb);
  if(ei<ENTRIES.length-1){const nb=document.createElement('button');nb.type='button';nb.className='pb';nb.textContent='Skip to next entry';nb.onclick=()=>openAbout(ei+1);go1.append(nb)}
  aboutIn.append(go1);
  about.hidden=false;about.scrollTop=0;history.replaceState(null,'',`#${e.id}`)}

/* theme */
const THMK='genai-park-theme',tb=$('#theme');
const isDark=()=>{const t=document.documentElement.dataset.theme;return t?t==='dark':matchMedia('(prefers-color-scheme: dark)').matches};
const syncT=()=>{tb.textContent=isDark()?'☀':'☾';tb.title=isDark()?'Light theme':'Dark theme'};
tb.onclick=()=>{const t=isDark()?'light':'dark';document.documentElement.dataset.theme=t;try{localStorage.setItem(THMK,t)}catch(e){}syncT()};syncT();

/* start */
const OLDH={e2020a:'2020s',e2020:'2020d',e2022a:'2022r',e2022b:'2022c',e2023a:'2023r',e2023b:'2023m'};
function route(){const m=location.hash.slice(1).split('/');if(/^e\d{4}[ab]?$/.test(m[0]))m[0]=OLDH[m[0]]||m[0].slice(1);let ei=ENTRIES.findIndex(e=>e.id===m[0]);if(ei<0)ei=0;
  if(m[1])go(ei,+m[1]-1,false);else openAbout(ei)}
route();if(!window.katex)addEventListener('load',()=>{builtFor=-1;if(about.hidden)go(cur,step,false);else openAbout(cur)});
})();
