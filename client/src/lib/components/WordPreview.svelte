<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { JishoSearchResult, SentenceExample } from '$lib/api/types';
  import { api } from '$lib/api/client';
  import { t } from '$lib/i18n';
  import { showError } from '$lib/stores/toast.svelte';
  import JapaneseWord from './JapaneseWord.svelte';

  interface Props {
    result: JishoSearchResult;
  }

  let { result }: Props = $props();

  const word = $derived(result.japanese[0]?.word || result.japanese[0]?.reading);
  const reading = $derived(result.japanese[0]?.reading);

  let examples = $state<SentenceExample[]>([]);
  let loadingExamples = $state(false);
  let currentAudio = $state<HTMLAudioElement | null>(null);
  let playingIndex = $state<number | null>(null);

  onMount(() => {
    loadExamples();
  });

  onDestroy(() => {
    // Clean up audio on component destroy to prevent memory leaks
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio = null;
    }
  });

  async function loadExamples() {
    if (!word) return;

    loadingExamples = true;

    try {
      const response = await api.searchSentences(word, 5);
      examples = response.sentences || [];
    } catch (e) {
      console.error('Failed to load examples:', e);
      const message = e instanceof Error ? e.message : 'Failed to load examples';
      showError(message);
    } finally {
      loadingExamples = false;
    }
  }

  function stopAudio() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = ''; // Release resources
      currentAudio = null;
    }
    playingIndex = null;
  }

  function playAudio(example: SentenceExample, index: number) {
    stopAudio();

    if (playingIndex === index || !example.audioUrl) {
      return;
    }

    const audio = new Audio(example.audioUrl);
    audio.onended = stopAudio;
    audio.onerror = stopAudio;
    audio.play();
    currentAudio = audio;
    playingIndex = index;
  }

  function formatSource(source: string): string {
    return source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
</script>

<div class="word-preview">
  <div class="word-header">
    <div class="word-main">
      <JapaneseWord
        japanese={word || ''}
        reading={reading}
        size="4xl"
      />
    </div>

    <div class="word-tags">
      {#if result.is_common}
        <span class="tag tag--common">{t('wordPreview.common')}</span>
      {/if}
      {#each result.jlpt as level}
        <span class="tag tag--jlpt">{level.toUpperCase()}</span>
      {/each}
    </div>
  </div>

  <div class="meanings">
    <h4 class="section-label section-label--lg">{t('wordPreview.meanings')}</h4>
    <ol class="meanings-list">
      {#each result.senses as sense}
        <li class="meaning-item">
          {#if sense.parts_of_speech.length > 0}
            <span class="pos">
              {sense.parts_of_speech.join(', ')}
            </span>
          {/if}
          <span class="definition">
            {sense.english_definitions.join('; ')}
          </span>
          {#if sense.info.length > 0}
            <span class="info">
              ({sense.info.join(', ')})
            </span>
          {/if}
        </li>
      {/each}
    </ol>
  </div>

  {#if result.japanese.length > 1}
    <div class="other-forms">
      <h4 class="section-label section-label--lg">{t('wordPreview.otherForms')}</h4>
      <div class="forms-list">
        {#each result.japanese.slice(1) as form}
          <span class="form">
            {form.word || form.reading}
            {#if form.word && form.word !== form.reading}
              【{form.reading}】
            {/if}
          </span>
        {/each}
      </div>
    </div>
  {/if}

  <div class="examples-section">
    <h4 class="section-label section-label--lg">{t('wordPreview.examples')}</h4>

    {#if loadingExamples}
      <p class="examples-loading">{t('wordPreview.loadingExamples')}</p>
    {:else if examples.length === 0}
      <p class="examples-empty">{t('wordPreview.noExamples')}</p>
    {:else}
      <div class="examples-list">
        {#each examples as example, index}
          <div class="example-item">
            <div class="example-content">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -- Trusted source: Tatoeba/Immersion Kit API -->
              <p class="example-japanese">{@html example.furigana || example.japanese}</p>
              <p class="example-translation">{example.english}</p>
              <span class="example-source">{formatSource(example.source)}</span>
            </div>
            {#if example.audioUrl}
              <button
                class="audio-btn"
                class:playing={playingIndex === index}
                onclick={() => playAudio(example, index)}
                aria-label={playingIndex === index ? 'Stop' : 'Play'}
              >
                {playingIndex === index ? '■' : '▶'}
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .word-preview {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .word-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .word-main {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
  }

  .example-japanese :global(ruby) {
    ruby-align: center;
  }

  .example-japanese :global(rt) {
    font-size: 0.6em;
    color: var(--color-text-secondary);
  }

  .word-tags {
    display: flex;
    gap: var(--space-2);
  }

  .meanings-list {
    list-style-position: inside;
    padding: 0;
  }

  .meaning-item {
    margin-bottom: var(--space-3);
    line-height: 1.6;
  }

  .pos {
    display: inline-block;
    font-size: var(--text-xs);
    color: var(--color-accent);
    font-style: italic;
    margin-right: var(--space-2);
  }

  .definition {
    color: var(--color-text-primary);
  }

  .info {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    font-style: italic;
  }

  .forms-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .form {
    font-size: var(--text-base);
    padding: var(--space-2) var(--space-3);
    background-color: var(--color-washi-dark);
    border-radius: var(--radius-md);
  }

  /* Example sentences styles */
  .examples-section {
    border-top: 1px solid var(--color-border-light);
    padding-top: var(--space-6);
  }

  .examples-loading,
  .examples-empty {
    font-size: var(--text-sm);
    color: var(--color-text-muted);
  }

  .examples-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .example-item {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-3);
    background-color: var(--color-washi-dark);
    border-radius: var(--radius-md);
    align-items: flex-start;
  }

  .example-content {
    flex: 1;
    min-width: 0;
  }

  .example-japanese {
    font-family: var(--font-serif);
    font-size: var(--text-base);
    line-height: 1.8;
    margin-bottom: var(--space-1);
  }

  .example-translation {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    line-height: 1.5;
    margin-bottom: var(--space-1);
  }

  .example-source {
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }

  .audio-btn {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: var(--radius-full);
    background-color: var(--color-accent);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    transition: background-color var(--transition-fast);
  }

  .audio-btn:hover {
    background-color: var(--color-accent-hover);
  }

  .audio-btn.playing {
    background-color: var(--color-shu);
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .word-preview {
      gap: var(--space-4);
    }

    .word-header {
      flex-direction: column;
      gap: var(--space-2);
    }

    .word-tags {
      justify-content: flex-start;
    }

    .meaning-item {
      margin-bottom: var(--space-2);
      line-height: 1.5;
    }

    .pos {
      display: block;
      margin-bottom: var(--space-1);
    }

    .forms-list {
      gap: var(--space-2);
    }

    .form {
      font-size: var(--text-sm);
      padding: var(--space-1) var(--space-2);
    }

    .examples-section {
      padding-top: var(--space-4);
    }

    .example-item {
      padding: var(--space-2);
    }

    .example-japanese {
      font-size: var(--text-sm);
      line-height: 1.6;
    }

    .example-translation {
      font-size: var(--text-xs);
    }

    .audio-btn {
      width: 28px;
      height: 28px;
      font-size: 10px;
    }
  }
</style>
