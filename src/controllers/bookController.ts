import type { Request, Response, NextFunction } from "express"
import { prisma } from "../lib/prisma"
import { AppError } from "../middleware/errorHandler"
import { redis, cacheKeys, CACHE_TTL } from "../utils/redis"

export const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Try to get from cache first
    const cacheKey = cacheKeys.allBooks()
    const cachedBooks = await redis.get(cacheKey)

    if (cachedBooks) {
      console.log("Cache hit: All books")
      return res.status(200).json({
        status: "success",
        data: {
          books: cachedBooks,
          source: "cache",
        },
      })
    }

    // If not in cache, get from database
    const books = await prisma.book.findMany({
      orderBy: {
        createdAt: "desc",
      },
    })

    // Store in cache
    await redis.set(cacheKey, books, { ex: CACHE_TTL.BOOKS_LIST })

    res.status(200).json({
      status: "success",
      data: {
        books,
        source: "database",
      },
    })
  } catch (err) {
    next(err)
  }
}

export const getBookById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number.parseInt(req.params.id)

    // Try to get from cache first
    const cacheKey = cacheKeys.book(id)
    const cachedBook = await redis.get(cacheKey)

    if (cachedBook) {
      console.log(`Cache hit: Book ${id}`)
      return res.status(200).json({
        status: "success",
        data: {
          book: cachedBook,
          source: "cache",
        },
      })
    }

    // If not in cache, get from database
    const book = await prisma.book.findUnique({
      where: { id },
    })

    if (!book) {
      return next(new AppError("Book not found", 404))
    }

    const bookData = {
      id: book.id,
      title: book.title,
      author: book.author,
      description: book.description,
      averageRating: book.averageRating,
      available: book.available,
    }

    // Store in cache
    await redis.set(cacheKey, bookData, { ex: CACHE_TTL.BOOK })

    res.status(200).json({
      status: "success",
      data: {
        book: bookData,
        source: "database",
      },
    })
  } catch (err) {
    next(err)
  }
}

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, author, description } = req.body

    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        description,
        available: true,
        averageRating: 0,
        totalRatings: 0,
        ratingCount: 0,
      },
    })

    // Invalidate books list cache
    await redis.del(cacheKeys.allBooks())

    res.status(201).json({
      status: "success",
      data: {
        book: newBook,
      },
    })
  } catch (err) {
    next(err)
  }
}

