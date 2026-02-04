<script lang="ts">
  /**
   * JapaneseWord Component
   *
   * Reusable component for displaying Japanese words with optional furigana reading.
   * Eliminates the repeated ruby/reading pattern across components.
   *
   * DRY: Centralizes the word display logic used in FlashCard and WordPreview.
   */

  interface Props {
    /** The Japanese word (kanji or kana) */
    japanese: string;
    /** Optional hiragana reading shown as furigana */
    reading?: string;
    /** Size variant for the text */
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  }

  let { japanese, reading, size = 'md' }: Props = $props();

  // Only show furigana if reading exists and differs from the word
  const showFurigana = $derived(reading && reading !== japanese);
</script>

{#if showFurigana}
  <ruby class="japanese-word japanese-word--{size}">
    {japanese}<rt>{reading}</rt>
  </ruby>
{:else}
  <span class="japanese-word japanese-word--{size}">{japanese}</span>
{/if}

<style>
  .japanese-word {
    font-family: var(--font-serif);
    line-height: 1.4;
  }

  ruby.japanese-word {
    display: ruby;
  }

  span.japanese-word {
    display: inline-block;
  }

  .japanese-word rt {
    color: var(--color-text-secondary);
    ruby-align: center;
  }

  /* Size variants */
  .japanese-word--sm {
    font-size: var(--text-lg);
  }

  .japanese-word--sm rt {
    font-size: var(--text-xs);
  }

  .japanese-word--md {
    font-size: var(--text-xl);
  }

  .japanese-word--md rt {
    font-size: var(--text-sm);
  }

  .japanese-word--lg {
    font-size: var(--text-2xl);
  }

  .japanese-word--lg rt {
    font-size: var(--text-sm);
  }

  .japanese-word--xl {
    font-size: var(--text-3xl);
  }

  .japanese-word--xl rt {
    font-size: var(--text-base);
  }

  .japanese-word--2xl {
    font-size: var(--text-3xl);
  }

  .japanese-word--2xl rt {
    font-size: var(--text-base);
  }

  .japanese-word--3xl {
    font-size: var(--text-4xl);
  }

  .japanese-word--3xl rt {
    font-size: var(--text-base);
  }

  .japanese-word--4xl {
    font-size: var(--text-4xl);
  }

  .japanese-word--4xl rt {
    font-size: var(--text-lg);
  }

  .japanese-word--5xl {
    font-size: var(--text-5xl);
  }

  .japanese-word--5xl rt {
    font-size: var(--text-lg);
  }

  /* Mobile responsive */
  @media (max-width: 640px) {
    .japanese-word--4xl {
      font-size: var(--text-3xl);
    }

    .japanese-word--5xl {
      font-size: var(--text-4xl);
    }

    .japanese-word--4xl rt,
    .japanese-word--5xl rt {
      font-size: var(--text-base);
    }
  }

  @media (max-width: 380px) {
    .japanese-word--4xl,
    .japanese-word--5xl {
      font-size: var(--text-3xl);
    }
  }
</style>
