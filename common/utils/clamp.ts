export const clamp = (x: number, min: number, max: number): number =>
  Math.min(Math.max(x, min), max);
