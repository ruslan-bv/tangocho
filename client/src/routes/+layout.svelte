<script lang="ts">
  import { onMount } from 'svelte';
  import '../styles/theme.css';
  import Header from '$lib/components/Header.svelte';
  import Toast from '$lib/components/Toast.svelte';
  import { initLocale } from '$lib/i18n';

  let { children } = $props();

  onMount(() => {
    initLocale();
  });
</script>

<div class="app">
  <Header />
  <main class="main">
    {@render children()}
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

  /* Mobile styles */
  @media (max-width: 640px) {
    .main {
      padding: var(--space-4) var(--space-3);
    }
  }
</style>
