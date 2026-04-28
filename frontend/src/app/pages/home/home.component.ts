import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product, GroceryKit, KitItem } from '../../models';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { ProductService } from '../../services/product.service';
import { GroceryKitService } from '../../services/grocery-kit.service';

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
  
  groceryKits: GroceryKit[] = [];
  isLoadingKits = false;

  categories = [
    { id: 'spices', name: 'Pure Spices', image: 'assets/images/cat-spices.jpg' },
    { id: 'oils', name: 'Cold Pressed Oils', image: 'assets/images/cat-oils.jpg' },
    { id: 'grains', name: 'Premium Grains', image: 'assets/images/cat-grains.jpg' },
    { id: 'sweets', name: 'Traditional Sweets', image: 'assets/images/cat-sweets.jpg' }
  ];

  get products(): Product[] {
    return this.popularProducts;
  }

  addToCartFromKit(kit: GroceryKit): void {
    this.addToCart(kit);
  }

  constructor(
    private cartService: CartService,
    private toastService: ToastService,
    private productService: ProductService,
    private groceryKitService: GroceryKitService
  ) {}

  ngOnInit(): void {
    this.loadPopularProducts();
    this.loadPopularKits();
    this.startHeroSlider();
  }

  loadPopularKits(): void {
    this.isLoadingKits = true;
    this.groceryKitService.getPopularKits().subscribe({
      next: (response) => {
        if (response.success) {
          this.groceryKits = response.data.kits;
        }
        this.isLoadingKits = false;
      },
      error: (err) => {
        console.error('Error loading popular kits:', err);
        this.isLoadingKits = false;
      }
    });
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
    // Check if it's a kit by looking for items array
    if ('items' in product && Array.isArray(product.items) && product.items.length > 0 && typeof product.items[0] !== 'string') {
      // It's a kit - expand and add all items
      const kit = product as GroceryKit;
      kit.items.forEach((item: KitItem) => {
        this.cartService.addToCart(item.product, item.quantity);
      });
      this.toastService.show(`${kit.name} kit added to cart! (${kit.items.length} items)`);
    } else {
      // It's a regular product
      const prod = product as Product;
      this.cartService.addToCart(prod, 1);
      this.toastService.show(`${prod.name} added to cart!`);
    }
  }

  onImageError(productId: string): void {
    this.imageErrors[productId] = true;
  }

  onKitImageError(kitId: string): void {
    this.kitImageErrors[kitId] = true;
  }
}
