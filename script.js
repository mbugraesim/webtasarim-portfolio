function playWelcomeIntro(){
  const intro=document.getElementById('welcome-screen');
  if(!intro)return;
  const target=document.querySelector('.site-header .brand > span');
  const logo=intro.querySelector('.welcome-screen__logo');
  const backdrop=intro.querySelector('.welcome-screen__backdrop');
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  const animations=[];
  const previousVisibility=target?.style.visibility;
  const finish=()=>{
    animations.forEach(animation=>animation.cancel());
    if(target)target.style.visibility=previousVisibility;
    intro.remove();
    for(const event of ['wheel','touchstart','pointerdown','keydown','resize']){
      window.removeEventListener(event,finish);
    }
    motionPreference.removeEventListener('change',finish);
  };
  if(!target||motionPreference.matches||typeof logo.animate!=='function'){finish();return;}
  const destination=target.getBoundingClientRect();
  const targetStyle=getComputedStyle(target);
  intro.classList.add('is-playing');
  const origin=logo.getBoundingClientRect();
  const scale=destination.width/origin.width;
  const dx=destination.left+destination.width/2-origin.left-origin.width/2;
  const dy=destination.top+destination.height/2-origin.top-origin.height/2;
  logo.style.background=targetStyle.background;
  logo.style.borderRadius=targetStyle.borderRadius.includes('%')
    ? targetStyle.borderRadius
    : `${parseFloat(targetStyle.borderRadius)/scale}px`;
  logo.style.fontFamily=targetStyle.fontFamily;
  logo.style.fontWeight=targetStyle.fontWeight;
  logo.style.fontSize=`${parseFloat(targetStyle.fontSize)/scale}px`;
  logo.style.letterSpacing='0';
  // The real logo stays hidden until its animated copy lands on it.
  target.style.visibility='hidden';
  const arrival=logo.animate([
    {offset:0,opacity:0,transform:'translate(0, 0) scale(.18)',boxShadow:'0 0 0 transparent'},
    {offset:.28,opacity:1,transform:'translate(0, 0) scale(1.08)',boxShadow:'0 20px 60px #315bea30'},
    {offset:.46,opacity:1,transform:'translate(0, 0) scale(1)',boxShadow:'0 20px 60px #315bea30'},
    {offset:1,opacity:1,transform:`translate(${dx}px, ${dy}px) scale(${scale})`,boxShadow:'0 0 0 transparent'}
  ],{duration:2100,easing:'cubic-bezier(.45, 0, .2, 1)',fill:'forwards'});
  animations.push(arrival,backdrop.animate([{opacity:1},{opacity:0}],
    {duration:850,delay:1000,easing:'ease-in-out',fill:'forwards'}));
  arrival.finished.then(finish).catch(()=>{});
  intro.addEventListener('animationend',event=>{
    if(event.target===intro)finish();
  });
  for(const event of ['wheel','touchstart','pointerdown','keydown','resize']){
    window.addEventListener(event,finish,{passive:true});
  }
  motionPreference.addEventListener('change',finish);
}

const menuButton=document.querySelector('.menu-button');
const mobileNav=document.querySelector('.mobile-nav');
menuButton.addEventListener('click',()=>{const open=menuButton.classList.toggle('open');mobileNav.classList.toggle('open',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç');mobileNav.setAttribute('aria-hidden',String(!open))});
mobileNav.addEventListener('click',e=>{if(e.target.matches('a')){menuButton.classList.remove('open');mobileNav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');mobileNav.setAttribute('aria-hidden','true')}});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.getElementById('year').textContent=new Date().getFullYear();

const glow=document.querySelector('.cursor-glow');
if(matchMedia('(pointer:fine)').matches){
  window.addEventListener('pointermove',e=>{glow.style.transform=`translate3d(${e.clientX-220}px,${e.clientY-220}px,0)`},{passive:true});
}

function setupInteractiveVisuals(){
  const pointer=matchMedia('(hover: hover) and (pointer: fine)');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('.hero-visual, .project-art, .course-card, .profile-card').forEach(surface=>{
    const glow=document.createElement('div');
    glow.className='interaction-glow';
    glow.setAttribute('aria-hidden','true');
    surface.append(glow);
    let frame=0;
    let position=null;
    const reset=()=>{
      cancelAnimationFrame(frame);
      frame=0;
      position=null;
      for(const name of ['--spot-x','--spot-y','--tilt-x','--tilt-y','--drift-x','--drift-y']){
        surface.style.removeProperty(name);
      }
    };
    surface.addEventListener('pointermove',event=>{
      if(!pointer.matches||motion.matches||event.pointerType==='touch')return;
      position={x:event.clientX,y:event.clientY};
      if(frame)return;
      frame=requestAnimationFrame(()=>{
        frame=0;
        const bounds=surface.getBoundingClientRect();
        if(!position||!bounds.width||!bounds.height)return;
        const x=Math.max(0,Math.min(1,(position.x-bounds.left)/bounds.width));
        const y=Math.max(0,Math.min(1,(position.y-bounds.top)/bounds.height));
        surface.style.setProperty('--spot-x',`${x*100}%`);
        surface.style.setProperty('--spot-y',`${y*100}%`);
        surface.style.setProperty('--tilt-x',`${(0.5-y)*5}deg`);
        surface.style.setProperty('--tilt-y',`${(x-0.5)*7}deg`);
        surface.style.setProperty('--drift-x',`${(x-0.5)*10}px`);
        surface.style.setProperty('--drift-y',`${(y-0.5)*8}px`);
      });
    },{passive:true});
    surface.addEventListener('pointerleave',reset);
    surface.addEventListener('pointercancel',reset);
    motion.addEventListener('change',reset);
    pointer.addEventListener('change',reset);
  });
}
setupInteractiveVisuals();

document.querySelectorAll('.project').forEach(card=>{
  card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();card.style.setProperty('--mx',`${e.clientX-r.left}px`);card.style.setProperty('--my',`${e.clientY-r.top}px`)});
});

const particleCanvas=document.getElementById('particleCanvas');
const particleCtx=particleCanvas.getContext('2d');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let particles=[];
function sizeParticles(){
  const ratio=Math.min(devicePixelRatio||1,2);
  particleCanvas.width=innerWidth*ratio;particleCanvas.height=innerHeight*ratio;
  particleCanvas.style.width=`${innerWidth}px`;particleCanvas.style.height=`${innerHeight}px`;
  particleCtx.setTransform(ratio,0,0,ratio,0,0);
  const count=Math.min(85,Math.max(48,Math.floor(innerWidth/20)));
  particles=Array.from({length:count},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,vx:(Math.random()-.5)*.7,vy:(Math.random()-.5)*.7,r:Math.random()*2+1}));
}
function drawParticles(){
  particleCtx.clearRect(0,0,innerWidth,innerHeight);
  for(let i=0;i<particles.length;i++){
    const p=particles[i];
    if(!reduceMotion){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>innerWidth)p.vx*=-1;if(p.y<0||p.y>innerHeight)p.vy*=-1;}
    particleCtx.beginPath();particleCtx.arc(p.x,p.y,p.r,0,Math.PI*2);particleCtx.fillStyle='rgba(139,68,255,.62)';particleCtx.fill();
    for(let j=i+1;j<particles.length;j++){
      const q=particles[j],dx=p.x-q.x,dy=p.y-q.y,d=Math.hypot(dx,dy);
      if(d<150){particleCtx.beginPath();particleCtx.moveTo(p.x,p.y);particleCtx.lineTo(q.x,q.y);particleCtx.strokeStyle=`rgba(152,59,255,${.28*(1-d/150)})`;particleCtx.lineWidth=.8;particleCtx.stroke();}
    }
  }
  if(!reduceMotion)requestAnimationFrame(drawParticles);
}
sizeParticles();drawParticles();
window.addEventListener('resize',sizeParticles,{passive:true});

const siteHeader=document.querySelector('.site-header');
const progressBar=document.querySelector('.scroll-progress span');
const navLinks=[...document.querySelectorAll('.desktop-nav a')];
const sections=[...document.querySelectorAll('main section[id], #academic-record')];
let headerAnimations=[];
let headerEffects=null;
let chromeInitialized=false;
function cancelHeaderTransition(){
  headerAnimations.forEach(animation=>animation.cancel());
  headerAnimations=[];
  headerEffects?.remove();
  headerEffects=null;
  siteHeader.inert=false;
}
function setHeaderLayout(scrolled){
  if(siteHeader.classList.contains('is-scrolled')===scrolled)return;
  const origin=siteHeader.querySelector('.brand > span').getBoundingClientRect();
  cancelHeaderTransition();
  siteHeader.classList.toggle('is-scrolled',scrolled);
  if(!chromeInitialized||innerWidth<=800||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const animate=(element,frames,options)=>{
    const animation=element.animate(frames,options);
    headerAnimations.push(animation);
    return animation;
  };
  if(!scrolled){
    animate(siteHeader,[{opacity:0,transform:'translateY(-12px)'},{opacity:1,transform:'none'}],
      {duration:320,easing:'ease-out'});
    return;
  }
  const flightTime=1350;
  const impactX=siteHeader.offsetWidth/2;
  const impactY=Math.min(innerHeight*.4,320);
  const startX=origin.left+origin.width/2;
  const startY=Math.max(28,origin.top+origin.height/2);
  const effects=document.createElement('div');
  effects.className='header-star-effects';
  effects.setAttribute('aria-hidden','true');
  document.body.append(effects);
  headerEffects=effects;
  const star=document.createElement('div');
  star.className='header-travel-star';
  star.innerHTML='<i class="star-trail"></i><i class="star-shape"></i>';
  effects.append(star);
  const point=(x,y,angle,scale)=>`translate(${x}px, ${y}px) rotate(${angle}deg) scale(${scale})`;
  animate(star,[
    {offset:0,transform:point(startX,startY,0,.35),opacity:0},
    {offset:.12,transform:point(startX-12,startY+12,25,1),opacity:1},
    {offset:.5,transform:point(startX+(impactX-startX)*.65,startY+(impactY-startY)*.35,120,1.1),opacity:1},
    {offset:.9,transform:point(impactX+8,impactY-25,220,1),opacity:1},
    {offset:1,transform:point(impactX,impactY,260,.55),opacity:0}
  ],{duration:flightTime,easing:'cubic-bezier(.35, 0, .25, 1)',fill:'forwards'});
  const ring=document.createElement('div');
  ring.className='header-star-ring';
  ring.style.left=`${impactX}px`;
  ring.style.top=`${impactY}px`;
  effects.append(ring);
  animate(ring,[
    {opacity:0,transform:'translate(-50%, -50%) scale(.2)'},
    {offset:.15,opacity:.85},
    {opacity:0,transform:'translate(-50%, -50%) scale(3.8)'}
  ],{duration:650,delay:flightTime-80,easing:'ease-out',fill:'both'});
  for(let i=0;i<14;i++){
    const spark=document.createElement('i');
    spark.className='header-star-spark';
    spark.style.left=`${impactX}px`;
    spark.style.top=`${impactY}px`;
    const angle=i/14*Math.PI*2;
    const distance=40+(i%4)*18;
    effects.append(spark);
    animate(spark,[
      {opacity:0,transform:'translate(-50%, -50%) scale(.2)'},
      {offset:.12,opacity:1},
      {opacity:0,transform:`translate(${Math.cos(angle)*distance}px, ${Math.sin(angle)*distance}px) scale(0)`}
    ],{duration:600,delay:flightTime-60,easing:'ease-out',fill:'both'});
  }
  siteHeader.inert=true;
  const opening=animate(siteHeader,[
    {opacity:0,clipPath:`circle(0px at ${impactX}px ${impactY}px)`},
    {offset:.06,opacity:1},
    {opacity:1,clipPath:`circle(${Math.hypot(siteHeader.offsetWidth,innerHeight)}px at ${impactX}px ${impactY}px)`}
  ],{duration:700,delay:flightTime-30,easing:'cubic-bezier(.22, 1, .36, 1)',fill:'backwards'});
  const items=[siteHeader.querySelector('.brand'),...navLinks,siteHeader.querySelector('.header-cta')];
  items.forEach((item,index)=>animate(item,[
    {opacity:0,transform:'translateX(-14px)'},
    {opacity:1,transform:'translateX(0)'}
  ],{duration:380,delay:flightTime+80+index*32,easing:'ease-out',fill:'backwards'}));
  opening.finished.then(()=>{
    effects.remove();
    if(headerEffects===effects){
      headerEffects=null;
      siteHeader.inert=false;
    }
  }).catch(()=>{});
}
function updatePageChrome(){
  const scrollTop=window.scrollY;
  const maxScroll=document.documentElement.scrollHeight-innerHeight;
  progressBar.style.transform=`scaleX(${maxScroll>0?Math.min(scrollTop/maxScroll,1):0})`;
  const isScrolled=siteHeader.classList.contains('is-scrolled');
  setHeaderLayout(scrollTop>(isScrolled?24:80));
  let current='';
  sections.forEach(section=>{if(scrollTop>=section.offsetTop-180)current=section.id});
  navLinks.forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${current}`));
}
updatePageChrome();
playWelcomeIntro();
chromeInitialized=true;
window.addEventListener('scroll',updatePageChrome,{passive:true});
window.addEventListener('resize',()=>{
  cancelHeaderTransition();
},{passive:true});
