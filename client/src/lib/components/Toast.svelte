<script lang="ts">
  import { getToasts, removeToast } from '$lib/stores/toast.svelte';

  const toasts = $derived(getToasts());
</script>

<div class="toast-container">
  {#each toasts as toast (toast.id)}
    <div class="toast {toast.type}" role="alert">
      <span class="toast-message">{toast.message}</span>
      <button
        class="toast-close"
        onclick={() => removeToast(toast.id)}
        aria-label="Close"
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
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    animation: slideIn 0.3s ease-out, fadeOut 0.5s ease-in 2.5s forwards;
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
    background: none;
    border: none;
    color: inherit;
    font-size: var(--text-lg);
    cursor: pointer;
    opacity: 0.8;
    padding: 0;
    line-height: 1;
  }

  .toast-close:hover {
    opacity: 1;
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

  @keyframes fadeOut {
    from {
      opacity: 1;
    }
    to {
      opacity: 0;
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
