# thermodynamics-module

An interactive learning module on the principles of thermodynamics for first-year (freshman) general chemistry students. It is a plain static website (HTML, CSS and JavaScript, no build step), so it can be opened directly in a browser or published with GitHub Pages.

**▶ Open the live module:** https://sunitathyagarajan.github.io/thermodynamics-module/

**Source code:** https://github.com/sunitathyagarajan/thermodynamics-module

## Lessons

| # | Page | What it covers |
|---|------|----------------|
| – | `index.html` | Overview, learning objectives, color key, key-equations card |
| 1 | `lessons/01-introduction.html` | What thermodynamics is, the macroscopic view, energy and units, the four laws, state vs path functions (interactive hiking demo) |
| 2 | `lessons/02-system-surroundings.html` | System, surroundings, boundary and universe; choosing the boundary (interactive); open, closed and isolated systems (animated); classification practice; exothermic vs endothermic (animated thermometers) |
| 3 | `lessons/03-energy-heat-work.html` | Internal energy U (animated solid/liquid/gas particles), heat q (heat-transfer animation, q = mcΔT, heating curve of water), work w (derivation of w = −P_extΔV, interactive P–V work), Joule's experiment, sign conventions, examples in gases, liquids and solids |
| 4 | `lessons/04-first-law.html` | ΔU = q + w, energy-accountant widget, piston simulator (constant V, constant P, adiabatic, isothermal), path dependence, special cases, calorimetry and enthalpy |
| 5 | `lessons/05-state-path-functions.html` | State vs path functions: route analogy, a drag-the-path P–V tool (ΔU fixed while q and w change, with a path log), why U is a state function (property of the state; perpetual-motion argument), why q and w are path functions (energy in transit, pond analogy, work as area, q = ΔU − w), an animated cycle, and a sorting activity |
| 6 | `lessons/06-calculations.html` | Nine step-by-step worked examples of different kinds (gas, solid, liquid → gas, solid → liquid, reactions, bomb calorimetry, reversible vs one-step), each with a "try it" check, plus a random practice-problem generator |
| 7 | `lessons/07-reversible-irreversible.html` | Reversible vs irreversible work and heat, a side-by-side animation (blocks moved at once vs sand moved grain by grain, with live P–V traces and work bars), the N-step P–V widget with convergence chart and cycles, the reservoir ladder for heat, a summary table, reversible work in gases, liquids and solids (compressibility chart, sound waves, boiling, surface work, a Daniell cell, an elastic-vs-plastic steel-wire interactive, compression comparison) and a numbered reference list with in-text citations |
| 8 | `lessons/08-enthalpy.html` | Enthalpy: H = U + PV and ΔH = q_P (derivation and diagram), measuring ΔH for gases, liquids and solids (calorimeters, ΔH vs ΔU interactive), the forms of ΔH (formation, combustion, fusion, vaporization, sublimation, solution, neutralization, bond, atomization, ionization, electron gain, lattice), enthalpy of phases (level diagram, phase-change calculator, heating/cooling calculator for water), with references |
| 9 | `lessons/09-hess-law.html` | Hess's law: statement and rules, interactive Hess puzzles with a waterfall diagram, and every method for ΔH — coffee-cup and bomb calorimetry, Hess's law, formation enthalpies (calculator with Hess cycle), bond enthalpies (interactive), heating/phase changes, Kirchhoff's law (interactive), Born–Haber cycle (step-through), a method-selection table, a first-law summary, with references |
| 10 | `lessons/10-second-law.html` | "Nature's one-way street": the second law, entropy as randomness (with a note on "disorder"), three animated examples (diffusion, gas expanding with a fluctuation trace, melting), microstates and macrostates, Boltzmann's S = k ln W with a microstate explorer, worked calculations with answer checks, conceptual questions, references |
| 11 | `lessons/11-spontaneity.html` | Spontaneity: spontaneous vs nonspontaneous, ΔS of system/surroundings/universe, formulas for ΔS of the system with worked examples and practice, ΔS_surr = −ΔH/T, an ice ⇌ water interactive showing all three situations, worked examples (spontaneous, equilibrium, nonspontaneous), a "heat flowing uphill" example with an interactive and a refrigerator diagram showing when ΔS_univ would decrease, a spontaneity explorer with temperature slider, entropy in living things and reactions (respiration, photosynthesis, catalase, protein folding), factors affecting entropy (factor explorer, predict-the-sign activity, ΔH/ΔS sign table), a scored "Test yourself" on Lessons 10–11, a summary so far, references |
| 12 | `lessons/12-third-law.html` | The third law: three ways to state it, why a perfect crystal has W = 1 and S = 0, residual entropy of CO and ice (crystal diagrams), measuring absolute entropy (interactive build-up of S for water from 0 K, with and without residual entropy), why entropy has a true zero but enthalpy doesn't, adiabatic demagnetization and the unattainability of absolute zero (interactive cooling staircase), practice, quizzes, references |
| 13 | `lessons/13-gibbs-free-energy.html` | Gibbs free energy: step-by-step derivation of ΔG = ΔH − TΔS = −TΔS_univ, what ΔG means (direction, maximum useful work, the "entropy tax", minimum G at equilibrium), a ΔG explorer with real reactions and temperature, ΔG° from ΔGf° and from ΔH° and ΔS°, ΔG° and K (interactive), vapor pressure of water from ΔG°, the Gibbs energy of the surroundings (ΔG_surr = 0 for a heat bath; ledger interactive) and of the universe, why we focus on the system, applications with interactives (Haber–Bosch operating conditions, drug binding, protein stability and sterilization, ATP coupling, Ellingham diagram for metal extraction, fuel-cell efficiency, diamond vs graphite), quizzes, module wrap-up, references |

Every diagram uses the same color code: blue = system, sand = surroundings, orange-red = heat (q), green = work (w), indigo = internal energy (U). Pages support light and dark mode.

## Running it

Open `index.html` in a browser, or serve the folder locally:

```bash
python3 -m http.server 8000
```

then visit http://localhost:8000.

To publish: in the GitHub repository settings, enable **Pages** from the `main` branch, root folder.

## Structure

```
index.html
lessons/          thirteen lesson pages
assets/css/       shared stylesheet (color tokens, layout, widgets)
assets/js/        common.js (navigation, quizzes, step reveal, answer checks)
                  gas.js (animated gas-in-a-piston canvas used by lessons 3, 4 and 7)
                  work-race.js (side-by-side reversible vs irreversible work animation, lesson 7)
```

All text uses **Calibri**. On devices without Calibri installed, the pages load Carlito (a free, metric-compatible equivalent) from Google Fonts — the only external resource.
