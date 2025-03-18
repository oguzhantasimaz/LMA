import { Request, Response, NextFunction } from "express"
import { AppError } from "./errorHandler"
import { verifyToken } from "../utils/auth"
import { prisma } from "../lib/prisma"
import { JwtPayload } from "../types/auth"

// Augment Express Request type to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Authentication required", 401))
    }

    // Extract token
    const token = authHeader.split(" ")[1]
    if (!token) {
      return next(new AppError("Authentication required", 401))
    }

    try {
      // Verify token
      const decoded = verifyToken(token)

      // Attach user info to request
      req.user = decoded

      next()
    } catch (err) {
      return next(new AppError("Invalid or expired token", 401))
    }
  } catch (err) {
    next(err)
  }
}

// Admin only middleware
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new AppError("Admin access required", 403))
  }
  next()
}

// Check if user is requesting their own data or is admin
export const checkUserAccess = (req: Request, res: Response, next: NextFunction) => {
  const userId = parseInt(req.params.id)
  
  if (isNaN(userId)) {
    return next(new AppError("Invalid user ID", 400))
  }
  
  if (!req.user) {
    return next(new AppError("Authentication required", 401))
  }
  
  // Allow access if user is requesting their own data or is an admin
  if (req.user.userId === userId || req.user.role === "ADMIN") {
    next()
  } else {
    next(new AppError("Access denied", 403))
  }
}
