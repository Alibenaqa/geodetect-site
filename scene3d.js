(function(){
  const canvas = document.getElementById('scene3d');
  if (!canvas || !window.THREE) return;
  const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const rendu = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  rendu.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(38, 2, 0.1, 100);
  cam.position.set(0, 2.2, 8.2);
  cam.lookAt(0, -0.7, 0);

  const monde = new THREE.Group();
  monde.rotation.x = 0.32;
  monde.rotation.y = -0.55;
  scene.add(monde);

  const L = 7, H = 3.2, P = 4.2; // largeur, hauteur (profondeur sol), profondeur scène

  // Strates translucides
  const strates = [
    {y: -0.4, h: 0.8, c: 0x3A4046, o: 0.30},
    {y: -1.3, h: 1.0, c: 0x33383D, o: 0.34},
    {y: -2.5, h: 1.4, c: 0x2B3034, o: 0.40},
  ];
  strates.forEach(s => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(L, s.h, P),
      new THREE.MeshBasicMaterial({color: s.c, transparent: true, opacity: s.o, depthWrite: false})
    );
    m.position.y = s.y;
    monde.add(m);
  });

  // Arêtes du bloc
  const aretes = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(L, H, P)),
    new THREE.LineBasicMaterial({color: 0x6B7075, transparent: true, opacity: 0.7})
  );
  aretes.position.y = -H/2 + 0.4;
  monde.add(aretes);

  // Grille de surface (le chantier)
  const grille = new THREE.GridHelper(L, 12, 0x4A5057, 0x3A4046);
  grille.scale.z = P / L;
  grille.position.y = 0.4;
  monde.add(grille);

  // Réseaux : cylindres traversant le bloc selon Z
  const reseaux = [
    {x: -1.7, y: -0.55, c: 0xE8722C},
    {x:  0.4, y: -1.35, c: 0xE8722C},
    {x:  1.9, y: -2.30, c: 0xE8722C},
  ];
  const marqueurs = [];
  reseaux.forEach(r => {
    const cyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.09, P + 0.3, 20),
      new THREE.MeshBasicMaterial({color: r.c})
    );
    cyl.rotation.x = Math.PI / 2;
    cyl.position.set(r.x, r.y, 0);
    monde.add(cyl);
    // halo de détection (s'allume au passage du scan)
    const halo = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 18, 18),
      new THREE.MeshBasicMaterial({color: 0xF2823D, transparent: true, opacity: 0})
    );
    halo.position.set(r.x, r.y, 0);
    monde.add(halo);
    marqueurs.push({x: r.x, halo});
  });

  // Cavité : sphère filaire dorée
  const cavite = new THREE.Mesh(
    new THREE.SphereGeometry(0.42, 14, 12),
    new THREE.MeshBasicMaterial({color: 0xB8860B, wireframe: true, transparent: true, opacity: 0.75})
  );
  cavite.position.set(-0.6, -2.2, 0.7);
  monde.add(cavite);
  const haloCav = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 14),
    new THREE.MeshBasicMaterial({color: 0xD4A017, transparent: true, opacity: 0})
  );
  haloCav.position.copy(cavite.position);
  monde.add(haloCav);
  marqueurs.push({x: cavite.position.x, halo: haloCav});

  // Plan de scan orange (balaie selon X)
  const plan = new THREE.Mesh(
    new THREE.PlaneGeometry(P, H),
    new THREE.MeshBasicMaterial({color: 0xE8722C, transparent: true, opacity: 0.13, side: THREE.DoubleSide, depthWrite: false})
  );
  plan.rotation.y = Math.PI / 2;
  plan.position.y = -H/2 + 0.4;
  monde.add(plan);
  const ligneScan = new THREE.Mesh(
    new THREE.PlaneGeometry(P, 0.03),
    new THREE.MeshBasicMaterial({color: 0xF2823D, transparent: true, opacity: 0.9, side: THREE.DoubleSide})
  );
  ligneScan.rotation.y = Math.PI / 2;
  ligneScan.position.y = 0.4;
  monde.add(ligneScan);

  // Interaction : rotation à la souris / au doigt
  let saisi = false, dernierX = 0, dernierY = 0, vitesseAuto = 0.0016;
  canvas.addEventListener('pointerdown', e => { saisi = true; dernierX = e.clientX; dernierY = e.clientY; canvas.classList.add('saisi'); });
  addEventListener('pointerup', () => { saisi = false; canvas.classList.remove('saisi'); });
  addEventListener('pointermove', e => {
    if (!saisi) return;
    monde.rotation.y += (e.clientX - dernierX) * 0.005;
    monde.rotation.x = Math.max(0.05, Math.min(0.9, monde.rotation.x + (e.clientY - dernierY) * 0.003));
    dernierX = e.clientX; dernierY = e.clientY;
  });

  // Rendu seulement quand visible
  let visible = false;
  new IntersectionObserver(es => es.forEach(e => visible = e.isIntersecting), {threshold: 0.05}).observe(canvas);

  function redim(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w * rendu.getPixelRatio()) {
      rendu.setSize(w, h, false);
      cam.aspect = w / h;
      cam.updateProjectionMatrix();
    }
  }

  function boucle(t){
    requestAnimationFrame(boucle);
    if (!visible) return;
    redim();
    if (!saisi && !reduit) monde.rotation.y += vitesseAuto;
    // balayage du scan
    const sx = reduit ? 0.4 : (((t / 5200) % 1) * (L + 1)) - (L + 1) / 2;
    plan.position.x = sx;
    ligneScan.position.x = sx;
    // halos : s'allument au passage
    marqueurs.forEach(m => {
      const d = Math.abs(sx - m.x);
      m.halo.material.opacity = Math.max(0, 0.5 - d * 0.9);
      const s = 1 + Math.max(0, 0.5 - d * 0.8);
      m.halo.scale.set(s, s, s);
    });
    rendu.render(scene, cam);
  }
  requestAnimationFrame(boucle);
})();
