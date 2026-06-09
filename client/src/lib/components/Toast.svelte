<script lang="ts">
  import { fade } from 'svelte/transition';
  import { getToasts, removeToast, clearTimer, scheduleRemoval } from '$lib/stores/toast.svelte';
  import type { Toast } from '$lib/stores/toast.svelte';
  import { t } from '$lib/i18n';

  const toasts = $derived(getToasts());

  // Pause the auto-dismiss countdown while the user is reading/interacting.
  function pause(toast: Toast) {
    clearTimer(toast.id);
  }

  function resume(toast: Toast) {
    if (toast.duration > 0) scheduleRemoval(toast.id, toast.duration);
  }
</script>

<!-- One persistent live region: success/info announce politely; errors carry
     role="alert" so they interrupt and aren't auto-dismissed before being read. -->
<div class="toast-container" aria-live="polite" aria-relevant="additions">
  {#each toasts as toast (toast.id)}
    <div
      class="toast {toast.type}"
      role={toast.type === 'error' ? 'alert' : 'status'}
      onmouseenter={() => pause(toast)}
      onmouseleave={() => resume(toast)}
      onfocusin={() => pause(toast)}
      onfocusout={() => resume(toast)}
      out:fade={{ duration: 200 }}
    >
      <span class="toast-message">{toast.message}</span>
      <button
        class="toast-close"
        onclick={() => removeToast(toast.id)}
        aria-label={t('common.close')}
      >
        ×
      </button>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: var(--space-4);
    right: var(--space-4);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    max-width: 400px;
  }

  .toast {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    animation: slideIn 0.3s ease-out;
  }

  .toast.error {
    background-color: var(--color-error);
    color: white;
  }

  .toast.success {
    background-color: var(--color-matcha);
    color: white;
  }

  .toast.info {
    background-color: var(--color-accent);
    color: white;
  }

  .toast-message {
    flex: 1;
    font-size: var(--text-sm);
    line-height: 1.4;
  }

  .toast-close {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    margin: calc(var(--space-1) * -1) calc(var(--space-2) * -1) calc(var(--space-1) * -1) 0;
    background: none;
    border: none;
    border-radius: var(--radius-sm);
    color: inherit;
    font-size: var(--text-lg);
    cursor: pointer;
    opacity: 0.8;
    line-height: 1;
  }

  .toast-close:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.15);
  }

  .toast-close:focus-visible {
    outline: 2px solid #fff;
    outline-offset: 1px;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  /* Mobile styles */
  @media (max-width: 640px) {
    .toast-container {
      top: var(--space-3);
      right: var(--space-3);
      left: var(--space-3);
      max-width: none;
    }

    .toast {
      padding: var(--space-2) var(--space-3);
    }

    .toast-message {
      font-size: var(--text-xs);
    }
  }
</style>
