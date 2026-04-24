<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { t } from '$lib/i18n';
  import Button from '$lib/components/Button.svelte';
  import { getAuthState, startGoogleLogin } from '$lib/stores/auth.svelte';

  let signingIn = $state(false);

  const auth = $derived(getAuthState());
  const errorParam = $derived($page.url.searchParams.get('error'));

  onMount(() => {
    if (auth.status === 'authenticated') {
      goto('/');
    }
  });

  $effect(() => {
    if (auth.status === 'authenticated') {
      goto('/');
    }
  });

  function handleSignIn() {
    signingIn = true;
    const returnTo = $page.url.searchParams.get('returnTo') || '/';
    startGoogleLogin(returnTo);
  }
</script>

<div class="login">
  <div class="login-card">
    <h1 class="login-kanji">単語帳</h1>
    <p class="tagline">{t('login.tagline')}</p>

    {#if errorParam}
      <div class="error">{t('login.error')}</div>
    {/if}

    <Button variant="primary" size="lg" onclick={handleSignIn} disabled={signingIn}>
      {signingIn ? t('login.redirecting') : t('login.signInWithGoogle')}
    </Button>

    <p class="note">{t('login.note')}</p>
  </div>
</div>

<style>
  .login {
    min-height: calc(100vh - 160px);
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

  .error {
    background-color: color-mix(in srgb, var(--color-error) 10%, transparent);
    border: 1px solid var(--color-error);
    color: var(--color-error);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
  }

  .note {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    margin: 0;
  }
</style>
