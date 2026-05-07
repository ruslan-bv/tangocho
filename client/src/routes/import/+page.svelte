<script lang="ts">
  import { onMount } from 'svelte';
  import type { DeckWithStats, ParsedWord } from '$lib/api/types';
  import { api, ApiError } from '$lib/api/client';
  import Button from '$lib/components/Button.svelte';
  import { t } from '$lib/i18n';
  import { showError, showSuccess } from '$lib/stores/toast.svelte';

  let text = $state('');
  let decks = $state<DeckWithStats[]>([]);
  let selectedDeckId = $state<number | null>(null);
  let parsing = $state(false);
  let creating = $state(false);
  let words = $state<ParsedWord[]>([]);
  let selected = $state<Set<string>>(new Set());

  const hasParsed = $derived(words.length > 0);
  const selectableCount = $derived(words.filter((w) => !w.alreadyInDeck).length);

  onMount(async () => {
    try {
      decks = await api.getDecks();
      if (decks.length > 0) {
        selectedDeckId = decks[0].id;
      }
    } catch {
      showError(t('common.loadFailed'));
    }
  });

  async function parse() {
    if (!text.trim() || parsing) return;
    if (!selectedDeckId) {
      showError(t('import.needDeck'));
      return;
    }

    parsing = true;
    words = [];
    selected = new Set();
    try {
      const res = await api.parseText(text, selectedDeckId);
      words = res.words;
      selected = new Set(words.filter((w) => !w.alreadyInDeck).map((w) => w.lemma));
      if (words.length === 0) showError(t('import.noWordsFound'));
    } catch (e) {
      const message =
        e instanceof ApiError && e.status === 400 ? e.message : t('import.parseError');
      showError(message);
    } finally {
      parsing = false;
    }
  }

  function toggleWord(lemma: string) {
    const next = new Set(selected);
    if (next.has(lemma)) next.delete(lemma);
    else next.add(lemma);
    selected = next;
  }

  function selectAll() {
    selected = new Set(words.filter((w) => !w.alreadyInDeck).map((w) => w.lemma));
  }

  function selectNone() {
    selected = new Set();
  }

  async function createCards() {
    if (!selectedDeckId || selected.size === 0 || creating) return;

    creating = true;
    try {
      const res = await api.bulkImport(selectedDeckId, Array.from(selected));
      const ok = res.results.filter((r) => r.ok).length;
      const skipped = res.results.length - ok;
      showSuccess(
        skipped > 0
          ? `${t('import.createdCount', { count: ok })} · ${t('import.skippedCount', { count: skipped })}`
          : t('import.createdCount', { count: ok })
      );

      const createdLemmas = new Set(res.results.filter((r) => r.ok).map((r) => r.lemma));
      words = words.map((w) =>
        createdLemmas.has(w.lemma) ? { ...w, alreadyInDeck: true } : w
      );
      selected = new Set();
    } catch (e) {
      const message = e instanceof Error ? e.message : t('import.createFailed');
      showError(message);
    } finally {
      creating = false;
    }
  }
</script>

<div class="import-page">
  <h1>{t('import.title')}</h1>
  <p class="description">{t('import.description')}</p>

  <div class="input-section">
    <label class="textarea-label" for="import-text">{t('import.textareaLabel')}</label>
    <textarea
      id="import-text"
      bind:value={text}
      placeholder={t('import.textareaPlaceholder')}
      rows="6"
      maxlength="5000"
      disabled={parsing}
    ></textarea>

    <div class="controls">
      <label class="deck-select">
        <span>{t('import.targetDeck')}</span>
        <select bind:value={selectedDeckId} disabled={decks.length === 0}>
          {#each decks as deck}
            <option value={deck.id}>{deck.name}</option>
          {/each}
        </select>
      </label>

      <Button
        variant="primary"
        onclick={parse}
        disabled={parsing || !text.trim() || !selectedDeckId}
      >
        {parsing ? t('import.parsing') : hasParsed ? t('import.reparse') : t('import.parse')}
      </Button>
    </div>
  </div>

  {#if decks.length === 0}
    <div class="no-decks card">
      <p>{t('add.createDeckFirst')}</p>
      <Button href="/decks/new" variant="primary">{t('add.createDeck')}</Button>
    </div>
  {/if}

  {#if hasParsed}
    <div class="results-section card">
      <div class="results-header">
        <span class="found-count">{t('import.foundCount', { count: words.length })}</span>
        <div class="bulk-actions">
          <button type="button" class="link" onclick={selectAll} disabled={selectableCount === 0}>
            {t('import.selectAll')}
          </button>
          <span class="separator">·</span>
          <button type="button" class="link" onclick={selectNone} disabled={selected.size === 0}>
            {t('import.selectNone')}
          </button>
        </div>
      </div>

      <ul class="word-list">
        {#each words as word (word.lemma)}
          <li class="word-row" class:disabled={word.alreadyInDeck}>
            <label class="word-label">
              <input
                type="checkbox"
                checked={selected.has(word.lemma)}
                disabled={word.alreadyInDeck}
                onchange={() => toggleWord(word.lemma)}
              />
              <span class="lemma">{word.lemma}</span>
              {#if word.reading && word.reading !== word.lemma}
                <span class="reading">{word.reading}</span>
              {/if}
              {#if word.surface !== word.lemma}
                <span class="surface">({word.surface})</span>
              {/if}
              <span class="pos pos--{word.pos}">{word.pos}</span>
              {#if word.jishoPreview}
                <span class="meaning">{word.jishoPreview.meaning}</span>
              {/if}
              {#if word.alreadyInDeck}
                <span class="badge">{t('import.alreadyInDeck')}</span>
              {/if}
            </label>
          </li>
        {/each}
      </ul>

      <div class="submit-row">
        <Button
          variant="primary"
          size="lg"
          onclick={createCards}
          disabled={creating || selected.size === 0}
        >
          {creating ? t('import.creating') : t('import.create', { count: selected.size })}
        </Button>
      </div>
    </div>
  {/if}
</div>

<style>
  .import-page {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-3);
    text-align: center;
  }

  .description {
    color: var(--color-text-secondary);
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .input-section {
    margin-bottom: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .textarea-label {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  textarea {
    font: inherit;
    font-family: var(--font-serif);
    color: var(--color-text-primary);
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    resize: vertical;
    min-height: 140px;
    line-height: 1.7;
  }

  textarea:focus {
    outline: 2px solid var(--color-accent);
    outline-offset: 1px;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .deck-select {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
  }

  .deck-select select {
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background-color: var(--color-surface-elevated);
    color: var(--color-text-primary);
  }

  .results-section {
    padding: var(--space-5);
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--color-border-light);
  }

  .found-count {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .bulk-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
  }

  .link {
    background: none;
    border: none;
    color: var(--color-accent);
    font-size: inherit;
    cursor: pointer;
    padding: 0;
    text-decoration: underline;
  }

  .link:disabled {
    color: var(--color-text-muted);
    cursor: not-allowed;
    text-decoration: none;
  }

  .separator {
    color: var(--color-text-muted);
  }

  .word-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .word-row {
    border-bottom: 1px solid var(--color-border-light);
  }

  .word-row:last-child {
    border-bottom: none;
  }

  .word-row.disabled {
    opacity: 0.5;
  }

  .word-label {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    cursor: pointer;
    flex-wrap: wrap;
  }

  .word-row.disabled .word-label {
    cursor: not-allowed;
  }

  .lemma {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    color: var(--color-text-primary);
  }

  .reading {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .surface {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .pos {
    font-size: var(--text-xs);
    padding: 2px var(--space-2);
    border-radius: var(--radius-sm);
    background-color: var(--color-washi-dark);
    color: var(--color-text-secondary);
  }

  .meaning {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    flex: 1;
    min-width: 200px;
  }

  .badge {
    font-size: var(--text-xs);
    padding: 2px var(--space-2);
    border-radius: var(--radius-sm);
    background-color: var(--color-border);
    color: var(--color-text-muted);
    margin-left: auto;
  }

  .submit-row {
    margin-top: var(--space-5);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border-light);
    display: flex;
    justify-content: center;
  }

  .no-decks {
    text-align: center;
    padding: var(--space-8);
  }

  .no-decks p {
    margin-bottom: var(--space-4);
    color: var(--color-text-secondary);
  }

  @media (max-width: 640px) {
    h1 {
      font-size: var(--text-2xl);
    }

    .controls {
      flex-direction: column;
      align-items: stretch;
    }

    .deck-select {
      flex-direction: column;
      align-items: stretch;
    }

    .meaning {
      flex: 1 1 100%;
    }

    .badge {
      margin-left: 0;
    }
  }
</style>
