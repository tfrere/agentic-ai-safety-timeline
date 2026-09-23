(() => {
  "use strict";

  const canvas = document.getElementById("agent-swarm");
  if (!canvas || canvas.parentElement.hidden) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const mark = canvas.parentElement;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cohortSize = 14;
  const colors = ["216,255,133", "176,222,175", "233,238,188"];
  const count = cohortSize * colors.length;
  const size = 96;
  const tau = Math.PI * 2;
  const mix = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
  const smooth = (start, end, value) => {
    const t = clamp((value - start) / (end - start));
    return t * t * (3 - 2 * t);
  };
  const normalize = (v) => {
    const length = Math.hypot(...v) || 1;
    return v.map((n) => n / length);
  };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

  function route(t) {
    const angle = t * 0.43;
    return [
      Math.sin(angle) * 0.47 + Math.sin(angle * 3 + 0.8) * 0.035,
      Math.sin(angle * 2 + 0.25) * 0.34,
      Math.cos(angle) * 0.27 + Math.sin(angle * 2 - 0.4) * 0.07,
    ];
  }

  function routeFrame(t) {
    const centre = route(t), ahead = route(t + 0.035);
    const tangent = normalize(ahead.map((n, axis) => n - centre[axis]));
    const normal = normalize(cross(tangent, [0, 0, 1]));
    return { centre, tangent, normal, binormal: cross(normal, tangent) };
  }

  function formation(cohort, t) {
    // Shared currents periodically bring the three cohorts together.
    const phase = t + (cohort - 1) * (2.75 + Math.sin(t * 0.2 + 0.3) * 1.65)
      + Math.sin(t * 0.7 + cohort) * 0.12;
    const now = routeFrame(phase), ahead = routeFrame(phase + 0.65);
    const bend = 1 - now.tangent.reduce((sum, n, axis) => sum + n * ahead.tangent[axis], 0);
    const turn = smooth(0.015, 0.24, bend);
    return { phase, turn, length: mix(1.3, 0.62, turn), width: mix(0.18, 0.125, turn) };
  }

  function destination(i, t, formations) {
    const cohort = Math.floor(i / cohortSize), slot = i % cohortSize;
    const shape = formations ? formations[cohort] : formation(cohort, t);
    const rank = clamp((slot + 0.5) / cohortSize + Math.sin(t * 0.31 + slot) * 0.08);
    const path = routeFrame(shape.phase - rank * shape.length);
    const angle = slot * 2.39996 + cohort * 0.7;
    const spread = Math.sqrt((slot + 0.5) / cohortSize);
    const lateral = Math.cos(angle) * spread * shape.width + Math.sin(t * 0.72 + i) * 0.009;
    const vertical = Math.sin(angle) * spread * shape.width * 0.8 + (cohort - 1) * 0.035;
    return path.centre.map((n, axis) => n + path.normal[axis] * lateral + path.binormal[axis] * vertical);
  }

  const agents = Array.from({ length: count }, (_, i) => {
    const start = destination(i, 0);
    const next = destination(i, 0.04);
    return {
      x: start[0], y: start[1], z: start[2],
      vx: (next[0] - start[0]) / 0.04,
      vy: (next[1] - start[1]) / 0.04,
      vz: (next[2] - start[2]) / 0.04,
      cohort: Math.floor(i / cohortSize),
      slot: i % cohortSize,
      phase: i * 2.39996,
      scale: 0.85 + (i % 5) * 0.07,
      trail: [],
    };
  });
  const forces = agents.map(() => ({ x: 0, y: 0, z: 0 }));
  let time = 0;
  let journey = 0;
  let frame = 0;
  let lastTime = null;
  let visible = true;
  let tiltX = 0;
  let tiltY = 0;
  let targetX = 0;
  let targetY = 0;
  let burst = 0;
  let recovery = null;
  const signals = [];
  const lastSignal = [-4, -2, 0];
  let drag = null;
  let ignoreClick = false;

  let trailTime = 0;
  function sendSignal(cohort, seed = 0) {
    if (signals.length) return;
    const chain = [cohort * cohortSize + seed];
    for (let hop = 0; hop < 2; hop++) {
      const from = agents[chain[chain.length - 1]];
      let nearest = -1, distance = 0.32;
      for (let i = cohort * cohortSize; i < (cohort + 1) * cohortSize; i++) {
        if (chain.includes(i)) continue;
        const a = agents[i], d = Math.hypot(a.x - from.x, a.y - from.y, a.z - from.z);
        if (d < distance) { distance = d; nearest = i; }
      }
      if (nearest < 0) break;
      chain.push(nearest);
    }
    if (chain.length > 1) {
      signals.push({ chain, age: 0, cohort });
      lastSignal[cohort] = time;
    }
  }

  function simulate(dt) {
    time += dt;
    if (recovery) {
      recovery.age += dt;
      if (recovery.age > 5) recovery = null;
    }
    burst = recovery ? 1 - smooth(0, 1.4, recovery.age) : 0;
    // The route keeps drifting while the nuclei form, so the regroup never freezes.
    journey += dt * (recovery ? mix(0.3, 1, smooth(2.2, 4.4, recovery.age)) : 1);
    const formations = colors.map((_, cohort) => formation(cohort, journey));
    const nextFormations = colors.map((_, cohort) => formation(cohort, journey + 0.04));
    const nuclei = recovery && colors.map((_, cohort) => {
      const seeds = agents.slice(cohort * cohortSize, cohort * cohortSize + 3);
      return ["x", "y", "z"].map((axis) => seeds.reduce((sum, a) => sum + a[axis] / seeds.length, 0));
    });
    for (let i = signals.length - 1; i >= 0; i--) {
      signals[i].age += dt;
      if (signals[i].age > (signals[i].chain.length - 1) * 0.36 + 0.24) signals.splice(i, 1);
    }
    for (let cohort = 0; cohort < colors.length; cohort++) {
      if (recovery) {
        if (!recovery.signaled[cohort] && recovery.age > 1.1 + cohort * 0.6 && !signals.length) {
          sendSignal(cohort);
          recovery.signaled[cohort] = true;
        }
      } else if (formations[cohort].turn > 0.32 && time - lastSignal[cohort] > 7.5) {
        sendSignal(cohort);
      }
    }
    for (let i = 0; i < count; i++) {
      const a = agents[i];
      let target = destination(i, journey, formations);
      const next = destination(i, journey + 0.04, nextFormations);
      const velocity = next.map((n, axis) => (n - target[axis]) / 0.04);
      let cohesion = 1;
      if (recovery) {
        // Three early arrivals form each nucleus; recruitment then travels backwards,
        // and the seeds leave first so the cohort departs as a line behind its leaders.
        const seed = a.slot < 3;
        const start = (seed ? 0.35 : 0.9 + a.slot * 0.05) + a.cohort * 0.1;
        const gather = smooth(start, start + 0.7, recovery.age);
        const release = smooth(2.2 + a.slot * 0.06, 4 + a.slot * 0.06, recovery.age);
        const anchor = seed ? recovery.anchors[a.cohort] : nuclei[a.cohort];
        const angle = a.phase;
        const width = seed ? 0.035 : 0.075 + a.slot * 0.003;
        const rest = [Math.cos(angle) * width, Math.sin(angle) * width, Math.sin(angle * 1.3) * width * 0.65];
        target = target.map((n, axis) => mix(anchor[axis] + rest[axis], n, release));
        for (let axis = 0; axis < 3; axis++) velocity[axis] *= release;
        cohesion = mix(0.035, 1, gather);
      }
      const force = forces[i];
      force.x = ((target[0] - a.x) * 3.6 + (velocity[0] - a.vx) * 2.5) * cohesion;
      force.y = ((target[1] - a.y) * 3.6 + (velocity[1] - a.vy) * 2.5) * cohesion;
      force.z = ((target[2] - a.z) * 3.6 + (velocity[2] - a.vz) * 2.5) * cohesion;

      // Local separation keeps individual agents distinct while they share a heading.
      for (let j = 0; j < count; j++) {
        if (i === j) continue;
        const b = agents[j];
        const dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
        const d = Math.hypot(dx, dy, dz);
        const separation = a.cohort === b.cohort ? 0.09 : 0.12;
        if (d > 0.0001 && d < separation) {
          const repel = (1 - d / separation) * 0.65 / d;
          force.x += dx * repel; force.y += dy * repel; force.z += dz * repel;
        }
      }
      const r = Math.hypot(a.x, a.y, a.z);
      const wall = Math.pow(Math.max(0, (r - 0.72) / 0.16), 2) * 1.2;
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
      const limit = Math.min(1, (0.7 + burst * 0.4) / speed);
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
    trailTime += dt;
    if (trailTime >= 0.06) {
      trailTime %= 0.06;
      for (const a of agents) {
        a.trail.push([a.x, a.y, a.z]);
        if (a.trail.length > 8) a.trail.shift();
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
    // A quiet glass envelope makes the contained volume legible.
    const lightX = Math.sin(tiltX) * 5, lightY = Math.sin(tiltY) * 4;
    const atmosphere = ctx.createRadialGradient(34 + lightX, 29 + lightY, 2, 48, 48, 42);
    atmosphere.addColorStop(0, "rgba(232,245,211,0.025)");
    atmosphere.addColorStop(0.72, "rgba(191,223,136,0.004)");
    atmosphere.addColorStop(1, "rgba(211,235,180,0.02)");
    ctx.fillStyle = atmosphere;
    ctx.beginPath();
    ctx.arc(48, 48, 42, 0, tau);
    ctx.fill();

    const rim = ctx.createLinearGradient(19 + lightX, 13 + lightY, 76 - lightX, 86 - lightY);
    rim.addColorStop(0, "rgba(232,245,211,0.17)");
    rim.addColorStop(0.45, "rgba(211,235,180,0.035)");
    rim.addColorStop(1, "rgba(211,235,180,0.09)");
    ctx.strokeStyle = rim;
    ctx.lineWidth = 0.65;
    ctx.stroke();

    const positions = agents.map((agent, i) => ({ ...project(agent.x, agent.y, agent.z), agent, i }));
    const energy = Array(count).fill(0);
    if (!motion.matches) for (const signal of signals) {
      const hop = Math.min(signal.chain.length - 2, Math.floor(signal.age / 0.36));
      const progress = clamp((signal.age - hop * 0.36) / 0.36);
      const from = positions[signal.chain[hop]], to = positions[signal.chain[hop + 1]];
      const fade = smooth(0, 0.12, signal.age) * (1 - smooth((signal.chain.length - 1) * 0.36, (signal.chain.length - 1) * 0.36 + 0.24, signal.age));
      ctx.strokeStyle = `rgba(${colors[signal.cohort]},${fade * 0.19})`;
      ctx.lineWidth = 0.45;
      ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(to.x, to.y); ctx.stroke();
      ctx.fillStyle = `rgba(246,255,220,${fade * 0.85})`;
      ctx.beginPath(); ctx.arc(mix(from.x, to.x, progress), mix(from.y, to.y, progress), 0.7, 0, tau); ctx.fill();
      energy[from.i] = (1 - progress) * fade;
      energy[to.i] = progress * fade;
    }
    const projected = positions.sort((a, b) => a.z - b.z);
    for (const p of projected) {
      const depth = Math.max(0, Math.min(1, (p.z + 0.9) / 1.8));
      const radius = (0.62 + depth * 0.55) * p.agent.scale * p.perspective;
      const alpha = 0.28 + depth * 0.7;
      const color = colors[p.agent.cohort];
      ctx.filter = p.z < -0.12 ? "blur(0.25px)" : "none";

      // Short, fading position histories show actual travel rather than twinkling.
      if (!motion.matches) {
        const trail = p.agent.trail.map((point) => project(...point));
        trail.push(p);
        ctx.lineCap = "round";
        for (let j = 1; j < trail.length; j++) {
          const strength = j / trail.length;
          ctx.strokeStyle = `rgba(${color},${alpha * strength * 0.33})`;
          ctx.lineWidth = radius * strength * 1.05;
          ctx.beginPath();
          ctx.moveTo(trail[j - 1].x, trail[j - 1].y);
          ctx.lineTo(trail[j].x, trail[j].y);
          ctx.stroke();
        }
      }

      const head = project(p.agent.x + p.agent.vx * 0.15, p.agent.y + p.agent.vy * 0.15, p.agent.z + p.agent.vz * 0.15);
      const angle = Math.atan2(head.y - p.y, head.x - p.x);
      const length = 2.3 + depth * 0.8;
      ctx.strokeStyle = `rgba(${color},${alpha})`;
      ctx.lineWidth = radius * 1.65;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(p.x - Math.cos(angle) * length, p.y - Math.sin(angle) * length);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.fillStyle = `rgba(250,255,235,${alpha * 0.75})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius * 0.48, 0, tau); ctx.fill();
      if (energy[p.i] > 0) {
        ctx.fillStyle = `rgba(246,255,220,${energy[p.i] * 0.18})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, radius * 2.4, 0, tau); ctx.fill();
      }
    }
    ctx.filter = "none";

    // A restrained reflection follows the hand while the sphere is rotated.
    const glintX = 32 + lightX, glintY = 25 + lightY;
    const glint = ctx.createRadialGradient(glintX, glintY, 0, glintX, glintY, 13);
    glint.addColorStop(0, "rgba(243,250,230,0.075)");
    glint.addColorStop(1, "rgba(243,250,230,0)");
    ctx.fillStyle = glint;
    ctx.beginPath();
    ctx.ellipse(glintX, glintY, 13, 4.5, -0.6 + lightX * 0.015, 0, tau);
    ctx.fill();
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
    signals.length = 0;
    recovery = {
      age: 0,
      signaled: colors.map(() => false),
      anchors: colors.map((_, cohort) => {
        const seeds = agents.slice(cohort * cohortSize, cohort * cohortSize + 3);
        return ["x", "y", "z"].map((axis) => seeds.reduce((sum, a) => sum + a[axis] / seeds.length, 0) * 0.68);
      }),
    };
    const centre = agents.reduce((sum, a) => [sum[0] + a.x / count, sum[1] + a.y / count, sum[2] + a.z / count], [0, 0, 0]);
    for (const a of agents) {
      const direction = normalize([a.x - centre[0], a.y - centre[1], a.z - centre[2]]);
      a.vx = direction[0] * 0.8 + Math.sin(a.phase) * 0.12;
      a.vy = direction[1] * 0.8 + Math.cos(a.phase * 1.3) * 0.12;
      a.vz = direction[2] * 0.8 + Math.sin(a.phase * 0.8) * 0.12;
      if (motion.matches) {
        a.x += direction[0] * 0.2; a.y += direction[1] * 0.2; a.z += direction[2] * 0.2;
        const spread = Math.min(1, 0.86 / Math.hypot(a.x, a.y, a.z));
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
