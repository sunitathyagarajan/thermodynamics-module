/* =========================================================
   GasCylinder — a canvas animation of gas particles in a
   cylinder with a movable piston. Used by several lessons.

   const g = new GasCylinder(canvas, { n: 40 });
   g.setVolumeFrac(0.6);   // piston height (0..1 of max)
   g.setTemp(300);         // particle speed ∝ √T
   g.setFlame(true);       // draw burner underneath
   g.setWeights(3);        // number of weights on piston
   g.setSand(k);           // pile of sand grains (0..1)
   ========================================================= */

class GasCylinder {
  constructor(canvas, opts = {}) {
    this.c = canvas;
    this.ctx = canvas.getContext("2d");
    this.n = opts.n || 40;
    this.T = opts.T || 300;
    this.vf = opts.vf ?? 0.5;           // target volume fraction
    this.vfShown = this.vf;             // animated
    this.flame = false;
    this.ice = false;
    this.bath = false;
    this.weights = opts.weights || 0;
    this.sand = 0;
    this.lockPin = false;
    this.insulated = false;
    this.labels = opts.labels !== false;
    this.particles = [];
    this.heatArrows = 0;   // +1 in, -1 out
    this.workArrow = 0;    // +1 on system (down), -1 by system (up)
    this.t = 0;
    this._resize();
    for (let i = 0; i < this.n; i++) {
      this.particles.push({ x: Math.random(), y: Math.random(), a: Math.random() * Math.PI * 2 });
    }
    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(canvas);
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }
  _resize() {
    const dpr = window.devicePixelRatio || 1;
    const r = this.c.getBoundingClientRect();
    this.W = r.width || 320; this.H = r.height || 300;
    this.c.width = this.W * dpr; this.c.height = this.H * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  setVolumeFrac(v) { this.vf = Math.max(0.08, Math.min(1, v)); }
  setTemp(T) { this.T = Math.max(1, T); }
  setFlame(on) { this.flame = !!on; }
  setIce(on) { this.ice = !!on; }
  setBath(on) { this.bath = !!on; }
  setWeights(k) { this.weights = k; }
  setSand(k) { this.sand = k; }
  setLock(on) { this.lockPin = !!on; }
  setInsulated(on) { this.insulated = !!on; }
  setArrows(heat, work) { this.heatArrows = heat; this.workArrow = work; }

  _loop(ts) {
    this.t = ts / 1000;
    // ease piston
    this.vfShown += (this.vf - this.vfShown) * 0.08;
    this._draw();
    requestAnimationFrame(this._loop);
  }

  _draw() {
    const ctx = this.ctx, W = this.W, H = this.H;
    const col = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    ctx.clearRect(0, 0, W, H);

    // geometry
    const cylW = Math.min(W * 0.46, 190);
    const cx = W / 2;
    const left = cx - cylW / 2, right = cx + cylW / 2;
    const bottom = H - 62, topMax = 70;
    const innerH = bottom - topMax;
    const pistonY = bottom - innerH * this.vfShown;
    const pistonH = 14;

    // surroundings label
    if (this.labels) {
      ctx.fillStyle = col("--surr");
      ctx.font = "600 12px Calibri, Carlito, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("SURROUNDINGS", 10, 18);
    }

    // insulation
    if (this.insulated) {
      ctx.fillStyle = col("--surface-2");
      ctx.strokeStyle = col("--ink-3");
      ctx.setLineDash([3, 3]);
      ctx.fillRect(left - 16, topMax - 30, cylW + 32, bottom - topMax + 46);
      ctx.strokeRect(left - 16, topMax - 30, cylW + 32, bottom - topMax + 46);
      ctx.setLineDash([]);
    }

    // gas region
    const hot = Math.min(1, Math.max(0, (this.T - 200) / 600));
    ctx.fillStyle = `rgba(${Math.round(80 + 170 * hot)}, ${Math.round(140 - 60 * hot)}, ${Math.round(230 - 170 * hot)}, 0.16)`;
    ctx.fillRect(left, pistonY + pistonH, cylW, bottom - pistonY - pistonH);

    // particles
    const speed = 0.0045 * Math.sqrt(this.T / 300);
    const gx0 = left + 6, gx1 = right - 6, gy0 = pistonY + pistonH + 6, gy1 = bottom - 6;
    ctx.fillStyle = col("--sys");
    for (const p of this.particles) {
      p.x += Math.cos(p.a) * speed * 1.4;
      p.y += Math.sin(p.a) * speed * 1.4 * (innerH / Math.max(40, gy1 - gy0)) * 0.6;
      if (p.x < 0) { p.x = -p.x; p.a = Math.PI - p.a; }
      if (p.x > 1) { p.x = 2 - p.x; p.a = Math.PI - p.a; }
      if (p.y < 0) { p.y = -p.y; p.a = -p.a; }
      if (p.y > 1) { p.y = 2 - p.y; p.a = -p.a; }
      const x = gx0 + p.x * (gx1 - gx0), y = gy0 + p.y * Math.max(0, gy1 - gy0);
      ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
    }

    // walls
    ctx.strokeStyle = col("--ink");
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(left, topMax - 30); ctx.lineTo(left, bottom); ctx.lineTo(right, bottom); ctx.lineTo(right, topMax - 30);
    ctx.stroke();

    // system boundary (dashed)
    ctx.strokeStyle = col("--sys");
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 5]);
    ctx.strokeRect(left + 3, pistonY + pistonH + 2, cylW - 6, bottom - pistonY - pistonH - 5);
    ctx.setLineDash([]);
    if (this.labels) {
      ctx.fillStyle = col("--sys");
      ctx.font = "700 12px Calibri, Carlito, sans-serif";
      ctx.textAlign = "center";
      if (bottom - pistonY > 60) ctx.fillText("SYSTEM (gas)", cx, bottom - 12);
    }

    // piston
    ctx.fillStyle = col("--ink-2");
    ctx.fillRect(left + 2, pistonY, cylW - 4, pistonH);
    ctx.fillRect(cx - 5, pistonY - 26, 10, 26);

    // lock pins
    if (this.lockPin) {
      ctx.fillStyle = col("--bad");
      ctx.fillRect(left - 12, pistonY - 6, 14, 6);
      ctx.fillRect(right - 2, pistonY - 6, 14, 6);
    }

    // weights
    const plateY = pistonY - 26;
    ctx.fillStyle = col("--ink-2");
    ctx.fillRect(cx - 34, plateY - 4, 68, 4);
    let wy = plateY - 4;
    for (let i = 0; i < this.weights; i++) {
      ctx.fillStyle = i % 2 ? col("--ink-3") : col("--ink-2");
      ctx.fillRect(cx - 28, wy - 16, 56, 16);
      wy -= 16;
    }
    // sand pile
    if (this.sand > 0) {
      ctx.fillStyle = col("--surr");
      const h = 30 * this.sand, w = 34 + 30 * this.sand;
      ctx.beginPath();
      ctx.moveTo(cx - w, wy); ctx.quadraticCurveTo(cx, wy - 2 * h, cx + w, wy); ctx.closePath(); ctx.fill();
    }

    // flame / ice bath
    if (this.flame) {
      const f = 1 + 0.15 * Math.sin(this.t * 22);
      for (let k = -1; k <= 1; k++) {
        const fx = cx + k * 30;
        ctx.fillStyle = col("--heat");
        ctx.beginPath();
        ctx.moveTo(fx - 10, H - 14);
        ctx.quadraticCurveTo(fx - 12, H - 14 - 26 * f, fx, H - 14 - 38 * f);
        ctx.quadraticCurveTo(fx + 12, H - 14 - 26 * f, fx + 10, H - 14);
        ctx.fill();
        ctx.fillStyle = "#ffd25a";
        ctx.beginPath();
        ctx.moveTo(fx - 5, H - 14);
        ctx.quadraticCurveTo(fx - 6, H - 14 - 12 * f, fx, H - 14 - 20 * f);
        ctx.quadraticCurveTo(fx + 6, H - 14 - 12 * f, fx + 5, H - 14);
        ctx.fill();
      }
      ctx.fillStyle = col("--ink-3");
      ctx.fillRect(cx - 55, H - 14, 110, 8);
    }
    if (this.bath) {
      ctx.fillStyle = "rgba(120, 190, 240, .35)";
      ctx.fillRect(left - 30, pistonY + 30, cylW + 60, bottom - pistonY - 24);
      ctx.strokeStyle = col("--ink-3"); ctx.lineWidth = 2;
      ctx.strokeRect(left - 30, pistonY + 30, cylW + 60, bottom - pistonY - 24);
      ctx.fillStyle = col("--ink-2"); ctx.font = "600 11px Calibri, Carlito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText("water bath · 300 K", cx, bottom + 18);
    }
    if (this.ice) {
      ctx.fillStyle = "rgba(120, 190, 240, .35)";
      ctx.fillRect(left - 30, bottom - 40, cylW + 60, 46);
      ctx.fillStyle = "#d4eefc"; ctx.strokeStyle = "#8cc4f0";
      for (let k = 0; k < 6; k++) {
        const x = left - 22 + k * (cylW + 40) / 5;
        ctx.fillRect(x, bottom - 14 - (k % 2) * 10, 14, 14);
        ctx.strokeRect(x, bottom - 14 - (k % 2) * 10, 14, 14);
      }
    }

    // energy arrows
    const dash = (this.t * 40) % 20;
    if (this.heatArrows) {
      ctx.strokeStyle = col("--heat"); ctx.fillStyle = col("--heat");
      ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.lineDashOffset = this.heatArrows > 0 ? -dash : dash;
      const yA = bottom - (bottom - pistonY) * 0.45;
      for (const side of [-1, 1]) {
        const xOuter = side < 0 ? left - 60 : right + 60, xInner = side < 0 ? left - 8 : right + 8;
        const [x0, x1] = this.heatArrows > 0 ? [xOuter, xInner] : [xInner, xOuter];
        ctx.beginPath(); ctx.moveTo(x0, yA); ctx.lineTo(x1, yA); ctx.stroke();
        this._head(x1, yA, x1 > x0 ? 0 : Math.PI);
      }
      ctx.setLineDash([]);
      ctx.font = "700 14px Calibri, Carlito, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(this.heatArrows > 0 ? "q > 0" : "q < 0", left - 40, yA - 12);
    }
    if (this.workArrow) {
      ctx.strokeStyle = col("--work"); ctx.fillStyle = col("--work");
      ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.lineDashOffset = -dash;
      const xA = right + 34, yTop = pistonY - 50, yBot = pistonY + 10;
      const [y0, y1] = this.workArrow > 0 ? [yTop, yBot] : [yBot, yTop];
      ctx.beginPath(); ctx.moveTo(xA, y0); ctx.lineTo(xA, y1); ctx.stroke();
      ctx.setLineDash([]);
      this._head(xA, y1, y1 > y0 ? Math.PI / 2 : -Math.PI / 2);
      ctx.font = "700 14px Calibri, Carlito, sans-serif"; ctx.textAlign = "left";
      ctx.fillText(this.workArrow > 0 ? "w > 0" : "w < 0", xA + 10, (yTop + yBot) / 2);
    }
  }
  _head(x, y, ang) {
    const ctx = this.ctx;
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-10, -8); ctx.lineTo(-10, 8); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
}
