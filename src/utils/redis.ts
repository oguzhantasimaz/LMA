import { Redis } from "@upstash/redis"

// Create Redis client instance
export const redis = new Redis({
  url: process.env.REDIS_URL || "https://helped-mustang-10086.upstash.io",
  token: process.env.REDIS_TOKEN || "xxxx",
})

// Cache TTL in seconds
export const CACHE_TTL = {
  BOOK: 3600, // 1 hour
  USER: 1800, // 30 minutes
  BOOKS_LIST: 600, // 10 minutes
  USERS_LIST: 600, // 10 minutes
}

// Lock TTL in milliseconds
export const LOCK_TTL = 30000 // 30 seconds

// Cache key generators
export const cacheKeys = {
  book: (id: number) => `book:${id}`,
  user: (id: number) => `user:${id}`,
  allBooks: () => "books:all",
  allUsers: () => "users:all",
}

// Lock key generators
export const lockKeys = {
  book: (id: number) => `lock:book:${id}`,
}

