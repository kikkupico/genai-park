/* The full-page explanation shown before each entry's walkthrough.
   Paragraphs may use $…$ for inline TeX; `eq` is display TeX; `fig.step` is a step index of the
   entry whose graph state is drawn as the figure. */
window.ABOUT={
picture:{lede:'Every model in this guide does one thing: given the text so far, it says how likely each possible next token is. The rest is detail about how that distribution is computed.',sections:[
 {h:'What a generative model does',p:[
  'A language model is a function. Give it the tokens written so far, $x_{<t}$, and it returns a probability for every token in the vocabulary. Generation repeats one move: draw a token from that distribution, append it to the text, and ask again. The text that comes out is nothing more than the sequence of draws.',
  'So the probability of a whole text is the product of the probabilities of each of its tokens given everything before it:'],
  say:'The probability of a whole text is the product of each token’s probability given the tokens before it.',eq:String.raw`p_\theta(x_{1:T})=\prod_{t=1}^{T}p_\theta(x_t\mid x_{<t})`},
 {h:'Drawing it as a graph',p:[
  'Draw each token as a node. The text written so far becomes a path through the nodes, and the next-token distribution becomes a fan of edges leaving the end of that path, wide where a token is likely and thin where it is not.'],
  fig:{step:1,cap:'The path is the text so far. The orange fan is the distribution over the next token; its widths sum to one.'}},
 {h:'There is no fixed map',p:[
  'It is tempting to picture a road network that every text follows. That is wrong for every model after 1948. The model computes a fresh fan each time from the whole path, so the same node can have very different fans depending on how you got there. That is why we only ever draw the path and its fan.',
  'Each entry in this guide is, at heart, an answer to one question: how much of the path can the fan depend on, and how is that dependence learned?'],
  fig:{step:9,cap:'Three paths that all end at “it”, with three different fans. The fan is a function of the path, not of the node.'}},
 {h:'How to read the walkthroughs',p:[
  'Under the graph is a tape: the tokens in order, since a path can visit the same node twice. A dashed bracket on the tape marks what the model actually looks at. Step through with Next or the arrow keys; each step’s equation opens when you reach it. The Key in the corner lists the symbols.']},
]},
'1948':{lede:'Shannon turned “how predictable is English?” into a number, and built the first language models by counting.',sections:[
 {h:'The problem',p:[
  'Before 1948 there was no quantitative definition of information, and no way to say how predictable a language is. Shannon modelled a source of text as a random process that emits one symbol at a time, each with a probability that depends on the symbols before it. Meaning was deliberately out of scope: only the statistics mattered.']},
 {h:'The idea: count, then normalise',p:[
  'Estimate those probabilities from text. For a bigram model, count how often each pair of adjacent tokens $(a,b)$ appears, and divide by how often $a$ appears. An $n$-gram model does the same with the last $n-1$ tokens as context.'],
  say:'The estimated chance that b follows a is the number of times the pair (a, b) appears, divided by the number of times a appears.',eq:String.raw`\hat p(b\mid a)=\frac{c(a,b)}{c(a)}`,
  fig:{step:1,cap:'From the two-sentence corpus below, every edge is a counted pair, normalised out of each node. For this model, and only this one, the edges really are a fixed table.'}},
 {h:'The limit: a fixed window',p:[
  'The model sees only the bracket. Once the subject has slipped out of it, the model cannot tell which verb fits, and produces text that is locally fine but globally inconsistent.',
  'Widening the window does not rescue it. There are $|V|^{n-1}$ possible contexts, and almost all of them never occur in any corpus, so their counts are zero. Much of the next fifty years is about escaping this trade-off.'],
  fig:{step:4,cap:'The bigram sees only “it”, so it is 50/50 between “meowed” and “flew”, and here it picks the wrong one.'}},
]},
'1958':{lede:'Rosenblatt’s perceptron set its weights from examples instead of by hand: the first machine that learned.',sections:[
 {h:'The problem',p:[
  'Early pattern recognisers used rules and weights chosen by people. Rosenblatt asked whether a machine could find the weights itself from labelled examples.']},
 {h:'The idea: a unit that learns from its mistakes',p:[
  'A perceptron takes a weighted sum of its inputs plus a bias, and outputs 1 if the sum is positive. When it gets an example wrong, each weight moves by its input times the error. When it is right, nothing changes.'],
  say:'The unit outputs 1 if the weighted sum of its inputs plus the bias is positive, and 0 otherwise. After each example, move every weight by the learning rate times the error times that weight’s input. When the prediction is right the error is zero, so nothing changes.',eq:String.raw`\hat y=\mathbb 1\big[w^\top x+b>0\big],\qquad w\leftarrow w+\eta\,(y-\hat y)\,x`,
  fig:{step:0,cap:'Inputs feed one unit through weighted edges. Width is the size of the weight; dashed means negative.'}},
 {h:'The geometry',p:[
  'The weights draw a line through the space of inputs. Everything on one side fires and everything on the other does not, and each mistake nudges that line. If any line separates the classes, the rule is guaranteed to find one after finitely many mistakes.'],
  fig:{step:4,cap:'After a few corrections the line puts only (1,1) on the firing side: AND is learned.'}},
 {h:'The limit',p:[
  'XOR fires when exactly one input is on, and no single line can separate those points. Minsky and Papert made this limit famous in 1969, and it stalled neural network research for over a decade. The fix needs hidden units, and a way to train them.'],
  fig:{step:5,cap:'With XOR, any line leaves at least one point (red ring) on the wrong side.'}},
]},
'1986':{lede:'Backpropagation made networks with hidden layers trainable, and the hidden units turned out to invent their own features.',sections:[
 {h:'The problem',p:[
  'A hidden layer can represent XOR, but how do you set its weights? The perceptron rule needs a target for every unit, and hidden units have none: only the output is ever told what it should have been.']},
 {h:'The idea: pass the blame back',p:[
  'Use smooth units (a sigmoid instead of a hard threshold), so that the error changes smoothly with every weight. The chain rule then gives the gradient of the error for every weight, and it can be computed backwards layer by layer, at about the cost of one forward pass. Each unit’s share of the blame is the sum of the blame of the units it feeds, weighted by the edges.'],
  say:'A weight’s gradient is the blame at the unit it feeds times the activity coming in. A unit’s blame is the weighted sum of the blame of the units it feeds, scaled by its own slope.',eq:String.raw`\frac{\partial \mathcal{L}}{\partial w_{ij}}=\delta_j\,a_i,\qquad \delta_i=\sigma'(z_i)\sum_j w_{ij}\,\delta_j`,
  fig:{step:2,cap:'Signal flows forward; error flows back along the same edges, split by the weights.'}},
 {h:'What it found',p:[
  'Rumelhart, Hinton and Williams showed that the hidden units, given no instructions, learn useful features of their own. Here one becomes roughly OR, the other roughly AND, and the output learns “OR and not AND”, which is XOR. Almost every model after this point is trained this way.'],
  fig:{step:4,cap:'Two hidden units draw two lines; the band between them is XOR.'}},
]},
'1990':{lede:'Recurrent networks gave language models a memory that is not limited to a fixed window.',sections:[
 {h:'The problem',p:[
  'An $n$-gram model forgets everything outside its window, and a wider window is hopeless to estimate. We want a model whose memory is not fixed in advance.']},
 {h:'The idea: carry a state',p:[
  'Keep a hidden vector $h_t$ and update it at every token from the previous state and the new token. The fan is read from the state. In principle the state can carry information from any distance, and the whole update is trained by backpropagation through time.'],
  say:'The new state is computed from the previous state and the current token, by the same learned function at every step. The next-token distribution is read off the hidden state by a linear map followed by a softmax.',eq:String.raw`h_t=f_\theta(h_{t-1},x_t),\qquad p_\theta(\cdot\mid x_{<t})=\operatorname{softmax}(V h_{t-1})`,
  fig:{step:1,cap:'The bar under each token is the state. At “it” it still holds “cat”, and the fan leans to “meowed”.'}},
 {h:'The limits, and the LSTM',p:[
  'In practice the memory fades. The gradient through a long chain is a product of many factors and tends to vanish, so the network cannot learn long-range links. The LSTM (Hochreiter and Schmidhuber, 1997) adds a gated cell that is copied forward almost unchanged, which keeps both memory and gradient alive.',
  'A second limit remains: $h_t$ needs $h_{t-1}$, so training must step through a text one token at a time. That is what the transformer removes.'],
  fig:{step:4,cap:'With a gated cell, the memory of “cat” survives eight tokens.'}},
]},
'2012':{lede:'AlexNet showed that a large convolutional network trained on GPUs beats hand-built vision systems, and started the deep-learning era.',sections:[
 {h:'The problem',p:[
  'Image recognition relied on features designed by hand. Neural networks could in principle learn them, but an image has hundreds of thousands of inputs, and wiring every pixel to every unit needs billions of weights.'],
  fig:{step:0,cap:'Full connections: every pixel feeds every unit.'}},
 {h:'The idea: local, shared, stacked',p:[
  'A convolutional layer connects each unit only to a small patch of the image, and uses the same small set of weights (a filter) at every position. A filter that detects an edge detects it anywhere, and the number of weights drops from billions to thousands. Stacking layers widens what each unit sees, so edges combine into parts and parts into objects. These ideas go back to LeCun’s convolutional networks of 1989.'],
  say:'Each unit applies the same small set of weights to its own patch of neighbouring inputs, then squashes the result.',eq:String.raw`h_j=\sigma\Big(\sum_k w_k\,x_{j+k}\Big)`,
  fig:{step:2,cap:'The same three weights (one colour each) slide along the row of pixels.'}},
 {h:'What changed in 2012',p:[
  'Krizhevsky, Sutskever and Hinton trained an eight-layer network with 60 million parameters on 1.2 million labelled ImageNet images, using two GPUs, ReLU units and dropout. Top-5 error fell from 26% to 15%. The lesson that scale plus learning beats hand design carried straight over to language.']},
]},
'2013':{lede:'VAEs and GANs learned to generate new images: a random seed goes in, an image comes out, in one pass.',sections:[
 {h:'The problem',p:[
  'A classifier maps an image to a label. Generating goes the other way: we need a model of images themselves, with millions of pixels that must agree with each other. Writing one pixel at a time is possible but slow.']},
 {h:'The idea: learn a map from noise to images',p:[
  'Draw a seed $z$ from a simple distribution and pass it through a network $G_\\theta$ that outputs an image. The question is how to train $G_\\theta$ when there is no “correct” image for a random seed.']},
 {h:'VAE: rebuild real images',p:[
  'Kingma and Welling added an encoder that maps a real image to a code $z$, and trained the decoder to rebuild the image from it. A penalty keeps the codes close to the simple seed distribution, so random seeds also decode to plausible images. The pixel-wise loss averages over possibilities, so samples come out blurry.'],
  say:'The VAE objective rewards rebuilding the image well from its code, minus a penalty for codes that stray from a standard Gaussian.',eq:String.raw`\mathcal{L}=\mathbb{E}_{q_\phi(z\mid x)}\big[\log p_\theta(x\mid z)\big]-\operatorname{KL}\big(q_\phi(z\mid x)\,\|\,\mathcal{N}(0,I)\big)`,
  fig:{step:1,cap:'Image → encoder → code → decoder → rebuilt image.'}},
 {h:'GAN: fool a judge',p:[
  'Goodfellow and colleagues trained a second network, the discriminator, to tell real images from generated ones, and trained the generator to fool it. Its gradient flows back through the image into the generator. Samples are sharp, but training is a two-player game and often unstable.'],
  say:'The discriminator tries to score real images high and generated ones low; the generator tries to make its images score high.',eq:String.raw`\min_G\max_D\ \mathbb{E}\log D(x)+\mathbb{E}\log\big(1-D(G(z))\big)`,
  fig:{step:3,cap:'The discriminator compares generated and real images.'}},
]},
'2017':{lede:'The transformer dropped the recurrent state: every position looks straight back at every earlier token.',sections:[
 {h:'The problem',p:[
  'Recurrent networks read text one token at a time, so training cannot be spread across a sequence, and information still fades over distance. Attention (2014) had already let translation models look directly back at the source sentence.']},
 {h:'The idea: attention is all you need',p:[
  'Vaswani and colleagues removed recurrence. Each position forms a query, every earlier position offers a key and a value, and the position takes a weighted average of the values, weighted by how well its query matches each key. A mask stops any position seeing the future. Many such heads run in parallel, in dozens of layers.'],
  say:'Each position takes a weighted average of value vectors, weighted by a softmax of query–key similarity, with future positions masked out.',eq:String.raw`\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\!\Big(\frac{QK^\top}{\sqrt{d_k}}+M\Big)V`,
  fig:{step:2,cap:'Arcs on the tape are attention weights. “it” attends mostly to “cat”, and the fan follows.'}},
 {h:'Why it won',p:[
  'Nothing is carried from one position to the next, so every position of a training text is computed at once, and any earlier token is one step away no matter how far back it is. That made it practical to train on vastly more text. The price is that each position attends to all earlier ones, so cost grows with the square of the length.'],
  fig:{step:4,cap:'In training every position draws its arcs at the same time.'}},
]},
'2020d':{lede:'Diffusion models generate an image in many small denoising steps instead of one stroke.',sections:[
 {h:'The problem',p:[
  'One-pass generators had to get everything right at once: VAEs were blurry, GANs were sharp but hard to train. A model that could fix its own mistakes along the way would avoid both problems.']},
 {h:'The idea: learn to undo noise',p:[
  'Take a real image and add a little Gaussian noise, again and again, until only noise is left. This forward process is fixed; nothing is learned. Then train one network to undo a single step: given a noisy image and the step number, predict the noise that was added. The loss is a plain squared error.'],
  say:'Train the network to predict the noise that was added to a noisy image, scored by squared error.',eq:String.raw`\mathcal{L}=\mathbb{E}\,\big\|\varepsilon-\varepsilon_\theta(x_t,t)\big\|^2`,
  fig:{step:1,cap:'Forward: each node is the image with a little more noise.'}},
 {h:'Generating',p:[
  'Start from fresh noise and apply the denoiser over and over. Each draft corrects the last, so early mistakes can be fixed. Ho, Jain and Abbeel (2020, building on Sohl-Dickstein and colleagues, 2015) showed this matches or beats GANs on quality. It is slow, with hundreds of steps, but stable, and it underlies most image generators since.'],
  fig:{step:4,cap:'Reverse: the learned denoiser runs from noise to a picture.'}},
]},
'1950':{lede:'Turing replaced “can machines think?” with a game a machine could be scored on: can a judge tell its text from a person’s?',sections:[
 {h:'The problem',p:[
  '“Can machines think?” had no agreed meaning, so it could not be answered. Turing swapped it for a test with a definite outcome. A judge exchanges typed messages with two hidden players, a person and a machine, and must say which is which. If the judge cannot reliably tell, the machine passes.'],
  fig:{step:0,cap:'Two sources, one judge. The judge sees nothing but text.'}},
 {h:'The idea in modern form',p:[
  'Read as statistics, the game asks whether samples from a model $p_\\theta$ can be told apart from samples of human text $p_{\\text{data}}$. Training a language model is the same game made into an objective: make the model’s distribution match the data’s. At each token the score is the probability the model gave to the token the person actually wrote, and the average of $-\\log$ of that is the cross-entropy loss that almost every model in this guide minimises.'],
  say:'The cross-entropy loss: the average, over positions, of minus the log-probability the model gave to the token that actually came next.',eq:String.raw`\mathcal{L}(\theta)=-\frac{1}{T}\sum_{t=1}^{T}\log p_\theta(x_t\mid x_{<t})`,
  fig:{step:3,cap:'The loss at a step is −log of the width of the edge the human actually took.'}},
 {h:'What it left open',p:[
  'The test, and the loss that descends from it, scores how human the text looks, not whether it is true. “Walking was written by Emerson” is as fluent as the true sentence. Turing also proposed training a “child machine” rather than programming an adult one: the choice between learned and hand-written systems, made in 1950. Scoring outputs by an outcome, rather than by resemblance, came much later, with RLHF.'],
  fig:{step:4,cap:'Both sentences pass. Only one is right.'}},
]},
'1966':{lede:'ELIZA held conversations with no learning at all: hand-written rules cut up the input and pasted the pieces into fixed templates.',sections:[
 {h:'The problem',p:[
  'In the 1960s there was no large digital text corpus, and the learning methods of the day could only classify simple patterns. Any conversational behaviour had to be written down explicitly. Weizenbaum’s best-known script, DOCTOR, imitated a Rogerian therapist, a style that mostly reflects the user’s statements back and so needs no knowledge of the world.']},
 {h:'The idea: decompose and reassemble',p:[
  'A script is a ranked list of keywords. Each keyword has decomposition patterns that split the input into numbered segments, and reassembly templates that build the reply from those segments, with pronouns swapped (“my” becomes “your”). When no keyword matches, the program emits a stock line such as “Please go on.”'],
  say:'The reply is the template filled in with the segments that the pattern cut out of the input.',eq:String.raw`y=r\big(d(x)\big)`,
  fig:{step:2,cap:'The pattern cuts the input into four segments; the template copies segment 3.'}},
 {h:'Why it mattered',p:[
  'The reply is a deterministic function of the input, with no probabilities and nothing fit to data. Every possible reply was, in form, written by the script author. People still confided in it, which Weizenbaum found troubling: the “ELIZA effect”. Hand-written rules dominated symbolic AI and the expert systems of the 1970s and 80s. They are transparent and brittle: inputs outside the rules get no meaningful answer, and natural language is far too large to cover by hand.']},
]},
'1989':{lede:'Hidden Markov models made speech recognition statistical: the designer draws the structure, and recordings fill in the numbers.',sections:[
 {h:'The problem',p:[
  'Rule-based speech recognisers, built on phonetic knowledge written by experts, did not hold up against real speakers, accents and noise. From the 1970s, groups at IBM and Carnegie Mellon modelled speech probabilistically instead, with parameters estimated from recorded data. Rabiner’s 1989 tutorial became the standard reference.']},
 {h:'The idea: hidden states that emit sounds',p:[
  'A word is a chain of hidden states, roughly one per phone. Each state can stay put or move on, with learned transition probabilities $a_{ij}$, and each emits acoustic frames from a learned density $b_j$. Only the frames are observed. The probability of the frames and a state path is a product along the path.'],
  say:'The joint probability of the sounds and a hidden state path: the start probability, times, at every step, the probability of moving to the next state and of that state producing the observed sound.',eq:String.raw`p(o_{1:T},s_{1:T}\mid\lambda)=\pi_{s_1}b_{s_1}(o_1)\prod_{t=2}^{T}a_{s_{t-1}s_t}\,b_{s_t}(o_t)`,
  fig:{step:3,cap:'The state path and the frames it emits. Self-loops let a phone last several frames.'}},
 {h:'Three problems, three algorithms',p:[
  'Evaluation sums over every state path with the forward recursion in $O(N^2T)$ time, so a recogniser can score each word model and pick the best. Decoding finds the single most likely path with Viterbi, which aligns frames to phones. Learning re-estimates the numbers with Baum–Welch, an instance of expectation–maximisation.',
  'That split, hand-designed structure with learned parameters, defined statistical AI until deep learning. The state set, the topology and the acoustic features were all still engineered, and from around 2012 neural networks began replacing them.'],
  fig:{step:5,cap:'The numbers are learned; the shape of the graph is not.'}},
]},
'2000':{lede:'Neural language models gave every word a learned vector, so that what is learned about one word carries over to similar words.',sections:[
 {h:'The problem',p:[
  'An n-gram model treats each word as an atomic symbol. Counts for “the cat ran” say nothing about “the dog ran”. Bengio and colleagues called this the curse of dimensionality: a joint model of ten words over a 100,000-word vocabulary has about $10^{50}$ free parameters, and no corpus can pin down more than a sliver of them.'],
  fig:{step:0,cap:'To counts, every word is equally unrelated to every other.'}},
 {h:'The idea: learned word vectors',p:[
  'Map each word to a vector $C(w)$ of a few dozen learned numbers. To predict the next word, concatenate the vectors of the previous few words and pass them through a small network ending in a softmax. The vectors and the network are trained together. Words that predict similar contexts end up with similar vectors, and because the network is smooth, probability given to one sentence spreads to its neighbours.'],
  say:'Look up a vector for each of the previous words, concatenate them, pass them through a tanh layer, and turn the result into next-word probabilities with a softmax.',eq:String.raw`p_\theta(x_t\mid x_{t-n+1:t-1})=\operatorname{softmax}\big(b+Wv+U\tanh(d+Hv)\big)`,
  fig:{step:3,cap:'“dog” sits next to “cat”, so a prediction learned after “the cat” transfers.'}},
 {h:'word2vec, and what followed',p:[
  'The softmax over the whole vocabulary was expensive. word2vec (2013) dropped the hidden layer and learned only the vectors, predicting each word’s neighbours with cheap approximations, on billions of words. The space turned out to have linear structure: king − man + woman lands near queen. Every neural language model since begins by looking up a learned embedding for each token. The context, though, was still a fixed window of a few words.'],
  fig:{step:4,cap:'The same offset takes man to woman and king to queen.'}},
]},
'2014':{lede:'Neural translation first squeezed a whole sentence into one vector, then learned to look back at every source word as it wrote.',sections:[
 {h:'The problem',p:[
  'Machine translation in 2014 meant phrase-based statistical systems: phrase tables, an n-gram language model, and many separately tuned parts. Sutskever and colleagues replaced the pipeline with one network trained end to end. An encoder LSTM reads the source; its final state $v$ starts a decoder LSTM that writes the translation.'],
  say:'The translation is generated one word at a time, each conditioned on a single fixed vector that summarises the source, and on the words so far.',eq:String.raw`p(y\mid x)=\prod_i p(y_i\mid v,\,y_{<i})`,
  fig:{step:1,cap:'Everything the decoder knows about the French passes through v.'}},
 {h:'The idea: attention',p:[
  'Bahdanau, Cho and Bengio showed quality fell on long sentences, as you would expect if one vector is a bottleneck. Their fix kept every encoder state $h_j$. At each output step the decoder scores every source position against its own state, turns the scores into weights with a softmax, and reads a weighted average of the encoder states. The weights are recomputed at every step.'],
  say:'Each output step’s context is a weighted sum of all encoder states, with weights from a softmax over alignment scores.',eq:String.raw`c_i=\sum_j\alpha_{ij}h_j,\qquad \alpha_{ij}=\operatorname{softmax}_j\big(a(s_{i-1},h_j)\big)`,
  fig:{step:2,cap:'Writing “European”, the decoder puts 0.80 of its weight on “européenne”.'}},
 {h:'What it changed, and what it left',p:[
  'Plotted as a matrix, the weights are a soft alignment, and they showed the model had learned French adjective–noun order unaided. By 2016 Google’s production translator was an LSTM encoder–decoder with attention. But the decoder still carried a recurrent state, so step $i$ had to wait for step $i-1$. The transformer kept the attention and dropped the recurrence.'],
  fig:{step:4,cap:'The alignment matrix. Off-diagonal cells are reordering.'}},
]},
'2018':{lede:'GPT showed that one model pretrained on raw text could be turned to almost any task, and GPT-3 showed the task could simply be written into the prompt.',sections:[
 {h:'The problem',p:[
  'Until 2018, most language tasks used separate models trained on their own labelled data. Pretrained word vectors were shared; little else was. The open question was whether pretraining a whole model on raw text would transfer.']},
 {h:'The idea: pretrain, then adapt',p:[
  'GPT (2018) pretrained a transformer decoder on about 7,000 books with plain next-token prediction, then fine-tuned it on each task with a small head. GPT-2 (2019, 1.5B parameters) skipped fine-tuning: since a task is just a conditional distribution, it can be specified in the text, as when appending “TL;DR:” to an article yields a summary.'],
  say:'Pretrain by maximising the likelihood of each next token over raw text; use the model by sampling a continuation of a prompt.',eq:String.raw`\text{pretrain: }\min_\theta\,-\sum_t\log p_\theta(x_t\mid x_{<t}),\qquad \text{use: }y\sim p_\theta(\cdot\mid c)`,
  fig:{step:2,cap:'Zero-shot: the task is in the prompt, and the fan is spread.'}},
 {h:'In-context learning',p:[
  'GPT-3 (2020, 175B parameters) did tasks from a description and a handful of examples in the context window, with no gradient updates at all. The parameters stay fixed; the task is inferred from the prompt. Few-shot ability improved steadily with model size, which raised the question of how much better a bigger model would be.'],
  fig:{step:3,cap:'One worked example in the prompt, and the fan sharpens on “fromage”.'}},
]},
'2020s':{lede:'Test loss falls as a smooth power law in model size, data and compute, so the result of a huge training run can be predicted from small ones.',sections:[
 {h:'The problem',p:[
  'By 2019 it was clear that bigger language models did better, but not how much better, or how to split a fixed compute budget between model size and data. Kaplan and colleagues measured this systematically, over many training runs spanning more than seven orders of magnitude.']},
 {h:'The finding: straight lines on log–log axes',p:[
  'Cross-entropy loss follows a power law in parameters $N$, tokens $D$ and compute $C\\approx6ND$, as long as the other two are not the bottleneck. The exponents are small, so returns are slow but steady: ten times the parameters cuts loss by about 16%. Depth versus width mattered far less than the total count. Because a power law is a straight line on log–log axes, a fit on small runs predicts larger ones.'],
  say:'Loss falls as a power of model size: ten times the parameters gives about 16% lower loss.',eq:String.raw`L(N)\approx\Big(\frac{N_c}{N}\Big)^{\alpha_N},\qquad \alpha_N\approx0.076`,
  fig:{step:2,cap:'Fit the line on small runs, then read off the big one.'}},
 {h:'Chinchilla, and the limit of the law',p:[
  'Hoffmann and colleagues (2022) redid the allocation analysis and found model size and data should grow together, about 20 tokens per parameter. Their 70B-parameter Chinchilla, trained on 1.4T tokens, beat the 280B Gopher trained with the same compute. Many large models had been undertrained.',
  'What the law predicts is loss: how well the model matches human text. It says nothing directly about truthfulness or helpfulness, which need a different training signal.'],
  fig:{step:3,cap:'At a fixed budget, a smaller model on more data wins.'}},
]},
'2021':{lede:'Classifier-free guidance lets one diffusion model push its samples harder toward the prompt, by comparing its predictions with and without it.',sections:[
 {h:'The problem',p:[
  'Diffusion models conditioned on a label or caption often followed it only loosely. Classifier guidance (Dhariwal and Nichol, 2021) fixed this with the gradient of a separate classifier trained on noisy images, which meant a second network to train and run.'],
  fig:{step:1,cap:'The classifier-guidance route: an extra network beside the denoiser.'}},
 {h:'The idea: extrapolate past the prompt',p:[
  'Ho and Salimans trained one network, replacing the prompt with a null token $\\varnothing$ for a small fraction of examples, so it learns both the conditional and the unconditional noise prediction. At each sampling step both are computed, and the result is pushed past the conditional one by a scale $w$. At $w=1$ this is the plain conditional model; above 1 it amplifies whatever the prompt adds.'],
  say:'The guided prediction starts from the unconditional prediction and moves w times as far as the conditioning moves it.',eq:String.raw`\tilde\varepsilon=\varepsilon_\theta(x_t,\varnothing)+w\,\big(\varepsilon_\theta(x_t,c)-\varepsilon_\theta(x_t,\varnothing)\big)`,
  fig:{step:3,cap:'From ε(∅) to ε(c), then w times as far.'}},
 {h:'What it changed',p:[
  'The difference between the two predictions acts as an implicit classifier, so guidance samples approximately from $p(x)\\,p(c\\mid x)^w$. Higher $w$ follows the prompt more closely with less variety; very high values oversaturate. It became the standard conditioning method for text-to-image and video, exposed as the “guidance scale”. But the prompt is still fixed before generation, and nothing scores how good the result was.'],
  fig:{step:4,cap:'Three guidance scales on the same prompt.'}},
]},
'2022r':{lede:'Reinforcement learning from human feedback trains a model on which of its answers people prefer, instead of on how closely it imitates text.',sections:[
 {h:'The problem',p:[
  'A pretrained model continues text the way its training data does. Given a question, GPT-3 might answer it, write more questions, or state a fluent falsehood, since all of these follow questions on the web. Likelihood training can only reward matching the data.'],
  fig:{step:0,cap:'Three continuations, all plausible as web text.'}},
 {h:'The idea: learn a reward, then optimise it',p:[
  'Christiano and colleagues (2017) learned a reward from people comparing pairs of outputs, for simulated robots and games. InstructGPT (2022) applied it to language in three stages: fine-tune on demonstrations; sample answers, have people rank them, and fit a reward model $r_\\phi$; then optimise the policy against $r_\\phi$ with reinforcement learning, while a KL penalty keeps it near the starting model.'],
  say:'Maximise the expected reward of the model’s outputs, minus a penalty for how far the model’s distribution moves from the reference model.',eq:String.raw`\max_\theta\ \mathbb{E}_{y\sim\pi_\theta}\big[r_\phi(x,y)\big]-\beta\,\mathrm{KL}\big(\pi_\theta\,\|\,\pi_{\text{ref}}\big)`,
  fig:{step:3,cap:'Whole answers are scored, and probability moves toward the preferred one.'}},
 {h:'Why the penalty matters',p:[
  'The reward model is an imperfect stand-in for people. Pushed too hard, the policy exploits its errors with longer, more flattering or overconfident text that scores well but that people do not prefer. Even so, labellers preferred the 1.3B InstructGPT to the 175B GPT-3. ChatGPT was trained this way. Generation itself did not change: each token is still committed in turn, without trying alternatives.'],
  fig:{step:4,cap:'Reward hacking: the reward model’s favourite is not the people’s.'}},
]},
'2022c':{lede:'Letting a model write out its reasoning before answering gives it more computation and a scratchpad, and multi-step accuracy jumps.',sections:[
 {h:'The problem',p:[
  'Large models did badly on multi-step problems such as arithmetic word problems, even when they could do each step. Asked for the answer directly, the model must emit it as the next token, after a single forward pass: a fixed amount of computation, however hard the question.'],
  fig:{step:0,cap:'One pass, one token, wrong.'}},
 {h:'The idea: think in tokens',p:[
  'Wei and colleagues changed only the worked examples in the prompt, adding the reasoning between question and answer. Large models then wrote their own reasoning on new problems. Every reasoning token buys another forward pass, and its result sits in the context, the model’s only working memory, for later passes to use.'],
  say:'First sample a reasoning sequence from the question, then sample the answer given the question and the reasoning.',eq:String.raw`z\sim p_\theta(\cdot\mid q),\qquad a\sim p_\theta(\cdot\mid q,z)`,
  fig:{step:1,cap:'Each output token is fed back in as input for the next pass.'}},
 {h:'Search, then training',p:[
  'Tree of Thoughts (2023) treated partial reasoning as a search tree: propose steps, have the model rate them, explore and backtrack. On the Game of 24, GPT-4 went from 4% with a single chain to 74% with search. Reasoning models from 2024 on, such as o1 and DeepSeek-R1, are trained with reinforcement learning to write long chains, rewarded only for a checkable final answer. Their chains grew longer and began to include self-checks. But a model cannot reason its way to a fact it never saw.'],
  fig:{step:3,cap:'Rated branches; only the promising ones are expanded.'}},
]},
'2023r':{lede:'Retrieval and tool use let other systems write into the model’s context, adding facts and abilities its parameters lack.',sections:[
 {h:'The problem',p:[
  'A model knows only what its parameters absorbed in training: nothing after the cutoff, shaky recall of rare facts, imprecise arithmetic. Generating more reasoning does not help; missing information cannot be derived.']},
 {h:'Retrieval',p:[
  'Retrieval-augmented generation (Lewis and colleagues, 2020) embeds the question and a large set of passages, retrieves the top few by inner product, and has the generator condition on each, averaging over them. The knowledge can be updated by swapping the index, without retraining.'],
  say:'The answer’s probability is averaged over the top-k retrieved documents, each weighted by how relevant the retriever finds it.',eq:String.raw`p(y\mid x)\approx\sum_{d\in\text{top-}k}p_\eta(d\mid x)\,p_\theta(y\mid x,d)`,
  fig:{step:2,cap:'The two best passages go into the context.'}},
 {h:'Tools',p:[
  'Toolformer (2023) taught a model to write API calls into its own text; each call runs and its result is spliced in before generation continues. The training data was made by the model itself: a sampled call was kept only if its result made the following text more predictable. In both cases outside information enters only as tokens in the context. Function calling, code execution and agent loops all work this way.'],
  fig:{step:3,cap:'The call and its result become part of the text.'}},
]},
'2023m':{lede:'Models trained on the output of earlier models lose the rare parts of the distribution first, and with repetition, collapse.',sections:[
 {h:'The problem',p:[
  'Language models are trained on text scraped from the web. As generated text spreads online, future training sets will contain the output of earlier models, whether anyone intends it or not. Shumailov and colleagues asked what happens when models are trained, generation after generation, on generated data.']},
 {h:'What happens',p:[
  'Each generation is fit to a finite sample of the previous one’s output. Rare events are often missing from a finite sample, so the next model gives them less probability, and the error compounds. The tails go first; the distribution narrows toward its mode. Language models fine-tuned repeatedly on their own text drifted into repetitive, degenerate output.'],
  say:'Each generation draws M samples from the previous model and fits the next model to them by maximum likelihood.',eq:String.raw`x_{1:M}^{(n)}\sim p_{\theta_n},\qquad \theta_{n+1}=\arg\max_\theta\sum_{i=1}^{M}\log p_\theta\big(x_i^{(n)}\big)`,
  fig:{step:2,cap:'After several generations, the tails are gone.'}},
 {h:'Why, and what it leaves open',p:[
  'For a Gaussian refit to its own samples, each generation multiplies the variance by a random factor whose mean is 1 but whose mean logarithm is negative, so the variance drifts to zero. Keeping original human data in each generation slows the slide, and accumulating synthetic data rather than replacing human data largely avoids it. Training on self-generated data works when an outside signal filters it, such as a checked answer or a game outcome. Where future human text will come from is still open.'],
  fig:{step:3,cap:'Four runs of the Gaussian case. The log-variance is a random walk with downward drift.'}},
]},
};
