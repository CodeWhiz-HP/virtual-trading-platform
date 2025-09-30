// Augment Express Request typing for our AuthedRequest if needed in future.
import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    // placeholder for future strong typing
  }
}
