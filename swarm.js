(() => {
  "use strict";

  const canvas = document.getElementById("agent-swarm");
  if (!canvas || canvas.parentElement.hidden) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const mark = canvas.parentElement;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const count = 44;
  const size = 96;
  const tau = Math.PI * 2;
  const mix = (a, b, t) => a + (b - a) * t;
  const agents = Array.from({ length: count }, (_, i) => {
    const y = 1 - 2 * (i + 0.5) / count;
    const r = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    return {
      x: Math.cos(angle) * r * 0.71,
      y: y * 0.66,
      z: Math.sin(angle) * r * 0.63,
      vx: 0.11 + Math.sin(i * 1.7) * 0.04,
      vy: Math.cos(i * 2.3) * 0.06,
      vz: 0.06 + Math.sin(i * 0.7) * 0.04,
      phase: i * 2.39996,
      scale: 0.85 + (i % 5) * 0.07,
    };
  });
  const forces = agents.map(() => ({ x: 0, y: 0, z: 0 }));
  let time = 0;
  let frame = 0;
  let lastTime = null;
  let visible = true;
  let tiltX = 0;
  let tiltY = 0;
  let targetX = 0;
  let targetY = 0;
  let burst = 0;
  let drag = null;
  let ignoreClick = false;

  function simulate(dt) {
    time += dt;
    burst = Math.max(0, burst - dt * 0.48);
    // Two overlapping currents slowly part and reunite without a sharp phase change.
    const split = Math.pow(0.5 - 0.5 * Math.cos(time * 0.29), 2);
    const axis = { x: Math.cos(time * 0.12), y: Math.sin(time * 0.16) * 0.5, z: Math.sin(time * 0.12) };
    const centres = [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 }];
    for (let i = 0; i < count; i++) {
      const c = centres[i % 2], a = agents[i];
      c.x += a.x * 2 / count; c.y += a.y * 2 / count; c.z += a.z * 2 / count;
    }
    const separation = 0.36 + Math.sin(time * 0.23) * 0.025;

    for (let i = 0; i < count; i++) {
      const a = agents[i];
      const group = i % 2;
      const side = group ? 1 : -1;
      const centre = centres[group];
      const gx = Math.cos(time * 0.27) * 0.15 + side * split * axis.x * 0.43 - centre.x;
      const gy = Math.sin(time * 0.21) * 0.17 + side * split * axis.y * 0.43 - centre.y;
      const gz = Math.sin(time * 0.27) * 0.15 + side * split * axis.z * 0.43 - centre.z;
      let neighbours = 0;
      let cx = 0, cy = 0, cz = 0;
      let vx = 0, vy = 0, vz = 0;
      let sx = 0, sy = 0, sz = 0;
      for (let j = 0; j < count; j++) {
        if (i === j) continue;
        const b = agents[j];
        const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        const d2 = dx * dx + dy * dy + dz * dz;
        if (d2 > 0.57 * 0.57) continue;
        const affinity = group === j % 2 ? 1 : 1 - split * 0.8;
        neighbours += affinity;
        cx += b.x * affinity; cy += b.y * affinity; cz += b.z * affinity;
        vx += b.vx * affinity; vy += b.vy * affinity; vz += b.vz * affinity;
        if (d2 < separation * separation && d2 > 0.000001) {
          const d = Math.sqrt(d2);
          const repel = (1 - d / separation) / d;
          sx += dx * repel; sy += dy * repel; sz += dz * repel;
        }
      }
      const force = forces[i];
      const guidance = 0.24 + split * 0.36;
      force.x = sx * 0.95 + (gx * 0.75 - a.vx) * guidance;
      force.y = sy * 0.95 + (gy * 0.75 - a.vy) * guidance;
      force.z = sz * 0.95 + (gz * 0.75 - a.vz) * guidance;
      if (neighbours) {
        const alignment = 1.5 * (1 - burst * 0.85);
        force.x += (vx / neighbours - a.vx) * alignment + (cx / neighbours - a.x) * 0.12;
        force.y += (vy / neighbours - a.vy) * alignment + (cy / neighbours - a.y) * 0.12;
        force.z += (vz / neighbours - a.vz) * alignment + (cz / neighbours - a.z) * 0.12;
      }
      // Gentle curl stretches the formation; individual drift prevents a rigid cluster.
      force.x += -a.z * 0.09 + Math.sin(time * 0.41 + a.phase) * 0.035;
      force.y += Math.sin(time * 0.33 + a.phase * 1.3) * 0.05;
      force.z += a.x * 0.09 + Math.cos(time * 0.37 + a.phase * 0.8) * 0.035;

      const r = Math.hypot(a.x, a.y, a.z);
      const wall = Math.pow(Math.max(0, (r - 0.67) / 0.23), 2) * 0.9;
      if (r > 0) {
        force.x -= a.x / r * wall;
        force.y -= a.y / r * wall;
        force.z -= a.z / r * wall;
      }
    }

    for (let i = 0; i < count; i++) {
      const a = agents[i], force = forces[i];
      a.vx += force.x * dt; a.vy += force.y * dt; a.vz += force.z * dt;
      const speed = Math.hypot(a.vx, a.vy, a.vz) || 1;
      const limit = Math.max(0.065, Math.min(0.23 + burst * 0.62, speed)) / speed;
      a.vx *= limit; a.vy *= limit; a.vz *= limit;
      a.x += a.vx * dt; a.y += a.vy * dt; a.z += a.vz * dt;
      const r = Math.hypot(a.x, a.y, a.z);
      if (r > 0.88) {
        const nx = a.x / r, ny = a.y / r, nz = a.z / r;
        a.x = nx * 0.88; a.y = ny * 0.88; a.z = nz * 0.88;
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
    // No glass surface or circular outline: depth and motion suggest the volume.
    const atmosphere = ctx.createRadialGradient(48, 48, 4, 48, 48, 43);
    atmosphere.addColorStop(0, "rgba(191,223,136,0.025)");
    atmosphere.addColorStop(1, "rgba(191,223,136,0)");
    ctx.fillStyle = atmosphere;
    ctx.fillRect(4, 4, 88, 88);

    const projected = agents.map((agent, i) => ({ ...project(agent.x, agent.y, agent.z), agent, i })).sort((a, b) => a.z - b.z);
    for (const p of projected) {
      const depth = Math.max(0, Math.min(1, (p.z + 0.9) / 1.8));
      const radius = (0.85 + depth * 0.8) * p.agent.scale * p.perspective;
      const alpha = 0.3 + depth * 0.65;
      const white = p.i % 5 === 0;
      const color = white ? "240,248,220" : "216,255,133";
      const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius * 3.5);
      glow.addColorStop(0, `rgba(${color},${depth * 0.2})`);
      glow.addColorStop(1, `rgba(${color},0)`);
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius * 3.5, 0, tau); ctx.fill();

      ctx.fillStyle = `rgba(${color},${alpha})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, tau); ctx.fill();
      if (depth > 0.65) {
        ctx.fillStyle = `rgba(251,255,236,${(depth - 0.65) * 1.3})`;
        ctx.beginPath(); ctx.arc(p.x - radius * 0.18, p.y - radius * 0.2, radius * 0.45, 0, tau); ctx.fill();
      }
    }
  }

  function tick(now) {
    const dt = lastTime === null ? 0 : Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now;
    const easing = 1 - Math.exp(-dt * (drag ? 18 : 7));
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
      tiltX = targetX;
      tiltY = targetY;
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

  function updateView() {
    if (motion.matches) {
      tiltX = targetX;
      tiltY = targetY;
      draw();
    }
  }

  function scatter() {
    burst = 1;
    for (const a of agents) {
      const r = Math.hypot(a.x, a.y, a.z) || 1;
      a.vx = a.x / r * 0.65 + Math.sin(a.phase) * 0.12;
      a.vy = a.y / r * 0.65 + Math.cos(a.phase * 1.3) * 0.12;
      a.vz = a.z / r * 0.65 + Math.sin(a.phase * 0.8) * 0.12;
      if (motion.matches) {
        const spread = Math.min(0.86, r * 1.35) / r;
        a.x *= spread; a.y *= spread; a.z *= spread;
      }
    }
    if (motion.matches) draw();
  }

  mark.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || drag) return;
    ignoreClick = false;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, yaw: targetX, pitch: targetY };
    mark.setPointerCapture(event.pointerId);
  });
  mark.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!ignoreClick && Math.hypot(dx, dy) < 4) return;
    ignoreClick = true;
    mark.classList.add("is-dragging");
    targetX = drag.yaw + dx * 0.012;
    targetY = Math.max(-1.2, Math.min(1.2, drag.pitch + dy * 0.012));
    updateView();
  });
  function endDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    if (event.type === "pointercancel") ignoreClick = true;
    drag = null;
    mark.classList.remove("is-dragging");
    if (mark.hasPointerCapture(event.pointerId)) mark.releasePointerCapture(event.pointerId);
  }
  mark.addEventListener("pointerup", endDrag);
  mark.addEventListener("pointercancel", endDrag);
  mark.addEventListener("lostpointercapture", endDrag);
  mark.addEventListener("click", (event) => {
    if (ignoreClick && event.detail !== 0) {
      ignoreClick = false;
      return;
    }
    ignoreClick = false;
    scatter();
  });
  mark.addEventListener("keydown", (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "ArrowLeft") targetX -= 0.2;
    if (event.key === "ArrowRight") targetX += 0.2;
    if (event.key === "ArrowUp") targetY -= 0.2;
    if (event.key === "ArrowDown") targetY += 0.2;
    if (event.key === "Home") targetX = targetY = 0;
    targetY = Math.max(-1.2, Math.min(1.2, targetY));
    updateView();
  });
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
