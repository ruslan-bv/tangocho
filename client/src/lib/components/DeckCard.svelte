<script lang="ts">
  import type { DeckWithStats } from '$lib/api/types';
  import { t } from '$lib/i18n';

  interface Props {
    deck: DeckWithStats;
    href?: string;
  }

  let { deck, href }: Props = $props();
</script>

<a href={href ?? `/decks/${deck.id}`} class="deck-card card card--interactive card--light">
  <div class="deck-header">
    <h3 class="deck-name">{deck.name}</h3>
    {#if deck.dueCards > 0}
      <span class="tag tag--due due-badge">{deck.dueCards}</span>
    {/if}
  </div>

  {#if deck.description}
    <p class="deck-description">{deck.description}</p>
  {/if}

  <div class="deck-stats">
    <div class="stat">
      <span class="stat-value">{deck.totalCards}</span>
      <span class="stat-label">{t('common.cards')}</span>
    </div>
    <div class="stat">
      <span class="stat-value">{deck.newCards}</span>
      <span class="stat-label">{t('common.new')}</span>
    </div>
    <div class="stat">
      <span class="stat-value">{deck.dueCards}</span>
      <span class="stat-label">{t('common.review')}</span>
    </div>
  </div>
</a>

<style>
  .deck-card {
    display: block;
    padding: var(--space-5);
    text-decoration: none;
    color: inherit;
  }

  .deck-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-3);
    margin-bottom: var(--space-2);
  }

  .deck-name {
    font-family: var(--font-sans);
    font-size: var(--text-lg);
    font-weight: 500;
    margin: 0;
  }

  .due-badge {
    min-width: 24px;
    text-align: center;
    border-radius: var(--radius-md);
  }

  .deck-description {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-4);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .deck-stats {
    display: flex;
    gap: var(--space-6);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border-light);
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    color: var(--color-text-primary);
  }

  .stat-label {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .deck-card {
      padding: var(--space-4);
    }

    .deck-card:hover {
      transform: none;
    }

    .deck-name {
      font-size: var(--text-base);
    }

    .deck-stats {
      gap: var(--space-4);
      padding-top: var(--space-3);
    }

    .stat-value {
      font-size: var(--text-lg);
    }
  }
</style>
