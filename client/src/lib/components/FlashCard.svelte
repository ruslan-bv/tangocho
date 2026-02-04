<script lang="ts">
  import type { CardWithWord } from '$lib/api/types';
  import { t } from '$lib/i18n';
  import JapaneseWord from './JapaneseWord.svelte';

  interface Props {
    card: CardWithWord;
    showAnswer: boolean;
  }

  let { card, showAnswer }: Props = $props();

  const word = $derived(card.word);
  const jlptLevels = $derived(word.jishoData?.jlpt || []);
  const isCommon = $derived(word.jishoData?.isCommon || false);
</script>

<div class="flash-card card" class:revealed={showAnswer}>
  <div class="card-front">
    <div class="word-display">
      <JapaneseWord
        japanese={word.japanese}
        reading={word.reading}
        size="5xl"
      />

      <div class="word-tags">
        {#if isCommon}
          <span class="tag tag--common">{t('wordPreview.common')}</span>
        {/if}
        {#each jlptLevels as level}
          <span class="tag tag--jlpt">{level.toUpperCase()}</span>
        {/each}
      </div>
    </div>
  </div>

  {#if showAnswer}
    <div class="card-back">
      <div class="divider"></div>

      <div class="meanings">
        <h4 class="section-label">{t('flashcard.meanings')}</h4>
        <ol>
          {#each word.meanings as meaning}
            <li>{meaning}</li>
          {/each}
        </ol>
      </div>

      {#if word.partsOfSpeech.length > 0}
        <div class="pos">
          {word.partsOfSpeech.join(' · ')}
        </div>
      {/if}

      {#if word.sentences.length > 0}
        <div class="sentences">
          <h4 class="section-label">{t('flashcard.examples')}</h4>
          {#each word.sentences.slice(0, 2) as sentence}
            <div class="sentence">
              <!-- eslint-disable-next-line svelte/no-at-html-tags -- Trusted source: Immersion Kit API -->
              <p class="sentence-jp">{@html sentence.furigana || sentence.japanese}</p>
              <p class="sentence-en">{sentence.english}</p>
            </div>
          {/each}
        </div>
      {/if}

      {#if word.kanji.length > 0}
        <div class="kanji-section">
          <h4 class="section-label">{t('flashcard.kanji')}</h4>
          <div class="kanji-list">
            {#each word.kanji as k}
              <div class="kanji-item">
                <span class="kanji-char">{k.character}</span>
                {#if k.jlptLevel}
                  <span class="kanji-jlpt">{k.jlptLevel}</span>
                {/if}
                <span class="kanji-meaning">{k.meanings.slice(0, 3).join(', ')}</span>
                <div class="kanji-readings">
                  {#if k.readings.onyomi.length > 0}
                    <span class="reading on">{k.readings.onyomi.slice(0, 2).join('、')}</span>
                  {/if}
                  {#if k.readings.kunyomi.length > 0}
                    <span class="reading kun">{k.readings.kunyomi.slice(0, 2).join('、')}</span>
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
    </div>
  {/if}
</div>

<style>
  .flash-card {
    padding: var(--space-8);
    min-height: 300px;
    display: flex;
    flex-direction: column;
  }

  .card-front {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .word-display {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .word-tags {
    display: flex;
    justify-content: center;
    gap: var(--space-2);
    margin-top: var(--space-3);
  }

  .sentence-jp :global(ruby) {
    ruby-align: center;
  }

  .sentence-jp :global(rt) {
    font-size: 0.6em;
    color: var(--color-text-secondary);
  }

  .card-back {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .divider {
    height: 1px;
    background: linear-gradient(
      to right,
      transparent,
      var(--color-border) 20%,
      var(--color-border) 80%,
      transparent
    );
    margin: var(--space-4) 0;
  }

  .meanings ol {
    list-style-position: inside;
    padding: 0;
  }

  .meanings li {
    margin-bottom: var(--space-1);
    font-size: var(--text-lg);
  }

  .pos {
    font-size: var(--text-sm);
    color: var(--color-accent);
    font-style: italic;
  }

  .sentences {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .sentence {
    padding: var(--space-3);
    background-color: var(--color-washi);
    border-radius: var(--radius-md);
  }

  .sentence-jp {
    font-size: var(--text-base);
    margin-bottom: var(--space-1);
  }

  .sentence-en {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
  }

  .kanji-section {
    width: 100%;
  }

  .kanji-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    width: 100%;
  }

  .kanji-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-3);
    background-color: var(--color-washi);
    border-radius: var(--radius-md);
    width: 120px;
    gap: var(--space-1);
  }

  .kanji-char {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
  }

  .kanji-jlpt {
    font-size: var(--text-xs);
    background-color: var(--color-accent);
    color: white;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
  }

  .kanji-meaning {
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    text-align: center;
  }

  .kanji-readings {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .reading {
    font-size: var(--text-xs);
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
    .flash-card {
      padding: var(--space-4);
      min-height: 200px;
    }

    .card-back {
      gap: var(--space-4);
    }

    .divider {
      margin: var(--space-2) 0;
    }

    .meanings li {
      font-size: var(--text-base);
    }

    .sentence {
      padding: var(--space-2);
    }

    .sentence-jp {
      font-size: var(--text-sm);
    }

    .sentence-en {
      font-size: var(--text-xs);
    }

    .kanji-list {
      justify-content: center;
      gap: var(--space-2);
    }

    .kanji-item {
      width: 100px;
      padding: var(--space-2);
    }

    .kanji-char {
      font-size: var(--text-2xl);
    }
  }

  @media (max-width: 380px) {
    .kanji-item {
      width: 90px;
    }
  }
</style>
