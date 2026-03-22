import * as errore from "errore";

export class LikeConflictError extends errore.createTaggedError({
  name: "LikeConflictError",
  message: "Already liked $subjectUri",
}) {}

