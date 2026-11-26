export * as Client from "./client.js";

import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let instance: Firestore | undefined;

interface ServiceAccount {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

function isEmulator(): boolean {
  return Boolean(process.env.FIRESTORE_EMULATOR_HOST);
}

/**
 * Reads `FIREBASE_SERVICE_ACCOUNT` as either a JSON string or a base64-encoded
 * JSON string. Never include the value in errors or logs.
 */
function serviceAccountFromEnv(): ServiceAccount | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT?.trim();
  if (!raw) return null;

  let parsed: Record<string, unknown>;
  try {
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    parsed = JSON.parse(json) as Record<string, unknown>;
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT is not valid JSON or base64-encoded JSON"
    );
  }

  const projectId = typeof parsed.project_id === "string" ? parsed.project_id : undefined;
  const clientEmail = typeof parsed.client_email === "string" ? parsed.client_email : undefined;
  const privateKey =
    typeof parsed.private_key === "string"
      ? parsed.private_key.replace(/\\n/g, "\n")
      : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT must contain project_id, client_email and private_key"
    );
  }

  return { projectId, clientEmail, privateKey };
}

/** Individual FIREBASE_* vars, used when FIREBASE_SERVICE_ACCOUNT isn't set. */
function serviceAccountFromParts(): ServiceAccount | null {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.GCLOUD_PROJECT ??
    process.env.GOOGLE_CLOUD_PROJECT;

  if (!clientEmail || !privateKey) return null;
  if (!projectId) {
    throw new Error(
      "Missing FIREBASE_PROJECT_ID (or GCLOUD_PROJECT) alongside FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY"
    );
  }

  return { projectId, clientEmail, privateKey };
}

function serviceAccount(): ServiceAccount | null {
  return serviceAccountFromEnv() ?? serviceAccountFromParts();
}

function credentials() {
  const account = serviceAccount();
  if (!account) return applicationDefault();

  return cert({
    projectId: account.projectId,
    clientEmail: account.clientEmail,
    privateKey: account.privateKey,
  });
}

function projectId(): string {
  const id =
    serviceAccount()?.projectId ??
    process.env.FIREBASE_PROJECT_ID ??
    process.env.GCLOUD_PROJECT ??
    process.env.GOOGLE_CLOUD_PROJECT;

  if (!id) {
    throw new Error(
      "Missing Firebase credentials — set FIREBASE_SERVICE_ACCOUNT (JSON or base64) or FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY"
    );
  }

  return id;
}

/** Lazy Firestore singleton. Uses env credentials, ADC, or the emulator. */
export function db(): Firestore {
  if (instance) return instance;

  const app =
    getApps()[0] ??
    initializeApp(
      isEmulator()
        ? { projectId: projectId() }
        : { credential: credentials(), projectId: projectId() }
    );

  instance = getFirestore(app);
  instance.settings({
    ignoreUndefinedProperties: true,
    // REST instead of gRPC for one-shot reads/writes: skips loading and
    // handshaking the gRPC stack, which dominates serverless cold starts.
    preferRest: true,
  });
  return instance;
}
