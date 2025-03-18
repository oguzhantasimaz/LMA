import { Router } from "express"
import { getAllUsers, getUserById, createUser } from "../controllers/userController"
import { validateUser, validateId, validate } from "../middleware/validation"
import { cacheMiddleware } from "../middleware/cache"
import { cacheKeys, CACHE_TTL } from "../utils/redis"
import { authenticate, adminOnly, checkUserAccess } from "../middleware/auth"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users (requires authentication)
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Not authenticated
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieve a user by their ID
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     description: Create a new user in the system
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid request body
 *       401:
 *         description: Unauthorized - Not authenticated
 *       500:
 *         description: Server error
 */

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

