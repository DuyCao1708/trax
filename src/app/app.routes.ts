import { Routes } from '@angular/router';
import { Login } from './pages/login';
import { Categories } from './components/categories';

export const routes: Routes = [
  { path: '', component: Login },
  { path: 'categories', component: Categories },
];
