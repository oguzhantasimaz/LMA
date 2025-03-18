import type { Request, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import { AppError } from "../middleware/errorHandler"
import { redis, cacheKeys, lockKeys } from "../utils/redis"
import { DistributedLock } from "../utils/lock"

export const borrowBook = async (req: Request, res: Response, next: NextFunction) => {
  const { userId, bookId } = req.body
  const lock = new DistributedLock(lockKeys.book(bookId))

  try {
    // Acquire lock for the book
    const lockAcquired = await lock.acquire()
    if (!lockAcquired) {
      return next(new AppError("Book is currently being processed by another request. Please try again.", 409))
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return next(new AppError("User not found", 404))
    }

    // Find book
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    })

    if (!book) {
      return next(new AppError("Book not found", 404))
    }

    // Check if book is available
    if (!book.available) {
      return next(new AppError("Book is not available for borrowing", 400))
    }

    // Use transaction to ensure both operations succeed or fail together
    const [borrowing, updatedBook] = await prisma.$transaction([
      // Create borrowing record
      prisma.borrowing.create({
        data: {
          userId,
          bookId,
          borrowDate: new Date(),
          returned: false,
        },
      }),

      // Update book availability
      prisma.book.update({
        where: { id: bookId },
        data: { available: false },
      }),
    ])

    // Invalidate book cache
    await redis.del(cacheKeys.book(bookId))
    await redis.del(cacheKeys.allBooks())
    await redis.del(cacheKeys.user(userId))

    res.status(201).json({
      status: "success",
      data: {
        borrowing: {
          id: borrowing.id,
          userId: borrowing.userId,
          bookId: borrowing.bookId,
          borrowDate: borrowing.borrowDate,
        },
      },
    })
  } catch (err) {
    next(err)
  } finally {
    // Always release the lock
    await lock.release()
  }
}

export const returnBook = async (req: Request, res: Response, next: NextFunction) => {
  const { borrowingId } = req.params
  const { rating } = req.body
  let bookId: number | null = null
  let userId: number | null = null
  let lock: DistributedLock | null = null

  try {
    // Find borrowing record
    const borrowing = await prisma.borrowing.findUnique({
      where: { id: Number.parseInt(borrowingId) },
      include: {
        book: true,
        user: true,
      },
    })

    if (!borrowing) {
      return next(new AppError("Borrowing record not found", 404))
    }

    if (borrowing.returned) {
      return next(new AppError("Book has already been returned", 400))
    }

    bookId = borrowing.book.id
    userId = borrowing.user.id

    // Acquire lock for the book
    lock = new DistributedLock(lockKeys.book(bookId))
    const lockAcquired = await lock.acquire()

    if (!lockAcquired) {
      return next(new AppError("Book is currently being processed by another request. Please try again.", 409))
    }

    // Update book's rating
    const newTotalRatings = borrowing.book.totalRatings + (rating || 0)
    const newRatingCount = borrowing.book.ratingCount + (rating ? 1 : 0)
    const newAverageRating = newRatingCount > 0 ? newTotalRatings / newRatingCount : 0

    // Use transaction to ensure all operations succeed or fail together
    const [updatedBorrowing, updatedBook] = await prisma.$transaction([
      // Update borrowing record
      prisma.borrowing.update({
        where: { id: Number.parseInt(borrowingId) },
        data: {
          returnDate: new Date(),
          rating: rating ? Number.parseInt(rating.toString()) : null,
          returned: true,
        },
      }),

      // Update book availability and rating
      prisma.book.update({
        where: { id: bookId },
        data: {
          available: true,
          totalRatings: newTotalRatings,
          ratingCount: newRatingCount,
          averageRating: newAverageRating,
        },
      }),
    ])

    // Invalidate caches
    await redis.del(cacheKeys.book(bookId))
    await redis.del(cacheKeys.allBooks())
    await redis.del(cacheKeys.user(userId))

    res.status(200).json({
      status: "success",
      data: {
        borrowing: {
          id: updatedBorrowing.id,
          userId: updatedBorrowing.userId,
          bookId: updatedBorrowing.bookId,
          borrowDate: updatedBorrowing.borrowDate,
          returnDate: updatedBorrowing.returnDate,
          rating: updatedBorrowing.rating,
        },
      },
    })
  } catch (err) {
    next(err)
  } finally {
    // Always release the lock if it was acquired
    if (lock) {
      await lock.release()
    }
  }
}

