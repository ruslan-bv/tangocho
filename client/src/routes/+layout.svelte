<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import '../styles/theme.css';
  import Header from '$lib/components/Header.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { initLocale, t } from '$lib/i18n';
  import { getAuthState, refreshAuth } from '$lib/stores/auth.svelte';

  let { children } = $props();

  const auth = $derived(getAuthState());
  const isLoginPage = $derived($page.url.pathname === '/login');

  onMount(() => {
    initLocale();
    refreshAuth();
  });

  $effect(() => {
    if (auth.status === 'anonymous' && !isLoginPage) {
      const returnTo = $page.url.pathname + $page.url.search;
      const qs = returnTo && returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : '';
      goto(`/login${qs}`);
    }
  });
</script>

<div class="app">
  {#if !isLoginPage}
    <Header />
  {/if}
  <main class="main" class:main--auth={isLoginPage}>
    {#if auth.status === 'loading' && !isLoginPage}
      <div class="loading-wrap">{t('auth.loading')}</div>
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

  .loading-wrap {
    text-align: center;
    padding: var(--space-12);
    color: var(--color-text-muted);
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .main {
      padding: var(--space-4) var(--space-3);
    }
  }
</style>
