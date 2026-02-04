<script lang="ts">
  import { getLocale, setLocale, getAvailableLocales, type Locale } from '$lib/i18n';

  const locale = $derived(getLocale());
  const locales = getAvailableLocales();

  const localeLabels: Record<Locale, string> = {
    ja: '日本語',
    en: 'English',
    ru: 'Русский',
  };

  const localeShort: Record<Locale, string> = {
    ja: 'JP',
    en: 'EN',
    ru: 'RU',
  };

  let open = $state(false);

  function selectLocale(loc: Locale) {
    setLocale(loc);
    open = false;
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.language-switcher')) {
      open = false;
    }
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="language-switcher">
  <button
    class="current-locale"
    onclick={() => (open = !open)}
    aria-expanded={open}
    aria-haspopup="listbox"
  >
    {localeShort[locale]}
    <span class="arrow" class:open>{open ? '▲' : '▼'}</span>
  </button>

  {#if open}
    <ul class="locale-dropdown" role="listbox">
      {#each locales as loc}
        <li role="option" aria-selected={loc === locale}>
          <button
            class="locale-option"
            class:active={loc === locale}
            onclick={() => selectLocale(loc)}
          >
            {localeLabels[loc]}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .language-switcher {
    position: relative;
  }

  .current-locale {
    font-size: var(--text-sm);
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-family: var(--font-sans);
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .current-locale:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .arrow {
    font-size: 8px;
    transition: transform var(--transition-fast);
  }

  .locale-dropdown {
    position: absolute;
    top: calc(100% + var(--space-1));
    right: 0;
    background: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-md);
    list-style: none;
    padding: var(--space-1);
    margin: 0;
    min-width: 120px;
    z-index: 200;
  }

  .locale-dropdown li {
    margin: 0;
  }

  .locale-option {
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    color: var(--color-text-secondary);
    cursor: pointer;
    text-align: left;
    font-size: var(--text-sm);
    font-family: var(--font-sans);
    transition: all var(--transition-fast);
  }

  .locale-option:hover {
    background: var(--color-washi-dark);
    color: var(--color-text-primary);
  }

  .locale-option.active {
    background: var(--color-accent);
    color: white;
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .current-locale {
      padding: var(--space-1) var(--space-2);
      font-size: var(--text-xs);
    }

    .arrow {
      font-size: 6px;
    }

    .locale-dropdown {
      min-width: 100px;
    }

    .locale-option {
      padding: var(--space-2);
      font-size: var(--text-xs);
    }
  }
</style>
