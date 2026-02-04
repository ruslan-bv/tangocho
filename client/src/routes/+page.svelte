<script lang="ts">
  import { onMount } from 'svelte';
  import type { DeckWithStats } from '$lib/api/types';
  import { api } from '$lib/api/client';
  import DeckCard from '$lib/components/DeckCard.svelte';
  import Button from '$lib/components/Button.svelte';
  import { t } from '$lib/i18n';
  import { showError } from '$lib/stores/toast.svelte';

  let decks = $state<DeckWithStats[]>([]);
  let loading = $state(true);
  let dueCount = $state(0);

  onMount(async () => {
    try {
      const [decksData, statsData] = await Promise.all([
        api.getDecks(),
        api.getStudyStats()
      ]);
      decks = decksData;
      dueCount = statsData.totalDue;
    } catch (error) {
      console.error('Failed to load data:', error);
      showError(t('common.loadFailed'));
    } finally {
      loading = false;
    }
  });
</script>

<div class="home">
  <section class="hero">
    <h1>{t('home.welcome')}</h1>
    <p class="subtitle">{t('home.subtitle')}</p>

    {#if dueCount > 0}
      <div class="due-notice">
        <span class="due-count">{dueCount}</span>
        <span class="due-text">{t('home.dueCards', { count: dueCount }).replace(String(dueCount), '')}</span>
      </div>
      <Button href="/study" variant="primary" size="lg">
        {t('home.startStudy')}
      </Button>
    {:else}
      <Button href="/add" variant="primary" size="lg">
        {t('home.addNewWord')}
      </Button>
    {/if}
  </section>

  <section class="decks-section">
    <div class="section-header">
      <h2>{t('home.decks')}</h2>
      <Button href="/decks/new" variant="ghost" size="sm">
        {t('common.createNew')}
      </Button>
    </div>

    {#if loading}
      <div class="loading">{t('common.loading')}</div>
    {:else if decks.length === 0}
      <div class="empty-state">
        <p>{t('home.noDecks')}</p>
        <Button href="/decks/new" variant="secondary">
          {t('home.createFirst')}
        </Button>
      </div>
    {:else}
      <div class="decks-grid">
        {#each decks as deck}
          <DeckCard {deck} />
        {/each}
      </div>
    {/if}
  </section>
</div>

<style>
  .home {
    display: flex;
    flex-direction: column;
    gap: var(--space-12);
  }

  .hero {
    text-align: center;
    padding: var(--space-12) 0;
  }

  .hero h1 {
    font-size: var(--text-5xl);
    margin-bottom: var(--space-4);
  }

  .subtitle {
    font-size: var(--text-lg);
    color: var(--color-text-secondary);
    margin-bottom: var(--space-8);
  }

  .due-notice {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
  }

  .due-count {
    font-family: var(--font-serif);
    font-size: var(--text-4xl);
    color: var(--color-accent);
  }

  .due-text {
    color: var(--color-text-secondary);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-6);
  }

  .section-header h2 {
    font-size: var(--text-2xl);
  }

  .decks-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  .loading, .empty-state {
    text-align: center;
    padding: var(--space-12);
    color: var(--color-text-muted);
  }

  .empty-state {
    background-color: var(--color-surface);
    border-radius: var(--radius-lg);
    border: 1px dashed var(--color-border);
  }

  .empty-state p {
    margin-bottom: var(--space-4);
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .home {
      gap: var(--space-8);
    }

    .hero {
      padding: var(--space-8) var(--space-4);
    }

    .hero h1 {
      font-size: var(--text-3xl);
    }

    .subtitle {
      font-size: var(--text-base);
      margin-bottom: var(--space-6);
    }

    .due-count {
      font-size: var(--text-3xl);
    }

    .section-header {
      margin-bottom: var(--space-4);
    }

    .section-header h2 {
      font-size: var(--text-xl);
    }

    .decks-grid {
      grid-template-columns: 1fr;
      gap: var(--space-3);
    }

    .loading, .empty-state {
      padding: var(--space-8);
    }
  }
</style>
