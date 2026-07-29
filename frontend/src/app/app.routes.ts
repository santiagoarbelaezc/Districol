import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponentComponent } from './components/login-component/login-component.component';
import { NosotrosComponent } from './components/nosotros/nosotros.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { ProductosPageComponent } from './pages/productos/productos.component';
import { DescripcionProductoComponent } from './components/descripcion-producto/descripcion-producto.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LegalComponent } from './pages/legal/legal.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponentComponent },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'productos', component: ProductosPageComponent },
  { path: 'productos/:id', component: DescripcionProductoComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'legal', component: LegalComponent },
  { path: 'politica-privacidad', redirectTo: 'legal?s=privacidad', pathMatch: 'full' },
  { path: 'terminos-condiciones', redirectTo: 'legal?s=terminos', pathMatch: 'full' },
  { path: 'politica-cookies', redirectTo: 'legal?s=cookies', pathMatch: 'full' },
  { path: 'aviso-legal', redirectTo: 'legal?s=aviso-legal', pathMatch: 'full' },
  { path: 'pqrs', redirectTo: 'legal?s=pqrs', pathMatch: 'full' }
];
