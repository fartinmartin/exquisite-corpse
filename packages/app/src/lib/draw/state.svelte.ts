import type { Paint } from "@fartinmartin/canvas-paint";

export const GUEST_TOKEN_COOKIE = "ecc_guest_token";
export const GUEST_HANDLE_COOKIE = "ecc_guest_handle";
export const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365,
};

const DEFAULT_COLORS = [
  "#000000",
  "#F44E3B",
  "#FE9200",
  "#FCDC00",
  "#A4DD00",
  "#68CCCA",
  "#AEA1FF",
  "#FDA1FF",
];

/**
 * Drawing tools, shared by the canvas stack, toolbar, save modal and cursor.
 * One drawer exists at a time, so a module-level store keeps this simple.
 */
function createDrawState() {
  let mode = $state<"draw" | "erase" | "fill">("draw");
  let size = $state(5);
  let color = $state("#000000");
  let colors = $state<string[]>([...DEFAULT_COLORS]);
  let empty = $state(true);
  let canUndo = $state(false);
  let canRedo = $state(false);
  let paint = $state<Paint | null>(null);

  function refresh() {
    empty =
      !paint ||
      paint.history.state.length === 0 ||
      paint.history.state.at(-1)?.mode === "clear";
    canUndo = paint?.history.canUndo ?? false;
    canRedo = paint?.history.canRedo ?? false;
  }

  return {
    get mode() {
      return mode;
    },
    set mode(value) {
      mode = value;
    },
    get size() {
      return size;
    },
    set size(value) {
      size = Math.min(10, Math.max(1, Math.round(value)));
    },
    get color() {
      return color;
    },
    set color(value) {
      color = value;
    },
    get colors() {
      return colors;
    },
    addColor(value: string) {
      if (!colors.includes(value)) colors = [...colors, value];
      color = value;
    },
    get empty() {
      return empty;
    },
    get canUndo() {
      return canUndo;
    },
    get canRedo() {
      return canRedo;
    },
    get paint() {
      return paint;
    },
    attach(next: Paint | null) {
      paint = next;
      refresh();
    },
    refresh,
    undo() {
      paint?.undo();
      refresh();
    },
    redo() {
      paint?.redo();
      refresh();
    },
    clear() {
      paint?.clear();
      refresh();
    },
    reset() {
      mode = "draw";
      size = 5;
      color = "#000000";
      empty = true;
      canUndo = false;
      canRedo = false;
      paint = null;
    },
  };
}

export const drawState = createDrawState();
