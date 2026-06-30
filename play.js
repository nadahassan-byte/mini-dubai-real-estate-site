/* ============================================================
   betterhomes careers — "Break the ceiling"
   Flagship recruitment game: endless vertical climber.
   Vanilla JS + Canvas. No build step, no dependencies.

   What's here:
   - The game loop (auto-rise climber, steer to hit each ceiling's weak point)
   - Career-tier + earnings progression tied to height
   - Lead-capture gate (the point of the build): save a score -> opt-in form
   - Local leaderboard (weekly / global / office) in localStorage, with a
     pluggable CRM webhook + score-submit hook for a real backend later
   - Open Graph-style share card rendered to canvas
   - Analytics event stubs (play_start, play_end, score_saved, lead_captured...)

   To wire a real backend, set BH.config.crmWebhook and BH.config.scoreApi.
   Everything else stays the same — the capture/leaderboard contract is stable.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Config (a real deploy overrides these) ---------- */
  const BH = (window.BH = {
    config: {
      crmWebhook: null,   // e.g. "https://crm.example/api/leads" — POST lead payload
      scoreApi: null,     // e.g. "https://api.example/scores" — server-side validated submit
      source: "break-the-ceiling",
    },
  });

  /* ---------- Career tiers: each "ceiling" climbs the ladder ---------- */
  // Thresholds are in metres of height. Crossing one breaks into the next tier.
  const TIERS = [
    { at: 0,   rank: "Tier 1", name: "New broker",    earn: 120000,  desc: "A clear first-90-days path and a desk that's already warm." },
    { at: 120, rank: "Tier 2", name: "Top performer", earn: 480000,  desc: "Listings, leads and training that lift your numbers fast." },
    { at: 300, rank: "Tier 3", name: "Team lead",     earn: 950000,  desc: "Your own pod, mentoring others, a cut of the team's wins." },
    { at: 560, rank: "Tier 4", name: "Director",      earn: 2000000, desc: "Leadership, equity conversations and the ceiling fully gone." },
  ];

  function tierForHeight(h) {
    let t = TIERS[0];
    for (const tier of TIERS) if (h >= tier.at) t = tier;
    return t;
  }
  // Earnings indicator scales smoothly between tier anchors for a "rising" feel.
  function earningsForHeight(h) {
    const i = TIERS.reduce((acc, t, idx) => (h >= t.at ? idx : acc), 0);
    const lo = TIERS[i];
    const hi = TIERS[Math.min(i + 1, TIERS.length - 1)];
    if (lo === hi) return lo.earn + Math.round((h - lo.at) * 1500);
    const span = hi.at - lo.at;
    const frac = span > 0 ? (h - lo.at) / span : 0;
    return Math.round(lo.earn + (hi.earn - lo.earn) * frac);
  }
  function aed(n) {
    if (n >= 1000000) return "AED " + (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return "AED " + Math.round(n / 1000) + "k";
    return "AED " + n;
  }

  /* ---------- Analytics (stub — swap console for your tracker) ---------- */
  function track(event, props) {
    const payload = Object.assign({ event: event, ts: Date.now(), segment: state.lead.segment || null }, props || {});
    if (typeof window.dataLayer !== "undefined") window.dataLayer.push(payload);
    // eslint-disable-next-line no-console
    console.debug("[analytics]", event, payload);
  }

  /* ---------- Leaderboard store (localStorage; CRM/scoreApi-ready) ---------- */
  const STORE_KEY = "bh_break_ceiling_scores_v1";

  function weekKey(ts) {
    // Bucket timestamps by Monday-aligned weeks in GST (UTC+4) — Mon 00:00 reset.
    const gst = ts + 4 * 3600 * 1000;
    const day = Math.floor(gst / 86400000);
    // 1970-01-01 was a Thursday, so day-of-week (Mon=0) is (day + 3) % 7.
    const dow = ((day + 3) % 7 + 7) % 7;
    return "w" + (day - dow);
  }

  function loadScores() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch (e) { return []; }
  }
  function saveScores(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list.slice(0, 500))); } catch (e) {}
  }

  // Seeded demo entries so the board never looks empty in a fresh browser.
  function seedIfEmpty() {
    const list = loadScores();
    if (list.length) return;
    const now = Date.now();
    const seed = [
      { name: "Layla H.",  height: 612, office: "Marina",      segment: "experienced", ts: now - 2 * 86400000, demo: true },
      { name: "Omar K.",   height: 540, office: "Downtown",    segment: "relocating",  ts: now - 1 * 86400000, demo: true },
      { name: "Priya R.",  height: 410, office: "Business Bay", segment: "returning",   ts: now - 3 * 3600000,  demo: true },
      { name: "Daniel M.", height: 288, office: "Marina",      segment: "new",         ts: now - 5 * 3600000,  demo: true },
      { name: "Sara A.",   height: 175, office: "JVC",         segment: "new",         ts: now - 9 * 3600000,  demo: true },
    ];
    saveScores(seed);
  }

  function addScore(entry) {
    const list = loadScores();
    list.push(entry);
    list.sort((a, b) => b.height - a.height);
    saveScores(list);
    return list;
  }

  function rankIn(list, entry) {
    return list.findIndex((e) => e === entry) + 1;
  }

  /* ---------- Lead submission (local + optional CRM webhook) ---------- */
  async function submitLead(lead) {
    track("lead_captured", { office: lead.office || null });
    if (!BH.config.crmWebhook) return { ok: true, local: true };
    try {
      const res = await fetch(BH.config.crmWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead.name, email: lead.email, whatsapp: lead.whatsapp,
          segment: lead.segment, office: lead.office,
          score: lead.height, source: BH.config.source, code: state.code || null,
        }),
      });
      return { ok: res.ok, local: false };
    } catch (e) {
      return { ok: false, error: String(e) };
    }
  }

  /* ============================================================
     THE GAME
     ============================================================ */
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  // Logical (CSS) size; we scale the backing store for crisp DPR rendering.
  let W = 0, H = 0, DPR = 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  const state = {
    mode: "idle",          // idle | playing | over
    player: { x: 0, vx: 0, targetX: 0 },
    height: 0,             // metres climbed (the score)
    riseSpeed: 0,          // world scroll speed (px/s) — ramps with height
    pxPerMetre: 7,
    ceilings: [],          // upcoming ceilings above the player
    nextCeilingY: 0,       // world-space y of the next ceiling to place
    cameraY: 0,            // world y at top of view
    particles: [],
    shakeT: 0,
    lastBreakFlash: 0,
    input: { pointerDown: false, pointerX: 0, left: false, right: false },
    lead: { segment: "" },
    code: null,
    lastEntry: null,
  };

  const PLAYER_SCREEN_Y_FRAC = 0.72; // player sits ~72% down the screen
  const PLAYER_R = 13;
  const CEIL_THICK = 16;
  const CEIL_GAP_PX = 150;           // vertical distance between ceilings (world px)

  function reset() {
    state.player.x = W / 2;
    state.player.targetX = W / 2;
    state.player.vx = 0;
    state.height = 0;
    state.riseSpeed = 120;
    state.cameraY = 0;
    state.ceilings = [];
    state.particles = [];
    state.shakeT = 0;
    // First ceiling sits a short, readable distance above the player so the
    // first "break" happens within a second or two, not after a long ramp.
    const playerLine = H * PLAYER_SCREEN_Y_FRAC;
    state.nextCeilingY = playerLine - 200;
    // Pre-populate well past the top of the view.
    while (state.nextCeilingY > state.cameraY - H * 1.5) {
      addCeiling(state.nextCeilingY);
      state.nextCeilingY -= CEIL_GAP_PX;
    }
  }

  // A ceiling: solid bar across the shaft, with one breakable weak point.
  function addCeiling(worldY) {
    const difficulty = Math.min(state.height / 600, 1); // 0 -> 1 as you climb
    const minW = 84 - difficulty * 46;                  // weak point shrinks
    const weakW = Math.max(38, minW);
    const margin = weakW / 2 + 10;
    const weakX = margin + Math.random() * (W - margin * 2);
    state.ceilings.push({ y: worldY, weakX: weakX, weakW: weakW, broken: false });
  }

  function worldToScreenY(worldY) {
    return worldY - state.cameraY;
  }

  /* ---------- Input ---------- */
  function pointerToCanvasX(clientX) {
    const rect = canvas.getBoundingClientRect();
    return Math.max(0, Math.min(W, clientX - rect.left));
  }
  canvas.addEventListener("pointerdown", (e) => {
    if (state.mode !== "playing") return;
    state.input.pointerDown = true;
    state.input.pointerX = pointerToCanvasX(e.clientX);
    state.player.targetX = state.input.pointerX;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!state.input.pointerDown) return;
    state.input.pointerX = pointerToCanvasX(e.clientX);
    state.player.targetX = state.input.pointerX;
  });
  function endPointer() { state.input.pointerDown = false; }
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);

  window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") state.input.left = true;
    if (e.key === "ArrowRight" || e.key === "d") state.input.right = true;
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft" || e.key === "a") state.input.left = false;
    if (e.key === "ArrowRight" || e.key === "d") state.input.right = false;
  });

  /* ---------- Particles ---------- */
  function spawnBreak(x, y) {
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 60 + Math.random() * 180;
      state.particles.push({
        x: x + (Math.random() - 0.5) * W * 0.5, y: y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40,
        life: 0.5 + Math.random() * 0.4, age: 0,
        size: 2 + Math.random() * 4,
      });
    }
    state.shakeT = 0.18;
  }

  /* ---------- Loop ---------- */
  let lastT = 0;
  function frame(t) {
    if (!lastT) lastT = t;
    const dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;
    if (state.mode === "playing") update(dt);
    render();
    requestAnimationFrame(frame);
  }

  function update(dt) {
    const p = state.player;

    // Horizontal steering.
    if (state.input.left) p.targetX -= 320 * dt;
    if (state.input.right) p.targetX += 320 * dt;
    p.targetX = Math.max(PLAYER_R, Math.min(W - PLAYER_R, p.targetX));
    // Ease toward target — gives weight without feeling laggy.
    p.x += (p.targetX - p.x) * Math.min(1, dt * 14);

    // Rise: camera moves up (world scrolls down on screen).
    state.riseSpeed = 95 + Math.min(state.height * 0.55, 240);
    state.cameraY -= state.riseSpeed * dt;
    state.height = Math.max(state.height, Math.round(-state.cameraY / state.pxPerMetre));

    // Player's world-space y (fixed on screen).
    const playerWorldY = state.cameraY + H * PLAYER_SCREEN_Y_FRAC;

    // Collision: any ceiling the player is crossing this frame.
    for (const c of state.ceilings) {
      if (c.broken) continue;
      // The player rises through a ceiling when its screen pos passes player line.
      const screenY = worldToScreenY(c.y);
      const playerScreenY = H * PLAYER_SCREEN_Y_FRAC;
      if (screenY >= playerScreenY - PLAYER_R && screenY <= playerScreenY + PLAYER_R) {
        const hitWeak = Math.abs(p.x - c.weakX) <= c.weakW / 2 + PLAYER_R * 0.6;
        if (hitWeak) {
          c.broken = true;
          spawnBreak(p.x, playerScreenY);
          state.lastBreakFlash = 1;
        } else {
          return gameOver();
        }
      }
    }

    // Recycle / generate ceilings as we climb.
    state.ceilings = state.ceilings.filter((c) => worldToScreenY(c.y) < H + 40);
    while (state.nextCeilingY > state.cameraY - H * 0.6) {
      addCeiling(state.nextCeilingY);
      state.nextCeilingY -= CEIL_GAP_PX;
    }

    // Particles.
    for (const pt of state.particles) {
      pt.age += dt; pt.vy += 520 * dt;
      pt.x += pt.vx * dt; pt.y += pt.vy * dt;
    }
    state.particles = state.particles.filter((pt) => pt.age < pt.life);

    if (state.shakeT > 0) state.shakeT -= dt;
    if (state.lastBreakFlash > 0) state.lastBreakFlash -= dt * 3;

    updateHUD();
  }

  function updateHUD() {
    const tier = tierForHeight(state.height);
    elHudTier.textContent = tier.name;
    elHudHeight.textContent = state.height + " m";
    elHudEarn.textContent = aed(earningsForHeight(state.height));
  }

  /* ---------- Render ---------- */
  function render() {
    ctx.save();
    let ox = 0, oy = 0;
    if (state.shakeT > 0) {
      const s = state.shakeT * 18;
      ox = (Math.random() - 0.5) * s; oy = (Math.random() - 0.5) * s;
    }
    ctx.clearRect(-20, -20, W + 40, H + 40);
    ctx.translate(ox, oy);

    // Background gradient — gets lighter / "higher altitude" as you climb.
    const climb = Math.min(state.height / 600, 1);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, mix("#16252d", "#2C537A", climb * 0.7));
    g.addColorStop(1, mix("#1F343F", "#16252d", 0.4));
    ctx.fillStyle = g;
    ctx.fillRect(-20, -20, W + 40, H + 40);

    // Subtle altitude lines.
    ctx.strokeStyle = "rgba(123,160,178,0.08)";
    ctx.lineWidth = 1;
    const step = CEIL_GAP_PX;
    const start = Math.floor(state.cameraY / step) * step;
    for (let y = start; y < state.cameraY + H + step; y += step) {
      const sy = worldToScreenY(y);
      ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke();
    }

    // Ceilings.
    for (const c of state.ceilings) {
      if (c.broken) continue;
      const sy = worldToScreenY(c.y);
      if (sy < -CEIL_THICK || sy > H + CEIL_THICK) continue;
      drawCeiling(c, sy);
    }

    // Particles (concrete shards).
    for (const pt of state.particles) {
      const a = 1 - pt.age / pt.life;
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = "#D9B9A0";
      ctx.fillRect(pt.x, pt.y, pt.size, pt.size);
    }
    ctx.globalAlpha = 1;

    // Break flash.
    if (state.lastBreakFlash > 0) {
      ctx.fillStyle = "rgba(255,120,122," + (state.lastBreakFlash * 0.18) + ")";
      ctx.fillRect(-20, -20, W + 40, H + 40);
    }

    // Player.
    if (state.mode !== "idle") drawPlayer();

    ctx.restore();
  }

  function drawCeiling(c, sy) {
    // Solid slab.
    ctx.fillStyle = "#334d5a";
    ctx.fillRect(0, sy - CEIL_THICK / 2, W, CEIL_THICK);
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(0, sy + CEIL_THICK / 2 - 3, W, 3);
    // Weak point — the opportunity. Glowing salmon notch.
    const wx = c.weakX - c.weakW / 2;
    ctx.fillStyle = "#FF787A";
    ctx.fillRect(wx, sy - CEIL_THICK / 2, c.weakW, CEIL_THICK);
    // Cracks.
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(c.weakX - 6, sy - CEIL_THICK / 2);
    ctx.lineTo(c.weakX + 2, sy);
    ctx.lineTo(c.weakX - 4, sy + CEIL_THICK / 2);
    ctx.moveTo(c.weakX + 7, sy - CEIL_THICK / 2);
    ctx.lineTo(c.weakX + 3, sy);
    ctx.stroke();
  }

  function drawPlayer() {
    const p = state.player;
    const py = H * PLAYER_SCREEN_Y_FRAC;
    // Glow trail.
    ctx.fillStyle = "rgba(217,185,160,0.25)";
    ctx.beginPath(); ctx.ellipse(p.x, py + 14, PLAYER_R * 0.9, PLAYER_R * 1.8, 0, 0, Math.PI * 2); ctx.fill();
    // Body — a rising "spark".
    const grd = ctx.createRadialGradient(p.x, py, 2, p.x, py, PLAYER_R + 4);
    grd.addColorStop(0, "#ffffff");
    grd.addColorStop(0.5, "#D9B9A0");
    grd.addColorStop(1, "#FF787A");
    ctx.fillStyle = grd;
    ctx.beginPath(); ctx.arc(p.x, py, PLAYER_R, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 1.5; ctx.stroke();
  }

  // Tiny hex colour mixer for the climbing background.
  function mix(a, b, t) {
    const pa = hex(a), pb = hex(b);
    const r = Math.round(pa[0] + (pb[0] - pa[0]) * t);
    const g = Math.round(pa[1] + (pb[1] - pa[1]) * t);
    const bl = Math.round(pa[2] + (pb[2] - pa[2]) * t);
    return "rgb(" + r + "," + g + "," + bl + ")";
  }
  function hex(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  /* ---------- Game lifecycle ---------- */
  function startGame() {
    resize();
    reset();
    state.mode = "playing";
    hide(elOverStart); hide(elOverOver); hide(elOverLead); hide(elOverSaved);
    track("play_start", {});
  }

  function gameOver() {
    state.mode = "over";
    const tier = tierForHeight(state.height);
    track("play_end", { height: state.height, tier: tier.name });
    elOverHeight.textContent = state.height;
    elOverTier.textContent = tier.name;
    elOverEyebrow.textContent = state.height >= 560 ? "Ceiling fully gone" : "Ceiling reached";
    elOverMsg.textContent = resultMessage(state.height);
    show(elOverOver);
  }

  function resultMessage(h) {
    if (h >= 560) return "Director tier. That's the whole point — the ceiling stops being a thing.";
    if (h >= 300) return "Team-lead territory. Imagine doing this with a real team behind you.";
    if (h >= 120) return "Top-performer pace. The cap you hit elsewhere? Not here.";
    return "Everyone starts at tier one. Here you don't stay there long.";
  }

  /* ============================================================
     UI WIRING
     ============================================================ */
  const elHudTier = document.getElementById("hud-tier");
  const elHudHeight = document.getElementById("hud-height");
  const elHudEarn = document.getElementById("hud-earn");

  const elOverStart = document.getElementById("overlay-start");
  const elOverOver = document.getElementById("overlay-over");
  const elOverLead = document.getElementById("overlay-lead");
  const elOverSaved = document.getElementById("overlay-saved");

  const elOverHeight = document.getElementById("over-height");
  const elOverTier = document.getElementById("over-tier");
  const elOverEyebrow = document.getElementById("over-eyebrow");
  const elOverMsg = document.getElementById("over-msg");

  function show(el) { el.classList.remove("is-hidden"); }
  function hide(el) { el.classList.add("is-hidden"); }

  document.getElementById("btn-start").addEventListener("click", startGame);
  document.getElementById("btn-retry").addEventListener("click", startGame);
  document.getElementById("btn-replay").addEventListener("click", startGame);

  // Save my score -> lead form gate.
  document.getElementById("btn-save").addEventListener("click", () => {
    hide(elOverOver);
    document.getElementById("lead-height").textContent = state.height;
    show(elOverLead);
    track("save_clicked", { height: state.height });
  });

  // Lead form submit.
  const leadForm = document.getElementById("lead-form");
  const leadNote = document.getElementById("lead-note");
  leadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    leadNote.className = "bh-form-note";
    const name = document.getElementById("lead-name").value.trim();
    const email = document.getElementById("lead-email").value.trim();
    const segment = document.getElementById("lead-segment").value;
    const consent = document.getElementById("lead-consent").checked;

    if (!name || !email || !segment) {
      leadNote.textContent = "Please add your name, email and the option that fits you.";
      leadNote.classList.add("is-error"); return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      leadNote.textContent = "That email doesn't look right — mind checking it?";
      leadNote.classList.add("is-error"); return;
    }
    if (!consent) {
      leadNote.textContent = "We need your consent to save your score and get in touch.";
      leadNote.classList.add("is-error"); return;
    }

    const lead = {
      name: name, email: email,
      whatsapp: document.getElementById("lead-whatsapp").value.trim(),
      segment: segment, office: document.getElementById("lead-office").value,
      height: state.height,
    };
    state.lead = lead;

    leadNote.textContent = "Saving your climb…";
    const res = await submitLead(lead);

    // Write to the (local) leaderboard regardless — the board is client-side here.
    const entry = {
      name: firstNameLastInitial(name), height: state.height,
      office: lead.office || "", segment: segment, ts: Date.now(), you: true,
    };
    const list = addScore(entry);
    state.lastEntry = entry;
    track("score_saved", { height: state.height, office: lead.office || null, crm: !res.local });

    hide(elOverLead);
    showSaved(list, entry);
    renderBoard(currentBoard);
  });

  function firstNameLastInitial(full) {
    const parts = full.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    return parts[0] + " " + parts[parts.length - 1][0] + ".";
  }

  /* ---------- Saved + share ---------- */
  function showSaved(list, entry) {
    const weekly = list.filter((e) => weekKey(e.ts) === weekKey(Date.now()))
                       .sort((a, b) => b.height - a.height);
    const rank = weekly.indexOf(entry) + 1;
    document.getElementById("saved-rank").textContent =
      rank > 0 ? "Weekly rank #" + rank : "On the all-time board";
    drawShareCard(entry, rank);
    show(elOverSaved);
  }

  function drawShareCard(entry, rank) {
    const cv = document.getElementById("share-card");
    const c = cv.getContext("2d");
    const w = cv.width, h = cv.height;
    const tier = tierForHeight(entry.height);

    const g = c.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#2C537A"); g.addColorStop(1, "#16252d");
    c.fillStyle = g; c.fillRect(0, 0, w, h);

    // Salmon accent bar.
    c.fillStyle = "#FF787A"; c.fillRect(0, 0, w, 8);

    c.fillStyle = "#D9B9A0";
    c.font = "600 22px Georgia, serif";
    c.fillText("betterhomes", 44, 64);
    c.font = "600 13px 'Segoe UI', sans-serif";
    c.fillStyle = "#7BA0B2";
    c.fillText("TRUST BETTER. GET BETTER", 44, 88);

    c.fillStyle = "#ffffff";
    c.font = "600 78px Georgia, serif";
    c.fillText(entry.height + " m", 44, 188);

    c.font = "400 20px 'Segoe UI', sans-serif";
    c.fillStyle = "#EDE8E4";
    c.fillText("I broke through to " + tier.name, 44, 224);

    c.font = "600 16px 'Segoe UI', sans-serif";
    c.fillStyle = "#FF787A";
    c.fillText(rank > 0 ? "Weekly leaderboard  ·  rank #" + rank : "On the leaderboard", 44, 270);

    c.font = "400 14px 'Segoe UI', sans-serif";
    c.fillStyle = "rgba(237,232,228,0.7)";
    c.fillText("Beat me at bhomes.com/careers/play", 44, 296);
  }

  document.getElementById("btn-share").addEventListener("click", async () => {
    const note = document.getElementById("share-note");
    track("share_clicked", { height: state.height });
    const cv = document.getElementById("share-card");
    const shareData = {
      title: "Break the ceiling",
      text: "I climbed to " + state.height + "m on Break the ceiling. Beat me.",
      url: location.href,
    };
    try {
      // Try sharing the score card image where supported.
      if (navigator.canShare && cv.toBlob) {
        cv.toBlob(async (blob) => {
          const file = new File([blob], "break-the-ceiling.png", { type: "image/png" });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: shareData.title, text: shareData.text });
          } else {
            await navigator.share(shareData);
          }
        }, "image/png");
        return;
      }
      if (navigator.share) { await navigator.share(shareData); return; }
      await navigator.clipboard.writeText(shareData.text + " " + shareData.url);
      note.textContent = "Link copied — paste it anywhere.";
      note.className = "bh-form-note is-ok";
    } catch (e) {
      note.textContent = "Share cancelled.";
      note.className = "bh-form-note";
    }
  });

  /* ---------- Leaderboard rendering ---------- */
  const boardEl = document.getElementById("board");
  const boardEmptyEl = document.getElementById("board-empty");
  let currentBoard = "weekly";

  function renderBoard(kind) {
    currentBoard = kind;
    const all = loadScores();
    let rows;

    if (kind === "office") {
      // Aggregate best score per office.
      const byOffice = {};
      for (const e of all) {
        if (!e.office) continue;
        if (!byOffice[e.office] || e.height > byOffice[e.office].height) {
          byOffice[e.office] = { name: e.office, height: e.height, meta: "best climber: " + e.name, office: e.office };
        }
      }
      rows = Object.values(byOffice).sort((a, b) => b.height - a.height);
    } else {
      let list = all.slice();
      if (kind === "weekly") {
        const wk = weekKey(Date.now());
        list = list.filter((e) => weekKey(e.ts) === wk);
      }
      list.sort((a, b) => b.height - a.height);
      rows = list.slice(0, 10).map((e) => ({
        name: e.name, height: e.height,
        meta: [segLabel(e.segment), e.office].filter(Boolean).join(" · "),
        you: e.you,
      }));
    }

    boardEl.innerHTML = "";
    if (!rows.length) { show(boardEmptyEl); return; }
    hide(boardEmptyEl);
    rows.forEach((r, i) => {
      const li = document.createElement("li");
      if (r.you) li.classList.add("is-you");
      li.innerHTML =
        '<span class="bh-board-rank">' + (i + 1) + "</span>" +
        '<span class="bh-board-who"><span class="bh-board-name">' + esc(r.name) +
        '</span><span class="bh-board-meta">' + esc(r.meta || "") + "</span></span>" +
        '<span class="bh-board-score">' + r.height + " m</span>";
      boardEl.appendChild(li);
    });
  }

  function segLabel(s) {
    return ({ new: "New broker", returning: "Returning", experienced: "Experienced", relocating: "Relocating" })[s] || "";
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  document.querySelectorAll(".bh-board-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".bh-board-tab").forEach((t) => {
        t.classList.remove("is-active"); t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active"); tab.setAttribute("aria-selected", "true");
      renderBoard(tab.dataset.board);
    });
  });

  /* ---------- Tier legend ---------- */
  function renderTierLegend() {
    const wrap = document.getElementById("tier-legend");
    wrap.innerHTML = TIERS.map((t) =>
      '<div class="bh-tier">' +
        '<span class="bh-tier-rank">' + t.rank + "</span>" +
        '<h3 class="bh-tier-name">' + t.name + "</h3>" +
        '<p class="bh-tier-earn">' + aed(t.earn) + " / yr</p>" +
        '<p class="bh-tier-desc">' + t.desc + "</p>" +
      "</div>"
    ).join("");
  }

  /* ---------- Smooth-scroll the play CTAs ---------- */
  document.querySelectorAll("[data-scroll-play]").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      document.getElementById("play").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Init ---------- */
  function init() {
    // ?code= links a physical-puzzle recipient to their lead profile.
    const params = new URLSearchParams(location.search);
    state.code = params.get("code");
    if (state.code) track("code_arrival", { code: state.code });

    resize();
    seedIfEmpty();
    renderTierLegend();
    renderBoard("weekly");
    updateHUD();
    const yr = document.getElementById("bh-year");
    if (yr) yr.textContent = new Date().getFullYear();
    requestAnimationFrame(frame);
  }

  let resizeRAF = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(() => {
      const px = state.player.x / (W || 1);
      resize();
      // Keep the player proportionally placed after a resize.
      state.player.x = px * W; state.player.targetX = state.player.x;
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
