import { Router } from "express"
import { borrowBook, returnBook } from "../controllers/borrowingController"
import { validateBorrowing, validateReturn, validate } from "../middleware/validation"
import { authenticate } from "../middleware/auth"

const router = Router()

// Protect all borrowing routes - users must be authenticated
router.use(authenticate)

/**
 * @swagger
 * /api/borrowings/borrow:
 *   post:
 *     summary: Borrow a book
 *     tags: [Borrowings]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - bookId
 *             properties:
 *               userId:
 *                 type: integer
 *               bookId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Book borrowed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     borrowing:
 *                       $ref: '#/components/schemas/Borrowing'
 *       400:
 *         description: Invalid input or book not available
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User or book not found
 *       409:
 *         description: Book is being processed by another request
 */
router.post("/borrow", validateBorrowing, validate, borrowBook)

/**
 * @swagger
 * /api/borrowings/return/{borrowingId}:
 *   post:
 *     summary: Return a borrowed book
 *     tags: [Borrowings]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: borrowingId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The borrowing ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating for the book (1-5)
 *     responses:
 *       200:
 *         description: Book returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     borrowing:
 *                       $ref: '#/components/schemas/Borrowing'
 *       400:
 *         description: Invalid input or book already returned
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Borrowing record not found
 *       409:
 *         description: Book is being processed by another request
 */
router.post("/return/:borrowingId", validateReturn, validate, returnBook)

export default router

