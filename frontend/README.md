# FreshCart - Premium Grocery Delivery Website

A modern, premium grocery delivery website built with Angular 19 and Tailwind CSS. Features a stunning UI similar to professional startup products like Blinkit or Zepto, with WhatsApp integration for order placement.

![FreshCart](public/freshcart-preview.png)

## Features

- **Modern UI/UX**: Premium design with smooth animations, gradient backgrounds, and a clean layout
- **Responsive Design**: Mobile-first approach with seamless experience across all devices
- **Product Catalog**: Browse groceries by category with search functionality
- **Cart Management**: Add items, update quantities, and manage your cart with ease
- **Checkout Flow**: Modern form UI with customer details and order summary
- **WhatsApp Integration**: Orders are sent directly via WhatsApp for instant communication
- **Local Storage**: Cart persists across browser sessions
- **Toast Notifications**: Beautiful feedback when adding items to cart

## Pages

1. **Home Page**: Hero section with gradient, feature highlights, and grocery kit cards
2. **Products Page**: Grid-based product catalog with category filtering
3. **Cart Page**: Cart management with item quantities and total calculation
4. **Checkout Page**: Customer details form with WhatsApp order integration

## Tech Stack

- **Angular 19**: Latest version with standalone components and signals
- **Tailwind CSS**: Modern utility-first styling
- **Lucide Angular**: Beautiful, consistent icon library
- **RxJS**: Reactive programming

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   ng serve
   ```

3. **Open your browser** and navigate to `http://localhost:4200`

### Building for Production

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── navbar/
│   │   ├── footer/
│   │   └── toast/
│   ├── pages/
│   │   ├── home/
│   │   ├── products/
│   │   ├── cart/
│   │   └── checkout/
│   ├── services/
│   │   ├── cart.service.ts
│   │   └── toast.service.ts
│   ├── models/
│   │   └── index.ts
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── styles.scss
└── index.html
```

## Customization

### WhatsApp Number

Update the WhatsApp number in `src/app/pages/checkout/checkout.component.ts`:

```typescript
const phoneNumber = '918870378977'; // Replace with your WhatsApp number
```

### Products

Add or modify products in `src/app/pages/products/products.component.ts`:

```typescript
products: Product[] = [
  { 
    id: 1, 
    name: 'Product Name', 
    price: 100, 
    priceRange: '₹90–₹110', 
    image: '📦', 
    category: 'category-name', 
    unit: '1kg',
    description: 'Product description'
  },
  // ... more products
];
```

### Colors & Styling

Customize colors in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#22c55e',
    600: '#16a34a',
    // ... more shades
  },
  whatsapp: {
    DEFAULT: '#25D366',
    dark: '#128C7E',
  }
}
```

## Features in Detail

### Cart Service
- Uses Angular Signals for reactive state management
- Persists cart data to localStorage
- Provides methods for adding, updating, and removing items

### Toast Notifications
- Auto-dismiss after 3 seconds
- Three types: success, error, info
- Smooth slide-up animation

### WhatsApp Integration
- Generates formatted order messages
- Opens WhatsApp with pre-filled order details
- Includes customer information and order summary

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions, please open an issue on the project repository.

---

Built with ❤️ using Angular and Tailwind CSS
