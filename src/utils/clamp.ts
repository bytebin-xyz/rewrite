export const clamp = (min: number, max: number, n: number): number =>
  Math.min(Math.max(n, min), max);
