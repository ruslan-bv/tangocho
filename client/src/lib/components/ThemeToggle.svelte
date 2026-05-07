<script lang="ts">
  import { t } from '$lib/i18n';
  import { getTheme, toggleTheme } from '$lib/theme/theme.svelte';

  const theme = $derived(getTheme());
  const label = $derived(theme === 'night' ? t('theme.toLight') : t('theme.toNight'));
  const glyph = $derived(theme === 'night' ? '日' : '月');
</script>

<button
  type="button"
  class="theme-toggle"
  onclick={toggleTheme}
  aria-label={label}
  title={label}
>
  <span class="glyph" aria-hidden="true">{glyph}</span>
</button>

<style>
  .theme-toggle {
    font-size: var(--text-sm);
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    color: var(--color-text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-family: var(--font-serif);
    line-height: 1;
    min-width: 36px;
  }

  .theme-toggle:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .glyph {
    font-size: var(--text-base);
  }

  @media (max-width: 640px) {
    .theme-toggle {
      padding: var(--space-1) var(--space-2);
    }
    .glyph {
      font-size: var(--text-sm);
    }
  }
</style>
