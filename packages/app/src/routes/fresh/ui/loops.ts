/**
 * The hand-drawn marks on a call to action (ui/circled.svelte): a loop round
 * the word, and what the pencil beside "draw" gets up to. One of each is
 * picked at random when a button appears, and kept while it's there.
 */

/** Loops in a 100×40 box around the word: absolute M and C commands only. */
export const LOOPS = [
  // neat
  "M16 8 C 40 0, 82 2, 94 14 C 104 28, 76 38, 46 37 C 18 36, 0 30, 3 19 C 6 8, 30 3, 62 4",
  // didn't close
  "M80 3 C 56 -8, 9 -2, 0 18 C -8 35, 28 46, 60 41 C 88 37, 108 26, 103 13",
  // lasso
  "M22 54 C 8 46, -3 32, 2 20 C 9 2, 44 -6, 70 0 C 98 6, 109 20, 93 31 C 76 43, 40 44, 18 37 C 4 32, -6 22, -12 7",
  // twice round
  "M22 10 C 44 -4, 93 -5, 100 13 C 106 31, 66 39, 38 37 C 8 35, -10 24, 2 11 C 15 -2, 54 1, 79 8 C 104 16, 101 36, 75 42 C 49 49, 13 43, 4 30 C -2 21, 6 12, 19 7",
  // scrawl
  "M12 18 C 22 -4, 88 -9, 99 11 C 110 32, 60 47, 30 40 C 2 34, -12 18, 10 8 C 34 -2, 80 6, 94 17 C 106 28, 82 36, 56 36 C 28 37, -2 36, 2 22 C 6 7, 36 1, 62 3 C 82 5, 98 0, 106 4",
];

export type Move = {
  /**
   * Strokes in the pencil's own 28×18 box, where the nib rests at (8.5, 16);
   * each is drawn in turn.
   */
  strokes: string[];
  /** The pencil draws the loop itself, then parks. */
  circles?: boolean;
};

export const MOVES: Move[] = [
  // squiggle
  { strokes: ["M-1.5 15.6 C 0.2 13.2, 1.8 17.8, 3.6 15.6 C 5.4 13.4, 6.6 17.8, 8.5 16"] },
  // two cursive loop-the-loops
  {
    strokes: [
      "M-6 16 C -2 16, 0.6 11.6, -1.6 11 C -3.8 10.6, -4 16.4, -0.6 16.2 C 2.6 16, 5.2 11.6, 3 11 C 0.8 10.6, 0.6 16.6, 4.2 16.4 C 5.8 16.3, 7.2 16.2, 8.5 16",
    ],
  },
  // underlines the word, ending back in its place
  { strokes: ["M-56 22.6 C -48 20, -42 25, -34 22.4 C -26 20, -19 25, -11 22.2 C -4 20.4, 4 23, 8.5 16"] },
  // a tiny face, like the desk doodles
  {
    strokes: [
      "M0.6 6.4 C 5 6, 7.8 9.6, 7 13.6 C 6.2 17.6, 2.8 19.4, -0.4 18.6 C -4.4 17.8, -6.2 14.2, -5.2 10.8 C -4.2 7.6, -1.4 6.2, 2.2 7",
      "M-1.8 10.4 L -1.7 11.4",
      "M2.4 10.2 L 2.5 11.2",
      "M-2.4 14 C -0.6 16.8, 2.8 16.6, 3.8 13.6",
    ],
  },
  { strokes: [], circles: true },
];

/** A random index; never `last`, when there is one. */
export function pickIndex(count: number, last = -1): number {
  if (last < 0) return Math.floor(Math.random() * count);
  return (last + 1 + Math.floor(Math.random() * (count - 1))) % count;
}

/**
 * A loop in px, for a box `width` × `height` (the word plus its padding),
 * tilted by `tilt` degrees. Wide boxes tilt less, for the same corner travel.
 */
export function placeLoop(d: string, width: number, height: number, tilt: number): string {
  const angle = ((tilt * Math.PI) / 180) * Math.min(1, 90 / width);
  return d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_, x, y) => {
    const dx = ((Number(x) - 50) / 100) * width;
    const dy = ((Number(y) - 20) / 40) * height;
    const px = width / 2 + dx * Math.cos(angle) - dy * Math.sin(angle);
    const py = height / 2 + dx * Math.sin(angle) + dy * Math.cos(angle);
    return `${px.toFixed(1)} ${py.toFixed(1)}`;
  });
}
