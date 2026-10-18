(function(){
  var doc=document.documentElement;
  if('scrollRestoration' in history)history.scrollRestoration='manual';
  window.scrollTo(0,0);
  var rm=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap=typeof gsap!=='undefined'&&typeof ScrollTrigger!=='undefined';
  var pre=document.getElementById('pre');
  var nav=document.getElementById('nav');
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s));};

  /* snow sparkles on the ground */
  var sp=document.getElementById('sparkles');
  if(sp){for(var q=0;q<34;q++){var d=document.createElement('i');d.style.left=(Math.random()*100)+'%';d.style.top=(Math.random()*100)+'%';d.style.animationDelay=(Math.random()*3.2)+'s';sp.appendChild(d);}}

  /* twinkle stars in the sky */
  var stars=document.getElementById('stars');
  if(stars){for(var i=0;i<40;i++){var st=document.createElement('i');st.style.left=(Math.random()*100)+'%';st.style.top=(Math.random()*55)+'%';st.style.animationDelay=(Math.random()*3)+'s';var ss=3+Math.random()*4;st.style.width=ss+'px';st.style.height=ss+'px';stars.appendChild(st);}}

  /* ── sound: tiny sleigh bell, WebAudio, no files ── */
  var AC=window.AudioContext||window.webkitAudioContext,actx=null,muted=false;
  function bell(f,when,vol){if(muted||!actx)return;var t0=actx.currentTime+(when||0);
    [1,2.02,3.01].forEach(function(m,i){var o=actx.createOscillator(),g=actx.createGain();o.type='sine';o.frequency.value=f*m;
      g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime((vol||.16)/(i+1.4),t0+.008);g.gain.exponentialRampToValueAtTime(.0001,t0+.85);
      o.connect(g);g.connect(actx.destination);o.start(t0);o.stop(t0+.9);});}
  function jingle(){if(!actx)return;bell(1050,0,.14);bell(1400,.07,.11);bell(1750,.14,.09);}
  function fanfare(){if(!actx)return;[880,1108,1318,1760].forEach(function(f,i){bell(f,i*.11,.15);});}
  function boing(){if(!actx)return;var o=actx.createOscillator(),g=actx.createGain(),t0=actx.currentTime;o.type='triangle';
    o.frequency.setValueAtTime(180,t0);o.frequency.exponentialRampToValueAtTime(520,t0+.13);o.frequency.exponentialRampToValueAtTime(240,t0+.28);
    g.gain.setValueAtTime(.001,t0);g.gain.linearRampToValueAtTime(.12,t0+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+.34);
    o.connect(g);g.connect(actx.destination);o.start(t0);o.stop(t0+.36);}
  function audioOn(){if(!actx&&AC){try{actx=new AC();}catch(e){}}if(actx&&actx.state==='suspended')actx.resume();}
  document.addEventListener('pointerdown',audioOn,{once:true});
  var sfxBtn=document.getElementById('sfx');
  if(sfxBtn)sfxBtn.addEventListener('click',function(){muted=!muted;sfxBtn.classList.toggle('muted',muted);sfxBtn.setAttribute('aria-pressed',String(!muted));sfxBtn.setAttribute('aria-label',muted?'Turn sounds on':'Turn sounds off');if(!muted){audioOn();jingle();}});

  /* ── the cast: tap to talk ── */
  function say(ch,txt){var b=ch.querySelector('.say');if(!b)return;b.textContent=txt||ch.getAttribute('data-say');b.style.setProperty('--nx','0px');
    $$('.ch.talk').forEach(function(o){if(o!==ch)o.classList.remove('talk');});ch.classList.add('talk');
    var r=b.getBoundingClientRect(),pad=12,nx=0;if(r.left<pad)nx=pad-r.left;else if(r.right>window.innerWidth-pad)nx=window.innerWidth-pad-r.right;if(nx)b.style.setProperty('--nx',nx+'px');
    clearTimeout(ch._t);ch._t=setTimeout(function(){ch.classList.remove('talk');},2400);
    if(window.gsap&&!rm){var f=ch.querySelector('.fig');gsap.fromTo(f,{y:0,scaleX:1,scaleY:1},{keyframes:[{scaleX:1.08,scaleY:.9,duration:.12},{y:-34,scaleX:.96,scaleY:1.06,duration:.28,ease:'power2.out'},{y:0,scaleX:1.06,scaleY:.94,duration:.3,ease:'bounce.out'},{scaleX:1,scaleY:1,duration:.15}]});}}
  $$('.ch').forEach(function(ch){
    ch.addEventListener('click',function(){if(ch===deerEl&&!found.deer)return;audioOn();boing();say(ch);});
    ch.addEventListener('mouseenter',function(){if(ch!==deerEl||found.deer)say(ch);});});

  /* ── hidden-object hunt: reindeer, candy cane, golden star ── */
  var deerEl=document.getElementById('deer'),peek=document.getElementById('peek');
  var counter=document.getElementById('counter'),ctext=document.getElementById('ctext'),dots=counter?counter.querySelectorAll('.dots i'):[];
  var found={deer:false,cane:false,star:false},n=0;
  var CHEER=['Ho ho ho — you found them all!','Great eyes!','You are a natural tracker.','Now go read the book!'];
  function score(what,msg){
    if(found[what])return;found[what]=true;n++;audioOn();jingle();
    if(dots[n-1])dots[n-1].classList.add('on');
    if(ctext)ctext.textContent=n<3?(msg+' '+(3-n)+' more to find'):'You found everything!';
    if(counter&&n===3)counter.classList.add('done');
    if(n===3){fanfare();
      if(window.confettiBurst){var r=counter.getBoundingClientRect();window.confettiBurst(r.left+r.width/2,r.top);setTimeout(function(){window.confettiBurst(window.innerWidth*.3,window.innerHeight*.4);},220);}
      $$('.ch').forEach(function(ch,i){setTimeout(function(){say(ch,CHEER[i%CHEER.length]);},i*260);});}}
  function findDeer(){if(found.deer)return;
    deerEl.classList.add('found');document.getElementById('hero').classList.add('found-deer');if(peek)peek.remove();
    if(window.gsap&&!rm){gsap.to(deerEl,{y:'-22%',duration:.7,ease:'back.out(2.2)',onComplete:function(){say(deerEl);}});}else{deerEl.style.transform='none';say(deerEl);}
    score('deer','You found the Reindeer!');}
  if(peek)peek.addEventListener('click',findDeer);
  if(deerEl)deerEl.addEventListener('click',function(){if(!found.deer)findDeer();});
  ['cane','star'].forEach(function(k){
    var el=document.getElementById(k==='cane'?'cane':'gstar');if(!el)return;
    el.addEventListener('click',function(){el.classList.add('got');
      if(window.confettiBurst){var r=el.getBoundingClientRect();window.confettiBurst(r.left+r.width/2,r.top+r.height/2);}
      score(k,k==='cane'?'A lost candy cane!':'The star is lit!');});});

  /* ── click the sky: a puff of snow ── */
  var heroEl=document.getElementById('hero');
  if(heroEl)heroEl.addEventListener('click',function(e){
    if(e.target.closest('.ch,.hunt,#peek,a,button,.hero-copy'))return;
    if(window.puffSnow)window.puffSnow(e.clientX,e.clientY);audioOn();bell(1600,0,.06);});

  /* nav */
  var lastY=0;
  function navState(y){
    nav.classList.toggle('scrolled',y>40);
    if(y>lastY+6&&y>200)nav.classList.add('hide');else if(y<lastY-6)nav.classList.remove('hide');
    lastY=y;
  }

  /* background shift by viewport middle */
  var secs=$$('[data-bg]');
  var curBg='';
  function bgUpdate(){
    var mid=window.innerHeight/2,hit=null;
    for(var i=0;i<secs.length;i++){var r=secs[i].getBoundingClientRect();if(r.top<=mid&&r.bottom>mid){hit=secs[i];break;}}
    if(!hit)return;
    var bg=hit.getAttribute('data-bg');
    if(bg!==curBg){curBg=bg;document.body.style.backgroundColor=bg;nav.classList.toggle('on-ink',bg==='#2C1E2A');}
  }

  /* reveal safety: anything on screen and still hidden -> show */
  function safety(){
    var h=window.innerHeight;
    $$('.rv:not(.in)').forEach(function(el){var r=el.getBoundingClientRect();if(r.top<h*.92&&r.bottom>0)el.classList.add('in');});
  }

  function onScroll(){var y=window.scrollY||window.pageYOffset;navState(y);bgUpdate();safety();}

  if(rm||!hasGsap){
    doc.classList.add(rm?'rm':'no-js');
    if(pre&&pre.parentNode)pre.parentNode.removeChild(pre);
    $$('.rv').forEach(function(e){e.classList.add('in');});
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();
    return;
  }

  doc.classList.add('fx');
  gsap.registerPlugin(ScrollTrigger);
  var lenis=(typeof Lenis!=='undefined')?new Lenis({lerp:.09,smoothWheel:true}):null;
  if(lenis){lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(function(t){lenis.raf(t*1000);});gsap.ticker.lagSmoothing(0);
    $$('a[href^="#"]').forEach(function(a){a.addEventListener('click',function(e){var id=a.getAttribute('href');var t=id.length>1&&document.querySelector(id);if(t){e.preventDefault();lenis.scrollTo(t,{offset:-60});}});});}
  window.addEventListener('scroll',onScroll,{passive:true});
  if(lenis)lenis.on('scroll',function(){onScroll();});
  onScroll();

  /* reveals (batched) + safety */
  ScrollTrigger.batch('.rv',{start:'top 90%',onEnter:function(els){els.forEach(function(e){e.classList.add('in');});},once:true});
  window.addEventListener('load',function(){setTimeout(safety,300);setTimeout(safety,1500);});

  /* preloader -> hero */
  var h1Lines=$$('.hero-copy h1 .l > span');
  gsap.set(h1Lines,{yPercent:110});
  gsap.set('.ch:not(.ch-deer) .fig',{yPercent:60,opacity:0});
  var mob=window.matchMedia('(max-width:900px)').matches;
  var intro=gsap.timeline({defaults:{ease:'expo.out'}});
  intro.to('#pre .shield',{strokeDashoffset:0,duration:.6,ease:'power2.inOut'})
       .to('#pre .star',{scale:1,duration:.4,ease:'back.out(2)'},'-=.15')
       .to('#pre',{yPercent:-100,duration:.7,ease:'expo.inOut'},'+=.1')
       .add(function(){if(pre&&pre.parentNode)pre.parentNode.removeChild(pre);})
       .to(h1Lines,{yPercent:0,duration:1,stagger:.09},'-=.45')
       .to('.ch:not(.ch-deer) .fig',{yPercent:0,opacity:1,duration:.9,stagger:.09,ease:'back.out(1.6)',clearProps:'transform,opacity'},'<+.1')
       .from('.hero-copy .label,.hero-copy p,.hero-cta,.minibook,.hint',{y:20,opacity:0,duration:.8,stagger:.08,clearProps:'all'},'-=.7');

  /* mouse parallax on the scene */
  if(!mob){
    var layers=$$('#hero [data-depth]').map(function(el){return {el:el,d:parseFloat(el.getAttribute('data-depth')),x:gsap.quickTo(el,'x',{duration:.8,ease:'power3'}),y:gsap.quickTo(el,'y',{duration:.8,ease:'power3'})};});
    document.getElementById('hero').addEventListener('pointermove',function(e){var r=e.currentTarget.getBoundingClientRect();var nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;layers.forEach(function(l){l.x(nx*l.d*r.width*-1);l.y(ny*l.d*r.height*-.6);});},{passive:true});
  }
  /* scroll parallax: scene sinks slightly */
  gsap.to('.ch, #deer',{y:40,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero-copy',{y:-40,opacity:.4,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});

  /* falling snow (canvas) */
  (function(){var c=document.getElementById('snowc');if(!c)return;var ctx=c.getContext('2d'),flakes=[],W,H;
    function size(){W=c.width=c.offsetWidth;H=c.height=c.offsetHeight;}size();window.addEventListener('resize',size);
    var n=mob?110:240;for(var i=0;i<n;i++)flakes.push({x:Math.random()*W,y:Math.random()*H,r:1+Math.random()*2.6,s:.4+Math.random()*1.1,w:Math.random()*Math.PI*2});
    window.puffSnow=function(px,py){var r=c.getBoundingClientRect();for(var i=0;i<26;i++)flakes.push({x:px-r.left,y:py-r.top,r:1.5+Math.random()*3,s:.3+Math.random()*1.4,w:Math.random()*6.28,vx:(Math.random()-.5)*5,vy:-Math.random()*4,life:70});};
    var hero=document.getElementById('hero');
    gsap.ticker.add(function(){var rect=hero.getBoundingClientRect();if(rect.bottom<0)return;ctx.clearRect(0,0,W,H);ctx.fillStyle='rgba(255,255,255,.9)';
      for(var i=flakes.length-1;i>=0;i--){var f=flakes[i];
        if(f.life!==undefined){f.vy+=.09;f.x+=f.vx;f.y+=f.vy;f.vx*=.97;f.life--;if(f.life<=0){flakes.splice(i,1);continue;}}
        else{f.y+=f.s;f.w+=.02;f.x+=Math.sin(f.w)*.4;if(f.y>H+4){f.y=-4;f.x=Math.random()*W;}}
        ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,6.283);ctx.fill();}});})();

  /* ribbon: continuous drift + velocity skew */
  var track=document.getElementById('track');
  if(track){var clone=track.firstElementChild;for(var k=0;k<5;k++)track.appendChild(clone.cloneNode(true));
    var half=clone.getBoundingClientRect().width;
    var base=gsap.to(track,{x:-half,duration:18,ease:'none',repeat:-1});
    var proxy={skew:0},clamp=gsap.utils.clamp(-14,14);
    ScrollTrigger.create({onUpdate:function(self){var v=clamp(self.getVelocity()/-220);if(Math.abs(v)>Math.abs(proxy.skew)){proxy.skew=v;gsap.to(proxy,{skew:0,duration:.6,ease:'power3',overwrite:true,onUpdate:function(){gsap.set('.ribbon',{skewX:proxy.skew});}});}
      base.timeScale(self.direction===-1?-1.5:1.5);gsap.to(base,{timeScale:self.direction===-1?-1:1,duration:.8,overwrite:'auto'});}});
  }

  /* the trail: pinned horizontal rail + boot prints + Santa marker */
  function buildTrail(){
    var rail=document.getElementById('rail');
    if(!rail)return;
    var pathEl=document.querySelector('#trail .path');
    var tl=gsap.timeline({scrollTrigger:{trigger:'#trail',start:'top top',end:function(){return '+='+(rail.scrollWidth-window.innerWidth+400);},pin:true,scrub:.6,anticipatePin:1,invalidateOnRefresh:true}});
    tl.to(rail,{x:function(){return -(rail.scrollWidth-window.innerWidth);},ease:'none'},0)
      .fromTo('#marker',{x:0},{x:function(){return pathEl.getBoundingClientRect().width;},ease:'none'},0)
      .to('#trail .print',{opacity:1,stagger:.08,ease:'none',duration:.9},0.05);
    return tl;
  }
  ScrollTrigger.matchMedia({
    '(min-width:901px)':function(){buildTrail();},
    '(max-width:900px)':function(){gsap.set('#trail .print',{opacity:1});gsap.fromTo('#marker',{x:0},{x:function(){return document.querySelector('#trail .path').getBoundingClientRect().width-60;},ease:'none',scrollTrigger:{trigger:'#trail',start:'top 70%',end:'bottom 40%',scrub:.5}});}
  });

  /* the reason: star rises */
  gsap.from('#bigstar',{y:70,scale:.6,transformOrigin:'50% 50%',opacity:0,ease:'expo.out',duration:1.2,scrollTrigger:{trigger:'#reason',start:'top 70%'}});

  /* series cards fan from a stack */
  var cards=$$('#stack .card');
  if(!mob&&cards.length){
    gsap.set(cards,{opacity:0,y:60,rotation:function(i){return (i-1)*-6;},x:function(i){return (1-i)*140;}});
    var fanned=false;
    function fan(){if(fanned)return;fanned=true;gsap.to(cards,{opacity:1,y:0,rotation:0,x:0,duration:1.1,ease:'expo.out',stagger:.1,clearProps:'transform,opacity'});}
    ScrollTrigger.create({trigger:'#stack',start:'top 80%',once:true,onEnter:fan});
    var fanSafety=function(){var r=document.getElementById('stack').getBoundingClientRect();if(r.top<window.innerHeight&&r.bottom>0)fan();};
    window.addEventListener('scroll',fanSafety,{passive:true});if(lenis)lenis.on('scroll',fanSafety);
  }

  /* stamp rotates with scroll */
  gsap.to('#stamp',{rotation:180,ease:'none',scrollTrigger:{trigger:'#join',start:'top bottom',end:'bottom top',scrub:true}});

  /* ── kid fun: confetti, poppable boot prints, spinning star ── */
  (function(){
    var c=document.getElementById('conf');if(!c)return;var ctx=c.getContext('2d'),bits=[];
    function size(){c.width=window.innerWidth;c.height=window.innerHeight;}size();window.addEventListener('resize',size);
    var cols=['#B4202B','#3F8F3C','#F5B98A','#FBE8D2','#B45A3C','#FFF'];
    window.confettiBurst=function(x,y){for(var i=0;i<70;i++)bits.push({x:x,y:y,vx:(Math.random()-.5)*11,vy:-Math.random()*13-3,g:.34,r:Math.random()*7+4,a:Math.random()*6,va:(Math.random()-.5)*.35,c:cols[(Math.random()*cols.length)|0],l:110});};
    gsap.ticker.add(function(){if(!bits.length){return;}ctx.clearRect(0,0,c.width,c.height);
      for(var i=bits.length-1;i>=0;i--){var b=bits[i];b.vy+=b.g;b.x+=b.vx;b.y+=b.vy;b.a+=b.va;b.l--;
        ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.a);ctx.fillStyle=b.c;ctx.globalAlpha=Math.max(0,Math.min(1,b.l/40));ctx.fillRect(-b.r/2,-b.r/2,b.r,b.r*.6);ctx.restore();
        if(b.l<=0||b.y>c.height+40)bits.splice(i,1);}
      if(!bits.length)ctx.clearRect(0,0,c.width,c.height);});
    $$('[data-cur="big"]').forEach(function(el){el.addEventListener('click',function(e){var r=el.getBoundingClientRect();window.confettiBurst(r.left+r.width/2,r.top+r.height/2);});});
  })();
  $$('#trail .print').forEach(function(h){h.addEventListener('click',function(){h.classList.remove('pop');void h.getBoundingClientRect();h.classList.add('pop');});});
  var bs=document.getElementById('bigstar');
  if(bs)bs.addEventListener('click',function(){bs.classList.remove('spin');void bs.getBoundingClientRect();bs.classList.add('spin');if(window.confettiBurst){var r=bs.getBoundingClientRect();window.confettiBurst(r.left+r.width/2,r.top+r.height/2);}});

  var rt;window.addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(function(){if(lenis)lenis.resize();ScrollTrigger.refresh();},150);});
  window.addEventListener('load',function(){setTimeout(function(){if(lenis)lenis.resize();ScrollTrigger.refresh();},400);});
})();
