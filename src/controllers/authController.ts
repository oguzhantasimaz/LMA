import type { Request, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import { AppError } from "../middleware/errorHandler"
import { comparePassword, generateTokens, hashPassword, verifyRefreshToken, extractUserData } from "../utils/auth"

// Register a new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return next(new AppError("User with this email already exists", 400))
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER", // Default role
      },
    })

    // Generate tokens
    const tokens = generateTokens(newUser)

    // Return user data and tokens
    res.status(201).json({
      status: "success",
      data: {
        user: extractUserData(newUser),
        tokens,
      },
    })
  } catch (err) {
    next(err)
  }
}

// Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return next(new AppError("Invalid email or password", 401))
    }

    // Check if password is correct
    const isPasswordValid = await comparePassword(password, user.password)
    if (!isPasswordValid) {
      return next(new AppError("Invalid email or password", 401))
    }

    // Generate tokens
    const tokens = generateTokens(user)

    res.status(200).json({
      status: "success",
      data: {
        user: extractUserData(user),
        tokens,
      },
    })
  } catch (err) {
    next(err)
  }
}

// Refresh access token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return next(new AppError("Refresh token is required", 400))
    }

    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken)

      // Get user by ID
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      })

      if (!user) {
        return next(new AppError("Invalid refresh token", 401))
      }

      // Generate new tokens
      const tokens = generateTokens(user)

      res.status(200).json({
        status: "success",
        data: {
          tokens,
        },
      })
    } catch (err) {
      return next(new AppError("Invalid or expired refresh token", 401))
    }
  } catch (err) {
    next(err)
  }
}

// Get current user profile
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError("Authentication required", 401))
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    })

    if (!user) {
      return next(new AppError("User not found", 404))
    }

    res.status(200).json({
      status: "success",
      data: {
        user: extractUserData(user),
      },
    })
  } catch (err) {
    next(err)
  }
}
