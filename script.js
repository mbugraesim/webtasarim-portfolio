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
