import * as errore from "errore";

export class CorpseAssemblyError extends errore.createTaggedError({
  name: "CorpseAssemblyError",
  message: "Failed to assemble corpse $corpseId: $reason",
}) {}
