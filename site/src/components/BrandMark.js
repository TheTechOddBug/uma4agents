import React from "react";
import { monogram, disc } from "../style/marks";

/**
 * The brand marks.
 *
 * Geometry comes from src/style/marks.js; colour comes from the page, through
 * the custom properties src/style/theme.js emits, so the mark follows the
 * theme. The committed static/brand/*.svg twins bake the dark values in,
 * because a file served on its own has no page to read from — those files are
 * generated from the same two modules.
 */

// An empty `title` marks the mark as decorative — used where the link around
// it is already labelled, so a screen reader does not read the name twice.
const label = (title) =>
  title ? { role: "img", "aria-label": title } : { "aria-hidden": true };

/** 1b — the U4A monogram. The site's mark. */
export const U4AMark = ({ size = 30, className, title = "U4A" }) => {
  const f = monogram.frame;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={monogram.viewBox}
      {...label(title)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x={f.x}
        y={f.y}
        width={f.w}
        height={f.h}
        rx={f.rx}
        fill="var(--bg)"
        stroke="var(--accent)"
        strokeWidth={monogram.frameWidth}
      />
      <g
        strokeWidth={monogram.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={monogram.u} stroke="var(--ink)" />
        <path d={monogram.four} stroke="var(--primary)" />
        <path d={monogram.a} stroke="var(--ink)" />
      </g>
      <path
        d={monogram.bar}
        stroke="var(--accent)"
        strokeWidth={monogram.barWidth}
        strokeLinecap="round"
      />
    </svg>
  );
};

/** 1a — the UMA disc with the numeral swapped. Kept as an alternate. */
export const UMADiscMark = ({ size = 30, className, title = "UMA4Agents" }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox={disc.viewBox}
    {...label(title)}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx={disc.face.cx} cy={disc.face.cy} r={disc.face.r} fill="var(--paper)" />
    <circle
      cx={disc.ring.cx}
      cy={disc.ring.cy}
      r={disc.ring.r}
      stroke="var(--accent)"
      strokeWidth={disc.ringWidth}
    />
    <path
      d={disc.four}
      stroke="var(--primary)"
      strokeWidth={disc.fourWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <g
      stroke="var(--bg)"
      strokeWidth={disc.strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={disc.u} />
      <path d={disc.m} />
      <path d={disc.a} />
    </g>
  </svg>
);

export default U4AMark;
