/* =========================================================
   Work race — irreversible vs reversible work, side by side.
   Lesson 6. Needs common.js (fmt, signed) loaded first.

   Both cylinders: 1.00 mol ideal gas, 298 K (water bath),
   between 4.00 atm / 6.12 L and 1.00 atm / 24.5 L.
   Left: 3 of 4 blocks moved at once (P_ext jumps).
   Right: same extra load as sand, moved one grain at a time
          (P_ext always ≈ P_gas).
   ========================================================= */
(function () {
  const root = document.getElementById("race");
  if (!root) return;

  const nRT = 24.4653, V1 = nRT / 4, V2 = nRT, J = 101.325, G = 24, BH = 13;
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const ease = (x) => x * x * (3 - 2 * x);
  const pLabel = (p) => `P<tspan dy="3" font-size="9">ext</tspan><tspan dy="-3"> = ${p.toFixed(2)} atm</tspan>`;

  // geometry
  const Ycyl = (v) => 315 - v * 8.4;          // top of gas
  const platTop = (v) => Ycyl(v) - 39;        // top surface of the load platform
  const CX = (v) => 50 + v / 26 * 290, CY = (p) => 470 - p / 4.5 * 110;

  // grain k leaves the pile when P_ext falls to Pk
  const Pk = (k) => 1 + 3 * (G - k - 1) / G;
  const grainY = (k) => platTop(nRT / Pk(k)) - BH - 4;
  const grainX = (k) => 268 + (k % 4) * 22;

  let dir = "exp";   // "exp" | "comp"
  let t = 0;         // shared clock 0..1

  // ---------- build one panel ----------
  function build(svg, kind) {
    const P = { kind };
    // water bath
    el("rect", { x: 104, y: 56, width: 152, height: 268, rx: 8, fill: "rgba(120,190,240,.22)", stroke: "var(--ink-3)", "stroke-dasharray": "4 3" }, svg);
    // gas
    P.gas = el("rect", { x: 120, width: 120, fill: "var(--sys-fill)" }, svg);
    P.dots = [];
    const dg = el("g", { fill: "var(--sys)" }, svg);
    for (let i = 0; i < 16; i++) {
      P.dots.push({ e: el("circle", { r: 3.5 }, dg), x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .02, vy: (Math.random() - .5) * .02 });
    }
    // cylinder walls
    el("path", { d: "M118 50 V 317 H 242 V 50", fill: "none", stroke: "var(--ink)", "stroke-width": 4 }, svg);
    // piston, rod, platform
    P.piston = el("rect", { x: 121, width: 118, height: 10, fill: "var(--ink-2)" }, svg);
    P.rod = el("rect", { x: 175, width: 10, height: 24, fill: "var(--ink-2)" }, svg);
    P.plat = el("rect", { x: 140, width: 80, height: 5, fill: "var(--ink-2)" }, svg);
    // bottom block (always on the piston): worth 1 atm
    P.base = el("rect", { x: 148, width: 64, height: BH, rx: 2, fill: "var(--ink-3)", stroke: "var(--ink-2)" }, svg);

    if (kind === "irr") {
      P.ledge = el("line", { x1: 16, x2: 102, stroke: "var(--ink)", "stroke-width": 3 }, svg);
      P.ledgeLbl = el("text", { x: 62, "text-anchor": "middle", class: "t-small t-muted" }, svg);
      P.ledgeLbl.textContent = "shelf";
      P.blocks = [1, 2, 3].map(() => el("rect", { width: 64, height: BH, rx: 2, fill: "var(--ink-3)", stroke: "var(--ink-2)" }, svg));
    } else {
      P.pile = el("path", { fill: "var(--surr)" }, svg);
      P.grains = [];
      for (let k = 0; k < G; k++) {
        const y = grainY(k), x = grainX(k);
        el("line", { x1: x - 8, x2: x + 8, y1: y + 4, y2: y + 4, stroke: "var(--ink-3)", "stroke-width": 1.5 }, svg);
        P.grains.push(el("circle", { cx: x, cy: y, r: 3.4, fill: "var(--surr)" }, svg));
      }
      el("text", { x: 301, y: 48, "text-anchor": "middle", class: "t-small t-muted" }, svg).textContent = "sand shelves";
    }
    P.pLbl = el("text", { x: 300, "text-anchor": "middle", class: "t-small", style: "font-weight:700" }, svg);

    // ---------- P–V chart ----------
    el("text", { x: 180, y: 348, "text-anchor": "middle", class: "t-small", style: "font-weight:700" }, svg).textContent = "P–V diagram (shaded area = |w|)";
    el("line", { x1: 50, y1: 470, x2: 345, y2: 470, stroke: "var(--ink)", "stroke-width": 1.5 }, svg);
    el("line", { x1: 50, y1: 470, x2: 50, y2: 355, stroke: "var(--ink)", "stroke-width": 1.5 }, svg);
    [0, 5, 10, 15, 20, 25].forEach(v => { el("text", { x: CX(v), y: 484, "text-anchor": "middle", class: "t-small t-muted" }, svg).textContent = v; });
    [0, 1, 2, 3, 4].forEach(p => {
      el("text", { x: 44, y: CY(p) + 4, "text-anchor": "end", class: "t-small t-muted" }, svg).textContent = p;
      if (p) el("line", { x1: 50, x2: 345, y1: CY(p), y2: CY(p), stroke: "var(--line)" }, svg);
    });
    el("text", { x: 198, y: 500, "text-anchor": "middle", class: "t-small" }, svg).textContent = "V (L)";
    el("text", { x: 18, y: 412, "text-anchor": "middle", class: "t-small", transform: "rotate(-90 18 412)" }, svg).textContent = "P (atm)";
    let iso = "";
    for (let i = 0; i <= 50; i++) { const v = V1 + (V2 - V1) * i / 50; iso += (i ? " L" : "M") + CX(v).toFixed(1) + " " + CY(nRT / v).toFixed(1); }
    el("path", { d: iso, fill: "none", stroke: "var(--ink-3)", "stroke-width": 1.5, "stroke-dasharray": "4 4" }, svg);
    const col = kind === "irr" ? "var(--heat)" : "var(--work)";
    P.area = el("path", { fill: col, opacity: .22 }, svg);
    P.trace = el("path", { fill: "none", stroke: col, "stroke-width": 3, "stroke-linejoin": "round" }, svg);
    el("circle", { cx: CX(V1), cy: CY(4), r: 4, fill: "var(--ink)" }, svg);
    el("circle", { cx: CX(V2), cy: CY(1), r: 4, fill: "var(--ink)" }, svg);
    P.dot = el("circle", { r: 6, fill: col, stroke: "#fff", "stroke-width": 2 }, svg);
    return P;
  }

  const irr = build(document.getElementById("raceIrr"), "irr");
  const rev = build(document.getElementById("raceRev"), "rev");

  // ---------- state of each side at shared time t ----------
  function irrState() {
    const s = clamp(t / 0.22);                  // irreversible finishes in 22% of the time
    const sl = clamp(s / 0.25), m = clamp((s - 0.25) / 0.75);
    const Va = dir === "exp" ? V1 : V2, Vb = dir === "exp" ? V2 : V1;
    const f = m === 0 ? 0 : 1 - Math.pow(1 - m, 5) * Math.cos(3 * Math.PI * m); // small overshoot = piston momentum
    const V = Va + (Vb - Va) * f;
    const Vc = Math.max(V1, Math.min(V2, V));
    const blocksOn = dir === "exp" ? (sl < 1 ? 4 : 1) : (sl < 1 ? 1 : 4);
    const Pext = dir === "exp" ? (sl > 0 ? 1 : 4) : (sl > 0 ? 4 : 1);
    const w = sl < 1 ? 0 : -Pext * (Vc - Va);
    return { s, sl, m, V, Vc, Pext, w, blocksOn };
  }
  function revState() {
    const s = t;
    const Va = dir === "exp" ? V1 : V2, Vb = dir === "exp" ? V2 : V1;
    const V = Va * Math.pow(Vb / Va, s);
    const Pext = nRT / V;
    return { s, V, Pext, w: -nRT * Math.log(V / Va) };
  }

  function drawCommon(P, V) {
    const yg = Ycyl(V);
    P.gas.setAttribute("y", yg); P.gas.setAttribute("height", 315 - yg);
    P.piston.setAttribute("y", yg - 10);
    P.rod.setAttribute("y", yg - 34);
    P.plat.setAttribute("y", platTop(V));
    P.base.setAttribute("y", platTop(V) - BH);
    P.dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0 || d.x > 1) { d.vx *= -1; d.x = clamp(d.x); }
      if (d.y < 0 || d.y > 1) { d.vy *= -1; d.y = clamp(d.y); }
      d.e.setAttribute("cx", (125 + d.x * 110).toFixed(1));
      d.e.setAttribute("cy", (yg + 5 + d.y * Math.max(0, 315 - yg - 10)).toFixed(1));
    });
  }

  function render() {
    // ----- irreversible -----
    const a = irrState();
    drawCommon(irr, a.V);
    const ledgeSurface = platTop(dir === "exp" ? V1 : V2) - BH;
    irr.ledge.setAttribute("y1", ledgeSurface); irr.ledge.setAttribute("y2", ledgeSurface);
    irr.ledgeLbl.setAttribute("y", ledgeSurface + 14);
    irr.blocks.forEach((b, i) => {
      const off = dir === "exp" ? -122 * ease(a.sl) : -122 * (1 - ease(a.sl));
      const onPiston = dir === "comp" && a.sl >= 1;
      const y = onPiston ? platTop(a.V) - (i + 2) * BH : ledgeSurface - (i + 1) * BH;
      b.setAttribute("x", 148 + off); b.setAttribute("y", y);
    });
    irr.pLbl.setAttribute("y", platTop(a.V) - a.blocksOn * BH - 8);
    irr.pLbl.setAttribute("x", 180);
    irr.pLbl.innerHTML = pLabel(a.Pext);
    // trace
    const Va = dir === "exp" ? V1 : V2, Pa = dir === "exp" ? 4 : 1, Pb = dir === "exp" ? 1 : 4;
    const pNow = a.sl < 1 ? Pa + (Pb - Pa) * a.sl : Pb;
    let d = `M${CX(Va)} ${CY(Pa)} L${CX(Va)} ${CY(pNow)}`;
    let ar = "";
    if (a.sl >= 1) {
      d += ` L${CX(a.Vc)} ${CY(Pb)}`;
      ar = `M${CX(Va)} ${CY(0)} L${CX(Va)} ${CY(Pb)} L${CX(a.Vc)} ${CY(Pb)} L${CX(a.Vc)} ${CY(0)} Z`;
    }
    irr.trace.setAttribute("d", d); irr.area.setAttribute("d", ar);
    irr.dot.setAttribute("cx", CX(a.sl >= 1 ? a.Vc : Va)); irr.dot.setAttribute("cy", CY(pNow));

    // ----- reversible -----
    const b = revState();
    drawCommon(rev, b.V);
    const g = Math.max(0, Math.min(G, Math.ceil(G * (b.Pext - 1) / 3 - 1e-6)));
    rev.grains.forEach((c, k) => c.setAttribute("opacity", k < G - g ? 1 : 0));
    const y0 = platTop(b.V) - BH, h = g ? 3 + 30 * g / G : 0;
    rev.pile.setAttribute("d", g ? `M${180 - 34} ${y0} Q180 ${y0 - 2 * h} ${180 + 34} ${y0} Z` : "");
    rev.pLbl.setAttribute("y", y0 - Math.max(h, 0) - 12);
    rev.pLbl.setAttribute("x", 180);
    rev.pLbl.innerHTML = pLabel(b.Pext);
    let rd = "", Vstart = dir === "exp" ? V1 : V2;
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const v = Vstart * Math.pow(b.V / Vstart, i / steps);
      rd += (i ? " L" : "M") + CX(v).toFixed(1) + " " + CY(nRT / v).toFixed(1);
    }
    rev.trace.setAttribute("d", rd);
    rev.area.setAttribute("d", rd + ` L${CX(b.V)} ${CY(0)} L${CX(Vstart)} ${CY(0)} Z`);
    rev.dot.setAttribute("cx", CX(b.V)); rev.dot.setAttribute("cy", CY(b.Pext));

    // ----- readouts -----
    const set = (id, txt) => { document.getElementById(id).textContent = txt; };
    set("irrP", a.Pext.toFixed(2) + " atm"); set("irrV", a.V.toFixed(1) + " L"); set("irrW", signed(a.w * J, 0) + " J");
    set("revP", b.Pext.toFixed(2) + " atm"); set("revV", b.V.toFixed(1) + " L"); set("revW", signed(b.w * J, 0) + " J");
    const max = 7437;
    document.getElementById("barIrr").style.width = Math.abs(a.w * J) / max * 100 + "%";
    document.getElementById("barRev").style.width = Math.abs(b.w * J) / max * 100 + "%";
    set("barIrrV", fmt(Math.abs(a.w * J), 0) + " J"); set("barRevV", fmt(Math.abs(b.w * J), 0) + " J");
    set("barTitle", dir === "exp" ? "Work done BY the gas (energy given to the loads)" : "Work done ON the gas (energy taken from the loads)");
    document.getElementById("raceTOut").textContent = t === 0 ? "start" : t >= 1 ? "finished" : Math.round(t * 100) + "%";

    document.getElementById("irrStatus").innerHTML =
      a.s === 0 ? (dir === "exp" ? "Ready: three blocks will be slid off onto the shelf in one go." : "Ready: three blocks on the high shelf will be pushed onto the piston in one go.")
      : a.s < 1 ? (dir === "exp" ? "Whoosh! P<sub>ext</sub> dropped to 1 atm; the gas (still at 4 atm) shoots the piston up and overshoots." : "Crash! P<sub>ext</sub> jumped to 4 atm; the piston slams down on the 1-atm gas.")
      : "Done in a flash — the gas was far from equilibrium the whole time.";
    document.getElementById("revStatus").innerHTML =
      b.s === 0 ? (dir === "exp" ? "Ready: sand grains will be moved to the shelves one at a time." : "Ready: grains on the shelves will be added back one at a time.")
      : b.s < 1 ? `${dir === "exp" ? "Each grain removed" : "Each grain added"} changes P<sub>ext</sub> only slightly, so P<sub>ext</sub> ≈ P<sub>gas</sub> and the piston creeps along the isotherm.`
      : "Done — but only after (ideally) infinitely many tiny steps.";

    const msg = document.getElementById("raceMsg");
    if (t >= 1) {
      msg.style.display = "block";
      msg.innerHTML = dir === "exp"
        ? `<b>Same start, same finish, same ΔU (= 0 for an ideal gas at constant T) — different work.</b> The sudden expansion lifted just one block, against 1 atm: <b>1,859 J</b>. The reversible expansion pushed against the largest possible pressure at every moment, lifting each sand grain as high as it could go before setting it on a shelf: <b>3,437 J</b>, 85% more. Reversible expansion gives the <b>maximum</b> work. Since ΔU = 0, the gas also drew that much heat from the water bath (q = −w).`
        : `<b>Same start, same finish — different work.</b> Dropping the three blocks from the high shelf crushed the gas with 4 atm the whole way: the surroundings did <b>7,437 J</b> of work on it. Adding the sand grain by grain, each from the shelf at its own height, needed only <b>3,437 J</b>. Reversible compression needs the <b>minimum</b> work. The extra 4,000 J in the sudden case ends up as heat dumped into the water bath.`;
    } else msg.style.display = "none";
  }

  // ---------- controls ----------
  const slider = document.getElementById("raceT");
  let playing = false, last = 0;
  const DUR = 9000;
  function frame(now) {
    if (playing) {
      t = Math.min(1, t + (now - last) / DUR);
      last = now;
      slider.value = Math.round(t * 1000);
      if (t >= 1) { playing = false; document.getElementById("racePlay").textContent = "▶ Play again"; }
    }
    render();
    requestAnimationFrame(frame);
  }
  document.getElementById("racePlay").addEventListener("click", (e) => {
    if (playing) { playing = false; e.target.textContent = "▶ Play"; return; }
    if (t >= 1) t = 0;
    playing = true; last = performance.now(); e.target.textContent = "❚❚ Pause";
  });
  document.getElementById("raceReset").addEventListener("click", () => {
    playing = false; t = 0; slider.value = 0; document.getElementById("racePlay").textContent = "▶ Play";
  });
  slider.addEventListener("input", () => {
    playing = false; t = slider.value / 1000; document.getElementById("racePlay").textContent = "▶ Play";
  });
  root.querySelectorAll("[data-race]").forEach(b => b.addEventListener("click", () => {
    dir = b.dataset.race;
    root.querySelectorAll("[data-race]").forEach(x => x.classList.toggle("on", x === b));
    playing = false; t = 0; slider.value = 0; document.getElementById("racePlay").textContent = "▶ Play";
  }));
  requestAnimationFrame(frame);
})();
