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
