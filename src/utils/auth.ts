import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { JwtPayload, AuthTokens } from "../types/auth"
import { User } from "@prisma/client"

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Compare password with hash
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash)
}

// Generate JWT tokens
export const generateTokens = (user: User): AuthTokens => {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  }

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  })

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  })

  return {
    accessToken,
    refreshToken,
  }
}

// Verify JWT token
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
}

// Verify refresh token
export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET!) as JwtPayload
}

// Extract user data for response (remove sensitive info)
export const extractUserData = (user: User): Omit<User, "password"> => {
  const { password, ...userData } = user
  return userData
}
