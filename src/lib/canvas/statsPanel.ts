import { writable } from 'svelte/store';

export function createStatsPanel(minHeight = 50, initialHeight = 50, maxHeight = 650) {
	const statsMinHeight = minHeight;
	const statsMaxHeight = maxHeight;
	const statsHeight = writable(initialHeight);
	let isResizing = false;

	function startResize() {
		isResizing = true;
		window.addEventListener('mousemove', resizePanel);
		window.addEventListener('mouseup', stopResize);
	}

	function resizePanel(e: MouseEvent) {
		if (!isResizing) return;
		const newHeight = window.innerHeight - e.clientY;
		statsHeight.set(Math.min(Math.max(newHeight, statsMinHeight), statsMaxHeight));
	}

	function stopResize() {
		isResizing = false;
		window.removeEventListener('mousemove', resizePanel);
		window.removeEventListener('mouseup', stopResize);
	}

	function handleResizeKey(e: KeyboardEvent) {
		if (e.key === 'ArrowUp') {
			statsHeight.update((h) => Math.min(h + 10, statsMaxHeight));
		}
		if (e.key === 'ArrowDown') {
			statsHeight.update((h) => Math.max(h - 10, statsMinHeight));
		}
	}

	return { statsHeight, statsMinHeight, statsMaxHeight, startResize, handleResizeKey };
}

export type StatsPanel = ReturnType<typeof createStatsPanel>;
