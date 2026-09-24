/* ==========================================================
   Flores amarillas — lógica
   1 Config y textos · 2 Utilidades · 3 Girasol (SVG) · 4 Campo
   5 Pétalos · 6 Ramo · 7 Tarjetas y modal · 8 Día/Noche
   9 Línea de tiempo y reinicio
   ========================================================== */

/* ---------- 1. CONFIG Y TEXTOS (edita aquí) ---------- */
const CARDS = [
  { emoji: "🎁", title: "Una sorpresa", hint: "Toca para abrir",
    heading: "Esto es para ti 🌻",
    text: "Quise regalarte flores que no se marchitan,\nque florecen cada vez que las miras.",
    sign: "— Con cariño", burst: true },
  { emoji: "💌", title: "Un mensaje para ti", hint: "Léelo con calma",
    heading: "Un mensaje",
    text: "Gracias por existir y por hacer los días\nmás luminosos. Que nunca te falte sol,\nni flores amarillas.",
    sign: "— Siempre tuyo" }
];

// Dedicatoria que aparece junto con el ramo (edítala aquí)
const DEDICATION = "Para Danna 🥰";

const MOBILE = matchMedia("(max-width:640px)").matches;
const REDUCED = matchMedia("(prefers-reduced-motion:reduce)").matches;
const K = REDUCED ? 0.15 : 1;              // factor de velocidad de la línea de tiempo
const $ = id => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);

/* ---------- 3. GIRASOL (definido una vez, reutilizado con <use>) ---------- */
function createSunflowerSymbol() {
  let petals = "";
  const ring = (n, off, ry, fill) => {
    for (let i = 0; i < n; i++)
      petals += `<ellipse cx="0" cy="-31" rx="7.5" ry="${ry}" fill="${fill}" transform="rotate(${i * 360 / n + off})"/>`;
  };
  ring(16, 0, 19, "#f2a900");     // pétalos de atrás (más oscuros)
  ring(16, 11, 18, "#ffd23a");    // pétalos de delante
  $("defs").innerHTML = `
    <radialGradient id="core" cx="45%" cy="40%"><stop offset="0" stop-color="#9a5b1c"/><stop offset="1" stop-color="#3b2008"/></radialGradient>
    <symbol id="sf" viewBox="-50 -50 100 100" overflow="visible">${petals}
      <circle r="17" fill="url(#core)"/>
      <circle r="11" fill="none" stroke="#c98a3a" stroke-width="1.4" stroke-dasharray="1.5 3.2" opacity=".8"/>
      <circle r="5"  fill="none" stroke="#c98a3a" stroke-width="1.2" stroke-dasharray="1 2.6" opacity=".8"/>
    </symbol>`;
}

/* ---------- 4. CAMPO DE FLORES ---------- */
// Cada capa tiene distinto tamaño/posición: eso crea la profundidad
const LAYERS = {
  far:  { n: 26, w: 0.065, bottom: [24, 30], sway: [1, 2] },
  mid:  { n: 15, w: 0.135, bottom: [4, 16],  sway: [1.5, 3] },
  near: { n: 6,  w: 0.28,  bottom: [-16, -6], sway: [2, 4] }
};

function createField() {
  const H = innerHeight, f = MOBILE ? 0.6 : 1;
  for (const [name, c] of Object.entries(LAYERS)) {
    const box = $(name); box.innerHTML = "";
    const n = Math.round(c.n * f);
    for (let i = 0; i < n; i++) {
      const w = H * c.w * rand(0.8, 1.25), el = document.createElement("div");
      el.className = "flower";
      el.style.cssText = `left:${(i + rand(0, 1)) / n * 110 - 8}%;bottom:${rand(...c.bottom)}%;
        width:${w}px;height:${w * 2.6}px;--a:${rand(...c.sway)}deg;--sd:${rand(4, 7)}s;--sl:${-rand(0, 6)}s`;
      const green = name === "far" ? "#3f8f34" : "#3f9a2f";
      el.innerHTML = `<svg viewBox="0 0 100 260" style="transform:scaleX(${Math.random() < .5 ? -1 : 1})">
        <path d="M50 260C46 190 54 120 50 50" stroke="${green}" stroke-width="4" fill="none"/>
        <path d="M50 200C25 190 12 165 8 150C32 152 46 172 50 200Z" fill="#4caf3a"/>
        <path d="M50 160C75 150 88 128 93 112C68 115 54 135 50 160Z" fill="#5cc043"/>
        <use href="#sf" x="12" y="4" width="76" height="76"/></svg>`;
      box.appendChild(el);
    }
  }
}

/* ---------- 5. PÉTALOS ---------- */
// Crea n pétalos con tamaño, velocidad, giro y deriva aleatorios
function createPetals(n, cls = "") {
  const box = $("petals");
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    p.className = "petal " + cls;
    p.style.cssText = `--x:${rand(0, 100)}%;--s:${rand(8, 20)}px;--d:${rand(9, 16)}s;--dl:${-rand(0, 14)}s;
      --dx:${rand(-120, 160)}px;--r:${rand(-720, 720)}deg`;
    box.appendChild(p);
  }
}
const ambientPetals = () => createPetals(REDUCED ? 0 : MOBILE ? 5 : 8, "amb");
const startRain = () => createPetals(REDUCED ? 0 : MOBILE ? 9 : 16, "rain");
const burstPetals = () => {                   // pétalos extra al abrir una tarjeta
  const before = $("petals").children.length; createPetals(MOBILE ? 8 : 14, "burst");
  setTimeout(() => [...$("petals").querySelectorAll(".burst")].forEach(p => p.remove()), 16000);
};

/* ---------- 6. FORMACIÓN DEL RAMO ---------- */
// x, y, tamaño y rotación de cada girasol dentro del viewBox 300x400
const HEADS = [
  [150, 78, 96, 0], [92, 118, 82, -12], [208, 118, 82, 12], [150, 150, 80, 6],
  [52, 178, 66, -18], [248, 178, 66, 18], [100, 186, 62, 10], [200, 186, 62, -10]
];

function buildBouquet() {
  const NS = "http://www.w3.org/2000/svg", root = $("bouquet");
  const stems = HEADS.map(([x, y], i) =>
    `<path class="b-stem" pathLength="1" style="--d:${i * .12}s" d="M150 330Q${150 + (x - 150) * .3} ${(330 + y) / 2} ${x} ${y + 12}"/>`).join("");
  const leaves = [[86, 226, -50], [214, 226, 50], [118, 208, -25], [182, 208, 25]].map(([x, y, r], i) =>
    `<ellipse class="b-leaf" style="--d:${.9 + i * .15}s" cx="${x}" cy="${y}" rx="15" ry="34" fill="${i % 2 ? '#4caf3a' : '#5cc043'}" transform="rotate(${r} ${x} ${y})"/>`).join("");
  const heads = HEADS.map(([x, y, s, r]) =>
    `<g transform="translate(${x} ${y}) rotate(${r})"><g class="b-head"><use href="#sf" x="${-s / 2}" y="${-s / 2}" width="${s}" height="${s}"/></g></g>`).join("");
  root.innerHTML = `<svg viewBox="0 0 300 400"><g class="b-sway">
    ${stems}${leaves}${heads}
    <g class="b-paper" style="--d:1.3s">
      <path d="M52 214Q150 246 248 214L150 396Z" fill="#fff8e6" stroke="#eadcb4" stroke-width="2"/>
      <path d="M150 396L98 226M150 396L202 226" stroke="#eadcb4" stroke-width="1.5" fill="none"/>
      <path d="M112 282Q150 296 188 282L182 302Q150 314 118 302Z" fill="#7cc46a"/>
    </g></g></svg>`;
  root.getBoundingClientRect();               // fuerza reflow para activar transiciones
  root.classList.add("on");
  $("dedic").textContent = DEDICATION;          // dedicatoria junto al ramo
  setTimeout(() => $("dedic").classList.add("show"), 900 * K);

  // Los girasoles "viajan" desde distintos puntos del campo hasta su lugar
  root.querySelectorAll(".b-head").forEach((h, i) => {
    const d = REDUCED ? 1 : 1500;
    h.animate([
      { transform: `translate(${rand(-500, 500)}px,${rand(80, 400)}px) scale(.15)`, opacity: 0 },
      { opacity: 1, offset: .4 },
      { transform: "none", opacity: 1 }
    ], { duration: d, delay: i * 140 * K, easing: "cubic-bezier(.2,.9,.25,1.12)", fill: "both" });
  });
}

/* ---------- 7. TARJETAS Y MODAL ---------- */
function createCards() {
  $("cards").innerHTML = CARDS.map((c, i) =>
    `<button class="card" type="button" data-i="${i}" style="transition-delay:${i * .25}s,${i * .25}s,0s,0s">
      <span class="em">${c.emoji}</span><span><b>${c.title}</b><small>${c.hint}</small></span></button>`).join("");
  $("cards").querySelectorAll(".card").forEach(b => b.onclick = () => openModal(CARDS[b.dataset.i]));
}
const showCards = () => $("cards").querySelectorAll(".card").forEach(c => c.classList.add("show"));

function openModal(c) {
  $("mEmoji").textContent = c.emoji; $("mTitle").textContent = c.heading;
  $("mText").textContent = c.text;   $("mSign").textContent = c.sign || "";
  $("modal").classList.add("open"); $("modal").setAttribute("aria-hidden", "false");
  $("mClose").focus();
  if (c.burst) burstPetals();
}
function closeModal() { $("modal").classList.remove("open"); $("modal").setAttribute("aria-hidden", "true"); }
$("mClose").onclick = closeModal;
$("modal").onclick = e => { if (e.target === $("modal")) closeModal(); };
addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

/* ---------- 8. DÍA / NOCHE ---------- */
// Día: 5:00–17:59 · Noche: 18:00–4:59. Prueba: añade ?modo=dia o ?modo=noche a la URL
function isDaytime() {
  const forced = new URLSearchParams(location.search).get("modo");
  if (forced) return forced === "dia";
  const h = new Date().getHours();
  return h >= 5 && h < 18;
}
function applyTime() {
  const day = isDaytime();
  document.body.classList.toggle("day", day);
  document.body.classList.toggle("night", !day);
}
function createStars() {
  const n = MOBILE ? 45 : 90;
  $("stars").innerHTML = Array.from({ length: n }, () =>
    `<i style="left:${rand(0, 100)}%;top:${rand(0, 100)}%;--s:${rand(1, 2.8)}px;--t:${rand(2, 5)}s;--dl:${-rand(0, 5)}s"></i>`).join("");
}

/* ---------- 9. LÍNEA DE TIEMPO Y REINICIO ---------- */
let timers = [];
const at = (ms, fn) => timers.push(setTimeout(fn, ms * K));

function play() {
  at(2500, () => $("world").classList.add("walk"));            // la cámara avanza
  at(6500, buildBouquet);                                       // las flores se reúnen
  at(10500, () => { $("title").classList.add("show"); startRain(); });  // título + lluvia
  at(12500, showCards);                                         // tarjetas
  at(14500, () => $("replay").classList.add("show"));           // botón repetir
}

function resetExperience() {
  timers.forEach(clearTimeout); timers = [];
  closeModal();
  const w = $("world");
  w.classList.add("reset"); w.classList.remove("walk"); w.offsetWidth; w.classList.remove("reset");
  $("dedic").classList.remove("show");
  $("bouquet").classList.remove("on"); $("bouquet").innerHTML = "";
  $("title").classList.remove("show"); $("replay").classList.remove("show");
  $("cards").querySelectorAll(".card").forEach(c => c.classList.remove("show"));
  $("petals").innerHTML = "";
  ambientPetals();
  play();
}
$("replay").onclick = resetExperience;

/* ---------- INICIO ---------- */
createSunflowerSymbol(); createField(); createStars(); createCards();
applyTime(); setInterval(applyTime, 60000);      // vuelve a comprobar la hora cada minuto
ambientPetals(); play();

// Si cambia el ancho (rotar el móvil), regenera el campo sin reiniciar todo
let lastW = innerWidth, rt;
addEventListener("resize", () => {
  clearTimeout(rt);
  rt = setTimeout(() => { if (Math.abs(innerWidth - lastW) > 80) { lastW = innerWidth; createField(); } }, 300);
});
