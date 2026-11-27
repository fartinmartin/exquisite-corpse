export * as Fixtures from "./fixtures.js";

import { existsSync, readFileSync } from "node:fs";
import type { DrawingData } from "@ecc/lexicons";
import type { CorpseRecord, SectionRecord } from "./records.js";
import type { Collection, Corpse, Section, SectionType, SectionWithDrawing } from "./types.js";
import type { Entry as AuditEntry, NewEntry as NewAuditEntry } from "./audit.js";
import { Drawing } from "./drawing.js";
import { SECTION_TYPES } from "./types.js";

/**
 * Local-only sample data so the UI can be exercised without Firestore
 * credentials. Enabled with `ECC_FIXTURES=1`; never used in production.
 */
export function enabled(): boolean {
  return process.env.ECC_FIXTURES === "1";
}

type FixturePoint = { x: number; y: number; color: string; size: number };

const INKS = ["#231f20", "#f44e3b", "#fe9200", "#0064ff", "#68ccca", "#aea1ff", "#fda1ff", "#86b500"];

/** Small seeded PRNG so fixture drawings are varied but stable between reloads. */
function prng(seed: number): () => number {
  let a = seed + 0x6d2b79f5;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stroke(points: [number, number][], color: string, size: number) {
  return {
    mode: "draw" as const,
    cap: "round" as const,
    join: "round" as const,
    tolerance: 30,
    points: points.map(([x, y]): FixturePoint => ({ x: Math.round(x), y: Math.round(y), color, size })),
  };
}

function wobble(rand: () => number, points: [number, number][], amount = 6): [number, number][] {
  return points.map(([x, y]) => [x + (rand() - 0.5) * amount, y + (rand() - 0.5) * amount]);
}

function ellipse(cx: number, cy: number, rx: number, ry: number, steps = 18): [number, number][] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = (i / steps) * Math.PI * 2;
    return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry];
  });
}

/**
 * A doodled creature part. Lines run off the top/bottom edges at roughly the
 * same x positions for every section, so random combinations still "connect"
 * across the folds — the way paper exquisite corpses do.
 */
function drawingFor(type: SectionType, seed = 0): DrawingData {
  const rand = prng(seed * 31 + type.length * 7 + (type === "mid" ? 3 : 0));
  const ink = () => INKS[Math.floor(rand() * INKS.length)];
  const cx = 270 + (rand() - 0.5) * 30;
  const paths = [];

  if (type === "top") {
    const rx = 60 + rand() * 60;
    const ry = 45 + rand() * 25;
    const cy = 95;
    const line = ink();
    paths.push(stroke(wobble(rand, ellipse(cx, cy, rx, ry)), line, 6));
    // eyes
    const eye = ink();
    paths.push(stroke([[cx - rx * 0.4, cy - 10]], eye, 14 + rand() * 10));
    paths.push(stroke([[cx + rx * 0.4, cy - 10]], eye, 14 + rand() * 10));
    // mouth
    paths.push(stroke(wobble(rand, [[cx - 25, cy + 20], [cx, cy + 30 + rand() * 10], [cx + 25, cy + 20]]), ink(), 5));
    // hair / antenna
    const hair = ink();
    for (let i = 0; i < 4 + Math.floor(rand() * 5); i++) {
      const hx = cx - rx * 0.7 + (i / 6) * rx * 1.4;
      paths.push(stroke(wobble(rand, [[hx, cy - ry + 4], [hx + (rand() - 0.5) * 40, cy - ry - 25 - rand() * 20]]), hair, 4));
    }
    // neck crossing the fold
    paths.push(stroke(wobble(rand, [[cx - 22, cy + ry - 2], [cx - 24, 180]], 3), line, 6));
    paths.push(stroke(wobble(rand, [[cx + 22, cy + ry - 2], [cx + 24, 180]], 3), line, 6));
  } else if (type === "mid") {
    const line = ink();
    const width = 90 + rand() * 70;
    paths.push(stroke(wobble(rand, [[cx - 24, 0], [cx - 30, 20], [cx - width, 50], [cx - width + 20, 150], [cx - 55, 180]]), line, 6));
    paths.push(stroke(wobble(rand, [[cx + 24, 0], [cx + 30, 20], [cx + width, 50], [cx + width - 20, 150], [cx + 55, 180]]), line, 6));
    // arms
    const arm = ink();
    paths.push(stroke(wobble(rand, [[cx - width, 60], [cx - width - 60, 40 + rand() * 60], [cx - width - 110, 30 + rand() * 100]], 12), arm, 6));
    paths.push(stroke(wobble(rand, [[cx + width, 60], [cx + width + 60, 40 + rand() * 60], [cx + width + 110, 30 + rand() * 100]], 12), arm, 6));
    // buttons / belly
    const dots = ink();
    for (let i = 0; i < 2 + Math.floor(rand() * 3); i++) {
      paths.push(stroke([[cx + (rand() - 0.5) * 20, 55 + i * 28]], dots, 10 + rand() * 8));
    }
  } else {
    const line = ink();
    const spread = 30 + rand() * 50;
    paths.push(stroke(wobble(rand, [[cx - 55, 0], [cx - 60, 30], [cx - spread - 40, 140], [cx - spread - 90, 150]]), line, 6));
    paths.push(stroke(wobble(rand, [[cx + 55, 0], [cx + 60, 30], [cx + spread + 40, 140], [cx + spread + 90, 150]]), line, 6));
    paths.push(stroke(wobble(rand, [[cx - 60, 30], [cx + 60, 30]]), line, 6));
    // ground
    paths.push(stroke(wobble(rand, [[20, 162], [180, 158], [360, 166], [520, 160]], 4), ink(), 4));
    // a sun-ish blob somewhere
    if (rand() > 0.4) paths.push(stroke([[60 + rand() * 60, 50 + rand() * 40]], ink(), 30 + rand() * 20));
  }

  return { width: 540, height: 180, version: "fixture", bgColor: "#ffffff", paths } as DrawingData;
}

/** SVG markup for a drawing's strokes, scaled to the 1080-wide thumbnail space. */
function strokesSvg(drawing: DrawingData, offsetY = 0): string {
  const scale = 1080 / drawing.width;
  return drawing.paths
    .map((path) => {
      const points = path.points as FixturePoint[];
      const first = points[0];
      if (!first) return "";
      const width = first.size * scale;
      if (points.length === 1) {
        return `<circle cx="${first.x * scale}" cy="${first.y * scale + offsetY}" r="${width / 2}" fill="${first.color}"/>`;
      }
      const d = points.map((p) => `${p.x * scale},${p.y * scale + offsetY}`).join(" ");
      return `<polyline points="${d}" fill="none" stroke="${first.color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join("");
}

function panelSvg(drawing: DrawingData): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="360"><rect width="1080" height="360" fill="#fff"/>${strokesSvg(drawing)}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function corpseSvg(drawings: (DrawingData | undefined)[]): string {
  const rows = drawings.map((drawing, index) => (drawing ? strokesSvg(drawing, index * 360) : "")).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><rect width="1080" height="1080" fill="#fff"/>${rows}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

interface Store {
  sections: SectionRecord[];
  corpses: CorpseRecord[];
  seeded: boolean;
}

const store: Store = { sections: [], corpses: [], seeded: false };

const CORPSE_ADJECTIVES = ["odd", "lumpy", "quiet", "bright", "crooked", "soft"];

/**
 * Real corpses copied out of Firestore by `packages/scripts/src/pull-fixtures.ts`
 * (git-ignored). Loaded first, so dev runs exercise real, messy drawings.
 */
function seedReal(): boolean {
  const file = new URL("../fixtures/real.json", import.meta.url);
  if (!existsSync(file)) return false;
  const data = JSON.parse(readFileSync(file, "utf8")) as {
    corpses: Corpse[];
    sections: SectionWithDrawing[];
  };
  for (const section of data.sections) {
    // older pulls predate thumbVersion/hidden
    store.sections.push({ thumb: "", ...section, thumbVersion: section.thumbVersion ?? 0, hidden: section.hidden ?? false, likedBy: [], featuredIn: [] });
  }
  for (const corpse of data.corpses) {
    store.corpses.push({ thumb: "", ...corpse, thumbVersion: corpse.thumbVersion ?? 0, hidden: corpse.hidden ?? false, likedBy: [] });
    for (const id of Object.values(corpse.sections)) {
      const section = store.sections.find((entry) => entry.id === id);
      if (section && !section.featuredIn.includes(corpse.id)) section.featuredIn.push(corpse.id);
    }
  }
  return data.corpses.length > 0;
}

function seed(): void {
  if (store.seeded) return;
  store.seeded = true;
  // Real data wins: generated creatures only fill in when there's none.
  if (seedReal()) return;

  const artists = ["anon-a", "anon-b", "anon-c", "@inked", "pixel-pal", "doodle"];
  const titles = ["soft start", "middle mash", "heavy ending", "tiny shapes", "big feelings", "wobbly hello", "sunday legs"];

  const generatedFrom = store.sections.length;
  for (let i = 0; i < 30; i++) {
    const type: SectionType = SECTION_TYPES[i % 3];
    const id = `sec_fixture_${i}`;
    store.sections.push({
      id,
      type,
      title: titles[i % titles.length],
      artist: artists[i % artists.length],
      date: new Date(Date.now() - i * 3_600_000).toISOString(),
      likes: (i * 7) % 13,
      likedBy: [],
      thumb: "",
      thumbVersion: 0,
      hidden: false,
      featuredIn: [],
      drawing: drawingFor(type, i),
    });
    const record = store.sections[store.sections.length - 1];
    record.thumb = panelSvg(record.drawing);
  }

  for (let i = 0; i < 12; i++) {
    const panels = SECTION_TYPES.map((type, offset) => {
      const section = store.sections[generatedFrom + ((i * 3 + offset) % 30)];
      return section;
    });

    const corpseId = `corpse_fixture_${i}`;
    store.corpses.push({
      id: corpseId,
      title: ["odd", "lumpy", "quiet", "bright", "crooked", "soft", "tall", "shy"][i % 8] + " " + ["creature", "fellow", "beast", "friend"][i % 4],
      date: new Date(Date.now() - i * 7_200_000).toISOString(),
      likes: i * 3,
      likedBy: [],
      thumb: corpseSvg(panels.map((panel) => panel.drawing)),
      thumbVersion: 0,
      hidden: false,
      sections: {
        top: panels[0].id,
        mid: panels[1].id,
        bot: panels[2].id,
      },
    });

    for (const panel of panels) {
      const target = store.sections.find((section) => section.id === panel.id);
      if (target && !target.featuredIn.includes(corpseId)) target.featuredIn.push(corpseId);
    }
  }
}

function summary(record: SectionRecord): SectionWithDrawing {
  const { likedBy: _likedBy, thumb: _thumb, ...rest } = record;
  return rest;
}

function listItem(record: SectionRecord): Section {
  const { drawing: _drawing, likedBy: _likedBy, thumb: _thumb, ...rest } = record;
  return rest;
}

function corpseSummary(record: CorpseRecord): Corpse {
  const { likedBy: _likedBy, thumb: _thumb, ...rest } = record;
  return rest;
}

export function thumb(collection: Collection, id: string): string | undefined {
  seed();
  const records: (SectionRecord | CorpseRecord)[] =
    collection === "sections" ? store.sections : store.corpses;
  return records.find((entry) => entry.id === id)?.thumb;
}

export function section(id: string): SectionWithDrawing | null {
  seed();
  const record = store.sections.find((entry) => entry.id === id);
  return record ? summary(record) : null;
}

export function randomSection(type: SectionType): SectionWithDrawing | null {
  seed();
  const pool = store.sections.filter((entry) => entry.type === type && !entry.hidden);
  if (pool.length === 0) return null;
  return summary(pool[Math.floor(Math.random() * pool.length)]);
}

export function listSections(options: {
  type?: SectionType;
  sort: "date" | "likes";
  page: number;
  pageSize: number;
}): { items: Section[]; page: number; hasMore: boolean } {
  seed();
  const filtered = store.sections
    .filter((entry) => !entry.hidden && (!options.type || entry.type === options.type))
    .sort((a, b) =>
      options.sort === "likes" ? b.likes - a.likes : Date.parse(b.date) - Date.parse(a.date)
    );

  const start = options.page * options.pageSize;
  const items = filtered.slice(start, start + options.pageSize).map(listItem);

  return { items, page: options.page, hasMore: start + options.pageSize < filtered.length };
}

export function saveSection(input: {
  type: SectionType;
  title: string;
  artist: string;
  drawing: DrawingData;
  siblings: Partial<Record<SectionType, string>>;
}): { sectionId: string; corpseId: string } {
  seed();
  const sectionId = `sec_fixture_${store.sections.length}`;
  const corpseId = `corpse_fixture_${store.corpses.length}`;

  store.sections.push({
    id: sectionId,
    type: input.type,
    title: input.title || "untitled",
    artist: input.artist || "anonymous",
    date: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    thumb: panelSvg(input.drawing),
    thumbVersion: 0,
    hidden: false,
    featuredIn: [corpseId],
    drawing: input.drawing,
  });

  const panels: Partial<Record<SectionType, string>> = { [input.type]: sectionId };
  for (const type of SECTION_TYPES) {
    if (type === input.type) continue;
    const sibling = input.siblings[type]
      ? store.sections.find((entry) => entry.id === input.siblings[type])
      : randomSection(type);
    if (sibling) panels[type] = sibling.id;
  }

  store.corpses.push({
    id: corpseId,
    title: "fresh corpse",
    date: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    thumb: corpseSvg(
      SECTION_TYPES.map((type) => store.sections.find((entry) => entry.id === (panels[type] ?? sectionId))?.drawing)
    ),
    thumbVersion: 0,
    hidden: false,
    sections: {
      top: panels.top ?? sectionId,
      mid: panels.mid ?? sectionId,
      bot: panels.bot ?? sectionId,
    },
  });

  return { sectionId, corpseId };
}

export function featuredIn(sectionId: string): Corpse[] {
  seed();
  const record = store.sections.find((entry) => entry.id === sectionId);
  if (!record) return [];
  return store.corpses
    .filter((corpse) => !corpse.hidden && record.featuredIn.includes(corpse.id))
    .slice(-3)
    .map(corpseSummary);
}

export function creaturesOf(sectionId: string): Corpse[] {
  seed();
  const record = store.sections.find((entry) => entry.id === sectionId);
  if (!record) return [];
  return store.corpses
    .filter((corpse) => !corpse.hidden && record.featuredIn.includes(corpse.id))
    .map(corpseSummary)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function moreByArtist(artist: string, excludeId?: string): Section[] {
  seed();
  return store.sections
    .filter((entry) => !entry.hidden && entry.artist === artist && entry.id !== excludeId)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 6)
    .map(listItem);
}

export function corpse(id: string): (Corpse & { panels: Partial<Record<SectionType, SectionWithDrawing>> }) | null {
  seed();
  const record = store.corpses.find((entry) => entry.id === id);
  if (!record) return null;
  const panels: Partial<Record<SectionType, SectionWithDrawing>> = {};

  for (const type of SECTION_TYPES) {
    const panel = section(record.sections[type]);
    if (panel) panels[type] = panel;
  }

  return { ...corpseSummary(record), panels };
}

export function randomCorpse(): (Corpse & { panels: Partial<Record<SectionType, SectionWithDrawing>> }) | null {
  seed();
  const pool = store.corpses.filter((entry) => !entry.hidden);
  if (pool.length === 0) return null;
  return corpse(pool[Math.floor(Math.random() * pool.length)].id);
}

export function listCorpses(options: {
  sort: "date" | "likes";
  page: number;
  pageSize: number;
}): { items: Corpse[]; page: number; hasMore: boolean } {
  seed();
  const sorted = store.corpses.filter((entry) => !entry.hidden).sort((a, b) =>
    options.sort === "likes" ? b.likes - a.likes : Date.parse(b.date) - Date.parse(a.date)
  );
  const start = options.page * options.pageSize;

  return {
    items: sorted.slice(start, start + options.pageSize).map(corpseSummary),
    page: options.page,
    hasMore: start + options.pageSize < sorted.length,
  };
}

export function toggleLike(collection: "sections" | "corpses", id: string, liker: string) {
  seed();
  const records = collection === "sections" ? store.sections : store.corpses;
  const record = records.find((entry) => entry.id === id);
  if (!record) return null;

  const liked = record.likedBy.includes(liker);
  record.likedBy = liked
    ? record.likedBy.filter((entry) => entry !== liker)
    : [...record.likedBy, liker];
  record.likes = Math.max(0, record.likes + (liked ? -1 : 1));

  return { likes: record.likes, liked: !liked };
}

export function likeState(collection: "sections" | "corpses", id: string, liker?: string) {
  seed();
  const records = collection === "sections" ? store.sections : store.corpses;
  const record = records.find((entry) => entry.id === id);
  return {
    likes: record?.likes ?? 0,
    liked: Boolean(liker && record?.likedBy.includes(liker)),
  };
}

/** Same shape as `Admin.previewSectionDelete`. */
export function previewSectionDelete(id: string): { section: Section; corpses: Corpse[] } | null {
  seed();
  const record = store.sections.find((entry) => entry.id === id);
  if (!record) return null;
  const corpses = store.corpses.filter((corpse) => record.featuredIn.includes(corpse.id));
  return { section: listItem(record), corpses: corpses.map(corpseSummary) };
}

/** Deletes a section and the corpses it's in; returns the deleted corpse ids. */
export function removeSection(id: string): { corpseIds: string[] } | null {
  const preview = previewSectionDelete(id);
  if (!preview) return null;
  const corpseIds = preview.corpses.map((corpse) => corpse.id);
  for (const corpseId of corpseIds) removeCorpse(corpseId);
  store.sections = store.sections.filter((entry) => entry.id !== id);
  return { corpseIds };
}

export function removeCorpse(id: string): true {
  seed();
  store.corpses = store.corpses.filter((entry) => entry.id !== id);
  for (const section of store.sections) {
    section.featuredIn = section.featuredIn.filter((corpseId) => corpseId !== id);
  }
  return true;
}

export function makeCorpse(sectionId: string): { corpseId: string } | null {
  seed();
  const record = store.sections.find((entry) => entry.id === sectionId);
  if (!record) return null;
  const result = saveSection({
    type: record.type,
    title: record.title,
    artist: record.artist,
    drawing: record.drawing,
    siblings: {},
  });
  return { corpseId: result.corpseId };
}

export function count(): { sections: number; corpses: number } {
  seed();
  return { sections: store.sections.length, corpses: store.corpses.length };
}

export { Drawing };

/** Every section and corpse, hidden included (admin browse). */
export function summaries(): { sections: Section[]; corpses: Corpse[] } {
  seed();
  return { sections: store.sections.map(listItem), corpses: store.corpses.map(corpseSummary) };
}

/** Same rules as `Admin.setHidden`. */
export function setHidden(collection: "sections" | "corpses", id: string, hidden: boolean): string[] | null {
  seed();
  if (collection === "corpses") {
    const record = store.corpses.find((entry) => entry.id === id);
    if (!record) return null;
    record.hidden = hidden;
    record.hiddenBy = hidden ? "manual" : undefined;
    return [];
  }

  const record = store.sections.find((entry) => entry.id === id);
  if (!record) return null;
  record.hidden = hidden;
  const by = `section:${id}`;
  const changed: string[] = [];
  for (const corpse of store.corpses.filter((entry) => record.featuredIn.includes(entry.id))) {
    if (hidden && !corpse.hidden) {
      corpse.hidden = true;
      corpse.hiddenBy = by;
      changed.push(corpse.id);
    } else if (!hidden && corpse.hiddenBy === by) {
      corpse.hidden = false;
      corpse.hiddenBy = undefined;
      changed.push(corpse.id);
    }
  }
  return changed;
}

/** In-memory audit log (newest first). */
const actions: AuditEntry[] = [];

export function recordAction(entry: NewAuditEntry): string {
  const id = `act_fixture_${actions.length}`;
  actions.unshift({ ...entry, id, at: new Date().toISOString() });
  return id;
}

export function recentActions(limit: number): AuditEntry[] {
  return actions.slice(0, limit);
}

export function markActionUndone(id: string, undoneBy: string): true {
  const entry = actions.find((item) => item.id === id);
  if (entry) entry.undoneBy = undoneBy;
  return true;
}

export function setFeaturedIn(sectionId: string, corpseIds: string[]): void {
  seed();
  const record = store.sections.find((entry) => entry.id === sectionId);
  if (record) record.featuredIn = [...corpseIds];
}
