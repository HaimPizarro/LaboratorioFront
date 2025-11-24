import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Definimos la interfaz aquí para que coincida con tu Java Entity
export interface Lab {
  id: number;
  code: string;
  name: string;
  location: string;
  capacity: number;
  active: boolean;
  userId?: number | null; // 👈 importante
}

@Injectable({
  providedIn: 'root'
})
export class LabService {
  private http = inject(HttpClient);

  // Apuntamos al puerto 8082 del lab-service
  private apiUrl = 'http://localhost:8082/api/labs';

  constructor() { }

  // Obtener todos los laboratorios
  getLabs(): Observable<Lab[]> {
    return this.http.get<Lab[]>(this.apiUrl);
  }

  // Crear laboratorio
  createLab(lab: any): Observable<Lab> {
    return this.http.post<Lab>(this.apiUrl, lab);
  }

  // Modificar laboratorio
  updateLab(id: number, lab: any): Observable<Lab> {
    return this.http.put<Lab>(`${this.apiUrl}/${id}`, lab);
  }

  // Eliminar laboratorio
  deleteLab(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
