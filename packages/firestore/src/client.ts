export * as Client from "./client.js";

import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let instance: Firestore | undefined;

function isEmulator(): boolean {
  return Boolean(process.env.FIRESTORE_EMULATOR_HOST);
}

function credentials() {
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (clientEmail && privateKey) {
    return cert({
      projectId: projectId(),
      clientEmail,
      privateKey,
    });
  }
  return applicationDefault();
}

function projectId(): string {
  const id =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.GCLOUD_PROJECT ??
    process.env.GOOGLE_CLOUD_PROJECT;
  if (!id) {
    throw new Error(
      "Missing FIREBASE_PROJECT_ID (or GCLOUD_PROJECT) — see packages/app/.env.schema"
    );
  }
  return id;
}

/** Lazy Firestore singleton. Uses a service account, ADC, or the emulator. */
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
  instance.settings({ ignoreUndefinedProperties: true });
  return instance;
}
