import { Router } from "express"
import { redis } from "../utils/redis"
import { prisma } from "../lib/prisma"

const router = Router()

router.get("/", async (req, res) => {
  try {
    // Check Redis connection
    const redisStatus = await redis
      .ping()
      .then(() => "connected")
      .catch(() => "disconnected")

    // Check database connection by running a simple query
    const dbStatus = await prisma.$queryRaw`SELECT 1`.then(() => "connected").catch(() => "disconnected")

    res.status(200).json({
      status: "success",
      data: {
        service: "library-management-api",
        redis: redisStatus,
        database: dbStatus,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Health check failed",
      error: error.message,
    })
  }
})

export default router

