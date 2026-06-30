/**
 * Pure geometry helpers for the SVG rings and radial gauges. Kept free of any
 * React Native / SVG imports so they are unit-testable in the vitest (node)
 * environment without a native renderer.
 */

/** Clamp `value` into `[min, max]`. */
export function clamp(value: number, min: number, max: number): number {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

/** Fraction (0..1) of `value` across `[min, max]`. */
export function fraction(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return clamp((value - min) / (max - min), 0, 1);
}

/** Circumference of a circle for a given radius. */
export function circumference(radius: number): number {
  return 2 * Math.PI * radius;
}

/**
 * `strokeDashoffset` for a progress ring: a full circle is `circumference`,
 * and the offset shrinks as the filled `progress` (0..1) grows.
 */
export function dashOffset(radius: number, progress: number): number {
  const c = circumference(radius);
  return c * (1 - clamp(progress, 0, 1));
}

/** Cartesian point on a circle for an angle in degrees (0° = 12 o'clock). */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/**
 * SVG path for an arc from `startAngle` to `endAngle` (degrees, clockwise).
 * Used by the semicircular gauges.
 */
export function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}
