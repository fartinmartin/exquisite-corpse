/**
 * Generates atproto lexicon JSON files from the canonical Valibot schemas.
 * Run with: pnpm lexicons:generate
 */
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../../generated");
mkdirSync(outDir, { recursive: true });

// ---------------------------------------------------------------------------
// Helpers to build lexicon JSON nodes
// ---------------------------------------------------------------------------

type LexPrimitive =
  | { type: "string"; format?: string; knownValues?: string[]; maxLength?: number; maxGraphemes?: number }
  | { type: "integer" }
  | { type: "boolean" }
  | { type: "blob"; accept: string[] }
  | { type: "ref"; ref: string }
  | { type: "array"; items: LexPrimitive }
  | { type: "object"; required: string[]; properties: Record<string, LexPrimitive>; description?: string };

function string(opts: Omit<Extract<LexPrimitive, { type: "string" }>, "type"> = {}): LexPrimitive {
  return { type: "string", ...opts };
}
function integer(): LexPrimitive { return { type: "integer" }; }
function ref(r: string): LexPrimitive { return { type: "ref", ref: r }; }
function array(items: LexPrimitive): LexPrimitive { return { type: "array", items }; }
function blob(accept: string[]): LexPrimitive { return { type: "blob", accept }; }
function object(
  properties: Record<string, LexPrimitive>,
  required: string[],
  description?: string
): LexPrimitive {
  return { type: "object", required, properties, ...(description ? { description } : {}) };
}

// ---------------------------------------------------------------------------
// club.exquisitecorpse.section
// ---------------------------------------------------------------------------

const sectionLexicon = {
  lexicon: 1,
  id: "club.exquisitecorpse.section",
  defs: {
    main: {
      type: "record",
      description: "A single drawn section (top, mid, or bot) of an exquisite corpse.",
      key: "tid",
      record: object(
        {
          section: string({ knownValues: ["top", "mid", "bot"] }),
          drawing: ref("#drawingData"),
          render: blob(["image/png"]),
          guestId: string(),
          createdAt: string({ format: "datetime" }),
        },
        ["section", "drawing", "createdAt"]
      ),
    },
    drawingData: object(
      {
        width: integer(),
        height: integer(),
        version: string(),
        paths: array(ref("#path")),
        bgColor: string(),
        margin: integer(),
      },
      ["width", "height", "version", "paths"],
      "Serialized canvas-paint Drawing — stroke commands used to reconstruct the image server-side."
    ),
    path: object(
      {
        mode: string({ knownValues: ["draw", "erase", "fill", "clear"] }),
        points: array(ref("#point")),
        scale: integer(),
        cap: string({ knownValues: ["butt", "round", "square"] }),
        join: string({ knownValues: ["round", "bevel", "miter"] }),
        tolerance: integer(),
      },
      ["mode", "points"]
    ),
    point: object(
      {
        x: integer(),
        y: integer(),
        color: string(),
        size: integer(),
      },
      ["x", "y", "color", "size"]
    ),
  },
};

// ---------------------------------------------------------------------------
// Write files
// ---------------------------------------------------------------------------

function write(id: string, lexicon: object) {
  const path = join(outDir, `${id}.json`);
  writeFileSync(path, JSON.stringify(lexicon, null, 2) + "\n");
  console.log(`wrote ${path}`);
}

write("club.exquisitecorpse.section", sectionLexicon);
console.log("done");
