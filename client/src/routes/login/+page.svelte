<script lang="ts">
  import { tick } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { t } from '$lib/i18n';
  import Button from '$lib/components/Button.svelte';
  import { ApiError } from '$lib/api/client';
  import {
    getAuthState,
    loginWithEmail,
    registerWithEmail,
  } from '$lib/stores/auth.svelte';

  type Mode = 'signIn' | 'register';
  let mode = $state<Mode>('signIn');
  let email = $state('');
  let password = $state('');
  let name = $state('');
  let submitting = $state(false);
  let error = $state<string | null>(null);
  let errorEl = $state<HTMLDivElement>();

  const auth = $derived(getAuthState());

  // Single source of truth for the post-auth destination: whenever we become
  // authenticated (on mount or after submit) honor ?returnTo.
  $effect(() => {
    if (auth.status === 'authenticated') goto(returnTo());
  });

  function returnTo(): string {
    const candidate = $page.url.searchParams.get('returnTo') || '/';
    return candidate.startsWith('/') && !candidate.startsWith('//') ? candidate : '/';
  }

  function toggleMode() {
    mode = mode === 'signIn' ? 'register' : 'signIn';
    error = null;
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();
    if (submitting) return;
    error = null;
    submitting = true;
    try {
      if (mode === 'signIn') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name || undefined);
      }
      // Redirect handled by the $effect above once auth becomes authenticated.
    } catch (err) {
      error = mapError(err);
      await tick();
      errorEl?.focus();
    } finally {
      submitting = false;
    }
  }

  function mapError(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.status === 401) return t('login.invalidCredentials');
      if (err.status === 409) return t('login.emailExists');
      if (err.status === 400) {
        const msg = err.message.toLowerCase();
        if (msg.includes('email')) return t('login.invalidEmail');
        if (msg.includes('password')) return t('login.passwordTooShort');
      }
    }
    return t('login.error');
  }
</script>

<div class="login">
  <div class="login-card">
    <h1 class="login-kanji">単語帳</h1>
    <p class="tagline">{t('login.tagline')}</p>

    <h2 class="mode-title">
      {mode === 'signIn' ? t('login.modeSignIn') : t('login.modeRegister')}
    </h2>

    {#if error}
      <div class="error" role="alert" tabindex="-1" bind:this={errorEl} id="login-error">
        {error}
      </div>
    {/if}

    <form class="form" onsubmit={handleSubmit} aria-busy={submitting}>
      <label class="field">
        <span class="label">{t('login.emailLabel')}</span>
        <input
          type="email"
          autocomplete="email"
          required
          disabled={submitting}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'login-error' : undefined}
          bind:value={email}
          placeholder={t('login.emailPlaceholder')}
        />
      </label>

      <label class="field">
        <span class="label">{t('login.passwordLabel')}</span>
        <input
          type="password"
          autocomplete={mode === 'signIn' ? 'current-password' : 'new-password'}
          required
          minlength={mode === 'register' ? 8 : undefined}
          disabled={submitting}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? 'login-error' : undefined}
          bind:value={password}
          placeholder={t('login.passwordPlaceholder')}
        />
      </label>

      {#if mode === 'register'}
        <label class="field">
          <span class="label">{t('login.nameLabel')}</span>
          <input
            type="text"
            autocomplete="nickname"
            disabled={submitting}
            bind:value={name}
            placeholder={t('login.namePlaceholder')}
          />
        </label>
      {/if}

      <Button variant="primary" size="lg" type="submit" disabled={submitting}>
        {#if submitting}
          {mode === 'signIn' ? t('login.submittingSignIn') : t('login.submittingRegister')}
        {:else}
          {mode === 'signIn' ? t('login.submitSignIn') : t('login.submitRegister')}
        {/if}
      </Button>
    </form>

    <button type="button" class="switch" onclick={toggleMode} disabled={submitting}>
      {mode === 'signIn' ? t('login.switchToRegister') : t('login.switchToSignIn')}
    </button>

    <p class="note">{t('login.note')}</p>
  </div>
</div>

<style>
  .login {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-6);
  }

  .login-card {
    max-width: 440px;
    width: 100%;
    text-align: center;
    padding: var(--space-10) var(--space-8);
    background-color: var(--color-surface);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .login-kanji {
    font-family: var(--font-serif);
    font-size: var(--text-5xl);
    letter-spacing: 0.08em;
    color: var(--color-text-primary);
    margin: 0;
  }

  .tagline {
    color: var(--color-text-secondary);
    margin: 0;
  }

  .mode-title {
    font-size: var(--text-lg);
    color: var(--color-text-primary);
    margin: 0;
  }

  .error {
    background-color: color-mix(in srgb, var(--color-error) 10%, transparent);
    border: 1px solid var(--color-error);
    color: var(--color-error);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    text-align: left;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .label {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .field input {
    font: inherit;
    color: var(--color-text-primary);
    background-color: var(--color-bg);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    width: 100%;
    box-sizing: border-box;
  }

  .field input:focus {
    outline: 2px solid var(--color-accent, var(--color-text-primary));
    outline-offset: 1px;
  }

  .switch {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    cursor: pointer;
    text-decoration: underline;
    padding: 0;
  }

  .switch:hover:not(:disabled) {
    color: var(--color-text-primary);
  }

  .switch:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error:focus {
    outline: 2px solid var(--color-error);
    outline-offset: 2px;
  }

  .note {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin: 0;
  }
</style>
