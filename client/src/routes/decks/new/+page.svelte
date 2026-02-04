<script lang="ts">
  import { goto } from '$app/navigation';
  import { api } from '$lib/api/client';
  import Button from '$lib/components/Button.svelte';
  import { t } from '$lib/i18n';
  import { showSuccess } from '$lib/stores/toast.svelte';

  let name = $state('');
  let description = $state('');
  let loading = $state(false);
  let error = $state<string | null>(null);

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!name.trim()) {
      error = t('decks.nameRequired');
      return;
    }

    loading = true;
    error = null;

    try {
      const deck = await api.createDeck({
        name: name.trim(),
        description: description.trim() || undefined
      });
      showSuccess(t('toast.deckCreated'));
      goto(`/decks/${deck.id}`);
    } catch (e) {
      error = e instanceof Error ? e.message : t('decks.createFailed');
    } finally {
      loading = false;
    }
  }
</script>

<div class="new-deck-page">
  <h1>{t('decks.createTitle')}</h1>

  <form onsubmit={handleSubmit} class="deck-form card">
    <div class="form-field">
      <label for="name">{t('decks.nameLabel')} <span class="required">*</span></label>
      <input
        id="name"
        type="text"
        bind:value={name}
        placeholder={t('decks.namePlaceholder')}
        class="input"
      />
    </div>

    <div class="form-field">
      <label for="description">{t('decks.descLabel')}</label>
      <textarea
        id="description"
        bind:value={description}
        placeholder={t('decks.descPlaceholder')}
        rows="3"
        class="input"
      ></textarea>
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <div class="form-actions">
      <Button href="/decks" variant="ghost">
        {t('common.cancel')}
      </Button>
      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? t('common.creating') : t('common.create')}
      </Button>
    </div>
  </form>
</div>

<style>
  .new-deck-page {
    max-width: 500px;
    margin: 0 auto;
  }

  h1 {
    font-size: var(--text-3xl);
    margin-bottom: var(--space-8);
    text-align: center;
  }

  .deck-form {
    padding: var(--space-6);
  }

  .form-field {
    margin-bottom: var(--space-5);
  }

  label {
    display: block;
    font-size: var(--text-sm);
    font-weight: 500;
    margin-bottom: var(--space-2);
  }

  .required {
    color: var(--color-error);
  }

  .error {
    color: var(--color-error);
    font-size: var(--text-sm);
    margin-bottom: var(--space-4);
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding-top: var(--space-4);
    border-top: 1px solid var(--color-border-light);
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .new-deck-page {
      padding: 0 var(--space-2);
    }

    h1 {
      font-size: var(--text-2xl);
      margin-bottom: var(--space-6);
    }

    .deck-form {
      padding: var(--space-4);
    }

    .form-actions {
      flex-direction: column-reverse;
    }

    .form-actions :global(a),
    .form-actions :global(button) {
      width: 100%;
      justify-content: center;
    }
  }
</style>
