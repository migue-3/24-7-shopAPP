import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '@auth/services/auth.service';

@Component({
  selector: 'app-admin-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-dashboard-layout.component.html',
})
export class AdminDashboardLayoutComponent {
  authService = inject(AuthService);

  user = computed(() => this.authService.user());
}
