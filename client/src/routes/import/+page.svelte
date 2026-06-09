<script lang="ts">
  import { onMount } from 'svelte';
  import type { DeckWithStats, ParsedWord, BulkResult, BulkResultReason } from '$lib/api/types';
  import { api, ApiError } from '$lib/api/client';
  import Button from '$lib/components/Button.svelte';
  import { t } from '$lib/i18n';
  import { showError, showSuccess } from '$lib/stores/toast.svelte';

  const MAX_TEXT = 5000;
  const BATCH_SIZE = 8; // import in chunks so progress is visible on large sets

  let text = $state('');
  let decks = $state<DeckWithStats[]>([]);
  let selectedDeckId = $state<number | null>(null);
  let parsing = $state(false);
  let creating = $state(false);
  let words = $state<ParsedWord[]>([]);
  let selected = $state<Set<string>>(new Set());
  // Per-lemma outcome from the last import, so each row can show what happened.
  let wordStatus = $state<Record<string, 'ok' | BulkResultReason>>({});
  let importDone = $state(0);
  let importTotal = $state(0);

  const hasParsed = $derived(words.length > 0);
  const selectableCount = $derived(words.filter((w) => !w.alreadyInDeck).length);
  const alreadyInDeckCount = $derived(words.filter((w) => w.alreadyInDeck).length);

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
    wordStatus = {};
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
    const lemmas = Array.from(selected);
    importTotal = lemmas.length;
    importDone = 0;
    const results: BulkResult[] = [];

    try {
      // Chunk the request so the progress bar actually moves on large imports.
      for (let i = 0; i < lemmas.length; i += BATCH_SIZE) {
        const batch = lemmas.slice(i, i + BATCH_SIZE);
        const res = await api.bulkImport(selectedDeckId, batch);
        results.push(...res.results);
        importDone = Math.min(lemmas.length, i + batch.length);
      }

      const created = results.filter((r) => r.ok).length;
      const already = results.filter((r) => !r.ok && r.reason === 'already_in_deck').length;
      const failed = results.filter((r) => !r.ok && r.reason !== 'already_in_deck').length;

      // Record each outcome so rows can be flagged; keep failures visible/selectable.
      const status: Record<string, 'ok' | BulkResultReason> = { ...wordStatus };
      const handled = new Set<string>();
      for (const r of results) {
        status[r.lemma] = r.ok ? 'ok' : (r.reason ?? 'error');
        if (r.ok || r.reason === 'already_in_deck') handled.add(r.lemma);
      }
      wordStatus = status;
      words = words.map((w) => (handled.has(w.lemma) ? { ...w, alreadyInDeck: true } : w));

      const next = new Set(selected);
      for (const lemma of handled) next.delete(lemma);
      selected = next;

      const parts = [t('import.createdCount', { count: created })];
      if (already > 0) parts.push(t('import.alreadyInDeckCount', { count: already }));
      if (failed > 0) parts.push(t('import.failedCount', { count: failed }));
      const summary = parts.join(' · ');
      if (failed > 0 && created === 0) showError(summary);
      else showSuccess(summary);
    } catch (e) {
      const message = e instanceof Error ? e.message : t('import.createFailed');
      showError(message);
    } finally {
      creating = false;
      importTotal = 0;
      importDone = 0;
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
      maxlength={MAX_TEXT}
      disabled={parsing}
    ></textarea>
    <div class="char-count" class:char-count--max={text.length >= MAX_TEXT}>
      {t('import.charCount', { count: text.length, max: MAX_TEXT })}
    </div>

    <div class="controls">
      <label class="deck-select">
        <span>{t('import.targetDeck')}</span>
        <select bind:value={selectedDeckId} disabled={decks.length === 0 || parsing || creating}>
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
        <span class="found-count">
          {t('import.foundCount', { count: words.length })}
          {#if alreadyInDeckCount > 0}
            · {t('import.alreadyInDeckCount', { count: alreadyInDeckCount })}
          {/if}
        </span>
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
              {#if wordStatus[word.lemma] === 'ok'}
                <span class="badge badge--added">{t('import.statusAdded')}</span>
              {:else if wordStatus[word.lemma] === 'already_in_deck' || (word.alreadyInDeck && !wordStatus[word.lemma])}
                <span class="badge">{t('import.statusSkipped')}</span>
              {:else if wordStatus[word.lemma]}
                <span class="badge badge--failed">{t('import.statusFailed')}</span>
              {/if}
            </label>
          </li>
        {/each}
      </ul>

      <div class="submit-row">
        {#if creating && importTotal > 0}
          <div
            class="import-progress"
            role="progressbar"
            aria-valuemin="0"
            aria-valuemax={importTotal}
            aria-valuenow={importDone}
          >
            <div class="progress-track">
              <div class="progress-fill" style:width="{(importDone / importTotal) * 100}%"></div>
            </div>
            <span class="progress-count">{importDone} / {importTotal}</span>
          </div>
        {/if}
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

  .char-count {
    align-self: flex-end;
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
    margin-top: calc(var(--space-2) * -1);
  }

  .char-count--max {
    color: var(--color-error);
    font-weight: 600;
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

  .badge--added {
    background-color: var(--color-success);
    color: #fff;
  }

  .badge--failed {
    background-color: var(--color-error);
    color: #fff;
  }

  .submit-row {
    margin-top: var(--space-5);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border-light);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
  }

  .import-progress {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    max-width: 360px;
  }

  .import-progress .progress-track {
    flex: 1;
    height: 6px;
    background-color: var(--color-border-light);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .import-progress .progress-fill {
    height: 100%;
    background-color: var(--color-accent);
    border-radius: var(--radius-full);
    transition: width var(--transition-fast);
  }

  .progress-count {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
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
