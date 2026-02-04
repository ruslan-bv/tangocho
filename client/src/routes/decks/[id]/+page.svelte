<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { DeckWithStats, CardWithWord } from '$lib/api/types';
  import { api } from '$lib/api/client';
  import Button from '$lib/components/Button.svelte';
  import { t, formatDate } from '$lib/i18n';
  import { showSuccess, showError } from '$lib/stores/toast.svelte';

  let deck = $state<DeckWithStats | null>(null);
  let cards = $state<CardWithWord[]>([]);
  let loading = $state(true);
  let deleting = $state(false);
  let showCards = $state(false);

  const deckId = $derived(Number($page.params.id));

  // Precompute isDue status to avoid creating Date objects in render loop
  function isDue(dueDate: string): boolean {
    return new Date(dueDate) <= new Date();
  }

  onMount(async () => {
    try {
      const [deckData, cardsData] = await Promise.all([
        api.getDeck(deckId),
        api.getDeckCards(deckId)
      ]);
      deck = deckData;
      cards = cardsData;
    } catch (error) {
      console.error('Failed to load deck:', error);
      showError(t('common.loadFailed'));
    } finally {
      loading = false;
    }
  });

  async function deleteDeck() {
    if (!deck || !confirm(t('decks.deleteConfirm', { name: deck.name }))) {
      return;
    }

    deleting = true;
    try {
      await api.deleteDeck(deck.id);
      showSuccess(t('toast.deckDeleted'));
      goto('/decks');
    } catch (error) {
      console.error('Failed to delete deck:', error);
      showError(t('decks.deleteFailed'));
    } finally {
      deleting = false;
    }
  }
</script>

<div class="deck-page">
  {#if loading}
    <div class="loading">{t('common.loading')}</div>
  {:else if !deck}
    <div class="not-found">
      <h2>{t('decks.notFound')}</h2>
      <Button href="/decks" variant="secondary">
        {t('decks.backToList')}
      </Button>
    </div>
  {:else}
    <div class="deck-header">
      <div class="deck-info">
        <h1>{deck.name}</h1>
        {#if deck.description}
          <p class="description">{deck.description}</p>
        {/if}
      </div>
      <div class="deck-actions">
        {#if deck.dueCards > 0}
          <Button href="/study?deck={deck.id}" variant="primary">
            {t('decks.studyCount', { count: deck.dueCards })}
          </Button>
        {/if}
        <Button href="/add?deck={deck.id}" variant="secondary">
          {t('decks.addWordShort')}
        </Button>
        <Button variant="ghost" onclick={deleteDeck} disabled={deleting}>
          {t('common.delete')}
        </Button>
      </div>
    </div>

    <div class="deck-stats">
      <div class="stat">
        <span class="stat-value">{deck.totalCards}</span>
        <span class="stat-label">{t('decks.totalCards')}</span>
      </div>
      <div class="stat">
        <span class="stat-value">{deck.newCards}</span>
        <span class="stat-label">{t('decks.newCards')}</span>
      </div>
      <div class="stat">
        <span class="stat-value">{deck.dueCards}</span>
        <span class="stat-label">{t('decks.dueCards')}</span>
      </div>
    </div>

    <div class="cards-section">
      <div class="cards-header">
        <h2>{t('decks.cardList')}</h2>
        {#if cards.length > 0}
          <div class="toggle-btn">
            <Button variant="ghost" onclick={() => showCards = !showCards}>
              {showCards ? t('decks.hideCards') : t('decks.showCards')}
            </Button>
          </div>
        {/if}
      </div>

      {#if cards.length === 0}
        <div class="empty-cards">
          <p>{t('decks.noCards')}</p>
          <Button href="/add?deck={deck.id}" variant="primary">
            {t('common.addWord')}
          </Button>
        </div>
      {:else if showCards}
        <div class="cards-list">
          {#each cards as card}
            <a href="/decks/{deckId}/cards/{card.id}" class="card-item">
              <div class="card-word">
                <span class="japanese">{card.word.japanese}</span>
                {#if card.word.reading !== card.word.japanese}
                  <span class="reading">【{card.word.reading}】</span>
                {/if}
              </div>
              <div class="card-meaning">
                {card.word.meanings.slice(0, 2).join('; ')}
              </div>
              <div class="card-status" class:due={isDue(card.dueDate)}>
                {#if isDue(card.dueDate)}
                  {t('common.review')}
                {:else}
                  {formatDate(card.dueDate)}
                {/if}
              </div>
            </a>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .deck-page {
    max-width: 900px;
    margin: 0 auto;
  }

  .loading, .not-found {
    text-align: center;
    padding: var(--space-12);
  }

  .deck-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-6);
    margin-bottom: var(--space-8);
  }

  .deck-info h1 {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-2);
  }

  .description {
    color: var(--color-text-secondary);
  }

  .deck-actions {
    display: flex;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .deck-stats {
    display: flex;
    gap: var(--space-8);
    padding: var(--space-6);
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-8);
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .stat-value {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
    color: var(--color-accent);
  }

  .stat-label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .cards-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  .cards-section h2 {
    font-size: var(--text-xl);
    margin: 0;
  }

  .toggle-btn :global(button) {
    min-width: 140px;
  }

  .empty-cards {
    text-align: center;
    padding: var(--space-8);
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px dashed var(--color-border);
  }

  .empty-cards p {
    margin-bottom: var(--space-4);
    color: var(--color-text-secondary);
  }

  .cards-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .card-item {
    display: grid;
    grid-template-columns: 1fr 2fr auto;
    gap: var(--space-4);
    align-items: center;
    padding: var(--space-4);
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }

  .card-item:hover {
    border-color: var(--color-border);
    background-color: var(--color-surface);
  }

  .card-word {
    display: flex;
    align-items: baseline;
    gap: var(--space-1);
  }

  .japanese {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
  }

  .reading {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .card-meaning {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .card-status {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
    background-color: var(--color-washi-dark);
    color: var(--color-text-muted);
  }

  .card-status.due {
    background-color: var(--color-accent);
    color: white;
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .deck-page {
      padding: 0 var(--space-4);
    }

    .deck-header {
      flex-direction: column;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .deck-info h1 {
      font-size: var(--text-2xl);
    }

    .deck-actions {
      width: 100%;
      flex-wrap: wrap;
    }

    .deck-stats {
      justify-content: space-around;
      gap: var(--space-4);
      padding: var(--space-4);
      margin-bottom: var(--space-6);
    }

    .stat-value {
      font-size: var(--text-2xl);
    }

    .stat-label {
      font-size: var(--text-xs);
    }

    .cards-header {
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .cards-section h2 {
      font-size: var(--text-lg);
    }

    .toggle-btn :global(button) {
      min-width: 120px;
    }

    .card-item {
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;
      gap: var(--space-2);
      padding: var(--space-3);
    }

    .card-word {
      grid-column: 1;
      grid-row: 1;
    }

    .card-meaning {
      grid-column: 1 / -1;
      grid-row: 2;
    }

    .card-status {
      grid-column: 2;
      grid-row: 1;
    }

    .japanese {
      font-size: var(--text-base);
    }

    .reading {
      font-size: var(--text-xs);
    }

    .card-meaning {
      font-size: var(--text-xs);
      white-space: normal;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }

  @media (max-width: 380px) {
    .deck-actions {
      flex-direction: column;
    }

    .deck-stats {
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
    }

    .stat {
      width: 100%;
      flex-direction: row;
      justify-content: space-between;
    }
  }
</style>
