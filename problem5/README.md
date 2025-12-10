# Problem 4 - User Management API

A RESTful API backend built with Express.js, Prisma ORM, and SQLite database.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js 5
- **Language**: TypeScript
- **ORM**: Prisma 7
- **Database**: SQLite

## Project Structure

```
src/
├── index.ts                 # Application entry point
├── controllers/             # HTTP request handlers
│   └── user.controller.ts
├── services/                # Business logic layer
│   └── user.service.ts
├── models/                  # TypeScript interfaces & DTOs
│   └── user.model.ts
├── routes/                  # API route definitions
│   └── user.routes.ts
└── lib/
    └── prisma.ts            # Prisma client singleton
```

## Prerequisites

- Node.js >= 18
- npm or yarn

## Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Setup database**

   The SQLite database file (`dev.db`) is already included. If you need to reset or recreate it:

   ```bash
   npx prisma migrate dev
   ```

3. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```

## Running the Application

### Development mode (with auto-reload)

```bash
npm run dev
```

### Production mode

```bash
npm start
```

The server will start on `http://localhost:3000` by default.

To use a different port:

```bash
PORT=8080 npm start
```

## API Endpoints

| Method | Endpoint      | Description                    |
|--------|---------------|--------------------------------|
| GET    | `/health`     | Health check                   |
| POST   | `/users`      | Create a new user              |
| GET    | `/users`      | List all users (with filters)  |
| GET    | `/users/:id`  | Get user by ID                 |
| PUT    | `/users/:id`  | Update user by ID              |
| DELETE | `/users/:id`  | Delete user by ID              |

## API Usage Examples

### Create a user

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "type": "admin"}'
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "type": "admin",
  "createdAt": "2025-12-09T21:00:00.000Z",
  "updatedAt": "2025-12-09T21:00:00.000Z"
}
```

### List users

```bash
# Get all users
curl http://localhost:3000/users

# Filter by type
curl "http://localhost:3000/users?type=admin"

# Filter by name (contains)
curl "http://localhost:3000/users?name=John"

# Pagination
curl "http://localhost:3000/users?limit=10&offset=0"
```

### Get user by ID

```bash
curl http://localhost:3000/users/1
```

### Update user

```bash
curl -X PUT http://localhost:3000/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated", "type": "superadmin"}'
```

### Delete user

```bash
curl -X DELETE http://localhost:3000/users/1
```

## Database Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  name      String
  type      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Available Scripts

| Script          | Description                              |
|-----------------|------------------------------------------|
| `npm start`     | Run the server                           |
| `npm run dev`   | Run the server with watch mode           |
| `npm run build` | Compile TypeScript to JavaScript         |

## Prisma Commands

```bash
# View database in browser
npx prisma studio

# Create a migration
npx prisma migrate dev --name <migration_name>

# Reset database
npx prisma migrate reset

# Generate Prisma client
npx prisma generate
```

## Configuration

### Environment Variables

| Variable       | Default | Description        |
|----------------|---------|-------------------|
| `PORT`         | `3000`  | Server port       |
| `DATABASE_URL` | -       | Database URL (optional, configured in prisma.config.ts) |

### Prisma Configuration

Database connection is configured in `prisma.config.ts`:

```typescript
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "file:./dev.db",
  },
});
```

