import { Router } from "express"
import { redis } from "../utils/redis"
import { prisma } from "../lib/prisma"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Service health check endpoints
 */

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check service health
 *     description: Returns the health status of the service
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 service:
 *                   type: string
 *                   example: "Library Management API"
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *       500:
 *         description: Service is not healthy
 */

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

