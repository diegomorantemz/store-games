import { Routes } from '@angular/router';
import { GameListComponent } from './components/game-list/game-list.component';

export const routes: Routes = [
  { path: '', component: GameListComponent },
  { path: '**', redirectTo: '' }
];
