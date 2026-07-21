// Nav qui se solidifie au scroll
const nav = document.getElementById('nav');
addEventListener('scroll', () => nav.classList.toggle('solide', scrollY > 40), {passive:true});

// Révélations au scroll
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
}, {threshold:.12});
document.querySelectorAll('.revele').forEach(el => obs.observe(el));
