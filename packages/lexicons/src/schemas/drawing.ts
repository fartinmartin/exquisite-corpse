import * as v from "valibot";

export const PointSchema = v.object({
  x: v.number(),
  y: v.number(),
  color: v.string(),
  size: v.number(),
});

export const PathModeSchema = v.picklist(["draw", "erase", "fill", "clear"]);
export const CapSchema = v.picklist(["butt", "round", "square"]);
export const JoinSchema = v.picklist(["round", "bevel", "miter"]);

export const PathSchema = v.object({
  mode: PathModeSchema,
  points: v.array(PointSchema),
  scale: v.optional(v.number()),
  cap: v.optional(CapSchema),
  join: v.optional(JoinSchema),
  tolerance: v.optional(v.number()),
});

/** Serialized canvas-paint Drawing — stroke commands stored as the canonical record. */
export const DrawingDataSchema = v.object({
  width: v.number(),
  height: v.number(),
  version: v.string(),
  paths: v.array(PathSchema),
  bgColor: v.optional(v.string()),
  margin: v.optional(v.number()),
});

export type Point = v.InferOutput<typeof PointSchema>;
export type PathMode = v.InferOutput<typeof PathModeSchema>;
export type Path = v.InferOutput<typeof PathSchema>;
export type DrawingData = v.InferOutput<typeof DrawingDataSchema>;
