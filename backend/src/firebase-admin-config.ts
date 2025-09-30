import admin from 'firebase-admin'
import 'dotenv/config'

// Load env when running compiled code without --env-file

// GOOGLE_APPLICATION_CREDENTIALS should point to the service account JSON
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.warn('GOOGLE_APPLICATION_CREDENTIALS is not set.Ensure ADC is configured or set the env var to your service account JSON path.')
}

if (!admin.apps || admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  })
  console.log('Firebase Admin SDK initialized')
}

export const adminAuth = admin.auth()
