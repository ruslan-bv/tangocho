<script lang="ts">
  import { onMount } from 'svelte';
  import type { DeckWithStats } from '$lib/api/types';
  import { api } from '$lib/api/client';
  import Button from '$lib/components/Button.svelte';
  import DeckCard from '$lib/components/DeckCard.svelte';
  import { t } from '$lib/i18n';
  import { showError } from '$lib/stores/toast.svelte';

  let decks = $state<DeckWithStats[]>([]);
  let loading = $state(true);

  onMount(async () => {
    try {
      decks = await api.getDecks();
    } catch (error) {
      console.error('Failed to load decks:', error);
      showError(t('common.loadFailed'));
    } finally {
      loading = false;
    }
  });
</script>

<div class="decks-page">
  <div class="page-header">
    <h1>{t('decks.title')}</h1>
    <Button href="/decks/new" variant="primary">
      {t('common.createNew')}
    </Button>
  </div>

  {#if loading}
    <div class="loading">{t('common.loading')}</div>
  {:else if decks.length === 0}
    <div class="empty-state">
      <div class="empty-icon">📚</div>
      <h2>{t('decks.empty')}</h2>
      <p>{t('decks.emptyDesc')}</p>
      <Button href="/decks/new" variant="primary">
        {t('home.createFirst')}
      </Button>
    </div>
  {:else}
    <div class="decks-grid">
      {#each decks as deck}
        <DeckCard {deck} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .decks-page {
    max-width: 1000px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-8);
  }

  .page-header h1 {
    font-size: var(--text-3xl);
  }

  .decks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--space-4);
  }

  .loading {
    text-align: center;
    padding: var(--space-12);
    color: var(--color-text-muted);
  }

  .empty-state {
    text-align: center;
    padding: var(--space-16);
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px dashed var(--color-border);
  }

  .empty-icon {
    font-size: 64px;
    margin-bottom: var(--space-4);
  }

  .empty-state h2 {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-2);
  }

  .empty-state p {
    color: var(--color-text-secondary);
    margin-bottom: var(--space-6);
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .decks-page {
      padding: 0 var(--space-2);
    }

    .page-header {
      margin-bottom: var(--space-6);
    }

    .page-header h1 {
      font-size: var(--text-2xl);
    }

    .decks-grid {
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }

    .empty-state {
      padding: var(--space-8);
    }

    .empty-icon {
      font-size: 48px;
    }

    .empty-state h2 {
      font-size: var(--text-xl);
    }
  }
</style>
