import * as errore from "errore";

export class SectionNotFoundError extends errore.createTaggedError({
  name: "SectionNotFoundError",
  message: "Section $id not found",
}) {}

export class DrawingValidationError extends errore.createTaggedError({
  name: "DrawingValidationError",
  message: "Invalid drawing data: $reason",
}) {}

export class SectionAlreadyExistsError extends errore.createTaggedError({
  name: "SectionAlreadyExistsError",
  message: "A $section section already exists for this corpse",
}) {}
