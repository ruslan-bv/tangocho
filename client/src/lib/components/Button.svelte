<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    onclick?: (e: MouseEvent) => void;
    children: Snippet;
  }

  let {
    variant = 'secondary',
    size = 'md',
    href,
    disabled = false,
    type = 'button',
    onclick,
    children
  }: Props = $props();
</script>

{#if href}
  <a {href} class="button {variant} {size}" class:disabled>
    {@render children()}
  </a>
{:else}
  <button
    {type}
    {disabled}
    class="button {variant} {size}"
    onclick={onclick}
  >
    {@render children()}
  </button>
{/if}

<style>
  .button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-sans);
    font-weight: 500;
    text-decoration: none;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .button:disabled,
  .button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Sizes */
  .sm {
    font-size: var(--text-sm);
    padding: var(--space-1) var(--space-3);
  }

  .md {
    font-size: var(--text-base);
    padding: var(--space-2) var(--space-4);
  }

  .lg {
    font-size: var(--text-lg);
    padding: var(--space-3) var(--space-6);
  }

  /* Variants */
  .primary {
    background-color: var(--color-accent);
    color: white;
    border-color: var(--color-accent);
  }

  .primary:hover:not(:disabled) {
    background-color: var(--color-accent-hover);
    border-color: var(--color-accent-hover);
  }

  .secondary {
    background-color: var(--color-surface-elevated);
    color: var(--color-text-primary);
    border-color: var(--color-border);
  }

  .secondary:hover:not(:disabled) {
    background-color: var(--color-washi-dark);
  }

  .ghost {
    background-color: transparent;
    color: var(--color-accent);
  }

  .ghost:hover:not(:disabled) {
    background-color: var(--color-washi-dark);
  }

  .danger {
    background-color: var(--color-error);
    color: white;
    border-color: var(--color-error);
  }

  .danger:hover:not(:disabled) {
    background-color: var(--color-shu-light);
    border-color: var(--color-shu-light);
  }
</style>
