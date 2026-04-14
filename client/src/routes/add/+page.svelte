<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { JishoSearchResult, DeckWithStats } from '$lib/api/types';
  import { api } from '$lib/api/client';
  import Button from '$lib/components/Button.svelte';
  import WordPreview from '$lib/components/WordPreview.svelte';
  import { t } from '$lib/i18n';
  import { showError, showInfo, showSuccess } from '$lib/stores/toast.svelte';

  let searchQuery = $state('');
  let searchResults = $state<JishoSearchResult[]>([]);
  let selectedResult = $state<JishoSearchResult | null>(null);
  let decks = $state<DeckWithStats[]>([]);
  let selectedDeckId = $state<number | null>(null);
  let loading = $state(false);
  let searching = $state(false);

  let searchTimeout: ReturnType<typeof setTimeout>;

  onMount(async () => {
    try {
      decks = await api.getDecks();
      if (decks.length > 0) {
        selectedDeckId = decks[0].id;
      }
    } catch (e) {
      console.error('Failed to load decks:', e);
      showError('Failed to load decks');
    }
  });

  // Check if query contains valid characters (letters, numbers, or Japanese)
  function hasValidCharacters(query: string): boolean {
    return /[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(query);
  }

  function handleSearchInput() {
    clearTimeout(searchTimeout);
    const trimmed = searchQuery.trim();
    if (trimmed.length < 1 || !hasValidCharacters(trimmed)) {
      searchResults = [];
      return;
    }

    searchTimeout = setTimeout(async () => {
      searching = true;
      try {
        const response = await api.searchJisho(searchQuery);
        searchResults = response.data;
        if (searchResults.length === 0) {
          showInfo(t('add.noResults'));
        }
      } catch (e) {
        console.error('Search failed:', e);
        const message = e instanceof Error ? e.message : 'Search failed';
        showError(message);
      } finally {
        searching = false;
      }
    }, 300);
  }

  function selectResult(result: JishoSearchResult) {
    selectedResult = result;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && selectedResult) {
      selectedResult = null;
    }
  }

  async function addWord() {
    if (!selectedResult || !selectedDeckId) return;

    loading = true;

    try {
      const japanese = selectedResult.japanese[0]?.word || selectedResult.japanese[0]?.reading;
      await api.addWord({
        japanese,
        deckId: selectedDeckId
      });

      // Reset and show success
      selectedResult = null;
      searchQuery = '';
      searchResults = [];
      showSuccess(t('toast.wordAdded'));
      goto(`/decks/${selectedDeckId}`);
    } catch (e) {
      console.error('Failed to add word:', e);
      const message = e instanceof Error ? e.message : 'Failed to add word';
      showError(message);
    } finally {
      loading = false;
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="add-page">
  <h1>{t('add.title')}</h1>

  <div class="search-section">
    <div class="search-box">
      <input
        type="text"
        placeholder={t('add.searchPlaceholder')}
        bind:value={searchQuery}
        oninput={handleSearchInput}
        class="input input--lg search-input"
      />
      {#if searching}
        <span class="search-spinner">{t('add.searching')}</span>
      {/if}
    </div>

    {#if searchResults.length > 0 && !selectedResult}
      <div class="search-results">
        {#each searchResults as result}
          <button
            class="result-item"
            onclick={() => selectResult(result)}
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
        <label class="deck-select">
          <span>{t('add.targetDeck')}</span>
          <select bind:value={selectedDeckId}>
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

  .search-spinner {
    position: absolute;
    right: var(--space-4);
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
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
