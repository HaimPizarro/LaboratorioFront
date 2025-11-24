import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  type: ToastType;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  private toastSubject = new Subject<ToastMessage | null>();
  toast$ = this.toastSubject.asObservable();

  private show(text: string, type: ToastType, durationMs = 2000) {
    const msg: ToastMessage = { text, type };
    this.toastSubject.next(msg);

    // Oculta el toast después de X ms
    setTimeout(() => {
      this.toastSubject.next(null);
    }, durationMs);
  }

  success(text: string, durationMs = 2000) {
    this.show(text, 'success', durationMs);
  }

  error(text: string, durationMs = 2000) {
    this.show(text, 'error', durationMs);
  }

  info(text: string, durationMs = 2000) {
    this.show(text, 'info', durationMs);
  }
}
