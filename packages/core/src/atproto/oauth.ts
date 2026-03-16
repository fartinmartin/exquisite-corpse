import {
  OAuthClient,
  type SessionStore,
  type StateStore,
  type StoredSession,
  type StoredState,
} from "@atcute/oauth-node-client";
import {
  LocalActorResolver,
  CompositeDidDocumentResolver,
  PlcDidDocumentResolver,
  WebDidDocumentResolver,
  CompositeHandleResolver,
  WellKnownHandleResolver,
  DohJsonHandleResolver,
} from "@atcute/identity-resolver";
import { eq } from "drizzle-orm";
import type { Did } from "@atcute/lexicons";
import { db } from "../db/index.js";
import { oauthSessions, oauthStates } from "../db/schema.js";

let _client: OAuthClient | null = null;

export function getOAuthClient(): OAuthClient {
  if (_client) return _client;

  if (!process.env.OAUTH_CLIENT_ID) throw new Error("OAUTH_CLIENT_ID env var is required");
  if (!process.env.OAUTH_PRIVATE_KEY_JWK) throw new Error("OAUTH_PRIVATE_KEY_JWK env var is required");

  const baseUrl = process.env.PUBLIC_BASE_URL ?? "http://localhost:5173";

  const actorResolver = new LocalActorResolver({
    didDocumentResolver: new CompositeDidDocumentResolver({
      methods: {
        plc: new PlcDidDocumentResolver(),
        web: new WebDidDocumentResolver(),
      },
    }),
    handleResolver: new CompositeHandleResolver({
      methods: {
        http: new WellKnownHandleResolver(),
        dns: new DohJsonHandleResolver({ dohUrl: "https://cloudflare-dns.com/dns-query" }),
      },
    }),
  });

  const sessionStore: SessionStore = {
    async get(key: Did) {
      const row = await db.query.oauthSessions.findFirst({ where: eq(oauthSessions.key, key) });
      return row ? (JSON.parse(row.session) as StoredSession) : undefined;
    },
    async set(key: Did, session: StoredSession) {
      const value = JSON.stringify(session);
      await db.insert(oauthSessions).values({ key, session: value })
        .onConflictDoUpdate({ target: oauthSessions.key, set: { session: value } });
    },
    async delete(key: Did) {
      await db.delete(oauthSessions).where(eq(oauthSessions.key, key));
    },
    async clear() { await db.delete(oauthSessions); },
  };

  const stateStore: StateStore = {
    async get(key: string) {
      const row = await db.query.oauthStates.findFirst({ where: eq(oauthStates.key, key) });
      return row ? (JSON.parse(row.state) as StoredState) : undefined;
    },
    async set(key: string, state: StoredState) {
      const value = JSON.stringify(state);
      await db.insert(oauthStates).values({ key, state: value })
        .onConflictDoUpdate({ target: oauthStates.key, set: { state: value } });
    },
    async delete(key: string) {
      await db.delete(oauthStates).where(eq(oauthStates.key, key));
    },
    async clear() { await db.delete(oauthStates); },
  };

  _client = new OAuthClient({
    metadata: {
      client_id: process.env.OAUTH_CLIENT_ID,
      client_name: "Exquisite Corpse Club",
      client_uri: baseUrl,
      redirect_uris: [`${baseUrl}/oauth/callback`],
      scope: "atproto transition:generic",
      jwks_uri: `${baseUrl}/oauth/jwks.json`,
    },
    keyset: [JSON.parse(process.env.OAUTH_PRIVATE_KEY_JWK)],
    actorResolver,
    stores: { sessions: sessionStore, states: stateStore },
  });

  return _client;
}
