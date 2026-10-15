import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login-component',
    imports: [CommonModule, FormsModule],
    templateUrl: './login-component.component.html',
    styleUrl: './login-component.component.css'
})
export class LoginComponentComponent implements OnInit {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  // Persistencia de usuario en el dispositivo
  recordarUsuario: boolean = true;
  usuarioRecordado: boolean = false;
  private readonly REMEMBERED_KEY = 'districol_remembered_email';

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Si ya existe una sesión activa válida, redirigir directo al dashboard
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Recuperar el usuario recordado en este dispositivo (persistente hasta borrar datos de navegación)
    const savedEmail = localStorage.getItem(this.REMEMBERED_KEY);
    if (savedEmail) {
      this.email = savedEmail;
      this.usuarioRecordado = true;
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  cambiarUsuario(): void {
    this.usuarioRecordado = false;
    this.email = '';
    this.password = '';
    localStorage.removeItem(this.REMEMBERED_KEY);
  }

  onSubmit(): void {
    this.errorMessage = '';
    
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    
    this.authService.login(this.email, this.password).subscribe({
      next: (res) => {
        this.isLoading = false;

        // Si la opción de recordar usuario está activa, preservarlo en el dispositivo
        if (this.recordarUsuario && this.email) {
          localStorage.setItem(this.REMEMBERED_KEY, this.email.trim());
        } else if (!this.recordarUsuario) {
          localStorage.removeItem(this.REMEMBERED_KEY);
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Error al iniciar sesión. Verifica tus credenciales.';
      }
    });
  }

  goToHome(): void {
    this.router.navigate(['/']);
  }
}
