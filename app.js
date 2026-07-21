// Nav qui se solidifie au scroll
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('solide', scrollY > 40), {passive:true});

// Menu mobile
const bascule = document.getElementById('menu-bascule');
if (bascule) {
  bascule.addEventListener('click', () => {
    const ouvert = nav.classList.toggle('ouvert');
    bascule.setAttribute('aria-expanded', ouvert);
  });
  document.querySelectorAll('.menu-mobile a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('ouvert');
    bascule.setAttribute('aria-expanded', 'false');
  }));
}

// Révélations au scroll
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, {threshold:.12});
document.querySelectorAll('.revele').forEach(el => obs.observe(el));
