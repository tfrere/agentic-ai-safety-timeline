(() => {
  "use strict";

  const canvas = document.getElementById("agent-swarm");
  const ctx = canvas?.getContext("2d");
  if (!ctx) return;

  const mark = canvas.parentElement;
  const heading = mark.closest(".intro-heading");
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const count = 36;
  const size = 96;
  const tau = Math.PI * 2;
  const mix = (a, b, t) => a + (b - a) * t;
  const fish = Array.from({ length: count }, (_, i) => {
    const y = 1 - 2 * (i + 0.5) / count;
    const r = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    return {
      x: Math.cos(angle) * r * 0.43,
      y: y * 0.34,
      z: Math.sin(angle) * r * 0.36,
      vx: 0.22 + Math.sin(i * 1.7) * 0.025,
      vy: Math.cos(i * 2.3) * 0.035,
      vz: 0.09 + Math.sin(i * 0.7) * 0.025,
      phase: i * 2.39996,
      scale: 0.85 + (i % 5) * 0.07,
    };
  });
  const forces = fish.map(() => ({ x: 0, y: 0, z: 0 }));
  let time = 0;
  let frame = 0;
  let lastTime = null;
  let visible = true;
  let tiltX = 0;
  let tiltY = 0;
  let targetX = 0;
  let targetY = 0;

  function simulate(dt) {
    time += dt;
    const centre = fish.reduce((sum, f) => ({ x: sum.x + f.x / count, y: sum.y + f.y / count, z: sum.z + f.z / count }), { x: 0, y: 0, z: 0 });
    // A slowly wandering heading steers the school; individual turns propagate locally.
    const gx = Math.cos(time * 0.39) * 0.53 - centre.x;
    const gy = Math.sin(time * 0.31 + 0.7) * 0.37 - centre.y;
    const gz = Math.sin(time * 0.39) * 0.53 - centre.z;
    const gl = Math.hypot(gx, gy, gz) || 1;

    for (let i = 0; i < count; i++) {
      const a = fish[i];
      let neighbours = 0;
      let cx = 0, cy = 0, cz = 0;
      let vx = 0, vy = 0, vz = 0;
      let sx = 0, sy = 0, sz = 0;
      for (let j = 0; j < count; j++) {
        if (i === j) continue;
        const b = fish[j];
        const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > 0.48 * 0.48) continue;
        neighbours++;
        cx += b.x; cy += b.y; cz += b.z;
        vx += b.vx; vy += b.vy; vz += b.vz;
        if (d2 < 0.26 * 0.26 && d2 > 0.000001) {
          const d = Math.sqrt(d2);
          const repel = (1 - d / 0.26) / d;
          sx += dx * repel; sy += dy * repel; sz += dz * repel;
        }
      }
      const force = forces[i];
      const initiative = i % 9 === 0 ? 0.9 : 0.32;
      force.x = sx * 1.2 + (gx / gl * 0.27 - a.vx) * initiative;
      force.y = sy * 1.2 + (gy / gl * 0.27 - a.vy) * initiative;
      force.z = sz * 1.2 + (gz / gl * 0.27 - a.vz) * initiative;
      if (neighbours) {
        force.x += (vx / neighbours - a.vx) * 2.4 + (cx / neighbours - a.x) * 0.28;
        force.y += (vy / neighbours - a.vy) * 2.4 + (cy / neighbours - a.y) * 0.28;
        force.z += (vz / neighbours - a.vz) * 2.4 + (cz / neighbours - a.z) * 0.28;
      }
      force.x += Math.sin(time * 0.71 + a.phase) * 0.024;
      force.y += Math.cos(time * 0.63 + a.phase * 1.3) * 0.024;
      force.z += Math.sin(time * 0.67 + a.phase * 0.8) * 0.024;

      // Anticipate the spherical boundary, turning inward before reaching the wall.
      const r = Math.hypot(a.x, a.y, a.z);
      const wall = Math.pow(Math.max(0, (r - 0.58) / 0.28), 2) * 0.8;
      if (r > 0) {
        force.x -= a.x / r * wall;
        force.y -= a.y / r * wall;
        force.z -= a.z / r * wall;
      }
    }

    for (let i = 0; i < count; i++) {
      const a = fish[i], force = forces[i];
      a.vx += force.x * dt; a.vy += force.y * dt; a.vz += force.z * dt;
      const speed = Math.hypot(a.vx, a.vy, a.vz) || 1;
      const limit = Math.max(0.15, Math.min(0.32, speed)) / speed;
      a.vx *= limit; a.vy *= limit; a.vz *= limit;
      a.x += a.vx * dt; a.y += a.vy * dt; a.z += a.vz * dt;
      const r = Math.hypot(a.x, a.y, a.z);
      if (r > 0.86) {
        const nx = a.x / r, ny = a.y / r, nz = a.z / r;
        a.x = nx * 0.86; a.y = ny * 0.86; a.z = nz * 0.86;
        const outward = Math.max(0, a.vx * nx + a.vy * ny + a.vz * nz);
        a.vx -= outward * nx; a.vy -= outward * ny; a.vz -= outward * nz;
      }
    }
  }

  function project(x, y, z) {
    const yaw = 0.4 + tiltX;
    const pitch = -0.25 + tiltY;
    const xx = x * Math.cos(yaw) + z * Math.sin(yaw);
    const zz = z * Math.cos(yaw) - x * Math.sin(yaw);
    const yy = y * Math.cos(pitch) - zz * Math.sin(pitch);
    const depth = y * Math.sin(pitch) + zz * Math.cos(pitch);
    const perspective = 4 / (4 - depth);
    return { x: 48 + xx * 44 * perspective, y: 48 + yy * 44 * perspective, z: depth, perspective };
  }

  function draw() {
    ctx.clearRect(0, 0, size, size);
    const body = ctx.createRadialGradient(36, 29, 3, 48, 48, 42);
    body.addColorStop(0, "rgba(173,210,148,0.045)");
    body.addColorStop(0.8, "rgba(103,140,113,0.018)");
    body.addColorStop(1, "rgba(184,225,151,0.055)");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(48, 48, 42, 0, tau); ctx.fill();

    const projected = fish.map((f) => {
      const p = project(f.x, f.y, f.z);
      const head = project(f.x + f.vx * 0.2, f.y + f.vy * 0.2, f.z + f.vz * 0.2);
      return { ...p, angle: Math.atan2(head.y - p.y, head.x - p.x), fish: f };
    }).sort((a, b) => a.z - b.z);

    for (const p of projected) {
      const depth = (p.z + 0.9) / 1.8;
      const scale = p.perspective * p.fish.scale * (0.72 + depth * 0.42);
      const alpha = 0.25 + depth * 0.7;
      const tail = Math.sin(time * 7 + p.fish.phase) * 0.32;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.scale(scale, scale);
      ctx.fillStyle = `rgba(216,255,153,${alpha * 0.055})`;
      ctx.beginPath(); ctx.ellipse(-0.5, 0, 5, 2.5, 0, 0, tau); ctx.fill();
      ctx.fillStyle = `rgba(${Math.round(186 + depth * 48)},255,${Math.round(130 + depth * 51)},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(1.9, 0);
      ctx.bezierCurveTo(0.8, -1.35, -1.3, -0.85, -4.2, tail);
      ctx.bezierCurveTo(-1.3, 0.85, 0.8, 1.35, 1.9, 0);
      ctx.fill();
      ctx.fillStyle = `rgba(249,255,229,${alpha * 0.85})`;
      ctx.beginPath(); ctx.arc(0.8, -0.12, 0.5, 0, tau); ctx.fill();
      ctx.restore();
    }

    // One quiet rim makes containment legible without drawing a cage or orbit lines.
    const rim = ctx.createLinearGradient(14, 8, 80, 90);
    rim.addColorStop(0, "rgba(211,239,184,0.27)");
    rim.addColorStop(0.4, "rgba(170,205,150,0.055)");
    rim.addColorStop(0.75, "rgba(170,205,150,0.04)");
    rim.addColorStop(1, "rgba(211,239,184,0.15)");
    ctx.strokeStyle = rim;
    ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(48, 48, 42, 0, tau); ctx.stroke();
  }

  function tick(now) {
    const dt = lastTime === null ? 0 : Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const easing = 1 - Math.exp(-dt * 4);
    tiltX = mix(tiltX, targetX, easing);
    tiltY = mix(tiltY, targetY, easing);
    // Small substeps keep flocking stable even when the display misses a frame.
    const steps = Math.max(1, Math.ceil(dt * 120));
    for (let i = 0; i < steps; i++) simulate(dt / steps);
    draw();
    frame = requestAnimationFrame(tick);
  }

  function updateMotion() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = null;
    if (motion.matches) {
      tiltX = tiltY = 0;
      draw();
    } else if (visible && !document.hidden) {
      frame = requestAnimationFrame(tick);
    }
  }

  function resize() {
    const resolution = Math.ceil(mark.getBoundingClientRect().width * Math.min(window.devicePixelRatio || 1, 3));
    if (resolution <= 0) return;
    canvas.width = canvas.height = resolution;
    ctx.setTransform(resolution / size, 0, 0, resolution / size, 0, 0);
    draw();
  }

  heading.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse" || motion.matches) return;
    const rect = heading.getBoundingClientRect();
    targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.45;
    targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.3;
  });
  heading.addEventListener("pointerleave", () => { targetX = targetY = 0; });
  motion.addEventListener("change", updateMotion);
  document.addEventListener("visibilitychange", updateMotion);
  window.addEventListener("pagehide", () => { cancelAnimationFrame(frame); frame = 0; });
  window.addEventListener("pageshow", updateMotion);
  window.addEventListener("resize", resize);
  new ResizeObserver(resize).observe(mark);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateMotion();
  }).observe(mark);

  for (let i = 0; i < 180; i++) simulate(1 / 120);
  resize();
  mark.classList.add("is-ready");
  updateMotion();
})();
