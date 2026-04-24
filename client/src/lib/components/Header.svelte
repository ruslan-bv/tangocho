<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { t } from '$lib/i18n';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import { getAuthState, logout } from '$lib/stores/auth.svelte';

  const auth = $derived(getAuthState());

  let menuOpen = $state(false);

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  async function handleSignOut() {
    closeMenu();
    await logout();
    goto('/login');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') closeMenu();
  }

  function handleDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement | null;
    if (!target?.closest('.user-menu')) closeMenu();
  }

  $effect(() => {
    if (menuOpen) {
      document.addEventListener('click', handleDocumentClick);
      document.addEventListener('keydown', handleKeydown);
      return () => {
        document.removeEventListener('click', handleDocumentClick);
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  });

  function initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + second).toUpperCase() || '?';
  }
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

      {#if auth.status === 'authenticated'}
        <div class="user-menu">
          <button
            type="button"
            class="avatar-btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={auth.user.name}
            onclick={toggleMenu}
          >
            {#if auth.user.avatarUrl}
              <img src={auth.user.avatarUrl} alt="" class="avatar" referrerpolicy="no-referrer" />
            {:else}
              <span class="avatar avatar--initials">{initials(auth.user.name)}</span>
            {/if}
          </button>

          {#if menuOpen}
            <div class="menu" role="menu">
              <div class="menu-info">
                <div class="menu-name">{auth.user.name}</div>
                <div class="menu-email">{auth.user.email}</div>
              </div>
              <button type="button" class="menu-item" role="menuitem" onclick={handleSignOut}>
                {t('auth.signOut')}
              </button>
            </div>
          {/if}
        </div>
      {/if}
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

  .user-menu {
    position: relative;
  }

  .avatar-btn {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .avatar-btn:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background-color: var(--color-washi-dark);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    object-fit: cover;
  }

  .avatar--initials {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-primary);
  }

  .menu {
    position: absolute;
    top: calc(100% + var(--space-2));
    right: 0;
    min-width: 220px;
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: var(--space-2);
    z-index: 200;
  }

  .menu-info {
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border-light);
    margin-bottom: var(--space-1);
  }

  .menu-name {
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    font-weight: 500;
  }

  .menu-email {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .menu-item {
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    border-radius: var(--radius-sm);
    cursor: pointer;
  }

  .menu-item:hover {
    background-color: var(--color-washi-dark);
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
