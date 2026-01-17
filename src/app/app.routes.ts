import { Routes } from '@angular/router';
import { Login } from './pages/login';
import { Home } from './pages/home';
import { authenticationGuard } from './guards/authentication-guard';
import { guestGuard } from './guards/guest-guard';
import { WalletForm } from './pages/wallet-form';
import { WalletsSettings } from './pages/wallets-settings';
import { QuickTransactionForm } from './pages/quick-transaction-form';
import { CategoriesSettings } from './components/categories-settings';
import { RetryAuthentication } from './pages/retry-authentication';

export const routes: Routes = [
  { path: '', component: Login, runGuardsAndResolvers: 'always', canActivate: [guestGuard] },
  {
    path: 'locked',
    component: RetryAuthentication,
  },
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
  {
    path: 'wallet-form/:id',
    component: WalletForm,
    runGuardsAndResolvers: 'always',
    canActivate: [authenticationGuard],
  },
  {
    path: 'wallets-settings',
    component: WalletsSettings,
    runGuardsAndResolvers: 'always',
    canActivate: [authenticationGuard],
  },
  {
    path: 'categories-settings',
    component: CategoriesSettings,
    runGuardsAndResolvers: 'always',
    canActivate: [authenticationGuard],
  },
  {
    path: 'quick-transaction-form',
    component: QuickTransactionForm,
    runGuardsAndResolvers: 'always',
    canActivate: [authenticationGuard],
  },
];
