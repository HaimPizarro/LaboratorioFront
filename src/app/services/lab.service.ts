import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Lab {
  id: number;
  code: string;
  name: string;
  location: string;
  capacity: number;
  active: boolean;
  userId?: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class LabService {
  private http = inject(HttpClient);

  // Apunta al puerto 8082 del lab-service
  private apiUrl = 'http://localhost:8082/api/labs';

  constructor() { }

  getLabs(): Observable<Lab[]> {
    return this.http.get<Lab[]>(this.apiUrl);
  }


  createLab(lab: any): Observable<Lab> {
    return this.http.post<Lab>(this.apiUrl, lab);
  }

  updateLab(id: number, lab: any): Observable<Lab> {
    return this.http.put<Lab>(`${this.apiUrl}/${id}`, lab);
  }


  deleteLab(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
