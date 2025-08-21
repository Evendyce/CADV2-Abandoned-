<script lang="ts">
  import { onMount } from 'svelte';
  export let data: { message: string };
  const canvasSupported =
    typeof document !== 'undefined' && !!document.createElement('canvas').getContext;

  let DrawingCanvas: typeof import('$lib/components/DrawingCanvas.svelte').default | null = null;

  onMount(async () => {
    if (canvasSupported) {
      const module = await import('$lib/components/DrawingCanvas.svelte');
      DrawingCanvas = module.default;
    }
  });
</script>

{#if canvasSupported}
  {#if DrawingCanvas}
    <svelte:component this={DrawingCanvas} />
  {:else}
    <p>Loading...</p>
  {/if}
{:else}
  <p>{data.message}</p>
{/if}

<!-- <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4">
  <div class="bg-white rounded-2xl shadow-xl p-4 w-full max-w-screen-xl h-[90vh]">
  </div>
</div> -->

