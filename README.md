# FreshCart - MEAN Stack Admin Dashboard

A full-stack web application built with the MEAN stack (MongoDB, Express.js, Angular, Node.js) featuring authentication and product management.

## Project Structure

```
vegetable/
├── backend/              # Node.js + Express Backend
│   ├── controllers/      # Business logic
│   ├── middleware/       # Auth middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Utilities & seed
│   ├── .env.example     # Environment template
│   ├── package.json
│   ├── README.md
│   └── server.js        # Entry point
│
└── frontend/            # Angular 19 Frontend
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── admin/
    │   │   │   │   ├── layout/      # Admin layout
│   │   │   │   └── sidebar/       # Admin sidebar
│   │   │   └── navbar/            # Main navbar
│   │   ├── guards/
│   │   │   └── auth.guard.ts      # Route protection
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts # JWT interceptor
│   │   ├── models/
│   │   │   ├── auth.model.ts      # Auth interfaces
│   │   │   └── product.model.ts   # Product interfaces
│   │   ├── pages/
│   │   │   └── admin/
│   │   │       ├── login/         # Login page
│   │   │       ├── dashboard/     # Dashboard
│   │   │       └── products/      # Product CRUD
│   │   ├── services/
│   │   │   ├── auth.service.ts     # Auth API
│   │   │   └── product.service.ts # Product API
│   │   ├── app.config.ts          # App configuration
│   │   └── app.routes.ts          # Routes
│   └── environments/               # Environment files
```

## Features

### Authentication
- JWT-based secure authentication
- Login page with username/password
- Protected admin routes with Auth Guard
- HTTP Interceptor for automatic token attachment
- Automatic logout on token expiration

### Admin Dashboard
- Clean layout with sidebar navigation
- Dashboard with statistics overview
- Quick action buttons

### Product Management
- View all products with pagination
- Add new products
- Edit existing products
- Delete products (soft delete)
- Search and filter products
- Responsive table design

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)
- Angular CLI

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env and set your JWT_SECRET
```

4. Seed database with sample data:
```bash
npm run seed
```

5. Start server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

4. Open `http://localhost:4200` in your browser

## Default Login Credentials

- **Username**: `admin`
- **Password**: `admin123`

## API Documentation

See `backend/README.md` for detailed API documentation.

## Architecture

### Backend (MVC Pattern)
- **Models**: MongoDB schemas for User and Product
- **Controllers**: Business logic and data handling
- **Routes**: API endpoint definitions
- **Middleware**: JWT verification and role checking

### Frontend (Component-based)
- **Standalone Components**: Angular 19 standalone components
- **Services**: API communication and state management
- **Guards**: Route protection
- **Interceptors**: JWT token attachment

## Tech Stack

- **Frontend**: Angular 19, Tailwind CSS, Bootstrap Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## Production Deployment

### Backend
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure MongoDB Atlas URI
4. Start with `npm start`

### Frontend
1. Build for production:
```bash
ng build --configuration production
```
2. Deploy `dist/` folder to your web server

## License

MIT
