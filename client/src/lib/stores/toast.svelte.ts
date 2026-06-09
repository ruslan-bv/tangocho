export interface Toast {
  id: number;
  message: string;
  type: 'error' | 'success' | 'info';
  /** Auto-dismiss delay in ms; 0 means the toast persists until dismissed. */
  duration: number;
}

// Errors stay until dismissed (so they can't vanish before being read);
// success/info auto-dismiss but linger long enough to read comfortably.
const DEFAULT_DURATION: Record<Toast['type'], number> = {
  error: 0,
  success: 4500,
  info: 4500,
};

let toasts = $state<Toast[]>([]);
let nextId = 0;
const timers = new Map<number, ReturnType<typeof setTimeout>>();

export function getToasts() {
  return toasts;
}

export function addToast(
  message: string,
  type: Toast['type'] = 'error',
  duration: number = DEFAULT_DURATION[type]
) {
  const id = nextId++;
  toasts = [...toasts, { id, message, type, duration }];
  if (duration > 0) scheduleRemoval(id, duration);
  return id;
}

/** (Re)arm the auto-dismiss timer — used to resume after a hover/focus pause. */
export function scheduleRemoval(id: number, delay: number) {
  clearTimer(id);
  timers.set(id, setTimeout(() => removeToast(id), delay));
}

/** Cancel a pending auto-dismiss — used while the user hovers/focuses a toast. */
export function clearTimer(id: number) {
  const timer = timers.get(id);
  if (timer !== undefined) {
    clearTimeout(timer);
    timers.delete(id);
  }
}

export function removeToast(id: number) {
  clearTimer(id);
  toasts = toasts.filter((t) => t.id !== id);
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
