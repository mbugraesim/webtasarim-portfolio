const menuButton=document.querySelector('.menu-button');
const mobileNav=document.querySelector('.mobile-nav');
menuButton.addEventListener('click',()=>{const open=menuButton.classList.toggle('open');mobileNav.classList.toggle('open',open);menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Menüyü kapat':'Menüyü aç');mobileNav.setAttribute('aria-hidden',String(!open))});
mobileNav.addEventListener('click',e=>{if(e.target.matches('a')){menuButton.classList.remove('open');mobileNav.classList.remove('open');menuButton.setAttribute('aria-expanded','false');mobileNav.setAttribute('aria-hidden','true')}});
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.getElementById('year').textContent=new Date().getFullYear();
