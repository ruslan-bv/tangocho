<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import '../styles/theme.css';
  import Header from '$lib/components/Header.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { initLocale, t } from '$lib/i18n';
  import { initTheme } from '$lib/theme/theme.svelte';
  import { getAuthState, refreshAuth } from '$lib/stores/auth.svelte';

  let { children } = $props();

  const auth = $derived(getAuthState());
  const isLoginPage = $derived($page.url.pathname === '/login');

  // Guard so a single anonymous state can't stack multiple redirects.
  let redirecting = $state(false);

  onMount(() => {
    initLocale();
    initTheme();
    refreshAuth();
  });

  $effect(() => {
    if (auth.status === 'authenticated') {
      redirecting = false;
    } else if (auth.status === 'anonymous' && !isLoginPage && !redirecting) {
      redirecting = true;
      const returnTo = $page.url.pathname + $page.url.search;
      const qs = returnTo && returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
      goto(`/login${qs}`);
    }
  });
</script>

<a href="#main-content" class="skip-link">{t('a11y.skipToContent')}</a>

<div class="app">
  {#if !isLoginPage}
    <Header />
  {/if}
  <main id="main-content" class="main" class:main--auth={isLoginPage} tabindex="-1">
    {#if auth.status === 'loading' && !isLoginPage}
      <div class="loading-wrap" role="status" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        <span>{t('auth.loading')}</span>
      </div>
    {:else if auth.status === 'authenticated' || isLoginPage}
      {@render children()}
    {/if}
  </main>
  <Toast />
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .main {
    flex: 1;
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-6) var(--space-4);
  }

  .main--auth {
    max-width: none;
    padding: 0;
  }

  /* main receives focus via the skip link / SvelteKit navigation; don't draw
     an outline around the whole page region. */
  .main:focus {
    outline: none;
  }

  .skip-link {
    position: absolute;
    left: var(--space-2);
    top: -3rem;
    z-index: 1000;
    padding: var(--space-2) var(--space-4);
    background-color: var(--color-accent);
    color: #fff;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    transition: top var(--transition-fast);
  }

  .skip-link:focus {
    top: var(--space-2);
    color: #fff;
  }

  .loading-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    text-align: center;
    padding: var(--space-12);
    color: var(--color-text-muted);
  }

  .spinner {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid var(--color-border);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .main {
      padding: var(--space-4) var(--space-3);
    }
  }
</style>
