import type { Request, Response, NextFunction } from "express"
import { redis } from "../utils/redis"

/**
 * Middleware to cache API responses
 * @param keyFn Function to generate cache key from request
 * @param ttl Time to live in seconds
 */
export const cacheMiddleware = (keyFn: (req: Request) => string, ttl: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== "GET") {
      return next()
    }

    const cacheKey = keyFn(req)

    try {
      // Try to get from cache
      const cachedData = await redis.get(cacheKey)

      if (cachedData) {
        console.log(`Cache hit: ${cacheKey}`)
        return res.status(200).json({
          status: "success",
          data: cachedData,
          source: "cache",
        })
      }

      // Store original send method
      const originalSend = res.send

      // Override send method to cache response
      res.send = function (body: any): Response {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(body)
            if (data.status === "success") {
              // Store in cache
              redis.set(cacheKey, data.data, { ex: ttl }).catch((err) => console.error(`Cache error: ${err.message}`))
            }
          } catch (err) {
            console.error(`Cache parsing error: ${err}`)
          }
        }

        // Call original send
        return originalSend.call(this, body)
      }

      next()
    } catch (err) {
      console.error(`Cache middleware error: ${err}`)
      next()
    }
  }
}

