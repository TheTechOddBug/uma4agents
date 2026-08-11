/* The story, as a sequence of scenes.
 *
 * One cast on one stage; the scenes are camera directions rather than
 * separate drawings, so the agent's walk from the vault to Alice's
 * authorization server and back is the same motion the protocol describes.
 *
 * Why a scene machine and not one long timeline
 * ---------------------------------------------
 * The obvious build is a single anime timeline with every move placed on it
 * by absolute time. It does not survive contact with this story, because
 * anime composes animations per property: adding a second tween for the same
 * property of the same element to one timeline silently discards it. The
 * agent's opacity changes five times here and its position eight times, so
 * most of the story would quietly never play — and it would look like it
 * worked, because the first tween for each property still runs.
 *
 * So each scene instead declares two things: `set`, the state of anything it
 * changes at the moment it begins, and `play`, the motion within it. Playing
 * a scene means applying the accumulated state and issuing fresh `animate()`
 * calls, which compose correctly because they are separate animations rather
 * than entries in one timeline. Scrubbing becomes exact and cheap: to show
 * any moment, apply the base state plus every scene's `set` up to that point.
 *
 * The captions are the authoritative text. They are in the DOM as an ordered
 * list whatever happens, so the page explains itself with the animation
 * switched off, with JavaScript disabled, and to a screen reader. The
 * animation illustrates the words; it does not carry meaning the words lack.
 */

import { animate, utils } from './vendor/anime.esm.min.js';

const $ = (sel) => document.querySelector(sel);

/* Where everyone stands. Named so the scenes read as blocking notes. */
const HOME = 240;
const OFFSTAGE_L = -140;
const PHONE_MARK = 372;        // beside the nightstand, reaching for it
const BOB_MARK = 470;
const AGENT_MARK = BOB_MARK + 92;
/* Structures are wide; an actor stands beside one, not inside it. These are
   the marks the agent walks to, offset left of each building's centre. */
const AS_CENTRE = 700;
const AS_MARK = AS_CENTRE - 112;
const VAULT_CENTRE = 1040;
const VAULT_MARK = VAULT_CENTRE - 140;
const VAULT_STEP = VAULT_MARK - 66;   // bounced back from the door
const GROUND = 560;

/* The stage before anything happens. Every property any scene ever touches
 * appears here, so that "put it back how it started" is a fact about this
 * object rather than a list of resets someone has to remember to update. */
const BASE = {
  '#alice':            { x: HOME, y: GROUND, opacity: 1 },
  '#alice-arm-l':      { rotate: 0 },
  '#bob':              { x: OFFSTAGE_L, y: GROUND, opacity: 0 },
  '#agent':            { x: OFFSTAGE_L - 90, y: GROUND, opacity: 0 },
  '#agent .eye':       { fill: '#5b8cff', opacity: 1 },
  '#ticket':           { x: VAULT_MARK, y: GROUND - 128, opacity: 0 },
  '#scroll':           { x: AS_MARK, y: GROUND - 250, opacity: 0, scaleY: 1 },
  '#signature':        { x: AS_CENTRE, y: GROUND - 236, opacity: 0 },
  '#key':              { x: AS_CENTRE, y: GROUND - 230, opacity: 0, rotate: 0, scale: 1 },
  '#ledger':           { x: 600, y: 400, opacity: 0 },
  '#titlecard':        { opacity: 0 },
  '#laptop-lid':       { rotate: 0 },
  '#laptop-screen':    { stroke: '#5b8cff' },
  '#place-nightstand': { opacity: 0 },
  '#phone-screen':     { fill: '#0d1119' },
  '#buzz':             { opacity: 0 },
  '#as-shield':        { stroke: '#5b8cff' },
  '#vault-spokes':     { rotate: 0 },
  '#vault-no':         { opacity: 0, scale: 1 },
  '#vault-yes':        { opacity: 0, scale: 1 },
  '#alice-row':        { opacity: 0.25 },
  '#alice-row .own-row': { stroke: '#232c3d' },
  '#question':         { x: VAULT_CENTRE, y: GROUND - 300, opacity: 0, scale: 1 },
};

/* Each scene declares only two things:
 *
 *   `end`  — what this scene leaves changed when it finishes. Nothing else.
 *   `play` — the motion within it.
 *
 * The stage at the start of scene i is the base plus every earlier scene's
 * `end`, in order. That is the whole state model, and it is worth being
 * strict about: the first draft had each scene restate the entire world it
 * expected to find, which duplicated every fact a dozen times and got four
 * of them wrong — a ticket that stayed in frame for the rest of the story, a
 * phone left glowing green through the credits. A scene cannot know what
 * came before it. It can only be honest about what it leaves behind.
 */
const SCENES = [
  {
    at: 0,
    text: 'Alice\u2019s money sits at her brokerage \u2014 in a system that holds a thousand other clients\u2019 holdings too.',
    end: { '#alice-row': { opacity: 1 }, '#alice-row .own-row': { stroke: '#5b8cff' } },
    play() {
      animate('#alice-row', { opacity: [0.25, 1], duration: 900, ease: 'outQuad' });
      animate('#alice-row .own-row', { stroke: ['#232c3d', '#5b8cff'], duration: 900, ease: 'outQuad' });
    },
  },
  {
    at: 5000,
    text: 'Her new advisor\u2019s agent is going to come asking for it. The brokerage cannot answer for her \u2014 and she will not always be awake.',
    end: {},
    play() {
      animate('#question', { opacity: [0, 1], y: [GROUND - 270, GROUND - 300], duration: 700, ease: 'outBack' });
      animate('#question', { scale: [1, 1.08, 1], duration: 1100, loop: 2, delay: 800 });
      animate('#question', { opacity: [1, 0], duration: 500, delay: 3900 });
    },
  },
  {
    at: 10000,
    text: 'So she writes her terms once \u2014 what an agent may see, for what purpose, for how long.',
    end: {},
    play() {
      // her hand at the keys
      animate('#alice-arm-l', { rotate: [0, 15, 0], duration: 640, loop: 3, ease: 'inOutSine' });
      animate('#laptop-screen', { stroke: ['#5b8cff', '#8f6bff', '#5b8cff'], duration: 1700, loop: 2 });
    },
  },
  {
    at: 15200,
    text: 'Then she closes the laptop. Nothing that follows waits for her to open it again.',
    end: { '#laptop-lid': { rotate: 82 }, '#alice': { x: OFFSTAGE_L },
           '#place-nightstand': { opacity: 1 } },
    play() {
      animate('#laptop-lid', { rotate: [0, 82], duration: 900, ease: 'inOutBack' });
      animate('#alice', { x: [HOME, OFFSTAGE_L], duration: 2500, delay: 900, ease: 'inOutSine' });
      animate('#place-nightstand', { opacity: [0, 1], duration: 700, delay: 1600 });
    },
  },
  {
    at: 20200,
    text: 'Bob is that advisor. His firm works through an agent, and it needs her portfolio.',
    end: { '#bob': { x: BOB_MARK, opacity: 1 }, '#agent': { x: AGENT_MARK, opacity: 1 } },
    play() {
      animate('#bob', { opacity: [0, 1], x: [OFFSTAGE_L, BOB_MARK], duration: 2000, ease: 'outSine' });
      animate('#agent', { opacity: [0, 1], x: [OFFSTAGE_L - 90, AGENT_MARK], duration: 2100, delay: 150, ease: 'outSine' });
      animate('#agent .eye', { opacity: [1, 0.25, 1], duration: 520, loop: 3, delay: 2300 });
    },
  },
  {
    at: 25200,
    beat: 'Beat 1 \u00b7 challenge',
    text: 'The server refuses it \u2014 and hands it a ticket, with the address of Alice\u2019s authorization server.',
    end: { '#agent': { x: VAULT_STEP }, '#ticket': { x: VAULT_STEP, opacity: 1 } },
    play() {
      animate('#agent', { x: [AGENT_MARK, VAULT_MARK], duration: 2100, ease: 'inOutSine' });
      animate('#agent', { y: [GROUND, GROUND - 14, GROUND], duration: 340, loop: 2, delay: 2200 });
      animate('#vault-no', { opacity: [0, 1], scale: [0.6, 1], duration: 520, delay: 2800, ease: 'outBack' });
      animate('#agent', { x: [VAULT_MARK, VAULT_STEP], duration: 480, delay: 2900, ease: 'outQuad' });
      animate('#ticket', {
        opacity: [0, 1], x: [VAULT_CENTRE - 70, VAULT_STEP],
        y: [GROUND - 200, GROUND - 128], duration: 900, delay: 3200, ease: 'outQuad',
      });
      animate('#vault-no', { opacity: [1, 0], duration: 500, delay: 4900 });
    },
  },
  {
    at: 31000,
    beat: 'Beat 2 \u00b7 the terms',
    text: 'The agent takes the ticket to her server. She isn\u2019t there. Her terms are.',
    end: { '#agent': { x: AS_MARK }, '#ticket': { opacity: 0 }, '#scroll': { opacity: 1 } },
    play() {
      animate(['#agent', '#ticket'], { x: AS_MARK, duration: 2200, ease: 'inOutSine' });
      animate('#ticket', { opacity: [1, 0], duration: 400, delay: 2300 });
      animate('#scroll', {
        opacity: [0, 1], scaleY: [0.06, 1], y: [GROUND - 190, GROUND - 250],
        duration: 800, delay: 2500, ease: 'outBack',
      });
      animate('#as-shield', { stroke: ['#5b8cff', '#2ed079', '#5b8cff'], duration: 1500, delay: 2800 });
    },
  },
  {
    at: 36800,
    beat: 'Beat 3 \u00b7 commit',
    text: 'The agent signs them, or it walks away. There is no third option and no haggling.',
    end: { '#scroll': { opacity: 0 }, '#signature': { opacity: 0 },
           '#agent .eye': { fill: '#2ed079' } },
    play() {
      animate('#signature', { opacity: [0, 1], duration: 200 });
      animate('#sign-line', { strokeDasharray: ['0 200', '200 0'], duration: 1100, ease: 'outQuad' });
      animate('#agent .eye', { fill: ['#5b8cff', '#2ed079'], duration: 600, delay: 1200 });
      animate(['#scroll', '#signature'], { opacity: [1, 0], duration: 600, delay: 3400 });
    },
  },
  {
    at: 41600,
    beat: 'Beat 4 \u00b7 grant',
    text: 'Signed, it is let in \u2014 for that purpose, for that long, and no further. Alice is still asleep.',
    end: { '#agent': { x: VAULT_MARK, opacity: 1 }, '#vault-spokes': { rotate: 200 } },
    play() {
      animate('#agent', { x: [AS_MARK, VAULT_MARK], duration: 1900, ease: 'inOutSine' });
      animate('#vault-yes', { opacity: [0, 1], scale: [0.6, 1], duration: 560, delay: 2000, ease: 'outBack' });
      animate('#vault-spokes', { rotate: [0, 200], duration: 1200, delay: 2000, ease: 'inOutQuad' });
      animate('#agent', { x: [VAULT_MARK, VAULT_MARK + 62], opacity: [1, 0.3], duration: 800, delay: 2600 });
      animate('#vault-yes', { opacity: [1, 0], duration: 400, delay: 4200 });
      animate('#agent', { x: [VAULT_MARK + 62, VAULT_MARK], opacity: [0.3, 1], duration: 700, delay: 4400 });
    },
  },
  {
    at: 47200,
    text: 'Then it asks to sell something. Her policy says: not this one. Ask me.',
    end: { '#vault-no': { opacity: 1 }, '#as-shield': { stroke: '#f2b955' },
           '#agent .eye': { fill: '#f2b955' } },
    play() {
      animate('#agent', { y: [GROUND, GROUND - 14, GROUND], duration: 340, loop: 2 });
      animate('#vault-no', { opacity: [0, 1], scale: [0.6, 1], duration: 500, delay: 700, ease: 'outBack' });
      animate('#as-shield', { stroke: ['#5b8cff', '#f2b955'], duration: 700, delay: 1300 });
      animate('#agent .eye', { fill: ['#2ed079', '#f2b955'], duration: 500, delay: 1500 });
    },
  },
  {
    at: 52400,
    text: 'Her phone buzzes. She approves that one order, from the couch.',
    end: { '#phone-screen': { fill: '#2ed079' } },
    play() {
      animate('#phone-screen', { fill: ['#0d1119', '#f2b955', '#0d1119'], duration: 900, loop: 3 });
      animate('#buzz', { opacity: [0, 1, 0], duration: 900, loop: 3 });
      animate('#alice', { x: [OFFSTAGE_L, PHONE_MARK], duration: 1700, delay: 500, ease: 'outSine' });
      animate('#alice-arm-l', { rotate: [0, -32, 0], duration: 700, delay: 2400 });
      animate('#phone-screen', { fill: ['#0d1119', '#2ed079'], duration: 400, delay: 2900 });
      animate('#alice', { x: [PHONE_MARK, OFFSTAGE_L], duration: 2100, delay: 3500, ease: 'inSine' });
    },
  },
  {
    at: 58000,
    text: 'The key she grants opens the door once, for that trade, and then it is spent.',
    end: { '#vault-no': { opacity: 0 }, '#vault-spokes': { rotate: 380 },
           '#agent .eye': { fill: '#5b8cff' }, '#as-shield': { stroke: '#5b8cff' },
           '#phone-screen': { fill: '#0d1119' } },
    play() {
      animate('#key', {
        opacity: [0, 1], x: [AS_CENTRE, VAULT_CENTRE - 60],
        y: [GROUND - 230, GROUND - 150], rotate: [0, 380],
        duration: 1400, ease: 'outQuad',
      });
      animate('#vault-no', { opacity: [1, 0], duration: 300, delay: 1200 });
      animate('#vault-yes', { opacity: [0, 1], scale: [0.6, 1], duration: 500, delay: 1400, ease: 'outBack' });
      animate('#vault-spokes', { rotate: [200, 380], duration: 1000, delay: 1400 });
      // and then it is spent
      animate('#key', { scale: [1, 1.3, 0], opacity: [1, 1, 0], duration: 1000, delay: 2800, ease: 'inBack' });
      animate('#vault-yes', { opacity: [1, 0], duration: 400, delay: 4200 });
      animate('#agent .eye', { fill: ['#f2b955', '#5b8cff'], duration: 400, delay: 4200 });
      animate('#as-shield', { stroke: ['#f2b955', '#5b8cff'], duration: 400, delay: 4200 });
      animate('#phone-screen', { fill: ['#2ed079', '#0d1119'], duration: 400, delay: 4200 });
    },
  },
  {
    at: 63400,
    text: 'And all of it is written down on her side: what was promised, what was touched, what she personally approved.',
    end: { '#agent': { opacity: 0.16 }, '#bob': { opacity: 0.16 } },
    play() {
      animate(['#agent', '#bob'], { opacity: [1, 0.16], duration: 700 });
      animate('#ledger', { opacity: [0, 1], y: [432, 400], duration: 800, delay: 300, ease: 'outBack' });
      animate('#ledger .ledger-row', {
        opacity: [0, 1], x: [-24, 0], duration: 520, delay: (_, i) => 800 + i * 380,
      });
      animate('#ledger', { opacity: [1, 0], duration: 700, delay: 4400 });
    },
  },
  {
    at: 68600,
    text: '',
    // The story ends where it began, and the striking of the set is part of
    // the last beat rather than something the loop does with a cut: the
    // curtain comes up, everyone goes back to their opening marks behind it,
    // and it lifts on the first frame again. Which is why this scene's `end`
    // restores the base — by the time the curtain is out of the way, the
    // stage already matches it, so starting over is invisible.
    end: {
      '#alice': { x: HOME }, '#bob': { opacity: 0, x: OFFSTAGE_L },
      '#agent': { opacity: 0, x: OFFSTAGE_L - 90 },
      '#ticket': { x: VAULT_MARK, opacity: 0 },
      '#laptop-lid': { rotate: 0 }, '#place-nightstand': { opacity: 0 },
      '#vault-spokes': { rotate: 0 },
      '#alice-row': { opacity: 0.25 }, '#alice-row .own-row': { stroke: '#232c3d' },
    },
    play() {
      animate('#titlecard', { opacity: [0, 1], duration: 900 });
      // behind the curtain
      animate(['#agent', '#bob'], { opacity: [0.16, 0], duration: 500, delay: 1500 });
      animate('#alice', { x: [OFFSTAGE_L, HOME], duration: 10, delay: 2000 });
      animate('#agent', { x: [VAULT_MARK, OFFSTAGE_L - 90], duration: 10, delay: 2000 });
      animate('#bob', { x: [BOB_MARK, OFFSTAGE_L], duration: 10, delay: 2000 });
      animate('#laptop-lid', { rotate: [82, 0], duration: 10, delay: 2000 });
      animate('#place-nightstand', { opacity: [1, 0], duration: 400, delay: 2000 });
      animate('#vault-spokes', { rotate: [380, 0], duration: 10, delay: 2000 });
      animate('#alice-row', { opacity: [1, 0.25], duration: 400, delay: 2000 });
      animate('#alice-row .own-row', { stroke: ['#5b8cff', '#232c3d'], duration: 400, delay: 2000 });
      animate('#titlecard', { opacity: [1, 0], duration: 900, delay: 3400 });
    },
  },
];

const TOTAL = 73000;

/* ---- the story as text, always ----------------------------------------- */

const storyboard = $('#storyboard');
for (const s of SCENES) {
  if (!s.text) continue;
  const li = document.createElement('li');
  li.innerHTML = (s.beat ? `<b>${s.beat}.</b> ` : '') + s.text;
  storyboard.appendChild(li);
}

/* ---- applying state ------------------------------------------------------ */

function apply(state) {
  for (const [sel, props] of Object.entries(state)) {
    const targets = document.querySelectorAll(sel);
    if (targets.length) utils.set(targets, props);
  }
}

/* The stage as it stands at the start of scene `i`: the base, plus what
 * every earlier scene left behind. Deriving it rather than storing it is
 * what makes scrubbing exact — there is no snapshot to drift out of date. */
function stateAt(i) {
  const out = structuredClone(BASE);
  for (let n = 0; n < i; n++) {
    for (const [sel, props] of Object.entries(SCENES[n].end)) {
      out[sel] = { ...(out[sel] || {}), ...props };
    }
  }
  return out;
}

const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  /* Nothing moves. The stage holds one readable frame — everyone present,
   * mid-story — and the list above carries the whole explanation. */
  apply(stateAt(5));
  apply({ '#agent': { x: AGENT_MARK }, '#alice': { x: HOME, opacity: 1 } });
} else {
  run();
}

function run() {
  const caption = $('#caption');
  const scrub = $('#scrub');
  const toggle = $('#toggle');

  let current = -1;
  let clock = 0;          // ms into the story
  let last = null;        // rAF timestamp of the previous frame
  let playing = true;
  let dragging = false;

  function showScene(i, { animateIt = true } = {}) {
    current = i;
    apply(stateAt(i));
    if (animateIt) SCENES[i].play();
    const s = SCENES[i];
    caption.style.opacity = '0';
    setTimeout(() => {
      caption.innerHTML = s.text
        ? (s.beat ? `<span class="beat">${s.beat}</span>` : '') + s.text
        : '';
      caption.style.opacity = '1';
    }, 160);
  }

  function sceneAt(ms) {
    let i = 0;
    for (let n = 0; n < SCENES.length; n++) if (ms >= SCENES[n].at) i = n;
    return i;
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (last === null) last = now;
    const dt = now - last;
    last = now;
    if (!playing || dragging) return;

    clock += dt;
    if (clock >= TOTAL) clock -= TOTAL;         // and round again
    const want = sceneAt(clock);
    if (want !== current) showScene(want);
    scrub.value = Math.round((clock / TOTAL) * 1000);
  }

  showScene(0);
  requestAnimationFrame(frame);

  /* ---- controls ---------------------------------------------------------- */

  function setPlaying(on) {
    playing = on;
    toggle.textContent = on ? 'Pause' : 'Play';
    toggle.setAttribute('aria-label', on ? 'Pause' : 'Play');
  }

  toggle.addEventListener('click', () => setPlaying(!playing));

  $('#replay').addEventListener('click', () => {
    clock = 0;
    showScene(0);
    setPlaying(true);
  });

  /* Scrubbing lands on a scene, which is the unit a presenter actually wants
   * to hold — and, conveniently, the unit whose state is exactly derivable. */
  scrub.addEventListener('pointerdown', () => { dragging = true; setPlaying(false); });
  scrub.addEventListener('pointerup', () => { dragging = false; });
  scrub.addEventListener('input', () => {
    clock = (scrub.value / 1000) * TOTAL;
    const want = sceneAt(clock);
    if (want !== current) showScene(want);
  });

  /* A presenter's convenience: space holds a beat without hunting for the
     button. Ignored while a control has focus, so the buttons still work. */
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !['BUTTON', 'INPUT'].includes(e.target.tagName)) {
      e.preventDefault();
      setPlaying(!playing);
    }
  });

  /* A handle for poking at it from the console: `u4a.scene(4)` to hold a
     beat. Costs nothing and saves rebuilding the page to answer "what does
     it look like at beat 2". */
  window.u4a = {
    scenes: SCENES,
    scene: (i) => { setPlaying(false); clock = SCENES[i].at; showScene(i); },
    stateAt,
  };
}
