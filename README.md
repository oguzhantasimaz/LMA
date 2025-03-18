# Library Management Application (LMA)

## Overview
LMA is a comprehensive library management application that provides APIs for managing users, books, borrowing operations, and administrative tasks. It helps libraries digitize their operations and users to easily browse and borrow books.

## Installation

```bash
# Navigate to the project directory
cd src

# Install dependencies
pnpm i

# For development with hot reload
pnpm run dev
```

## Setup 

Fill in the environment variables in the `.env` file.
Example is provided in the `.env.example` file.

I used upstash for caching and lock mechanism for borrowing operations. You can create a free account at https://upstash.com/ and get the URL for the Redis instance.

Also for postgres, you can use supabase or any other postgres instance.

## API Documentation

Server running on port 3000
Swagger documentation available at http://localhost:3000/api-docs
Swagger JSON available at http://localhost:3000/swagger.json

## Features

- User management
- Book management
- User authentication
- Borrowing operations
- Administrative tasks

## Technology Stack
- Node.js with Express
- TypeScript
- Prisma ORM
- Swagger for API documentation
- CORS and Helmet for security
- Upstash Redis for lock mechanism for borrowing operations
- Upstash Redis for caching

