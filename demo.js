(function(){
  const sur = document.getElementById('surbrillance');
  const etapes = document.querySelectorAll('#demo-etapes .demo-etape');
  if (!sur || !etapes.length) return;
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Régions de la capture (en % : gauche, haut, largeur, hauteur)
  const regions = [
    [0.5, 2.5, 15, 93],   // toute la sidebar
    [17, 9, 55, 82],      // carte et détections
    [74.5, 5, 25, 90],    // panneau profondeurs
    [76.5, 0.3, 23, 6],   // boutons export (haut droite)
  ];
  let i = 0;
  function applique(n){
    const [g, h, l, ht] = regions[n];
    sur.style.left = g + '%';
    sur.style.top = h + '%';
    sur.style.width = l + '%';
    sur.style.height = ht + '%';
    etapes.forEach((e, j) => e.classList.toggle('active', j === n));
  }
  applique(1);
  if (!reduit){
    setInterval(() => { i = (i + 1) % regions.length; applique(i); }, 3600);
  }
  etapes.forEach((e, j) => e.addEventListener('click', () => { i = j; applique(j); }));
})();
