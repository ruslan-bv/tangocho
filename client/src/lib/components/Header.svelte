<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { t } from '$lib/i18n';
  import LanguageSwitcher from './LanguageSwitcher.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import { getAuthState, logout } from '$lib/stores/auth.svelte';

  const auth = $derived(getAuthState());
  const path = $derived($page.url.pathname);

  let menuOpen = $state(false);
  let navOpen = $state(false);
  let avatarBtn = $state<HTMLButtonElement>();
  let firstMenuItem = $state<HTMLButtonElement>();
  let navToggle = $state<HTMLButtonElement>();

  // Centralized active-link detection so every link uses the same rule.
  function isActive(href: string, exact = false): boolean {
    if (exact) return path === href;
    return path === href || path.startsWith(href + '/');
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
    if (menuOpen) navOpen = false;
  }

  function closeMenu(returnFocus = false) {
    menuOpen = false;
    if (returnFocus) avatarBtn?.focus();
  }

  function toggleNav() {
    navOpen = !navOpen;
    if (navOpen) menuOpen = false;
  }

  function closeNav(returnFocus = false) {
    navOpen = false;
    if (returnFocus) navToggle?.focus();
  }

  async function handleSignOut() {
    closeMenu();
    await logout();
    goto('/login');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Escape') return;
    if (menuOpen) closeMenu(true);
    if (navOpen) closeNav(true);
  }

  function handleDocumentClick(e: MouseEvent) {
    const target = e.target as HTMLElement | null;
    if (!target?.closest('.user-menu')) menuOpen = false;
    if (!target?.closest('.nav-mobile')) navOpen = false;
  }

  $effect(() => {
    if (menuOpen || navOpen) {
      document.addEventListener('click', handleDocumentClick);
      document.addEventListener('keydown', handleKeydown);
      return () => {
        document.removeEventListener('click', handleDocumentClick);
        document.removeEventListener('keydown', handleKeydown);
      };
    }
  });

  // Move focus into the user menu on open so keyboard users land on the action.
  $effect(() => {
    if (menuOpen) firstMenuItem?.focus();
  });

  function initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? '';
    const second = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + second).toUpperCase() || '?';
  }
</script>

{#snippet navLinks(onclick?: () => void)}
  <a href="/" class:active={isActive('/', true)} aria-current={isActive('/', true) ? 'page' : undefined} {onclick}>
    {t('nav.home')}
  </a>
  <a href="/decks" class:active={isActive('/decks')} aria-current={isActive('/decks') ? 'page' : undefined} {onclick}>
    {t('nav.decks')}
  </a>
  <a href="/study" class:active={isActive('/study')} aria-current={isActive('/study') ? 'page' : undefined} {onclick}>
    {t('nav.study')}
  </a>
  <a href="/add" class:active={isActive('/add', true)} aria-current={isActive('/add', true) ? 'page' : undefined} {onclick}>
    {t('nav.add')}
  </a>
  <a href="/import" class:active={isActive('/import', true)} aria-current={isActive('/import', true) ? 'page' : undefined} {onclick}>
    {t('nav.import')}
  </a>
{/snippet}

<header class="header">
  <div class="header-content">
    <a href="/" class="logo" aria-label="Tangocho">
      <span class="logo-kanji">単語帳</span>
      <span class="logo-romaji">Tangocho</span>
    </a>

    <div class="actions">
      <nav class="nav nav-desktop" aria-label={t('a11y.primaryNav')}>
        {@render navLinks()}
      </nav>

      <ThemeToggle />
      <LanguageSwitcher />

      {#if auth.status === 'authenticated'}
        <div class="user-menu">
          <button
            type="button"
            class="avatar-btn"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={auth.user.name}
            bind:this={avatarBtn}
            onclick={toggleMenu}
          >
            {#if auth.user.avatarUrl}
              <img src={auth.user.avatarUrl} alt="" class="avatar" referrerpolicy="no-referrer" />
            {:else}
              <span class="avatar avatar--initials" aria-hidden="true">{initials(auth.user.name)}</span>
            {/if}
          </button>

          {#if menuOpen}
            <div class="menu" role="menu">
              <div class="menu-info">
                <div class="menu-name">{auth.user.name}</div>
                <div class="menu-email">{auth.user.email}</div>
              </div>
              <button type="button" class="menu-item" role="menuitem" bind:this={firstMenuItem} onclick={handleSignOut}>
                {t('auth.signOut')}
              </button>
            </div>
          {/if}
        </div>
      {/if}

      <div class="nav-mobile">
        <button
          type="button"
          class="nav-toggle"
          aria-label={navOpen ? t('a11y.closeMenu') : t('a11y.openMenu')}
          aria-haspopup="true"
          aria-expanded={navOpen}
          aria-controls="mobile-nav"
          bind:this={navToggle}
          onclick={toggleNav}
        >
          <span class="nav-toggle-glyph" aria-hidden="true">{navOpen ? '✕' : '☰'}</span>
        </button>

        {#if navOpen}
          <nav id="mobile-nav" class="mobile-nav-panel" aria-label={t('a11y.primaryNav')}>
            {@render navLinks(() => closeNav())}
          </nav>
        {/if}
      </div>
    </div>
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

  .actions {
    display: flex;
    align-items: center;
    gap: var(--space-4);
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

  .nav-desktop a.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--color-accent);
  }

  /* Mobile nav (hamburger) — hidden on desktop */
  .nav-mobile {
    position: relative;
    display: none;
  }

  .nav-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .nav-toggle:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .nav-toggle-glyph {
    font-size: var(--text-xl);
    line-height: 1;
  }

  .mobile-nav-panel {
    position: absolute;
    top: calc(100% + var(--space-2));
    right: 0;
    min-width: 200px;
    display: flex;
    flex-direction: column;
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    padding: var(--space-2);
    z-index: 200;
  }

  .mobile-nav-panel a {
    padding: var(--space-3);
    border-radius: var(--radius-sm);
    font-size: var(--text-base);
  }

  .mobile-nav-panel a:hover {
    background-color: var(--color-washi-dark);
  }

  .mobile-nav-panel a.active {
    color: var(--color-accent);
    font-weight: 500;
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

  /* Collapse the text links into a hamburger when they'd crowd the bar. */
  @media (max-width: 720px) {
    .nav-desktop {
      display: none;
    }

    .nav-mobile {
      display: block;
    }

    .actions {
      gap: var(--space-2);
    }
  }

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
  }
</style>
