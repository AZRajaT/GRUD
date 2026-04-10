import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, GroceryKit } from '../../models';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  popularProducts: Product[] = [];
  isLoadingProducts = false;
  imageErrors: { [key: string]: boolean } = {};
  kitImageErrors: { [key: string]: boolean } = {};
  
  // Hero slider
  currentSlide = 0;
  private slideInterval: any;
  
  groceryKits: GroceryKit[] = [
    {
      _id: 'kit-1',
      name: '₹999 Starter Kit',
      price: 999,
      description: 'Perfect for bachelors & individuals',
      items: ['Rice 2kg', 'Toor Dal 1kg', 'Sunflower Oil 1L', 'Salt 1kg', 'Sugar 1kg', 'Tea 250g', 'Basic Masalas Set'],
      popular: false
    },
    {
      _id: 'kit-2',
      name: '₹1999 Family Kit',
      price: 1999,
      description: 'Ideal for families of 3-4 members',
      items: ['Basmati Rice 5kg', 'Toor Dal 2kg', 'Moong Dal 1kg', 'Groundnut Oil 2L', 'Pure Ghee 250g', 'Salt 2kg', 'Sugar 2kg', 'Complete Masala Box', 'Wheat Atta 5kg'],
      popular: true
    },
    {
      _id: 'kit-3',
      name: '₹2999 Premium Kit',
      price: 2999,
      description: 'Ultimate pack with organic & premium items',
      items: ['Premium Basmati Rice 5kg', 'Organic Toor Dal 2kg', 'Cold Pressed Oil 1L', 'Pure Cow Ghee 500g', 'Rock Salt 2kg', 'Jaggery 1kg', 'Premium Spices Collection', 'Dry Fruits Mix 250g'],
      popular: false
    }
  ];

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadPopularProducts();
    this.startHeroSlider();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startHeroSlider(): void {
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % 3;
      this.updateSlider();
    }, 4000); // Change slide every 4 seconds
  }

  updateSlider(): void {
    const slides = document.querySelectorAll('.hero-slider .slide');
    slides.forEach((slide, index) => {
      if (index === this.currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });
  }

  loadPopularProducts(): void {
    this.isLoadingProducts = true;
    this.productService.getProducts(1, 8).subscribe({
      next: (response) => {
        if (response.success) {
          // Get first 8 active products as popular products
          this.popularProducts = response.data.products
            .filter(p => p.isActive !== false)
            .slice(0, 8);
        }
        this.isLoadingProducts = false;
      },
      error: (err) => {
        console.error('Error loading popular products:', err);
        this.isLoadingProducts = false;
      }
    });
  }

  addToCart(product: Product | GroceryKit): void {
    const prod = product as Product;
    this.cartService.addToCart(prod, 1);
    this.toastService.show(`${product.name} added to cart!`);
  }

  onImageError(productId: string): void {
    this.imageErrors[productId] = true;
  }

  onKitImageError(kitId: string): void {
    this.kitImageErrors[kitId] = true;
  }
}
