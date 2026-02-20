import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponentComponent } from './components/login-component/login-component.component';
import { NosotrosComponent } from './components/nosotros/nosotros.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponentComponent },
  { path: 'nosotros', component: NosotrosComponent }
];
