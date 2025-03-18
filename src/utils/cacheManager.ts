import { redis, cacheKeys } from "./redis"

export class CacheManager {
  /**
   * Clear all caches
   */
  static async clearAll(): Promise<void> {
    await redis.flushall()
    console.log("All caches cleared")
  }

  /**
   * Clear book caches
   */
  static async clearBookCaches(): Promise<void> {
    // Get all keys matching book:*
    const keys = await redis.keys("book:*")
    if (keys.length > 0) {
      await redis.del(keys)
    }

    // Clear all books list
    await redis.del(cacheKeys.allBooks())
    console.log("Book caches cleared")
  }

  /**
   * Clear user caches
   */
  static async clearUserCaches(): Promise<void> {
    // Get all keys matching user:*
    const keys = await redis.keys("user:*")
    if (keys.length > 0) {
      await redis.del(keys)
    }

    // Clear all users list
    await redis.del(cacheKeys.allUsers())
    console.log("User caches cleared")
  }

  /**
   * Clear specific book cache
   */
  static async clearBookCache(bookId: number): Promise<void> {
    await redis.del(cacheKeys.book(bookId))
    await redis.del(cacheKeys.allBooks())
    console.log(`Book ${bookId} cache cleared`)
  }

  /**
   * Clear specific user cache
   */
  static async clearUserCache(userId: number): Promise<void> {
    await redis.del(cacheKeys.user(userId))
    await redis.del(cacheKeys.allUsers())
    console.log(`User ${userId} cache cleared`)
  }
}

