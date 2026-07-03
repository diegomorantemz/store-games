import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000';
  private currentUserSubject: BehaviorSubject<User | null>;
  private sessionKey = 'current_user_id';

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User | null>(null);

    const savedUserId = localStorage.getItem(this.sessionKey);
    if (savedUserId) {
      this.http.get<User>(`${this.apiUrl}/users/${savedUserId}`).subscribe({
        next: (user) => {
          this.currentUserSubject.next(user);
        },
        error: () => {
          localStorage.removeItem(this.sessionKey);
          this.currentUserSubject.next(null);
        }
      });
    }
  }

  getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  getCurrentUserSnapshot(): User | null {
    return this.currentUserSubject.value;
  }

  registerUser(userData: Omit<User, 'id' | 'registeredAt'>): Observable<User> {
    const newUser = {
      ...userData,
      registeredAt: new Date().toISOString()
    };

    return this.http.post<User>(`${this.apiUrl}/users`, newUser);
  }

  loginUser(email: string, password: string): Observable<User | null> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}&password=${password}`).pipe(
      map(users => users.length > 0 ? users[0] : null)
    );
  }

  checkEmailExists(email: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users?email=${email}`);
  }

  setSession(user: User): void {
    localStorage.setItem(this.sessionKey, String(user.id));
    this.currentUserSubject.next(user);
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem('cart_session'); 
    localStorage.removeItem('favorites_session');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return localStorage.getItem(this.sessionKey) !== null;
  }

  updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${user.id}`, user);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  getPublicUser(userId: number): Observable<Omit<User, 'password'>> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`).pipe(
      map(({ password, ...publicUser }) => publicUser)
    );
  }
}