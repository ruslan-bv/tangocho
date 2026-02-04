/**
 * useAsyncData - Svelte 5 utility for async data loading
 *
 * Provides a standardized pattern for:
 * - Loading state management
 * - Error handling
 * - Data fetching with automatic loading state
 *
 * DRY: Reduces repeated try-catch-finally patterns in page components.
 */

/**
 * Creates reactive state for async data loading.
 *
 * @param fetcher - Async function that returns data
 * @param initial - Initial value before data is loaded
 * @returns Object with reactive data, loading, error states and load/reload functions
 *
 * @example
 * ```typescript
 * const decks = useAsyncData(() => api.getDecks(), []);
 *
 * onMount(() => {
 *   decks.load();
 * });
 *
 * // In template:
 * // {#if decks.loading} Loading... {/if}
 * // {#each decks.data as deck} ... {/each}
 * ```
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, initial: T) {
  let data = $state(initial);
  let loading = $state(true);
  let error = $state<Error | null>(null);

  async function load() {
    loading = true;
    error = null;
    try {
      data = await fetcher();
    } catch (e) {
      error = e instanceof Error ? e : new Error('Failed to load data');
      console.error('useAsyncData error:', e);
    } finally {
      loading = false;
    }
  }

  return {
    get data() { return data; },
    set data(value: T) { data = value; },
    get loading() { return loading; },
    get error() { return error; },
    load,
    reload: load,
  };
}

/**
 * Creates reactive state for multiple async data fetches.
 * All fetchers run in parallel.
 *
 * @param fetchers - Object mapping keys to fetcher functions
 * @param initial - Object mapping keys to initial values
 * @returns Object with reactive data for each key, plus loading and error states
 *
 * @example
 * ```typescript
 * const state = useMultiAsyncData(
 *   {
 *     decks: () => api.getDecks(),
 *     stats: () => api.getStudyStats()
 *   },
 *   { decks: [], stats: null }
 * );
 *
 * onMount(() => state.load());
 * ```
 */
export function useMultiAsyncData<T extends Record<string, unknown>>(
  fetchers: { [K in keyof T]: () => Promise<T[K]> },
  initial: T
) {
  const data = $state({ ...initial });
  let loading = $state(true);
  let error = $state<Error | null>(null);

  async function load() {
    loading = true;
    error = null;

    try {
      const keys = Object.keys(fetchers) as (keyof T)[];
      const promises = keys.map(key => fetchers[key]());
      const results = await Promise.all(promises);

      keys.forEach((key, index) => {
        (data as T)[key] = results[index];
      });
    } catch (e) {
      error = e instanceof Error ? e : new Error('Failed to load data');
      console.error('useMultiAsyncData error:', e);
    } finally {
      loading = false;
    }
  }

  return {
    data,
    get loading() { return loading; },
    get error() { return error; },
    load,
    reload: load,
  };
}
