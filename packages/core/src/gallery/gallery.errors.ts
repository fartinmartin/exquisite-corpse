import * as errore from "errore";

export class LikeConflictError extends errore.createTaggedError({
  name: "LikeConflictError",
  message: "Already liked drawing $drawingUri",
}) {}

export class CorpseNotFoundError extends errore.createTaggedError({
  name: "CorpseNotFoundError",
  message: "Corpse $id not found",
}) {}
