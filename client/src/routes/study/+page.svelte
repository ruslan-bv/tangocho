<script lang="ts">
  import { page } from '$app/stores';
  import type { CardWithWord, DeckWithStats, ReviewRating } from '$lib/api/types';
  import { api } from '$lib/api/client';
  import Button from '$lib/components/Button.svelte';
  import DeckCard from '$lib/components/DeckCard.svelte';
  import FlashCard from '$lib/components/FlashCard.svelte';
  import { t } from '$lib/i18n';
  import { showError } from '$lib/stores/toast.svelte';

  let cards = $state<CardWithWord[]>([]);
  let decks = $state<DeckWithStats[]>([]);
  let currentIndex = $state(0);
  let showAnswer = $state(false);
  let loading = $state(true);
  let reviewing = $state(false);
  let sessionComplete = $state(false);
  let reviewedCount = $state(0);
  let deckId = $state<number | undefined>(undefined);
  let selectingDeck = $state(false);

  const currentCard = $derived(cards[currentIndex]);
  const remainingCards = $derived(cards.length - currentIndex);
  const decksWithDue = $derived(decks.filter(d => d.dueCards > 0));

  // Track the deck param from URL to react to navigation changes
  const deckParam = $derived($page.url.searchParams.get('deck'));

  // Load data when URL changes (handles both initial load and navigation)
  $effect(() => {
    loadData(deckParam);
  });

  async function loadData(deckParamValue: string | null) {
    // Reset state for new load
    loading = true;
    selectingDeck = false;
    sessionComplete = false;
    currentIndex = 0;
    showAnswer = false;
    cards = [];

    try {
      if (deckParamValue) {
        // Deck specified in URL - load cards directly
        deckId = Number(deckParamValue);
        cards = await api.getDueCards(deckId);
        if (cards.length === 0) {
          sessionComplete = true;
        }
      } else {
        // No deck specified - show deck selection
        decks = await api.getDecks();
        selectingDeck = true;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showError(t('common.loadFailed'));
    } finally {
      loading = false;
    }
  }

  function reveal() {
    showAnswer = true;
  }

  async function rate(rating: ReviewRating) {
    if (!currentCard || reviewing) return;

    reviewing = true;
    try {
      await api.reviewCard({
        cardId: currentCard.id,
        rating
      });

      reviewedCount++;

      if (currentIndex < cards.length - 1) {
        currentIndex++;
        showAnswer = false;
      } else {
        sessionComplete = true;
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      showError(t('toast.reviewFailed'));
    } finally {
      reviewing = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (loading || sessionComplete) return;

    if (!showAnswer) {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        reveal();
      }
    } else {
      switch (e.code) {
        case 'Digit1':
          rate(1);
          break;
        case 'Digit2':
          rate(2);
          break;
        case 'Digit3':
          rate(3);
          break;
        case 'Digit4':
          rate(4);
          break;
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="study-page">
  {#if loading}
    <div class="loading">
      <p>{t('study.loadingCards')}</p>
    </div>
  {:else if selectingDeck}
    <div class="deck-selection">
      <h1>{t('study.selectDeck')}</h1>
      <p class="selection-subtitle">{t('study.selectDeckDesc')}</p>

      {#if decksWithDue.length === 0}
        <div class="empty">
          <h2>{t('study.noCardsTitle')}</h2>
          <p>{t('study.noCardsDesc')}</p>
          <Button href="/add" variant="primary">
            {t('common.addWord')}
          </Button>
        </div>
      {:else}
        <div class="decks-grid">
          {#each decksWithDue as deck}
            <DeckCard {deck} href={`/study?deck=${deck.id}`} />
          {/each}
        </div>
      {/if}
    </div>
  {:else if sessionComplete}
    <div class="complete">
      <div class="complete-icon">✓</div>
      <h1>{t('study.complete')}</h1>
      <p class="complete-stats">
        {t('study.reviewedToday', { count: reviewedCount })}
      </p>
      <div class="complete-actions">
        <Button href={deckId ? '/decks' : '/'} variant="secondary">
          {deckId ? t('decks.backToList') : t('study.goHome')}
        </Button>
        <Button href={deckId ? `/add?deck=${deckId}` : '/add'} variant="primary">
          {t('home.addNewWord')}
        </Button>
      </div>
    </div>
  {:else if currentCard}
    <div class="study-header">
      <span class="progress">
        {t('study.remaining', { count: remainingCards })}
      </span>
    </div>

    <FlashCard card={currentCard} {showAnswer} />

    <div class="controls">
      {#if !showAnswer}
        <Button variant="primary" size="lg" onclick={reveal}>
          {t('study.showAnswer')}
          <span class="shortcut">Space</span>
        </Button>
      {:else}
        <div class="rating-buttons">
          <button
            class="rating-btn again"
            onclick={() => rate(1)}
            disabled={reviewing}
          >
            <span class="rating-label">{t('study.again')}</span>
            <span class="rating-key">1</span>
          </button>
          <button
            class="rating-btn hard"
            onclick={() => rate(2)}
            disabled={reviewing}
          >
            <span class="rating-label">{t('study.hard')}</span>
            <span class="rating-key">2</span>
          </button>
          <button
            class="rating-btn good"
            onclick={() => rate(3)}
            disabled={reviewing}
          >
            <span class="rating-label">{t('study.good')}</span>
            <span class="rating-key">3</span>
          </button>
          <button
            class="rating-btn easy"
            onclick={() => rate(4)}
            disabled={reviewing}
          >
            <span class="rating-label">{t('study.easy')}</span>
            <span class="rating-key">4</span>
          </button>
        </div>
      {/if}
    </div>
  {:else}
    <div class="empty">
      <h2>{t('study.noCardsTitle')}</h2>
      <p>{t('study.noCardsDesc')}</p>
      <Button href="/add" variant="primary">
        {t('common.addWord')}
      </Button>
    </div>
  {/if}
</div>

<style>
  .study-page {
    max-width: 900px;
    margin: 0 auto;
    min-height: 70vh;
    display: flex;
    flex-direction: column;
  }

  .loading, .empty, .complete {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: var(--space-4);
  }

  .complete-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background-color: var(--color-matcha);
    color: white;
    font-size: var(--text-4xl);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: var(--space-4);
  }

  .complete h1 {
    font-size: var(--text-3xl);
  }

  .complete-stats {
    font-size: var(--text-lg);
    color: var(--color-text-secondary);
  }

  .complete-actions {
    display: flex;
    gap: var(--space-4);
    margin-top: var(--space-6);
  }

  .study-header {
    display: flex;
    justify-content: center;
    margin-bottom: var(--space-6);
  }

  .progress {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .controls {
    margin-top: var(--space-8);
    display: flex;
    justify-content: center;
  }

  .shortcut {
    font-size: var(--text-xs);
    opacity: 0.7;
    margin-left: var(--space-2);
    padding: var(--space-1) var(--space-2);
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-sm);
  }

  .rating-buttons {
    display: flex;
    gap: var(--space-3);
    width: 100%;
    max-width: 500px;
  }

  .rating-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-4);
    border: 2px solid;
    border-radius: var(--radius-lg);
    background: none;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .rating-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .rating-label {
    font-size: var(--text-sm);
    font-weight: 500;
  }

  .rating-key {
    font-size: var(--text-xs);
    opacity: 0.6;
    padding: var(--space-1) var(--space-2);
    background-color: rgba(0, 0, 0, 0.05);
    border-radius: var(--radius-sm);
  }

  .rating-btn.again {
    border-color: var(--color-error);
    color: var(--color-error);
  }

  .rating-btn.again:hover:not(:disabled) {
    background-color: var(--color-error);
    color: white;
  }

  .rating-btn.hard {
    border-color: var(--color-warning);
    color: var(--color-warning);
  }

  .rating-btn.hard:hover:not(:disabled) {
    background-color: var(--color-warning);
    color: white;
  }

  .rating-btn.good {
    border-color: var(--color-matcha);
    color: var(--color-matcha);
  }

  .rating-btn.good:hover:not(:disabled) {
    background-color: var(--color-matcha);
    color: white;
  }

  .rating-btn.easy {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .rating-btn.easy:hover:not(:disabled) {
    background-color: var(--color-accent);
    color: white;
  }

  .empty h2 {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-2);
  }

  .empty p {
    color: var(--color-text-secondary);
    margin-bottom: var(--space-6);
  }

  /* Deck selection styles */
  .deck-selection {
    width: 100%;
    padding: var(--space-8) 0;
  }

  .deck-selection h1 {
    font-size: var(--text-3xl);
    text-align: center;
    margin-bottom: var(--space-2);
  }

  .selection-subtitle {
    text-align: center;
    color: var(--color-text-secondary);
    margin-bottom: var(--space-8);
  }

  .decks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .study-page {
      padding: 0 var(--space-2);
      min-height: 60vh;
    }

    .complete-icon {
      width: 60px;
      height: 60px;
      font-size: var(--text-3xl);
    }

    .complete h1 {
      font-size: var(--text-2xl);
    }

    .complete-stats {
      font-size: var(--text-base);
    }

    .complete-actions {
      flex-direction: column;
      width: 100%;
      gap: var(--space-3);
    }

    .complete-actions :global(a) {
      width: 100%;
      justify-content: center;
    }

    .study-header {
      margin-bottom: var(--space-4);
    }

    .controls {
      margin-top: var(--space-4);
    }

    .rating-buttons {
      flex-wrap: wrap;
      gap: var(--space-2);
    }

    .rating-btn {
      flex: 1 1 calc(50% - var(--space-1));
      min-width: calc(50% - var(--space-1));
      padding: var(--space-3);
    }

    .rating-label {
      font-size: var(--text-xs);
    }

    .rating-key {
      font-size: 10px;
    }

    .empty h2 {
      font-size: var(--text-xl);
    }
  }

  @media (max-width: 380px) {
    .rating-btn {
      flex: 1 1 100%;
    }
  }
</style>
