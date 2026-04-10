import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { CustomerDetails } from '../../models';
import { LocationPickerComponent } from '../../components/location-picker/location-picker.component';

type ValidationErrors = {
  [key: string]: boolean;
};

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule,
    LocationPickerComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  cartItems = this.cartService.cartItems;
  cartTotal = this.cartService.cartTotal;
  imageErrors: { [key: string]: boolean } = {};

  customer: CustomerDetails = {
    name: '',
    phone: '',
    address: '',
    apartmentName: '',
    flatNumber: ''
  };

  validationErrors: ValidationErrors = {
    name: false,
    phone: false,
    address: false,
    apartmentName: false,
    flatNumber: false
  };

  deliveryLocation: any = null;
  isOrderPlaced = false;
  isProcessing = false;
  private readonly PHONE_NUMBER = '918870378977';

  // Store order summary for success screen (cart gets cleared after order)
  orderSummary = {
    itemCount: 0,
    totalAmount: 0,
    items: [] as any[]
  };

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Load saved customer details from localStorage
    this.loadCustomerDetails();
  }

  private loadCustomerDetails(): void {
    if (typeof window !== 'undefined') {
      const savedDetails = localStorage.getItem('customerDetails');
      if (savedDetails) {
        try {
          const parsed = JSON.parse(savedDetails);
          this.customer = { ...this.customer, ...parsed };
        } catch (e) {
          console.error('Error parsing saved customer details:', e);
        }
      }
    }
  }

  private saveCustomerDetails(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('customerDetails', JSON.stringify(this.customer));
    }
  }

  validateField(fieldName: keyof CustomerDetails): void {
    const value = this.customer[fieldName];
    if (fieldName === 'phone') {
      // Phone validation: exactly 10 digits
      this.validationErrors[fieldName] = !value || !/^\d{10}$/.test(value);
    } else {
      this.validationErrors[fieldName] = !value || value.toString().trim() === '';
    }
    // Save to localStorage on each valid change
    this.saveCustomerDetails();
  }

  onPhoneInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Only allow digits
    input.value = input.value.replace(/\D/g, '');
    this.customer.phone = input.value;
    // Limit to 10 digits
    if (this.customer.phone.length > 10) {
      this.customer.phone = this.customer.phone.slice(0, 10);
    }
    // Clear validation error while typing
    if (this.validationErrors['phone']) {
      this.validateField('phone');
    }
  }

  onLocationSelected(location: any): void {
    this.deliveryLocation = location;
    // Update customer address from location
    if (location.address) {
      this.customer.address = location.address;
    }
    if (location.houseNumber) {
      this.customer.flatNumber = location.houseNumber;
    }
    if (location.buildingName) {
      this.customer.apartmentName = location.buildingName;
    }
    // Clear validation errors for auto-filled fields
    this.validationErrors['address'] = false;
    this.validationErrors['flatNumber'] = false;
    this.validationErrors['apartmentName'] = false;
    this.saveCustomerDetails();
  }

  getFormProgress(): number {
    const fields: (keyof CustomerDetails)[] = ['name', 'phone', 'address', 'apartmentName', 'flatNumber'];
    const filledFields = fields.filter(field => {
      const value = this.customer[field];
      if (field === 'phone') {
        return value && /^\d{10}$/.test(value);
      }
      return value && value.toString().trim() !== '';
    }).length;
    return Math.round((filledFields / fields.length) * 100);
  }

  placeOrder(): void {
    // Validate all fields first
    const fields: (keyof CustomerDetails)[] = ['name', 'phone', 'address', 'apartmentName', 'flatNumber'];
    let hasErrors = false;
    
    fields.forEach(field => {
      this.validateField(field);
      if (this.validationErrors[field]) {
        hasErrors = true;
      }
    });

    if (hasErrors) {
      this.toastService.show('Please fill in all required details correctly', 'error');
      // Scroll to first error
      setTimeout(() => {
        const firstError = document.querySelector('.border-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    if (this.cartItems().length === 0) {
      this.toastService.show('Your cart is empty', 'error');
      return;
    }

    this.isProcessing = true;

    // Save order summary before clearing cart
    this.orderSummary = {
      itemCount: this.cartItems().length,
      totalAmount: this.cartTotal(),
      items: [...this.cartItems()]
    };

    // Generate WhatsApp message
    const message = this.generateWhatsAppMessage();
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp
    const whatsappUrl = `https://wa.me/${this.PHONE_NUMBER}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
    
    this.isProcessing = false;
    this.isOrderPlaced = true;
    
    // Clear cart after successful order
    this.cartService.clearCart();
  }

  isFormValid(): boolean {
    const fields: (keyof CustomerDetails)[] = ['name', 'phone', 'address', 'apartmentName', 'flatNumber'];
    return fields.every(field => {
      const value = this.customer[field];
      if (field === 'phone') {
        return value && /^\d{10}$/.test(value);
      }
      return value && value.toString().trim() !== '';
    }) && this.cartItems().length > 0;
  }

  private generateWhatsAppMessage(): string {
    const items = this.cartItems()
      .map(item => `• ${item.product.name} x ${item.quantity} = ₹${item.product.price * item.quantity}`)
      .join('\n');

    let locationInfo = '';
    if (this.deliveryLocation && this.deliveryLocation.lat && this.deliveryLocation.lng) {
      locationInfo = `\n📍 *Location:* https://www.google.com/maps?q=${this.deliveryLocation.lat},${this.deliveryLocation.lng}`;
    }

    const landmark = this.deliveryLocation?.landmark ? `\n🏢 *Landmark:* ${this.deliveryLocation.landmark}` : '';

    return `🛒 *New Order from AROW Mart*\n\n📋 *Order Items:*\n${items}\n\n💰 *Total Amount:* ₹${this.cartTotal()}${locationInfo}${landmark}\n\n👤 *Customer Details:*\nName: ${this.customer.name}\nPhone: ${this.customer.phone}\nAddress: ${this.customer.address}\nApartment: ${this.customer.apartmentName}\nFlat/House: ${this.customer.flatNumber}\n\nThank you for choosing AROW Mart! 🛍️`;
  }

  onImageError(productId: string | undefined): void {
    if (productId) {
      this.imageErrors[productId] = true;
    }
  }
}
