import { api } from '$lib/api/client';
import type { AuthUser } from '$lib/api/types';

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: AuthUser }
  | { status: 'anonymous'; user: null };

let state = $state<AuthState>({ status: 'loading', user: null });

export function getAuthState(): AuthState {
  return state;
}

export function getAuthUser(): AuthUser | null {
  return state.user;
}

export async function refreshAuth(): Promise<AuthUser | null> {
  try {
    const user = await api.getCurrentUser();
    state = user
      ? { status: 'authenticated', user }
      : { status: 'anonymous', user: null };
    return user;
  } catch {
    state = { status: 'anonymous', user: null };
    return null;
  }
}

export async function logout(): Promise<void> {
  try {
    await api.logout();
  } finally {
    state = { status: 'anonymous', user: null };
  }
}

export function startGoogleLogin(returnTo?: string): void {
  window.location.href = api.googleLoginUrl(returnTo);
}
