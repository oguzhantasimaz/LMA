import { Router } from "express"
import { CacheManager } from "../utils/cacheManager"
import { authenticate, adminOnly } from "../middleware/auth"

const router = Router()

// Protect all admin routes with authentication and authorization
router.use(authenticate)
router.use(adminOnly)

// Clear all caches
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

// Clear book caches
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

// Clear user caches
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

