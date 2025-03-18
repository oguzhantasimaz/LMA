import { Router } from "express"
import { CacheManager } from "../utils/cacheManager"
import { authenticate, adminOnly } from "../middleware/auth"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/cache/clear-all:
 *   post:
 *     summary: Clear all caches
 *     description: Clear all caches (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All caches cleared successfully
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not an admin
 */
router.post("/cache/clear-all", async (req, res, next) => {
  try {
    await CacheManager.clearAll()
    res.status(200).json({
      status: "success",
      message: "All caches cleared",
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/admin/cache/clear-books:
 *   post:
 *     summary: Clear book caches
 *     description: Clear book caches (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Book caches cleared successfully
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not an admin
 */
router.post("/cache/clear-books", async (req, res, next) => {
  try {
    await CacheManager.clearBookCaches()
    res.status(200).json({
      status: "success",
      message: "Book caches cleared",
    })
  } catch (err) {
    next(err)
  }
})

/**
 * @swagger
 * /api/admin/cache/clear-users:
 *   post:
 *     summary: Clear user caches
 *     description: Clear user caches (admin only)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User caches cleared successfully
 *       401:
 *         description: Unauthorized - Not authenticated
 *       403:
 *         description: Forbidden - Not an admin
 */
router.post("/cache/clear-users", async (req, res, next) => {
  try {
    await CacheManager.clearUserCaches()
    res.status(200).json({
      status: "success",
      message: "User caches cleared",
    })
  } catch (err) {
    next(err)
  }
})

export default router

