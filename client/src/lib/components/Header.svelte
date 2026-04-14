<script lang="ts">
  import { page } from '$app/stores';
  import { t } from '$lib/i18n';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
</script>

<header class="header">
  <div class="header-content">
    <a href="/" class="logo">
      <span class="logo-kanji">単語帳</span>
      <span class="logo-romaji">Tangocho</span>
    </a>

    <nav class="nav">
      <a href="/" class:active={$page.url.pathname === '/'} aria-current={$page.url.pathname === '/' ? 'page' : undefined}>
        {t('nav.home')}
      </a>
      <a href="/decks" class:active={$page.url.pathname.startsWith('/decks')} aria-current={$page.url.pathname.startsWith('/decks') ? 'page' : undefined}>
        {t('nav.decks')}
      </a>
      <a href="/study" class:active={$page.url.pathname.startsWith('/study')} aria-current={$page.url.pathname.startsWith('/study') ? 'page' : undefined}>
        {t('nav.study')}
      </a>
      <a href="/add" class:active={$page.url.pathname === '/add'} aria-current={$page.url.pathname === '/add' ? 'page' : undefined}>
        {t('nav.add')}
      </a>
      <LanguageSwitcher />
    </nav>
  </div>
</header>

<style>
  .header {
    background-color: var(--color-surface-elevated);
    border-bottom: 1px solid var(--color-border-light);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--space-4);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .logo {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    text-decoration: none;
  }

  .logo-kanji {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    color: var(--color-text-primary);
    letter-spacing: 0.05em;
  }

  .logo-romaji {
    font-size: var(--text-2xl);
    color: var(--color-text-muted);
    font-weight: 300;
  }

  .nav {
    display: flex;
    gap: var(--space-6);
    align-items: center;
  }

  .nav a {
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    padding: var(--space-2) 0;
    position: relative;
    transition: color var(--transition-fast);
  }

  .nav a:hover {
    color: var(--color-text-primary);
  }

  .nav a.active {
    color: var(--color-accent);
  }

  .nav a.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--color-accent);
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .header-content {
      padding: var(--space-3);
    }

    .logo {
      gap: var(--space-1);
    }

    .logo-kanji {
      font-size: var(--text-xl);
    }

    .logo-romaji {
      font-size: var(--text-xl);
    }

    .nav {
      gap: var(--space-3);
    }

    .nav a {
      font-size: var(--text-xs);
      padding: var(--space-1) 0;
    }
  }

  @media (max-width: 380px) {
    .nav {
      gap: var(--space-2);
    }
  }
</style>
