<script lang="ts">
  import DrawingCanvas from '$lib/components/DrawingCanvas.svelte';
  export let data: { message: string };
  const canvasSupported =
    typeof document !== 'undefined' && !!document.createElement('canvas').getContext;
</script>

{#if canvasSupported}
  <DrawingCanvas />
{:else}
  <p>{data.message}</p>
{/if}

<!-- <div class="flex items-center justify-center min-h-screen bg-gray-100 p-4">
  <div class="bg-white rounded-2xl shadow-xl p-4 w-full max-w-screen-xl h-[90vh]">
  </div>
</div> -->

