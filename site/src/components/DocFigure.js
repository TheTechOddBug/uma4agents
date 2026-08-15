import React, { useEffect, useRef, useState } from "react";
import { animate, utils } from "animejs";

/**
 * A figure in the documentation that can move.
 *
 * The scene model is the home page's, for the reason given at the top of
 * src/animation/story.js: anime composes animations per property, so a single
 * long timeline silently drops the second tween for any property it already
 * animates. Each scene instead declares `end` — what it leaves changed — and
 * `play` — the motion within it. Applying the base state plus every earlier
 * scene's `end` reproduces any moment exactly, which is what makes stepping
 * and reduced-motion work without a second code path.
 *
 * Three rules this component enforces so the motion never carries meaning the
 * page would lose without it:
 *
 *   1. The captions are the explanation. They render as an ordered list
 *      whatever happens — animation off, JavaScript off, screen reader.
 *   2. `prefers-reduced-motion` lands on the final frame, not a blank one.
 *   3. Nothing plays until the figure is on screen, and it stops when it
 *      leaves. A diagram animating in a viewport nobody is looking at is a
 *      battery cost with no reader.
 *
 * Selectors in scenes are resolved against this figure's own DOM, so two
 * figures on one page cannot animate each other.
 */

const DocFigure = ({ title, scenes, children, caption }) => {
  const rootRef = useRef(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const timer = useRef(null);
  // Once the reader touches the controls they own playback. Without this the
  // viewport observer below restarts the animation a moment after any click,
  // so choosing a step and reading it is impossible.
  const takenOver = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !scenes || scenes.length === 0) return undefined;

    const $$ = (sel) => Array.from(root.querySelectorAll(sel));

    const apply = (state) => {
      for (const [sel, props] of Object.entries(state)) {
        const targets = $$(sel);
        if (targets.length) utils.set(targets, props);
      }
    };

    // The accumulated state once scene `i` has finished. Inclusive of `i`,
    // because a reader who clicks step 4 wants to see what step 4 leaves
    // behind — not the frame before it ran.
    const stateThrough = (i) => {
      const state = {};
      for (let s = 0; s <= i && s < scenes.length; s += 1) {
        for (const [sel, props] of Object.entries(scenes[s].end || {})) {
          state[sel] = { ...(state[sel] || {}), ...props };
        }
      }
      return state;
    };

    // Animations already in flight have to be stopped before a new frame is
    // applied. anime keeps tweening on its own clock, so a scene the reader
    // just skipped past will happily write its end values over the frame they
    // asked for — which looked like the wrong step rendering.
    const running = [];
    const track = (targets, props) => {
      const instance = animate(targets, props);
      running.push(instance);
      return instance;
    };
    const stopAll = () => {
      for (const instance of running) {
        if (instance && typeof instance.pause === "function") instance.pause();
      }
      running.length = 0;
    };

    root.__figure = {
      apply,
      goto: (i) => {
        stopAll();
        apply(scenes[0].reset || {});
        apply(stateThrough(i));
      },
      play: (i) => {
        const scene = scenes[i];
        if (scene && scene.play) scene.play(track, $$);
      },
    };

    return () => {
      stopAll();
      root.__figure = null;
    };
  }, [scenes]);

  // Reduced motion: settle on the last frame and never move.
  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const fig = rootRef.current && rootRef.current.__figure;
    if (!fig || !scenes) return;
    if (reduced) {
      fig.goto(scenes.length - 1);
      setPlaying(false);
      return;
    }
    fig.goto(step);
    if (playing) fig.play(step);
  }, [step, playing, reduced, scenes]);

  // Advance while playing.
  useEffect(() => {
    if (!playing || reduced || !scenes) return undefined;
    const hold = scenes[step]?.hold ?? 2600;
    timer.current = setTimeout(() => {
      setStep((s) => (s + 1) % scenes.length);
    }, hold);
    return () => clearTimeout(timer.current);
  }, [playing, step, reduced, scenes]);

  // Play when it comes into view, stop when it leaves.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced || !scenes) return undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Leaving the viewport always stops it; coming back only starts it
        // again if the reader has not taken over.
        if (!entry.isIntersecting) setPlaying(false);
        else if (!takenOver.current) setPlaying(true);
      },
      { threshold: 0.35 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, [reduced, scenes]);

  const animated = scenes && scenes.length > 0;

  return (
    <figure className="doc-diagram" ref={rootRef}>
      <div className="doc-diagram__frame">{children}</div>

      {animated && !reduced && (
        <div className="doc-figure__controls">
          <button
            type="button"
            className="doc-figure__button"
            onClick={() => {
              takenOver.current = true;
              setPlaying((p) => !p);
            }}
            aria-label={playing ? `Pause: ${title}` : `Play: ${title}`}
          >
            {playing ? "❙❙" : "▶"}
          </button>
          <ol className="doc-figure__steps">
            {scenes.map((s, i) => (
              <li key={s.text}>
                <button
                  type="button"
                  className={`doc-figure__step${
                    i === step ? " doc-figure__step--active" : ""
                  }`}
                  aria-current={i === step ? "step" : undefined}
                  onClick={() => {
                    takenOver.current = true;
                    setPlaying(false);
                    setStep(i);
                  }}
                >
                  {i + 1}
                </button>
              </li>
            ))}
          </ol>
          <p className="doc-figure__caption" aria-live="polite">
            {scenes[step].text}
          </p>
        </div>
      )}

      {/* Always present. This is the figure's actual explanation; the motion
          illustrates it. Visually hidden once the live caption above is
          carrying the current step, and shown in full when nothing moves. */}
      {animated && (
        <ol
          className={`doc-figure__script${
            reduced ? "" : " doc-figure__script--quiet"
          }`}
        >
          {scenes.map((s) => (
            <li key={s.text}>{s.text}</li>
          ))}
        </ol>
      )}

      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};

export default DocFigure;
