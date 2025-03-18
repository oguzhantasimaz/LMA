import { Router } from "express"
import { getAllUsers, getUserById, createUser } from "../controllers/userController"
import { validateUser, validateId, validate } from "../middleware/validation"
import { cacheMiddleware } from "../middleware/cache"
import { cacheKeys, CACHE_TTL } from "../utils/redis"
import { authenticate, adminOnly, checkUserAccess } from "../middleware/auth"

const router = Router()

// Apply authentication middleware to protect routes
router.use(authenticate)

// Protected routes for all authenticated users
router.get(
  "/:id",
  validateId,
  validate,
  checkUserAccess, // Only allow users to access their own data or admin
  cacheMiddleware((req) => cacheKeys.user(Number.parseInt(req.params.id)), CACHE_TTL.USER),
  getUserById,
)

// Admin only routes
router.get(
  "/",
  adminOnly,
  cacheMiddleware(() => cacheKeys.allUsers(), CACHE_TTL.USERS_LIST),
  getAllUsers,
)

router.post("/", adminOnly, validateUser, validate, createUser)

export default router

