import { Routes } from '@angular/router';
import { GameListComponent } from './components/game-list/game-list.component';
import { CartComponent } from './components/cart/cart.component';

export const routes: Routes = [
  { path: '', component: GameListComponent },
  { path: 'cart', component: CartComponent },
  { path: '**', redirectTo: '' }
];
