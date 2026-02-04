export interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
}

let toasts = $state<Toast[]>([]);
let nextId = 0;

export function getToasts() {
  return toasts;
}

export function addToast(message: string, type: Toast['type'] = 'error') {
  const id = nextId++;
  toasts = [...toasts, { id, message, type }];

  // Auto-remove after 3 seconds
  setTimeout(() => {
    removeToast(id);
  }, 3000);

  return id;
}

export function removeToast(id: number) {
  toasts = toasts.filter(t => t.id !== id);
}

export function showError(message: string) {
  return addToast(message, 'error');
}

export function showSuccess(message: string) {
  return addToast(message, 'success');
}

export function showInfo(message: string) {
  return addToast(message, 'info');
}
