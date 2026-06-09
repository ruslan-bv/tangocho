<script lang="ts">
  import { onDestroy, tick } from 'svelte';
  import { page } from '$app/stores';
  import { beforeNavigate } from '$app/navigation';
  import type { CardWithWord, DeckWithStats, ReviewRating } from '$lib/api/types';
  import { api } from '$lib/api/client';
  import Button from '$lib/components/Button.svelte';
  import DeckCard from '$lib/components/DeckCard.svelte';
  import FlashCard from '$lib/components/FlashCard.svelte';
  import { t } from '$lib/i18n';
  import { showError } from '$lib/stores/toast.svelte';

  // How long a rating can be taken back before it's committed to the server.
  const UNDO_MS = 5000;

  let cards = $state<CardWithWord[]>([]);
  let decks = $state<DeckWithStats[]>([]);
  let currentIndex = $state(0);
  let showAnswer = $state(false);
  let loading = $state(true);
  let sessionComplete = $state(false);
  let reviewedCount = $state(0);
  let deckId = $state<number | undefined>(undefined);
  let selectingDeck = $state(false);
  let startedWithCards = $state(false);

  // Deferred-commit undo: the latest rating waits a few seconds before being
  // sent, so a mis-tap can be reversed. Any navigation flushes it first.
  type Pending = { card: CardWithWord; rating: ReviewRating; index: number };
  let pending = $state<Pending | null>(null);
  let undoTimer: ReturnType<typeof setTimeout> | undefined;

  // Discards responses from superseded loads (e.g. rapid deck switches).
  let loadSeq = 0;

  let ratingButtons = $state<HTMLDivElement | null>(null);

  const currentCard = $derived(cards[currentIndex]);
  const totalCards = $derived(cards.length);
  const progressPercent = $derived(totalCards ? (currentIndex / totalCards) * 100 : 0);
  const decksWithDue = $derived(decks.filter((d) => d.dueCards > 0));

  const deckParam = $derived($page.url.searchParams.get('deck'));

  // Reload only when the deck actually changes, so unrelated query-string
  // changes don't wipe an in-progress session.
  let loadedDeckParam: string | null | undefined = undefined;
  $effect(() => {
    const p = deckParam;
    if (p !== loadedDeckParam) {
      loadedDeckParam = p;
      loadData(p);
    }
  });

  function ratingLabel(rating: ReviewRating): string {
    return rating === 1
      ? t('study.again')
      : rating === 2
        ? t('study.hard')
        : rating === 3
          ? t('study.good')
          : t('study.easy');
  }

  async function loadData(deckParamValue: string | null) {
    const seq = ++loadSeq;
    // Send the queued rating before refetching, or the just-rated card
    // comes back as due and gets reviewed twice.
    await commitPending();
    if (seq !== loadSeq) return;

    // Reset state for new load
    loading = true;
    selectingDeck = false;
    sessionComplete = false;
    startedWithCards = false;
    currentIndex = 0;
    showAnswer = false;
    reviewedCount = 0;
    cards = [];

    try {
      if (deckParamValue) {
        // Deck specified in URL - load cards directly
        deckId = Number(deckParamValue);
        const dueCards = await api.getDueCards(deckId);
        if (seq !== loadSeq) return;
        cards = dueCards;
        startedWithCards = cards.length > 0;
        if (cards.length === 0) {
          sessionComplete = true;
        }
      } else {
        // No deck specified - show deck selection
        const allDecks = await api.getDecks();
        if (seq !== loadSeq) return;
        decks = allDecks;
        selectingDeck = true;
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      showError(t('common.loadFailed'));
    } finally {
      if (seq === loadSeq) {
        loading = false;
      }
    }
  }

  async function reveal() {
    showAnswer = true;
    // The card-front reveal button disappears, so keyboard focus would fall
    // back to <body>; land it on the rating buttons instead.
    await tick();
    ratingButtons?.focus();
  }

  function clearPending() {
    if (undoTimer) {
      clearTimeout(undoTimer);
      undoTimer = undefined;
    }
  }

  async function commitPending() {
    if (!pending) return;
    const p = pending;
    pending = null; // captured synchronously before the await
    clearPending();
    try {
      await api.reviewCard({ cardId: p.card.id, rating: p.rating });
    } catch (error) {
      console.error('Failed to submit review:', error);
      showError(t('toast.reviewFailed'));
    }
  }

  function rate(rating: ReviewRating) {
    if (!currentCard || !showAnswer || sessionComplete) return;
    // Commit the previous pending review (fire-and-forget) before queuing this one.
    void commitPending();

    pending = { card: currentCard, rating, index: currentIndex };
    clearPending();
    undoTimer = setTimeout(() => void commitPending(), UNDO_MS);

    reviewedCount++;
    if (currentIndex < cards.length - 1) {
      currentIndex++;
      showAnswer = false;
    } else {
      sessionComplete = true;
    }
  }

  function undo() {
    if (!pending) return;
    clearPending();
    const p = pending;
    pending = null;
    sessionComplete = false;
    currentIndex = p.index;
    showAnswer = true;
    reviewedCount = Math.max(0, reviewedCount - 1);
  }

  function isEditableTarget(target: EventTarget | null): boolean {
    const el = target as HTMLElement | null;
    if (!el || !el.tagName) return false;
    const tag = el.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.repeat || isEditableTarget(e.target)) return;
    if (loading || selectingDeck) return;

    // Undo works whenever a rating is still pending (including the done screen).
    if (pending && (e.key === 'u' || e.key === 'U' || e.code === 'Backspace')) {
      e.preventDefault();
      undo();
      return;
    }

    if (sessionComplete || !currentCard) return;

    if (!showAnswer) {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') {
        e.preventDefault();
        reveal();
      }
      return;
    }

    switch (e.code) {
      case 'Digit1':
      case 'Numpad1':
        rate(1);
        break;
      case 'Digit2':
      case 'Numpad2':
        rate(2);
        break;
      case 'Digit3':
      case 'Numpad3':
        rate(3);
        break;
      case 'Digit4':
      case 'Numpad4':
        rate(4);
        break;
    }
  }

  // Never lose a queued rating: flush it on navigation or teardown.
  beforeNavigate(() => {
    void commitPending();
  });
  onDestroy(() => {
    void commitPending();
  });
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
  {:else if sessionComplete && !startedWithCards}
    <div class="complete">
      <div class="complete-icon all-done" aria-hidden="true">月</div>
      <h1>{t('study.allReviewedTitle')}</h1>
      <p class="complete-stats">
        {t('study.allReviewedDesc')}
      </p>
      <div class="complete-actions">
        <Button href={deckId ? `/decks/${deckId}` : '/'} variant="secondary">
          {deckId ? t('card.backToDeck') : t('study.goHome')}
        </Button>
        <Button href={deckId ? `/add?deck=${deckId}` : '/add'} variant="primary">
          {t('home.addNewWord')}
        </Button>
      </div>
    </div>
  {:else if sessionComplete}
    <div class="complete">
      <div class="complete-icon" aria-hidden="true">✓</div>
      <h1>{t('study.complete')}</h1>
      <p class="complete-stats">
        {t('study.reviewedToday', { count: reviewedCount })}
      </p>
      {#if pending}
        <div class="undo-bar" role="status" aria-live="polite">
          <span>{ratingLabel(pending.rating)}</span>
          <button type="button" class="undo-btn" onclick={undo}>{t('study.undo')}</button>
        </div>
      {/if}
      <div class="complete-actions">
        <Button variant="primary" onclick={() => loadData(deckParam)}>
          {t('study.studyAgain')}
        </Button>
        <Button href={deckId ? `/decks/${deckId}` : '/'} variant="secondary">
          {deckId ? t('card.backToDeck') : t('study.goHome')}
        </Button>
      </div>
    </div>
  {:else if currentCard}
    <div class="study-header">
      <Button href={deckId ? `/decks/${deckId}` : '/'} variant="ghost" size="sm">
        {t('study.endSession')}
      </Button>
      <span class="progress-text">
        {t('study.cardProgress', { current: Math.min(currentIndex + 1, totalCards), total: totalCards })}
      </span>
    </div>
    <div
      class="progress-track"
      role="progressbar"
      aria-label={t('study.cardProgress', { current: Math.min(currentIndex + 1, totalCards), total: totalCards })}
      aria-valuemin="0"
      aria-valuemax={totalCards}
      aria-valuenow={currentIndex}
    >
      <div class="progress-fill" style:width="{progressPercent}%"></div>
    </div>

    <FlashCard card={currentCard} {showAnswer} onReveal={reveal} />

    <div class="controls">
      {#if !showAnswer}
        <Button variant="primary" size="lg" onclick={reveal}>
          {t('study.showAnswer')}
          <span class="shortcut">Space</span>
        </Button>
      {:else}
        <div class="rating-buttons" bind:this={ratingButtons} tabindex="-1">
          <button class="rating-btn again" onclick={() => rate(1)}>
            <span class="rating-label">{t('study.again')}</span>
            <span class="rating-key">1</span>
          </button>
          <button class="rating-btn hard" onclick={() => rate(2)}>
            <span class="rating-label">{t('study.hard')}</span>
            <span class="rating-key">2</span>
          </button>
          <button class="rating-btn good" onclick={() => rate(3)}>
            <span class="rating-label">{t('study.good')}</span>
            <span class="rating-key">3</span>
          </button>
          <button class="rating-btn easy" onclick={() => rate(4)}>
            <span class="rating-label">{t('study.easy')}</span>
            <span class="rating-key">4</span>
          </button>
        </div>
      {/if}
    </div>

    {#if pending}
      <div class="undo-bar undo-bar--floating" role="status" aria-live="polite">
        <span>{ratingLabel(pending.rating)}</span>
        <button type="button" class="undo-btn" onclick={undo}>{t('study.undo')}</button>
      </div>
    {/if}
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

  .complete-icon.all-done {
    background-color: var(--color-accent);
  }

  .study-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .progress-text {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .progress-track {
    height: 4px;
    background-color: var(--color-border-light);
    border-radius: var(--radius-full);
    overflow: hidden;
    margin-bottom: var(--space-6);
  }

  .progress-fill {
    height: 100%;
    background-color: var(--color-accent);
    border-radius: var(--radius-full);
    transition: width var(--transition-normal);
  }

  .controls {
    margin-top: var(--space-8);
    min-height: 88px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .undo-bar {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-4);
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-md);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .undo-bar--floating {
    position: sticky;
    bottom: var(--space-4);
    margin: var(--space-6) auto 0;
  }

  .undo-btn {
    background: none;
    border: none;
    color: var(--color-accent);
    font-weight: 600;
    font-size: var(--text-sm);
    cursor: pointer;
    padding: var(--space-1) var(--space-2);
    border-radius: var(--radius-sm);
  }

  .undo-btn:hover {
    background-color: var(--color-washi-dark);
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

    .complete-actions :global(a),
    .complete-actions :global(button) {
      width: 100%;
      justify-content: center;
    }

    .controls {
      margin-top: var(--space-4);
      min-height: 0;
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
