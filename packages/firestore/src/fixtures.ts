export * as Fixtures from "./fixtures.js";

import type { DrawingData } from "@ecc/lexicons";
import type { CorpseRecord, SectionRecord } from "./records.js";
import type { Corpse, Section, SectionType, SectionWithDrawing } from "./types.js";
import { Drawing } from "./drawing.js";
import { SECTION_TYPES } from "./types.js";

/**
 * Local-only sample data so the UI can be exercised without Firestore
 * credentials. Enabled with `ECC_FIXTURES=1`; never used in production.
 */
export function enabled(): boolean {
  return process.env.ECC_FIXTURES === "1";
}

function panelSvg(label: string, color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="360"><rect width="1080" height="360" fill="${color}"/><text x="540" y="200" font-family="monospace" font-size="90" text-anchor="middle" fill="#231f20">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function corpseSvg(colors: string[]): string {
  const rows = colors
    .map((color, index) => `<rect y="${index * 360}" width="1080" height="360" fill="${color}"/>`)
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080">${rows}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function drawingFor(type: SectionType): DrawingData {
  const y = type === "top" ? 50 : type === "mid" ? 90 : 130;
  return {
    width: 540,
    height: 180,
    version: "fixture",
    bgColor: "#ffffff",
    paths: [
      {
        mode: "draw",
        cap: "round",
        join: "round",
        tolerance: 30,
        points: [
          { x: 40, y, color: "#0064ff", size: 12 },
          { x: 160, y: y - 60, color: "#0064ff", size: 12 },
          { x: 300, y, color: "#f44e3b", size: 12 },
          { x: 440, y: y + 40, color: "#f44e3b", size: 12 },
        ],
      },
      {
        mode: "draw",
        cap: "round",
        join: "round",
        tolerance: 30,
        points: [
          { x: 220, y: y - 40, color: "#231f20", size: 8 },
          { x: 250, y: y - 30, color: "#231f20", size: 8 },
          { x: 280, y: y - 40, color: "#231f20", size: 8 },
        ],
      },
      {
        mode: "draw",
        cap: "round",
        join: "round",
        tolerance: 30,
        points: [{ x: 480, y: y + 30, color: "#fcda00", size: 40 }],
      },
    ],
  };
}

interface Store {
  sections: SectionRecord[];
  corpses: CorpseRecord[];
  seeded: boolean;
}

const store: Store = { sections: [], corpses: [], seeded: false };

function seed(): void {
  if (store.seeded) return;
  store.seeded = true;

  const artists = ["anon-a", "anon-b", "anon-c", "@inked", "pixel-pal", "doodle"];
  const titles = ["soft start", "middle mash", "heavy ending", "tiny shapes", "big feelings"];

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
      thumb: panelSvg(type, ["#deebff", "#fff29d", "#d1ee7f"][i % 3]),
      featuredIn: [],
      drawing: drawingFor(type),
    });
  }

  for (let i = 0; i < 12; i++) {
    const panels = SECTION_TYPES.map((type, offset) => {
      const section = store.sections[(i * 3 + offset) % store.sections.length];
      return { ...section, type, drawing: drawingFor(type) };
    });

    const corpseId = `corpse_fixture_${i}`;
    store.corpses.push({
      id: corpseId,
      title: ["odd", "lumpy", "quiet", "bright", "crooked", "soft"][i] + " creature",
      date: new Date(Date.now() - i * 7_200_000).toISOString(),
      likes: i * 3,
      likedBy: [],
      thumb: corpseSvg(["#deebff", "#fff29d", "#d1ee7f"]),
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
  const { likedBy: _likedBy, ...rest } = record;
  return rest;
}

function corpseSummary(record: CorpseRecord): Corpse {
  const { likedBy: _likedBy, ...rest } = record;
  return rest;
}

export function section(id: string): SectionWithDrawing | null {
  seed();
  const record = store.sections.find((entry) => entry.id === id);
  return record ? summary(record) : null;
}

export function randomSection(type: SectionType): SectionWithDrawing | null {
  seed();
  const pool = store.sections.filter((entry) => entry.type === type);
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
    .filter((entry) => !options.type || entry.type === options.type)
    .sort((a, b) =>
      options.sort === "likes" ? b.likes - a.likes : Date.parse(b.date) - Date.parse(a.date)
    );

  const start = options.page * options.pageSize;
  const items = filtered.slice(start, start + options.pageSize).map((record) => {
    const { drawing: _drawing, likedBy: _likedBy, ...rest } = record;
    return rest;
  });

  return { items, page: options.page, hasMore: start + options.pageSize < filtered.length };
}

export function saveSection(input: {
  type: SectionType;
  title: string;
  artist: string;
  drawing: DrawingData;
  thumb: string;
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
    thumb: input.thumb,
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

  const thumb = corpseSvg(["#deebff", "#fff29d", "#d1ee7f"]);

  store.corpses.push({
    id: corpseId,
    title: "fresh corpse",
    date: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    thumb,
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
    .filter((corpse) => record.featuredIn.includes(corpse.id))
    .slice(-3)
    .map(corpseSummary);
}

export function moreByArtist(artist: string, excludeId?: string): Section[] {
  seed();
  return store.sections
    .filter((entry) => entry.artist === artist && entry.id !== excludeId)
    .sort((a, b) => b.likes - a.likes)
    .slice(0, 6)
    .map((record) => {
      const { drawing: _drawing, likedBy: _likedBy, ...rest } = record;
      return rest;
    });
}

export function corpse(id: string): Corpse & { panels: Partial<Record<SectionType, SectionWithDrawing>> } {
  seed();
  const record = store.corpses.find((entry) => entry.id === id) ?? store.corpses[0];
  const panels: Partial<Record<SectionType, SectionWithDrawing>> = {};

  for (const type of SECTION_TYPES) {
    const panel = section(record.sections[type]);
    if (panel) panels[type] = panel;
  }

  return { ...corpseSummary(record), panels };
}

export function randomCorpse(): Corpse & {
  panels: Partial<Record<SectionType, SectionWithDrawing>>;
} {
  seed();
  const record = store.corpses[Math.floor(Math.random() * store.corpses.length)];
  return corpse(record.id);
}

export function listCorpses(options: {
  sort: "date" | "likes";
  page: number;
  pageSize: number;
}): { items: Corpse[]; page: number; hasMore: boolean } {
  seed();
  const sorted = [...store.corpses].sort((a, b) =>
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

export function removeSection(id: string): true {
  seed();
  const index = store.sections.findIndex((entry) => entry.id === id);
  if (index >= 0) store.sections.splice(index, 1);
  return true;
}

export function removeCorpse(id: string): true {
  seed();
  const index = store.corpses.findIndex((entry) => entry.id === id);
  if (index >= 0) store.corpses.splice(index, 1);
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
    thumb: record.thumb,
    siblings: {},
  });
  return { corpseId: result.corpseId };
}

export function count(): { sections: number; corpses: number } {
  seed();
  return { sections: store.sections.length, corpses: store.corpses.length };
}

export { Drawing };
