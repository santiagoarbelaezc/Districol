import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponentComponent } from './components/login-component/login-component.component';
import { NosotrosComponent } from './components/nosotros/nosotros.component';
import { ContactoComponent } from './pages/contacto/contacto.component';
import { ProductosPageComponent } from './pages/productos/productos.component';
import { DescripcionProductoComponent } from './components/descripcion-producto/descripcion-producto.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponentComponent },
  { path: 'nosotros', component: NosotrosComponent },
  { path: 'contacto', component: ContactoComponent },
  { path: 'productos', component: ProductosPageComponent },
  { path: 'productos/:id', component: DescripcionProductoComponent }
];
