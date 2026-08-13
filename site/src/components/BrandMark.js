import React from "react";
import { role } from "../style/theme";
import { monogram, disc } from "../style/marks";

/**
 * The brand marks.
 *
 * Geometry comes from src/style/marks.js and colour from src/style/theme.js,
 * so these render exactly what static/brand/*.svg contains — those files are
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
        fill={role.bg}
        stroke={role.accent}
        strokeWidth={monogram.frameWidth}
      />
      <g
        strokeWidth={monogram.strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={monogram.u} stroke={role.ink} />
        <path d={monogram.four} stroke={role.primary} />
        <path d={monogram.a} stroke={role.ink} />
      </g>
      <path
        d={monogram.bar}
        stroke={role.accent}
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
    <circle cx={disc.face.cx} cy={disc.face.cy} r={disc.face.r} fill={role.paper} />
    <circle
      cx={disc.ring.cx}
      cy={disc.ring.cy}
      r={disc.ring.r}
      stroke={role.accent}
      strokeWidth={disc.ringWidth}
    />
    <path
      d={disc.four}
      stroke={role.primary}
      strokeWidth={disc.fourWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <g
      stroke={role.bg}
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
