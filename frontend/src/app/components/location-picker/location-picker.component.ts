import { Component, EventEmitter, Output, OnInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

interface Location {
  address: string;
  lat: number;
  lng: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

@Component({
  selector: 'app-location-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4">
      <!-- Search/Input Section -->
      <div class="relative">
        <label class="block text-sm font-medium text-text-primary mb-2">
          <i class="bi bi-geo-alt text-primary-500 mr-1"></i>
          Search Location
        </label>
        <div class="relative flex gap-2">
          <div class="flex-1 relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">
              <i class="bi bi-search"></i>
            </span>
            <input
              #addressInput
              type="text"
              [(ngModel)]="address"
              (ngModelChange)="onAddressChange($event)"
              (keyup.enter)="searchAddress()"
              placeholder="Enter your delivery address"
              class="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl focus:border-primary-400 focus:bg-white focus:outline-none transition-all duration-200 placeholder:text-gray-400"
              [class.border-primary-400]="selectedLocation">
          </div>
          <button
            type="button"
            (click)="detectLocation()"
            [disabled]="isDetecting"
            class="px-4 py-3 bg-primary-100 text-primary-600 rounded-xl font-medium transition-all duration-200 hover:bg-primary-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap">
            @if (isDetecting) {
              <i class="bi bi-arrow-repeat animate-spin"></i>
              <span class="hidden sm:inline">Detecting...</span>
            } @else {
              <i class="bi bi-crosshair"></i>
              <span class="hidden sm:inline">Auto</span>
            }
          </button>
        </div>
      </div>

      <!-- Selected Location Chip -->
      @if (selectedLocation) {
        <div class="flex items-center gap-2 px-4 py-2 bg-primary-50 border border-primary-200 rounded-xl">
          <i class="bi bi-check-circle-fill text-primary-500"></i>
          <span class="text-sm text-primary-700 font-medium truncate">
            {{ selectedLocation.address | slice:0:60 }}{{ selectedLocation.address.length > 60 ? '...' : '' }}
          </span>
          <button
            (click)="clearLocation()"
            class="ml-auto text-primary-400 hover:text-primary-600 transition-colors">
            <i class="bi bi-x-circle"></i>
          </button>
        </div>
      }

      <!-- Google Maps Container -->
      <div class="relative">
        <div 
          #mapContainer
          class="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-border bg-gray-100"
          [class.border-primary-400]="selectedLocation"
          [class.border-dashed]="!selectedLocation">
          @if (!isMapLoaded && !mapError) {
            <div class="flex flex-col items-center justify-center h-full text-text-secondary">
              <div class="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-3 animate-pulse">
                <i class="bi bi-map text-gray-400 text-xl"></i>
              </div>
              <p class="text-sm">Loading map...</p>
            </div>
          }
          @if (mapError) {
            <div class="flex flex-col items-center justify-center h-full text-text-secondary p-4 text-center">
              <div class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
                <i class="bi bi-exclamation-triangle text-red-500 text-xl"></i>
              </div>
              <p class="text-sm font-medium text-red-600 mb-1">Map Error</p>
              <p class="text-xs">{{ mapError }}</p>
              <button
                (click)="retryLoadMap()"
                class="mt-3 px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors">
                <i class="bi bi-arrow-clockwise mr-1"></i>
                Retry
              </button>
            </div>
          }
        </div>

        <!-- Map Controls -->
        @if (isMapLoaded) {
          <div class="absolute top-3 right-3 flex flex-col gap-2">
            <button
              (click)="resetMapView()"
              class="w-10 h-10 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-text-primary"
              title="Reset view">
              <i class="bi bi-fullscreen"></i>
            </button>
            <button
              (click)="detectLocation()"
              [disabled]="isDetecting"
              class="w-10 h-10 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center justify-center text-primary-500 disabled:opacity-50"
              title="My location">
              <i class="bi bi-geo" [class.animate-bounce]="isDetecting"></i>
            </button>
          </div>
        }

        <!-- Map Instructions -->
        @if (isMapLoaded && !selectedLocation) {
          <div class="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-xs bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border">
            <div class="flex items-start gap-2">
              <i class="bi bi-info-circle-fill text-primary-500 mt-0.5"></i>
              <p class="text-xs text-text-secondary">
                Click on the map to set your delivery location, or use the search box to find your address.
              </p>
            </div>
          </div>
        }
      </div>

      <!-- Address Details Form -->
      <div class="bg-gray-50 rounded-xl p-4 border border-border">
        <h4 class="font-semibold text-text-primary text-sm mb-3 flex items-center gap-2">
          <i class="bi bi-house-door text-primary-500"></i>
          Address Details
        </h4>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-text-secondary mb-1">House/Flat Number *</label>
            <input
              type="text"
              [(ngModel)]="houseNumber"
              (ngModelChange)="emitLocation()"
              placeholder="e.g., 101, A-Block"
              class="w-full px-3 py-2 bg-white border border-border rounded-lg focus:border-primary-400 focus:outline-none transition-colors text-sm">
          </div>
          <div>
            <label class="block text-xs font-medium text-text-secondary mb-1">Building/Apartment</label>
            <input
              type="text"
              [(ngModel)]="buildingName"
              (ngModelChange)="emitLocation()"
              placeholder="e.g., Green Valley"
              class="w-full px-3 py-2 bg-white border border-border rounded-lg focus:border-primary-400 focus:outline-none transition-colors text-sm">
          </div>
          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-text-secondary mb-1">Landmark (Optional)</label>
            <input
              type="text"
              [(ngModel)]="landmark"
              (ngModelChange)="emitLocation()"
              placeholder="e.g., Near City Mall, Opposite to School"
              class="w-full px-3 py-2 bg-white border border-border rounded-lg focus:border-primary-400 focus:outline-none transition-colors text-sm">
          </div>
        </div>
      </div>
    </div>
  `
})
export class LocationPickerComponent implements OnInit, OnDestroy {
  @Output() locationSelected = new EventEmitter<Location & { houseNumber: string; buildingName: string; landmark: string }>();
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  @ViewChild('addressInput', { static: true }) addressInput!: ElementRef;

  address = '';
  houseNumber = '';
  buildingName = '';
  landmark = '';
  selectedLocation: Location | null = null;
  isDetecting = false;
  isMapLoaded = false;
  mapError: string | null = null;

  private map: any;
  private marker: any;
  private geocoder: any;
  private autocomplete: any;
  private apiKey: string;

  constructor(private ngZone: NgZone) {
    this.apiKey = environment.googleMapsApiKey;
  }

  ngOnInit(): void {
    this.loadSavedLocation();
    this.loadGoogleMapsScript();
  }

  ngOnDestroy(): void {
    // Cleanup map listeners if needed
    if (this.map && this.marker) {
      // Remove marker listeners
    }
  }

  private loadSavedLocation(): void {
    if (typeof window !== 'undefined') {
      const savedLocation = localStorage.getItem('deliveryLocation');
      if (savedLocation) {
        try {
          const parsed = JSON.parse(savedLocation);
          this.address = parsed.address || '';
          this.houseNumber = parsed.houseNumber || '';
          this.buildingName = parsed.buildingName || '';
          this.landmark = parsed.landmark || '';
          if (parsed.lat && parsed.lng) {
            this.selectedLocation = {
              address: parsed.address,
              lat: parsed.lat,
              lng: parsed.lng
            };
          }
        } catch (e) {
          console.error('Error parsing saved location:', e);
        }
      }
    }
  }

  private loadGoogleMapsScript(): void {
    if (this.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      this.mapError = 'Please configure your Google Maps API key in environment.ts';
      return;
    }

    if (window.google && window.google.maps) {
      this.initializeMap();
      return;
    }

    // Define callback for Google Maps script
    window.initMap = () => {
      this.ngZone.run(() => {
        this.initializeMap();
      });
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geocoding&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      this.ngZone.run(() => {
        this.mapError = 'Failed to load Google Maps. Please check your internet connection.';
      });
    };
    document.head.appendChild(script);
  }

  private initializeMap(): void {
    try {
      const defaultLocation = { lat: 20.5937, lng: 78.9629 }; // Center of India
      const initialLocation = this.selectedLocation || defaultLocation;

      this.map = new window.google.maps.Map(this.mapContainer.nativeElement, {
        center: initialLocation,
        zoom: this.selectedLocation ? 16 : 5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_BOTTOM
        },
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Initialize geocoder
      this.geocoder = new window.google.maps.Geocoder();

      // Initialize autocomplete
      this.autocomplete = new window.google.maps.places.Autocomplete(
        this.addressInput.nativeElement,
        {
          types: ['address'],
          componentRestrictions: { country: 'in' }
        }
      );

      this.autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place = this.autocomplete.getPlace();
          if (place.geometry) {
            this.setLocation(
              place.geometry.location.lat(),
              place.geometry.location.lng(),
              place.formatted_address || place.name
            );
          }
        });
      });

      // Add click listener to map
      this.map.addListener('click', (event: any) => {
        this.ngZone.run(() => {
          this.handleMapClick(event);
        });
      });

      // If we have a saved location, show marker
      if (this.selectedLocation) {
        this.addMarker(this.selectedLocation);
      }

      this.isMapLoaded = true;
    } catch (error) {
      console.error('Error initializing map:', error);
      this.mapError = 'Error initializing map. Please try again.';
    }
  }

  private handleMapClick(event: any): void {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    // Show loading state
    this.isDetecting = true;

    // Reverse geocode
    this.geocoder.geocode(
      { location: { lat, lng } },
      (results: any[], status: string) => {
        this.ngZone.run(() => {
          this.isDetecting = false;
          if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            this.setLocation(lat, lng, address);
          } else {
            // Fallback: use coordinates as address
            this.setLocation(lat, lng, `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
          }
        });
      }
    );
  }

  private setLocation(lat: number, lng: number, address: string): void {
    this.selectedLocation = {
      address,
      lat,
      lng
    };
    this.address = address;

    // Update map
    this.map.setCenter({ lat, lng });
    this.map.setZoom(16);

    // Add/update marker
    this.addMarker({ lat, lng, address });

    // Emit location
    this.emitLocation();
  }

  private addMarker(location: Location): void {
    // Remove existing marker
    if (this.marker) {
      this.marker.setMap(null);
    }

    // Create new marker
    this.marker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: this.map,
      draggable: true,
      animation: window.google.maps.Animation.DROP,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new window.google.maps.Size(40, 40)
      }
    });

    // Add drag end listener
    this.marker.addListener('dragend', () => {
      this.ngZone.run(() => {
        const position = this.marker.getPosition();
        this.handleMapClick({ latLng: position });
      });
    });
  }

  detectLocation(): void {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    this.isDetecting = true;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // Use Google Maps Geocoder instead of Nominatim
        if (this.geocoder) {
          this.geocoder.geocode(
            { location: { lat, lng } },
            (results: any[], status: string) => {
              this.ngZone.run(() => {
                this.isDetecting = false;
                if (status === 'OK' && results[0]) {
                  const address = results[0].formatted_address;
                  this.setLocation(lat, lng, address);
                } else {
                  this.setLocation(lat, lng, `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
                }
              });
            }
          );
        } else {
          this.ngZone.run(() => {
            this.isDetecting = false;
            this.setLocation(lat, lng, `Location (${lat.toFixed(6)}, ${lng.toFixed(6)})`);
          });
        }
      },
      (error) => {
        this.ngZone.run(() => {
          this.isDetecting = false;
          console.error('Error getting location:', error);
          let errorMessage = 'Unable to detect your location. Please enter your address manually.';
          if (error.code === 1) {
            errorMessage = 'Location access denied. Please enable location permissions in your browser settings.';
          } else if (error.code === 2) {
            errorMessage = 'Location unavailable. Please try again later.';
          }
          alert(errorMessage);
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  searchAddress(): void {
    if (!this.address.trim()) return;

    this.isDetecting = true;
    this.geocoder.geocode(
      { address: this.address },
      (results: any[], status: string) => {
        this.ngZone.run(() => {
          this.isDetecting = false;
          if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            const formattedAddress = results[0].formatted_address;
            this.setLocation(location.lat(), location.lng(), formattedAddress);
          } else {
            alert('Address not found. Please try a different search term.');
          }
        });
      }
    );
  }

  onAddressChange(newAddress: string): void {
    this.address = newAddress;
    if (this.selectedLocation && this.selectedLocation.address !== newAddress) {
      // Address manually changed, clear selection until searched
      this.selectedLocation = null;
      if (this.marker) {
        this.marker.setMap(null);
        this.marker = null;
      }
    }
  }

  clearLocation(): void {
    this.selectedLocation = null;
    this.address = '';
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }
    this.map.setZoom(5);
    this.map.setCenter({ lat: 20.5937, lng: 78.9629 });
    this.emitLocation();
  }

  resetMapView(): void {
    if (this.selectedLocation) {
      this.map.setCenter({ lat: this.selectedLocation.lat, lng: this.selectedLocation.lng });
      this.map.setZoom(16);
    } else {
      this.map.setCenter({ lat: 20.5937, lng: 78.9629 });
      this.map.setZoom(5);
    }
  }

  retryLoadMap(): void {
    this.mapError = null;
    this.loadGoogleMapsScript();
  }

  emitLocation(): void {
    const locationData = {
      ...(this.selectedLocation || { address: this.address, lat: 0, lng: 0 }),
      houseNumber: this.houseNumber,
      buildingName: this.buildingName,
      landmark: this.landmark
    };

    // Save to localStorage for persistence
    localStorage.setItem('deliveryLocation', JSON.stringify(locationData));

    this.locationSelected.emit(locationData);
  }
}
