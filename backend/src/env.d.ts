/// <reference types="node" />

declare namespace NodeJS {
  interface ProcessEnv {
    GOOGLE_APPLICATION_CREDENTIALS?: string
    MONGODB_URI?: string
    CORS_ORIGIN?: string
    PORT?: string
  }
}
