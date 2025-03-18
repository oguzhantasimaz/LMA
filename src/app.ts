import express from "express"
import cors from "cors"
import helmet from "helmet"
import swaggerUi from "swagger-ui-express"
import userRoutes from "./routes/userRoutes"
import bookRoutes from "./routes/bookRoutes"
import borrowingRoutes from "./routes/borrowingRoutes"
import adminRoutes from "./routes/adminRoutes"
import healthRoutes from "./routes/healthRoutes"
import authRoutes from "./routes/authRoutes"
import swaggerRoutes from "./routes/swaggerRoutes"
import { errorHandler } from "./middleware/errorHandler"
import { prisma } from "./lib/prisma"
import { isDatabaseInitialized, initializeDatabase } from "./utils/dbInit"
import swaggerSpec from "./config/swagger"

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(helmet())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/swagger.json', swaggerRoutes)

// Routes
app.use("/health", healthRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/books", bookRoutes)
app.use("/api/borrowings", borrowingRoutes)
app.use("/api/admin", adminRoutes)

// Error handling middleware
app.use(errorHandler)

// Initialize the server with database check
async function startServer() {
  try {
    // Check if database is initialized
    const isDbInitialized = await isDatabaseInitialized()
    
    if (!isDbInitialized) {
      console.log('Database tables not found. Attempting to create schema...')
      await initializeDatabase()
    }
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`)
      console.log(`Swagger JSON available at http://localhost:${PORT}/swagger.json`)
    })

    // Handle graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("SIGTERM signal received: closing HTTP server")
      await prisma.$disconnect()
      server.close(() => {
        console.log("HTTP server closed")
      })
    })
    
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Start the server
startServer()

export default app

