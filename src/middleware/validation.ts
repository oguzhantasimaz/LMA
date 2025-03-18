import { body, param, validationResult } from "express-validator"
import type { Request, Response, NextFunction } from "express"

export const validateUser = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
]

export const validateBook = [
  body("title").notEmpty().withMessage("Title is required"),
  body("author").notEmpty().withMessage("Author is required"),
]

export const validateBorrowing = [
  body("userId").isInt().withMessage("Valid user ID is required"),
  body("bookId").isInt().withMessage("Valid book ID is required"),
]

export const validateReturn = [body("rating").isFloat({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5")]

export const validateId = [param("id").isInt().withMessage("Valid ID is required")]

// Auth validations
export const validateRegister = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
]

export const validateLogin = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
]

export const validateRefreshToken = [
  body("refreshToken").notEmpty().withMessage("Refresh token is required"),
]

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}

