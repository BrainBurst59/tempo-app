import { describe, expect, it } from 'vitest';
import {
  circumference,
  clamp,
  dashOffset,
  describeArc,
  fraction,
  polarToCartesian,
} from './ringMath';

describe('ringMath', () => {
  it('clamps values and handles NaN', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
    expect(clamp(Number.NaN, 2, 10)).toBe(2);
  });

  it('computes a clamped fraction across a range', () => {
    expect(fraction(50, 0, 100)).toBe(0.5);
    expect(fraction(150, 0, 100)).toBe(1);
    expect(fraction(5, 10, 10)).toBe(0); // degenerate range
  });

  it('full progress means zero dash offset; empty means full circumference', () => {
    const r = 40;
    expect(dashOffset(r, 1)).toBeCloseTo(0);
    expect(dashOffset(r, 0)).toBeCloseTo(circumference(r));
    expect(dashOffset(r, 0.25)).toBeCloseTo(circumference(r) * 0.75);
  });

  it('places 0° at 12 o’clock', () => {
    const p = polarToCartesian(50, 50, 40, 0);
    expect(p.x).toBeCloseTo(50);
    expect(p.y).toBeCloseTo(10);
  });

  it('produces a valid arc path string', () => {
    const d = describeArc(50, 50, 40, -120, 120);
    expect(d.startsWith('M ')).toBe(true);
    expect(d).toContain(' A 40 40 ');
  });
});
