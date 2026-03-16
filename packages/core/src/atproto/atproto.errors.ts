import * as errore from "errore";

export class AuthExpiredError extends errore.createTaggedError({
  name: "AuthExpiredError",
  message: "Session expired — please sign in again",
}) {}

export class AuthRequiredError extends errore.createTaggedError({
  name: "AuthRequiredError",
  message: "Authentication required",
}) {}

export class OAuthCallbackError extends errore.createTaggedError({
  name: "OAuthCallbackError",
  message: "OAuth callback failed",
}) {}
