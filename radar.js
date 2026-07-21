// Fond radar animé : balayage et hyperboles (hero de l'accueil uniquement)
const cv = document.getElementById('radar-canvas');
const ctx = cv.getContext('2d');
const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;
function taille(){ cv.width = cv.offsetWidth * devicePixelRatio; cv.height = cv.offsetHeight * devicePixelRatio; }
taille(); addEventListener('resize', taille);

function dessiner(t){
  const w = cv.width, h = cv.height, dpr = devicePixelRatio;
  ctx.clearRect(0,0,w,h);
  // strates horizontales
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1 * dpr;
  for(let y = h*0.25; y < h; y += h*0.13){
    ctx.beginPath();
    for(let x = 0; x <= w; x += 24*dpr){
      const dy = Math.sin(x*0.002/dpr + y) * 6 * dpr;
      x === 0 ? ctx.moveTo(x, y+dy) : ctx.lineTo(x, y+dy);
    }
    ctx.stroke();
  }
  // hyperboles fixes
  const hyps = [[0.72, 0.62, 0.09], [0.48, 0.78, 0.06], [0.86, 0.82, 0.05]];
  hyps.forEach(([cx, cy, r]) => {
    ctx.strokeStyle = 'rgba(232,114,44,0.5)';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    for(let i = -1; i <= 1; i += 0.05){
      const x = (cx + i*r*2.2) * w;
      const y = (cy + Math.abs(i)*r*1.6) * h;
      i === -1 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(232,114,44,0.85)';
    ctx.beginPath(); ctx.arc(cx*w, cy*h, 3.5*dpr, 0, 7); ctx.fill();
  });
  // ligne de balayage verticale
  if(!reduit){
    const bx = ((t/6000) % 1) * w;
    const grad = ctx.createLinearGradient(bx-90*dpr, 0, bx, 0);
    grad.addColorStop(0, 'rgba(232,114,44,0)');
    grad.addColorStop(1, 'rgba(232,114,44,0.16)');
    ctx.fillStyle = grad;
    ctx.fillRect(bx-90*dpr, 0, 90*dpr, h);
    ctx.fillStyle = 'rgba(232,114,44,0.55)';
    ctx.fillRect(bx, 0, 1.5*dpr, h);
    requestAnimationFrame(dessiner);
  }
}
requestAnimationFrame(dessiner);
