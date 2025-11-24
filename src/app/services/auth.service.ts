import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private apiUrl = 'http://localhost:8081/api/users';

  constructor() { }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, {
      email,
      newPassword
    });
  }

  saveUserToStorage(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  getUserFromStorage() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, userData);
  }

  logout() {
    localStorage.removeItem('currentUser');
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

}
