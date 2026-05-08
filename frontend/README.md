# AROW Mart - Premium Grocery Delivery Website

A modern, premium grocery delivery website built with Angular 19 and Tailwind CSS. Features a stunning UI similar to professional startup products like Blinkit or Zepto, with full Google Maps integration for accurate delivery location handling.

![AROW Mart](public/freshcart-preview.png)

## Features

- **Modern UI/UX**: Premium design with smooth animations, gradient backgrounds, and a clean layout
- **Google Maps Integration**: Interactive map for selecting delivery location with autocomplete and auto-detection
- **Responsive Design**: Mobile-first approach with seamless experience across all devices
- **Product Catalog**: Browse groceries by category with search functionality
- **Cart Management**: Add items, update quantities, and manage your cart with ease
- **Checkout Flow**: Modern form UI with customer details and order summary
- **Order Management**: Robust backend to store and manage customer orders
- **Local Storage**: Cart and location details persist across browser sessions
- **Toast Notifications**: Beautiful feedback for user actions

## Pages

1. **Home Page**: Hero section with feature highlights and grocery kit cards
2. **Products Page**: Grid-based product catalog with category filtering
3. **Cart Page**: Cart management with item quantities and total calculation
4. **Checkout Page**: Customer details form with Google Maps location picker
5. **Admin Dashboard**: Manage orders, products, and categories

## Tech Stack

- **Frontend**: Angular 19 (Standalone components, Signals)
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Styling**: Tailwind CSS, Bootstrap Icons
- **Maps**: Google Maps JavaScript API

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Installation

1. **Clone and Install Backend**:
   ```bash
   cd backend
   npm install
   ```

2. **Clone and Install Frontend**:
   ```bash
   cd frontend
   npm install
   ```

3. **Configure Environment Variables**:
   - Update `backend/.env` with your MongoDB URI and JWT secret.
   - Update `frontend/src/environments/environment.ts` with your Google Maps API Key.

4. **Run the Application**:
   - Backend: `npm start` (in backend folder)
   - Frontend: `npm start` (in frontend folder)

## Google Maps Configuration

To use the map features:
1. Get an API key from the [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials).
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Paste the key in `src/environments/environment.ts`.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── location-picker/
│   │   ├── navbar/
│   │   ├── footer/
│   │   └── toast/
│   ├── pages/
│   │   ├── home/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── admin/
│   ├── services/
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   └── toast.service.ts
│   ├── app.component.ts
│   └── app.routes.ts
├── styles.scss
└── index.html
```

## License

MIT License

Built with ❤️ using Angular and Node.js
