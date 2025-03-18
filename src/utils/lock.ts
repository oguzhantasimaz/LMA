import { redis, LOCK_TTL } from "./redis"
import { v4 as uuidv4 } from "uuid"

export class DistributedLock {
  private lockKey: string
  private lockValue: string
  private acquired = false

  constructor(lockKey: string) {
    this.lockKey = lockKey
    this.lockValue = uuidv4() // Generate a unique token for this lock instance
  }

  /**
   * Acquire a lock with a timeout
   * @param timeoutMs Maximum time to wait for lock acquisition in milliseconds
   * @param retryIntervalMs Time between retries in milliseconds
   * @returns True if lock was acquired, false otherwise
   */
  async acquire(timeoutMs = 10000, retryIntervalMs = 100): Promise<boolean> {
    const startTime = Date.now()

    while (Date.now() - startTime < timeoutMs) {
      // Try to set the lock key with NX (only if it doesn't exist)
      const result = await redis.set(this.lockKey, this.lockValue, {
        nx: true,
        ex: Math.ceil(LOCK_TTL / 1000), // Convert to seconds for Redis EX
      })

      if (result === "OK") {
        this.acquired = true
        return true
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs))
    }

    return false
  }

  /**
   * Release the lock if it was acquired by this instance
   * @returns True if lock was released, false otherwise
   */
  async release(): Promise<boolean> {
    if (!this.acquired) {
      return false
    }

    // Use Lua script to ensure we only delete our own lock
    const script = `
      if redis.call('get', KEYS[1]) == ARGV[1] then
        return redis.call('del', KEYS[1])
      else
        return 0
      end
    `

    const result = await redis.eval(script, [this.lockKey], [this.lockValue])

    this.acquired = false
    return result === 1
  }
}

