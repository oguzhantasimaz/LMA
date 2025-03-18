import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()

/**
 * Utility function to check if the database schema is already initialized
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  const prisma = new PrismaClient()
  try {
    // Try to query the _prisma_migrations table to check if migrations exist
    const result = await prisma.$queryRaw`SELECT COUNT(*) FROM "_prisma_migrations";`
    await prisma.$disconnect()
    return true
  } catch (error) {
    console.log('Database is not initialized:', error.message)
    await prisma.$disconnect()
    return false
  }
}

/**
 * Push the Prisma schema to the database without creating migrations
 */
export async function initializeDatabase(): Promise<void> {
  console.log('🔄 Initializing database schema...')
  
  try {
    // Use the Prisma db push command to create the tables without migrations
    const { exec } = require('child_process')
    return new Promise((resolve, reject) => {
      exec('npx prisma db push', (error: any, stdout: any, stderr: any) => {
        if (error) {
          console.error('❌ Database initialization failed:', error.message)
          return reject(error)
        }
        console.log('✅ Database schema initialized successfully!')
        console.log(stdout)
        resolve()
      })
    })
  } catch (error) {
    console.error('❌ Failed to initialize database:', error.message)
    throw error
  }
}
