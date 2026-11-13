(() => {
  'use strict';

  const script = document.currentScript;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!script?.src || !context || document.querySelector('[data-washcation-flowers]')) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const assetFolder = new URL('./assets/scent-particles/', script.src);
  const flowers = ['sage.png', 'rose.png', 'honey.png', 'ocean.png'].map((file) => {
    const image = new Image();
    image.src = new URL(file, assetFolder).href;
    return image;
  });

  canvas.setAttribute('data-washcation-flowers', '');
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '1000',
  });
  document.body.append(canvas);

  const particles = [];
  const turn = Math.PI * 2;
  const random = (min, max) => min + Math.random() * (max - min);
  let frameId = 0;
  let width;
  let height;
  let lastTrail = null;
  let trailColor = 0;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function render(now) {
    frameId = 0;
    context.clearRect(0, 0, width, height);

    for (let i = particles.length - 1; i >= 0; i--) {
      const particle = particles[i];
      const elapsed = Math.max(0, (now - particle.start) / 1000);
      const progress = elapsed / particle.life;
      if (progress >= 1) {
        particles.splice(i, 1);
        continue;
      }

      const offset = elapsed * (1 - progress * 0.38);
      const x = particle.x + particle.vx * offset;
      const y = particle.y + particle.vy * offset + 19 * elapsed ** 2;
      const size = particle.size * (1 - 0.23 * progress);

      context.save();
      context.translate(x, y);
      context.rotate(particle.angle + particle.spin * elapsed);
      context.globalAlpha = particle.opacity * (1 - progress ** 1.65);
      context.drawImage(particle.image, -size / 2, -size / 2, size, size);
      context.restore();
    }

    if (particles.length) frameId = requestAnimationFrame(render);
  }

  function addFlower(x, y, image, speed, direction, size, life, opacity) {
    if (!image.complete || !image.naturalWidth) return;

    particles.push({
      image, x, y, size, life, opacity,
      start: performance.now(),
      vx: Math.cos(direction) * speed,
      vy: Math.sin(direction) * speed,
      angle: random(0, turn),
      spin: random(-2.6, 2.6),
    });

    if (particles.length > 80) particles.shift();
    if (!frameId) frameId = requestAnimationFrame(render);
  }

  function leaveTrail(event) {
    if (reducedMotion.matches || event.pointerType !== 'mouse') return;

    const { clientX: x, clientY: y } = event;
    const now = performance.now();
    if (lastTrail && (now - lastTrail.time < 55 ||
        Math.hypot(x - lastTrail.x, y - lastTrail.y) < 13)) return;

    lastTrail = { x, y, time: now };
    addFlower(x + 3, y + 7, flowers[trailColor], random(9, 21),
      random(0.35, 2.5), random(11, 16), 0.52, 0.66);
    trailColor = (trailColor + 1) % flowers.length;
  }

  function burst(event) {
    if (reducedMotion.matches || event.button !== 0) return;

    let { clientX: x, clientY: y } = event;
    if (event.detail === 0) {
      const control = event.target instanceof Element &&
        event.target.closest('a[href], button, input, select, textarea, summary, [role="button"]');
      if (!control) return;

      const bounds = control.getBoundingClientRect();
      x = bounds.left + bounds.width / 2;
      y = bounds.top + bounds.height / 2;
    }

    const rotation = random(0, turn);
    for (let i = 0; i < 8; i++) {
      const direction = rotation + i * turn / 8 + random(-0.16, 0.16);
      addFlower(x, y, flowers[i % flowers.length], random(53, 94), direction,
        random(12, 20), random(0.52, 0.76), 0.92);
    }
  }

  function clearEffects() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    particles.length = 0;
    lastTrail = null;
    context.clearRect(0, 0, width, height);
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('pointermove', leaveTrail, { passive: true });
  document.addEventListener('click', burst, { capture: true, passive: true });
  reducedMotion.addEventListener('change', clearEffects);
})();
