import type { Request, Response, NextFunction } from 'express'
import { adminAuth } from '../firebase-admin-config'

export interface AuthedRequest extends Request {
  user?: { uid: string }
}

export async function authenticateToken(req: AuthedRequest, res: Response, next: NextFunction) {
  const authHeader = (req as any).headers?.authorization as string | undefined
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token not provided or malformed.' })
  }
  const idToken = authHeader.split(' ')[1]
  try {
    const decoded = await adminAuth.verifyIdToken(idToken)
    req.user = { uid: decoded.uid }
    next()
  } catch (err) {
    console.error('Error verifying Firebase token:', err)
    return res.status(403).json({ message: 'Invalid or expired authentication token.' })
  }
}
