import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50" *ngIf="toast">
      <div
        class="px-4 py-3 rounded-lg shadow-lg text-sm text-white flex items-center gap-2 animate-fade-in"
        [ngClass]="{
          'bg-green-600': toast.type === 'success',
          'bg-red-600': toast.type === 'error',
          'bg-slate-800': toast.type === 'info'
        }"
      >
        <span>{{ toast.text }}</span>
      </div>
    </div>
  `,
  styles: [`
    .animate-fade-in {
      animation: fadeInOut 0.3s ease-out;
    }
    @keyframes fadeInOut {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ToastComponent {
  toast: ToastMessage | null = null;

  private toastService = inject(ToastService);

  constructor() {
    this.toastService.toast$.subscribe(msg => {
      this.toast = msg;
    });
  }
}
