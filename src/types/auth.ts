import { User } from "@prisma/client"

export interface JwtPayload {
  userId: number
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginResponse {
  tokens: AuthTokens
  user: Omit<User, "password">
}
