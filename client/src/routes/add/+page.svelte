<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { page } from '$app/stores';
  import type { JishoSearchResult, DeckWithStats } from '$lib/api/types';
  import { api, ApiError } from '$lib/api/client';
  import Button from '$lib/components/Button.svelte';
  import WordPreview from '$lib/components/WordPreview.svelte';
  import { t } from '$lib/i18n';
  import { showError, showSuccess } from '$lib/stores/toast.svelte';

  let searchQuery = $state('');
  let searchResults = $state<JishoSearchResult[]>([]);
  let selectedResult = $state<JishoSearchResult | null>(null);
  let decks = $state<DeckWithStats[]>([]);
  let selectedDeckId = $state<number | null>(null);
  let loading = $state(false);
  let searching = $state(false);
  // The query whose results are currently shown \u2014 drives a persistent
  // "no results" state instead of a toast that disappears.
  let searchedQuery = $state<string | null>(null);
  let lastAdded = $state<{ word: string; deckId: number; deckName: string } | null>(null);

  let searchTimeout: ReturnType<typeof setTimeout>;
  let searchSeq = 0; // discard out-of-order responses
  let searchInput = $state<HTMLInputElement>();
  let resultEls: HTMLButtonElement[] = [];

  const selectedDeckName = $derived(decks.find((d) => d.id === selectedDeckId)?.name ?? '');

  onMount(async () => {
    try {
      decks = await api.getDecks();
      // Preselect the deck from ?deck= (links from deck pages), else the first
      const requestedDeckId = Number($page.url.searchParams.get('deck'));
      if (decks.some((d) => d.id === requestedDeckId)) {
        selectedDeckId = requestedDeckId;
      } else if (decks.length > 0) {
        selectedDeckId = decks[0].id;
      }
    } catch (e) {
      console.error('Failed to load decks:', e);
      showError(t('common.loadFailed'));
    }
    searchInput?.focus();
  });

  onDestroy(() => {
    // Cancel a queued search so it can't fire (and toast) after navigation
    clearTimeout(searchTimeout);
    searchSeq++;
  });

  // Check if query contains valid characters (letters, numbers, or Japanese)
  function hasValidCharacters(query: string): boolean {
    return /[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(query);
  }

  function handleSearchInput() {
    clearTimeout(searchTimeout);
    const trimmed = searchQuery.trim();
    if (trimmed.length < 1 || !hasValidCharacters(trimmed)) {
      searchSeq++;
      searchResults = [];
      searchedQuery = null;
      searching = false;
      return;
    }

    searchTimeout = setTimeout(() => runSearch(trimmed), 300);
  }

  async function runSearch(query: string) {
    const seq = ++searchSeq;
    searching = true;
    try {
      const response = await api.searchJisho(query);
      if (seq !== searchSeq) return; // a newer search superseded this one
      searchResults = response.data;
      searchedQuery = query;
    } catch (e) {
      if (seq !== searchSeq) return;
      console.error('Search failed:', e);
      showError(e instanceof Error ? e.message : t('common.loadFailed'));
    } finally {
      if (seq === searchSeq) searching = false;
    }
  }

  function clearSearch() {
    clearTimeout(searchTimeout);
    searchSeq++;
    searchQuery = '';
    searchResults = [];
    searchedQuery = null;
    searching = false;
    searchInput?.focus();
  }

  function selectResult(result: JishoSearchResult) {
    selectedResult = result;
    lastAdded = null;
  }

  function focusResult(i: number) {
    resultEls[i]?.focus();
  }

  function handleInputKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' && searchResults.length > 0 && !selectedResult) {
      e.preventDefault();
      focusResult(0);
    }
  }

  function handleResultKeydown(e: KeyboardEvent, index: number) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusResult(Math.min(index + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (index === 0) searchInput?.focus();
      else focusResult(index - 1);
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Escape') return;
    if (selectedResult) selectedResult = null;
    else if (searchQuery) clearSearch();
  }

  async function addWord() {
    if (!selectedResult || !selectedDeckId) return;

    loading = true;
    const deckId = selectedDeckId;
    const deckName = selectedDeckName;

    try {
      const japanese = selectedResult.japanese[0]?.word || selectedResult.japanese[0]?.reading;
      await api.addWord({ japanese, deckId });

      // Stay on the page so the user can keep adding; offer a path to the deck.
      lastAdded = { word: japanese, deckId, deckName };
      selectedResult = null;
      searchQuery = '';
      searchResults = [];
      searchedQuery = null;
      showSuccess(t('toast.wordAdded'));
      await tick();
      searchInput?.focus();
    } catch (e) {
      console.error('Failed to add word:', e);
      if (e instanceof ApiError && e.status === 409) {
        showError(t('add.alreadyAdded'));
      } else {
        showError(e instanceof Error ? e.message : t('common.loadFailed'));
      }
    } finally {
      loading = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="add-page">
  <h1>{t('add.title')}</h1>

  {#if lastAdded && !selectedResult && searchResults.length === 0}
    <div class="added-banner" role="status">
      <span>{t('toast.wordAdded')} — {lastAdded.word}</span>
      <a href={`/decks/${lastAdded.deckId}`} class="added-link">{lastAdded.deckName} →</a>
    </div>
  {/if}

  <div class="search-section">
    <div class="search-box">
      <input
        type="search"
        bind:this={searchInput}
        placeholder={t('add.searchPlaceholder')}
        bind:value={searchQuery}
        oninput={handleSearchInput}
        onkeydown={handleInputKeydown}
        autocapitalize="off"
        autocorrect="off"
        autocomplete="off"
        spellcheck="false"
        aria-label={t('add.title')}
        class="input input--lg search-input"
      />
      {#if searching}
        <span class="search-spinner" role="status">{t('add.searching')}</span>
      {:else if searchQuery}
        <button type="button" class="search-clear" onclick={clearSearch} aria-label={t('add.clearSearch')}>
          ×
        </button>
      {/if}
    </div>

    {#if searchResults.length > 0 && !selectedResult}
      <!-- Plain buttons with roving arrow-key focus; listbox/option roles would
           require the full combobox pattern wired to the input. -->
      <div class="search-results" role="group" aria-label={t('add.title')}>
        {#each searchResults as result, index}
          <button
            class="result-item"
            bind:this={resultEls[index]}
            onclick={() => selectResult(result)}
            onkeydown={(e) => handleResultKeydown(e, index)}
          >
            <span class="result-word">
              {result.japanese[0]?.word || result.japanese[0]?.reading}
            </span>
            <span class="result-reading">
              {result.japanese[0]?.reading}
            </span>
            <span class="result-meaning">
              {result.senses[0]?.english_definitions.slice(0, 3).join(', ')}
            </span>
            {#if result.is_common}
              <span class="tag tag--common">{t('add.common')}</span>
            {/if}
          </button>
        {/each}
      </div>
    {:else if searchedQuery && !searching && !selectedResult}
      <div class="state-message state-message--empty state-message--compact no-results">
        <p>{t('add.noResultsFor', { query: searchedQuery })}</p>
      </div>
    {/if}
  </div>

  {#if selectedResult}
    <div class="preview-section card">
      <div class="preview-header">
        <h2>{t('add.preview')}</h2>
        <Button variant="ghost" size="sm" onclick={() => selectedResult = null}>
          × {t('common.close')}
        </Button>
      </div>

      <WordPreview result={selectedResult} />

      <div class="add-form">
        <label class="deck-select" for="add-deck-select">
          <span>{t('add.targetDeck')}</span>
          <select id="add-deck-select" bind:value={selectedDeckId}>
            {#each decks as deck}
              <option value={deck.id}>{deck.name}</option>
            {/each}
          </select>
        </label>

        <Button
          variant="primary"
          size="lg"
          onclick={addWord}
          disabled={loading || !selectedDeckId}
        >
          {loading ? t('add.adding') : t('add.addToDeck')}
        </Button>
      </div>
    </div>
  {/if}

  {#if decks.length === 0}
    <div class="no-decks">
      <p>{t('add.createDeckFirst')}</p>
      <Button href="/decks/new" variant="primary">
        {t('add.createDeck')}
      </Button>
    </div>
  {/if}
</div>

<style>
  .add-page {
    max-width: 800px;
    margin: 0 auto;
  }

  h1 {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-8);
    text-align: center;
  }

  .search-section {
    margin-bottom: var(--space-8);
  }

  .search-box {
    position: relative;
  }

  .search-input {
    padding-right: var(--space-12);
  }

  /* Hide the native search clear button; we render our own. */
  .search-input::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
  }

  .search-spinner {
    position: absolute;
    right: var(--space-4);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  .search-clear {
    position: absolute;
    right: var(--space-3);
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: var(--color-washi-dark);
    color: var(--color-text-secondary);
    border-radius: var(--radius-full);
    font-size: var(--text-lg);
    line-height: 1;
    cursor: pointer;
  }

  .search-clear:hover {
    color: var(--color-text-primary);
  }

  .added-banner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
    padding: var(--space-3) var(--space-4);
    background-color: color-mix(in srgb, var(--color-success) 12%, transparent);
    border: 1px solid var(--color-success);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
  }

  .added-link {
    font-weight: 600;
    white-space: nowrap;
  }

  .no-results {
    margin-top: var(--space-4);
    text-align: center;
  }

  .search-results {
    margin-top: var(--space-2);
    background-color: var(--color-surface-elevated);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    max-height: 400px;
    overflow-y: auto;
  }

  .result-item {
    width: 100%;
    display: grid;
    grid-template-columns: auto 1fr auto;
    gap: var(--space-3);
    align-items: center;
    padding: var(--space-4);
    border: none;
    background: none;
    text-align: left;
    cursor: pointer;
    border-bottom: 1px solid var(--color-border-light);
    transition: background-color var(--transition-fast);
  }

  .result-item:last-child {
    border-bottom: none;
  }

  .result-item:hover {
    background-color: var(--color-washi-dark);
  }

  .result-word {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
  }

  .result-reading {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .result-meaning {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    grid-column: 2 / -1;
  }

  .preview-section {
    padding: var(--space-6);
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-6);
  }

  .preview-header h2 {
    font-size: var(--text-xl);
    margin: 0;
  }

  .add-form {
    margin-top: var(--space-6);
    padding-top: var(--space-6);
    border-top: 1px solid var(--color-border-light);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    align-items: center;
  }

  .deck-select {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .deck-select select {
    padding: var(--space-2) var(--space-4);
    font-size: var(--text-base);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    background-color: var(--color-surface-elevated);
  }

  .no-decks {
    text-align: center;
    padding: var(--space-12);
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
  }

  .no-decks p {
    margin-bottom: var(--space-4);
    color: var(--color-text-secondary);
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .add-page {
      padding: 0 var(--space-2);
    }

    h1 {
      font-size: var(--text-2xl);
      margin-bottom: var(--space-6);
    }

    .search-results {
      max-height: 300px;
    }

    .result-item {
      grid-template-columns: 1fr auto;
      gap: var(--space-2);
      padding: var(--space-3);
    }

    .result-word {
      font-size: var(--text-lg);
    }

    .result-reading {
      font-size: var(--text-xs);
    }

    .result-meaning {
      grid-column: 1 / -1;
      font-size: var(--text-xs);
    }

    .preview-section {
      padding: var(--space-4);
    }

    .preview-header {
      margin-bottom: var(--space-4);
    }

    .preview-header h2 {
      font-size: var(--text-lg);
    }

    .add-form {
      margin-top: var(--space-4);
      padding-top: var(--space-4);
    }

    .deck-select {
      flex-direction: column;
      align-items: stretch;
      gap: var(--space-2);
      width: 100%;
    }

    .deck-select select {
      width: 100%;
    }

    .no-decks {
      padding: var(--space-8);
    }
  }
</style>
