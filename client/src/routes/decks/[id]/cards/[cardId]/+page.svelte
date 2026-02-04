<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import type { CardWithWord } from '$lib/api/types';
  import { api } from '$lib/api/client';
  import Button from '$lib/components/Button.svelte';
  import { t, formatDate } from '$lib/i18n';
  import { showSuccess, showError } from '$lib/stores/toast.svelte';

  let card = $state<CardWithWord | null>(null);
  let loading = $state(true);
  let deleting = $state(false);

  const deckId = $derived(Number($page.params.id));
  const cardId = $derived(Number($page.params.cardId));

  onMount(async () => {
    try {
      card = await api.getCard(cardId);
    } catch (error) {
      console.error('Failed to load card:', error);
      showError(t('common.loadFailed'));
    } finally {
      loading = false;
    }
  });

  async function deleteCard() {
    if (!card || !confirm(t('card.deleteConfirm'))) {
      return;
    }

    deleting = true;
    try {
      await api.deleteCard(card.id);
      showSuccess(t('toast.cardDeleted'));
      goto(`/decks/${deckId}`);
    } catch (error) {
      console.error('Failed to delete card:', error);
      showError(t('card.deleteFailed'));
    } finally {
      deleting = false;
    }
  }
</script>

<div class="card-page">
  {#if loading}
    <div class="loading">{t('common.loading')}</div>
  {:else if !card}
    <div class="not-found">
      <h2>{t('card.notFound')}</h2>
      <Button href="/decks/{deckId}" variant="secondary">
        {t('card.backToDeck')}
      </Button>
    </div>
  {:else}
    <div class="card-header">
      <Button href="/decks/{deckId}" variant="ghost">
        ← {t('card.backToDeck')}
      </Button>
      <Button variant="danger" onclick={deleteCard} disabled={deleting}>
        {t('common.delete')}
      </Button>
    </div>

    <div class="word-display">
      <h1 class="japanese">{card.word.japanese}</h1>
      {#if card.word.reading !== card.word.japanese}
        <p class="reading">{card.word.reading}</p>
      {/if}
    </div>

    <div class="section">
      <h2>{t('flashcard.meanings')}</h2>
      <ul class="meanings-list">
        {#each card.word.meanings as meaning}
          <li>{meaning}</li>
        {/each}
      </ul>
    </div>

    {#if card.word.sentences && card.word.sentences.length > 0}
      <div class="section">
        <h2>{t('flashcard.examples')}</h2>
        <div class="sentences-list">
          {#each card.word.sentences as sentence}
            <div class="sentence">
              <p class="sentence-jp">{sentence.japanese}</p>
              <p class="sentence-en">{sentence.english}</p>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if card.word.kanji && card.word.kanji.length > 0}
      <div class="section">
        <h2>{t('flashcard.kanji')}</h2>
        <div class="kanji-list">
          {#each card.word.kanji as k}
            <div class="kanji-item">
              <span class="kanji-char">{k.character}</span>
              {#if k.jlptLevel}
                <span class="kanji-jlpt">{k.jlptLevel}</span>
              {/if}
              <span class="kanji-meaning">{k.meanings.slice(0, 3).join(', ')}</span>
              <div class="kanji-readings">
                {#if k.readings.onyomi.length > 0}
                  <span class="reading on">音: {k.readings.onyomi.slice(0, 3).join('、')}</span>
                {/if}
                {#if k.readings.kunyomi.length > 0}
                  <span class="reading kun">訓: {k.readings.kunyomi.slice(0, 3).join('、')}</span>
                {/if}
              </div>
              {#if k.strokeCount > 0}
                <span class="kanji-strokes">{k.strokeCount} strokes</span>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <div class="section">
      <h2>SRS</h2>
      <div class="srs-stats">
        <div class="stat">
          <span class="stat-label">{t('card.dueDate')}</span>
          <span class="stat-value">{formatDate(card.dueDate)}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{t('card.interval')}</span>
          <span class="stat-value">{card.interval} {t('card.days')}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{t('card.repetitions')}</span>
          <span class="stat-value">{card.repetitions}</span>
        </div>
        <div class="stat">
          <span class="stat-label">{t('card.easeFactor')}</span>
          <span class="stat-value">{card.easeFactor.toFixed(2)}</span>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .card-page {
    max-width: 700px;
    margin: 0 auto;
  }

  .loading, .not-found {
    text-align: center;
    padding: var(--space-12);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-8);
  }

  .word-display {
    text-align: center;
    padding: var(--space-8);
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-6);
  }

  .japanese {
    font-family: var(--font-serif);
    font-size: var(--text-5xl);
    margin-bottom: var(--space-2);
  }

  .reading {
    font-size: var(--text-xl);
    color: var(--color-text-secondary);
  }

  .section {
    margin-bottom: var(--space-6);
  }

  .section h2 {
    font-size: var(--text-lg);
    margin-bottom: var(--space-3);
    color: var(--color-text-secondary);
  }

  .meanings-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .meanings-list li {
    padding: var(--space-3) var(--space-4);
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    margin-bottom: var(--space-2);
  }

  .sentences-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .sentence {
    padding: var(--space-4);
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
  }

  .sentence-jp {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    margin-bottom: var(--space-2);
  }

  .sentence-en {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .srs-stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .stat {
    padding: var(--space-4);
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .stat-label {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .stat-value {
    font-size: var(--text-lg);
    font-weight: 500;
  }

  .kanji-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .kanji-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-4);
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border-light);
    border-radius: var(--radius-md);
    width: 160px;
    gap: var(--space-2);
  }

  .kanji-char {
    font-family: var(--font-serif);
    font-size: var(--text-4xl);
  }

  .kanji-jlpt {
    font-size: var(--text-xs);
    background-color: var(--color-accent);
    color: white;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
  }

  .kanji-meaning {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    text-align: center;
  }

  .kanji-readings {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
  }

  .reading {
    font-size: var(--text-sm);
  }

  .reading.on {
    color: var(--color-shu);
  }

  .reading.kun {
    color: var(--color-matcha);
  }

  .kanji-strokes {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .card-page {
      padding: 0 var(--space-4);
    }

    .card-header {
      margin-bottom: var(--space-4);
    }

    .word-display {
      padding: var(--space-6);
      margin-bottom: var(--space-4);
    }

    .japanese {
      font-size: var(--text-4xl);
    }

    .reading {
      font-size: var(--text-lg);
    }

    .section {
      margin-bottom: var(--space-4);
    }

    .section h2 {
      font-size: var(--text-base);
    }

    .meanings-list li {
      padding: var(--space-2) var(--space-3);
      font-size: var(--text-sm);
    }

    .sentence {
      padding: var(--space-3);
    }

    .sentence-jp {
      font-size: var(--text-base);
    }

    .sentence-en {
      font-size: var(--text-xs);
    }

    .srs-stats {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-2);
    }

    .stat {
      padding: var(--space-3);
    }

    .stat-label {
      font-size: var(--text-xs);
    }

    .stat-value {
      font-size: var(--text-base);
    }

    .kanji-list {
      justify-content: center;
      gap: var(--space-2);
    }

    .kanji-item {
      width: 140px;
      padding: var(--space-3);
    }

    .kanji-char {
      font-size: var(--text-3xl);
    }

    .kanji-meaning {
      font-size: var(--text-xs);
    }

    .kanji-readings {
      gap: 0;
    }

    .reading {
      font-size: var(--text-xs);
    }
  }

  /* Very small screens */
  @media (max-width: 380px) {
    .card-header {
      flex-direction: column;
      gap: var(--space-2);
      align-items: stretch;
    }

    .japanese {
      font-size: var(--text-3xl);
    }

    .srs-stats {
      grid-template-columns: 1fr;
    }

    .kanji-item {
      width: 120px;
    }
  }
</style>
