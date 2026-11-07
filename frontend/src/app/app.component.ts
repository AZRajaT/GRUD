import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastComponent } from './components/toast/toast.component';
import { FloatingCartComponent } from './components/floating-cart/floating-cart.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { LoadingService } from './services/loading.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ToastComponent, FloatingCartComponent, SpinnerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'nammabasket';
  isAdminRoute = false;

  constructor(
    private router: Router,
    private loadingService: LoadingService
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.isAdminRoute = event.url.startsWith('/admin');
      } else if (event instanceof NavigationError || event instanceof NavigationCancel) {
        this.loadingService.reset();
      }
    });
  }
}
