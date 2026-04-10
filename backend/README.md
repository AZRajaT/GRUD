# FreshCart Backend

MEAN Stack Admin Dashboard Backend API built with Node.js, Express.js, and MongoDB.

## Features

- **Authentication**: JWT-based authentication with secure password hashing
- **Product Management**: Full CRUD operations for products
- **Role-based Access**: Admin and user roles
- **RESTful API**: Clean API design following REST principles
- **Input Validation**: Request validation using express-validator

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- express-validator for validation
- CORS enabled

## Project Structure

```
backend/
├── controllers/        # Business logic
│   ├── auth.controller.js
│   └── product.controller.js
├── middleware/         # Custom middleware
│   └── auth.middleware.js
├── models/            # MongoDB schemas
│   ├── user.model.js
│   └── product.model.js
├── routes/            # API routes
│   ├── auth.routes.js
│   └── product.routes.js
├── utils/             # Utility functions
│   ├── jwt.utils.js
│   └── seed.js
├── .env.example       # Environment variables template
├── package.json
└── server.js          # Entry point
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start MongoDB (make sure MongoDB is running locally or use MongoDB Atlas)

4. Seed the database with sample data:
```bash
npm run seed
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/freshcart` |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRE` | JWT expiration time | `24h` |

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/auth/verify` | Verify JWT token | Yes |

### Products

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products` | Get all products | No |
| GET | `/api/products/:id` | Get single product | No |
| POST | `/api/products` | Create product | Yes |
| PUT | `/api/products/:id` | Update product | Yes |
| DELETE | `/api/products/:id` | Soft delete product | Yes |
| GET | `/api/products/categories` | Get all categories | No |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

## Default Admin Credentials

After seeding the database:
- **Username**: `admin`
- **Password**: `admin123`

## Authentication

The API uses JWT Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Product Model

```javascript
{
  name: String,        // required, max 100 chars
  price: Number,       // required, min 0
  quantity: Number,    // default 0, min 0
  description: String, // optional, max 500 chars
  category: String,    // default 'General'
  imageUrl: String,    // optional
  isActive: Boolean,   // default true
  createdBy: ObjectId  // reference to User
}
```

## User Model

```javascript
{
  username: String,  // required, unique, 3-30 chars
  email: String,     // required, unique, valid email
  password: String,  // required, min 6 chars (hashed)
  role: String,      // enum: ['admin', 'user'], default 'user'
  isActive: Boolean  // default true
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Validation errors (optional)
}
```

## License

MIT
