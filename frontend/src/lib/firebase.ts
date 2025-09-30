// Firebase app initialization and Auth export
// Reads config from Vite env variables (prefix VITE_) and initializes Firebase.
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'

type FirebaseSetup = {
  app: FirebaseApp
  auth: Auth
}

let cached: FirebaseSetup | null = null

export function getFirebase(): FirebaseSetup {
  if (cached) return cached

  const cfg = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
    appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
  }

  for (const [k, v] of Object.entries(cfg)) {
    if (!v) throw new Error(`Missing Firebase env: ${k}`)
  }

  const app = getApps().length ? getApps()[0]! : initializeApp(cfg)
  const auth = getAuth(app)
  cached = { app, auth }
  return cached
}

export type { Auth }
