import { Routes } from '@angular/router';
import { Login } from './pages/login';
import { Categories } from './components/categories';
import { Home } from './pages/home';
import { authenticationGuard } from './guards/authentication-guard';
import { guestGuard } from './guards/guest-guard';
import { WalletForm } from './pages/wallet-form';

export const routes: Routes = [
  { path: '', component: Login, runGuardsAndResolvers: 'always', canActivate: [guestGuard] },
  {
    path: 'home',
    component: Home,
    runGuardsAndResolvers: 'always',
    canActivate: [authenticationGuard],
  },
  {
    path: 'wallet-form',
    component: WalletForm,
    runGuardsAndResolvers: 'always',
    canActivate: [authenticationGuard],
  },
];
