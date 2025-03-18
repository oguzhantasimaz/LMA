import type { Request, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import { AppError } from "../middleware/errorHandler"
import { redis, cacheKeys, CACHE_TTL } from "../utils/redis"

export const getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get from cache first
    const cacheKey = cacheKeys.allUsers()
    const cachedUsers = await redis.get(cacheKey)

    if (cachedUsers) {
      console.log("Cache hit: All users")
      return res.status(200).json({
        status: "success",
        data: {
          users: cachedUsers,
          source: "cache",
        },
      })
    }

    // If not in cache, get from database
    const users = await prisma.user.findMany({
      orderBy: {
        name: "asc",
      },
    })

    // Store in cache
    await redis.set(cacheKey, users, { ex: CACHE_TTL.USERS_LIST })

    res.status(200).json({
      status: "success",
      data: {
        users,
        source: "database",
      },
    })
  } catch (err) {
    next(err)
  }
}

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number.parseInt(req.params.id)

    // Try to get from cache first
    const cacheKey = cacheKeys.user(id)
    const cachedUserData = await redis.get(cacheKey)

    if (cachedUserData) {
      console.log(`Cache hit: User ${id}`)
      return res.status(200).json({
        status: "success",
        data: cachedUserData,
        source: "cache",
      })
    }

    // If not in cache, get from database
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return next(new AppError("User not found", 404))
    }

    // Get current borrowings
    const currentBorrowings = await prisma.borrowing.findMany({
      where: {
        userId: id,
        returned: false,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        borrowDate: "desc",
      },
    })

    // Get past borrowings with ratings
    const pastBorrowings = await prisma.borrowing.findMany({
      where: {
        userId: id,
        returned: true,
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        returnDate: "desc",
      },
    })

    const userData = {
      user,
      currentBorrowings: currentBorrowings.map((b) => ({
        bookId: b.book.id,
        title: b.book.title,
        borrowDate: b.borrowDate,
      })),
      pastBorrowings: pastBorrowings.map((b) => ({
        bookId: b.book.id,
        title: b.book.title,
        borrowDate: b.borrowDate,
        returnDate: b.returnDate,
        rating: b.rating,
      })),
    }

    // Store in cache
    await redis.set(cacheKey, userData, { ex: CACHE_TTL.USER })

    res.status(200).json({
      status: "success",
      data: userData,
      source: "database",
    })
  } catch (err) {
    next(err)
  }
}

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email } = req.body

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return next(new AppError("User with this email already exists", 400))
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
      },
    })

    // Invalidate users list cache
    await redis.del(cacheKeys.allUsers())

    res.status(201).json({
      status: "success",
      data: {
        user: newUser,
      },
    })
  } catch (err) {
    next(err)
  }
}

