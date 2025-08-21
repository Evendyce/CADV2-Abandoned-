<script lang="ts">
        import { onMount } from 'svelte';
        import {
                getRenderScale as calcRenderScale,
                mmToPx as calcMmToPx,
                pxToMm as calcPxToMm,
                snapZoomToNearest10
        } from '$lib/canvas/utils';
        import { createStatsPanel } from '$lib/canvas/statsPanel';

  type CanvasState = 'draw' | 'manipulate' | 'view';
  let canvasState: CanvasState = 'draw';

        const {
                statsHeight,
                statsMinHeight,
                statsMaxHeight,
                startResize,
                handleResizeKey
        } = createStatsPanel();

	let Konva: typeof import('konva').default;
	let container: HTMLDivElement;
	let width = 0;
	let height = 0;
	let stage: any;
	let layer: any;
	let linePreview: any = null;
	let snapPreview: any = null;
	let snapActive = false;
	let snappedAngleDeg: number | null = null;
	let anchors: { x: number; y: number }[][] = [];
	let currentLine: { x: number; y: number }[] = [];
	let isDrawing = false;
	let latestMouse: { x: number; y: number } | null = null;
	let lastClickTime = 0;
	let lastClickPosition: { x: number; y: number } | null = null;
	let anchorCircles: InstanceType<any>[] = [];

	let baseScale = 0.2;
	let zoomPercent = 100;
	let ctrlPressed = false;
	let spacePressed = false;
	let showHelp = false;
	let visibleIndicators = { top: false, bottom: false, left: false, right: false };

	type AnchorAction =
		| {
				type: 'add-anchor';
				lineIndex: number;
				point: { x: number; y: number };
				startedNewLine: boolean;
		  }
		| {
				type: 'move-anchor';
				lineIndex: number;
				anchorIndex: number;
				from: { x: number; y: number };
				to: { x: number; y: number };
		  };

	let undoStack: AnchorAction[] = [];
	let redoStack: AnchorAction[] = [];

	//ANGLE SNAPPING
	const SNAP_ANGLES = [0, 45, 90, 135, 180, -45, -90, -135, -180];
	const ANGLE_THRESHOLD = 5; // degrees within which it will snap

        

        const getRenderScale = () => calcRenderScale(baseScale, zoomPercent);

        const mmToPx = (point: { x: number; y: number }) =>
                calcMmToPx(point, baseScale, zoomPercent);

        const pxToMm = (x: number, y: number) =>
                calcPxToMm(x, y, baseScale, zoomPercent);

	const getDrawingBounds = () => {
		const allPoints = anchors.flat();
		if (allPoints.length === 0) return null;
		let minX = allPoints[0].x,
			minY = allPoints[0].y,
			maxX = allPoints[0].x,
			maxY = allPoints[0].y;
		for (const pt of allPoints) {
			if (pt.x < minX) minX = pt.x;
			if (pt.x > maxX) maxX = pt.x;
			if (pt.y < minY) minY = pt.y;
			if (pt.y > maxY) maxY = pt.y;
		}
		return { minX, maxX, minY, maxY };
	};

	function updateIndicators() {
		const bounds = getDrawingBounds();
		if (!bounds || !stage || !container) return;
		const [minX, minY] = mmToPx({ x: bounds.minX, y: bounds.minY });
		const [maxX, maxY] = mmToPx({ x: bounds.maxX, y: bounds.maxY });
		const offset = stage.position();
		visibleIndicators.top = minY + offset.y < 0;
		visibleIndicators.left = minX + offset.x < 0;
		visibleIndicators.right = maxX + offset.x > width;
		visibleIndicators.bottom = maxY + offset.y > height;
	}

        // snapZoomToNearest10 imported from utils

	function zoomToFit() {
		const bounds = getDrawingBounds();
		if (!bounds || !stage || !container) return;
		width = container.clientWidth;
		height = container.clientHeight;
		const margin = 20;
		const contentWidthMm = bounds.maxX - bounds.minX;
		const contentHeightMm = bounds.maxY - bounds.minY;
		const availableWidth = width - margin * 2;
		const availableHeight = height - margin * 2;
		const scaleX = availableWidth / (contentWidthMm * baseScale);
		const scaleY = availableHeight / (contentHeightMm * baseScale);
		const newScale = Math.min(scaleX, scaleY) * 100;
		zoomPercent = snapZoomToNearest10(newScale);
		const centerX = (bounds.minX + bounds.maxX) / 2;
		const centerY = (bounds.minY + bounds.maxY) / 2;
		const [centerPxX, centerPxY] = mmToPx({ x: centerX, y: centerY });
		stage.position({ x: width / 2 - centerPxX, y: height / 2 - centerPxY });
		redrawAll();
	}

	const redrawAll = () => {
		layer.destroyChildren();
		anchorCircles = [];

		anchors.forEach((segment, segmentIndex) => {
			const scaledPoints = segment.flatMap(mmToPx);
			const line = new Konva.Line({
				points: scaledPoints,
				stroke: 'black',
				strokeWidth: 2
			});
			layer.add(line);

			segment.forEach((point, anchorIndex) => {
				const [x, y] = mmToPx(point);
				const oldPos = anchors[segmentIndex][anchorIndex];
				const circle = new Konva.Circle({
					x,
					y,
					radius: 4,
					fill: 'blue',
					stroke: 'white',
					strokeWidth: 1,
					draggable: true
				});

				circle.on('mouseover', () => {
					document.body.style.cursor = 'pointer';
					circle.fill('orange');
					layer.draw();
				});

				circle.on('mouseout', () => {
					document.body.style.cursor = 'default';
					circle.fill('blue');
					layer.draw();
				});

				circle.on('dragstart', () => {
					circle.fill('#f97316');
					layer.draw();
				});

				circle.on('dragend', () => {
					const newPos = pxToMm(circle.x(), circle.y());

					redoStack = [];
					undoStack.push({
						type: 'move-anchor',
						lineIndex: segmentIndex,
						anchorIndex,
						from: oldPos,
						to: newPos
					});

					circle.fill('blue');
					layer.draw();
				});

				circle.on('dragmove', () => {
					const newPos = pxToMm(circle.x(), circle.y());
					anchors[segmentIndex][anchorIndex] = newPos;

					// Only redraw the line, NOT everything
					const updatedPoints = anchors[segmentIndex].flatMap(mmToPx);
					line.points(updatedPoints);
					layer.batchDraw();
				});

				anchorCircles.push(circle);
				layer.add(circle);
			});
		});

		if (linePreview) layer.add(linePreview);
		if (snapPreview) layer.add(snapPreview);
		layer.draw();
		updateIndicators();
	};

	function zoomIn() {
		zoomPercent = Math.min(zoomPercent + 10, 500);
		redrawAll();
	}

	function zoomOut() {
		zoomPercent = Math.max(zoomPercent - 10, 10);
		redrawAll();
	}

	function resetZoom() {
		zoomPercent = 100;
		redrawAll();
	}

	function undo() {
		const action = undoStack.pop();
		if (!action) return;

		if (action.type === 'add-anchor') {
			const line = anchors[action.lineIndex] || [];

			// Remove anchor
			line.pop();

			// If line is now empty and it started the line, remove it
			if (action.startedNewLine || line.length === 0) {
				anchors.splice(action.lineIndex, 1);
			}

			redoStack.push(action);
			redrawAll();
		} else if (action.type === 'move-anchor') {
			anchors[action.lineIndex][action.anchorIndex] = action.from;
			redoStack.push(action);
			redrawAll();
		}
	}

	function redo() {
		const action = redoStack.pop();
		if (!action) return;

		if (action.type === 'add-anchor') {
			if (action.startedNewLine || !anchors[action.lineIndex]) {
				anchors.splice(action.lineIndex, 0, [action.point]);
			} else {
				anchors[action.lineIndex].push(action.point);
			}

			undoStack.push(action);
			redrawAll();
		} else if (action.type === 'move-anchor') {
			anchors[action.lineIndex][action.anchorIndex] = action.to;
			undoStack.push(action);
			redrawAll();
		}
	}

	function getAngleDegrees(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
		const dx = p2.x - p1.x;
		const dy = p2.y - p1.y;
		return Math.atan2(dy, dx) * (180 / Math.PI);
	}

	function snapAngle(
		last: { x: number; y: number },
		current: { x: number; y: number }
	): { x: number; y: number } {
		const angle = getAngleDegrees(last, current);

		let closest = angle;
		snappedAngleDeg = null;

		for (const snap of SNAP_ANGLES) {
			if (Math.abs(angle - snap) <= ANGLE_THRESHOLD) {
				closest = snap;
				snappedAngleDeg = snap; // Store snapped angle
				break;
			}
		}

		const dist = Math.hypot(current.x - last.x, current.y - last.y);

		const rad = closest * (Math.PI / 180);
		return {
			x: last.x + dist * Math.cos(rad),
			y: last.y + dist * Math.sin(rad)
		};
	}

        onMount(() => {
                let keydownHandler: (e: KeyboardEvent) => void;
                let keyupHandler: (e: KeyboardEvent) => void;
                let resizeHandler: () => void;
                let debouncedResizeHandler: () => void;

                const init = async () => {
                        Konva = (await import('konva')).default;
                        anchorCircles = [];
                        let resizeTimeout: number;

                        debouncedResizeHandler = () => {
                                clearTimeout(resizeTimeout);
                                resizeTimeout = window.setTimeout(() => {
                                        if (container) updateSize();
                                }, 100); // delay can be adjusted
                        };

                        const updateSize = () => {
                                if (!container || !stage) return;
                                width = container.clientWidth;
                                height = container.clientHeight;
                                stage.width(width);
                                stage.height(height);
                                stage.draw();
                                updateIndicators();
                        };
                        resizeHandler = updateSize;

                        const updateSizeStabilized = () => {
                                updateSize();
                                setTimeout(updateSize, 0); // double-call after layout
                        };

                        stage = new Konva.Stage({ container, width: 0, height: 0, draggable: false });
                        updateSizeStabilized();

                        layer = new Konva.Layer();
                        stage.add(layer);

                        stage.on('mousedown', (e: any) => {
                                const target = e.target;
                                if (target && target.getClassName && target.getClassName() === 'Circle') {
                                        // It's an anchor, don't handle as drawing click
                                        return;
                                }
                                if (ctrlPressed || spacePressed) return;
                                const now = Date.now();
                                const pointer = stage.getPointerPosition();
                                if (!pointer) return;
                                const offset = stage.position();
                                const x = pointer.x - offset.x;
                                const y = pointer.y - offset.y;
                                let pos = pxToMm(x, y);

                                if (!isDrawing) {
                                        currentLine = [pos];
                                        const previewPoints = [...mmToPx(pos), ...mmToPx(pos)];
                                        linePreview = new Konva.Line({
                                                points: previewPoints,
                                                stroke: 'black',
                                                strokeWidth: 2,
                                                lineCap: 'round',
                                                lineJoin: 'round',
                                                dash: [4, 4]
                                        });
                                        isDrawing = true;
                                        lastClickTime = now;
                                        lastClickPosition = pos;
                                        layer.add(linePreview);
                                } else {
                                        const timeSinceLastClick = now - lastClickTime;
                                        const distanceFromLastClick = Math.hypot(
                                                pos.x - (lastClickPosition?.x || 0),
                                                pos.y - (lastClickPosition?.y || 0)
                                        );

                                        if (timeSinceLastClick < 300 && distanceFromLastClick < 2) {
                                                if (currentLine.length === 1 && latestMouse) {
                                                        const adjusted = pxToMm(latestMouse.x - stage.x(), latestMouse.y - stage.y());
                                                        currentLine.push(adjusted);
                                                        linePreview.points(currentLine.flatMap(mmToPx));
                                                }

                                                if (currentLine.length < 2) {
                                                        linePreview?.destroy();
                                                } else {
                                                        linePreview?.dash([]);
                                                        anchors = [...anchors, [...currentLine]];
                                                }

                                                if (snapPreview) snapPreview.destroy();
                                                snapPreview = null;
                                                snapActive = false;

                                                linePreview = null;
                                                currentLine = [];
                                                isDrawing = false;
                                                redrawAll();
                                                return;
                                        }

                                        const startedNewLine = currentLine.length === 0;

                                        if (currentLine.length > 0) {
                                                const last = currentLine[currentLine.length - 1];
                                                pos = snapAngle(last, pos); // ✨ Apply snapping!
                                        }
                                        currentLine.push(pos);

                                        linePreview.points([...currentLine.flatMap(mmToPx), ...mmToPx(pos)]);

                                        // Store as action
                                        undoStack.push({
                                                type: 'add-anchor',
                                                lineIndex: anchors.length,
                                                point: pos,
                                                startedNewLine
                                        });

                                        redoStack = []; // Clear redo history

                                        lastClickTime = now;
                                        lastClickPosition = pos;
                                        redrawAll();
                                }
                        });

                        stage.on('mousemove', (e: any) => {
                                if (!isDrawing || !linePreview) return;
                                const pointer = stage.getPointerPosition();
                                if (!pointer) return;
                                const offset = stage.position();
                                const x = pointer.x - offset.x;
                                const y = pointer.y - offset.y;
                                latestMouse = { x, y };

                                if (isDrawing) {
                                        const last =
                                                currentLine.length > 0 ? currentLine[currentLine.length - 1] : anchors.at(-1)?.at(-1);

                                        const raw = pxToMm(x, y);
                                        const snapped = last ? snapAngle(last, raw) : raw;

                                        snapActive = !!last && Math.hypot(snapped.x - raw.x, snapped.y - raw.y) > 0.01;

                                        if (!snapPreview) {
                                                snapPreview = new Konva.Line({
                                                        stroke: 'red',
                                                        strokeWidth: 1,
                                                        dash: [2, 4],
                                                        lineCap: 'round',
                                                        lineJoin: 'round'
                                                });
                                        } else {
                                                layer.add(snapPreview);
                                        }

                                        snapPreview.points(last ? [...mmToPx(last), ...mmToPx(snapped)] : []);
                                } else if (snapPreview) {
                                        snapPreview.points([]);
                                        snapActive = false;
                                }

                                const previewPoints = [...currentLine.flatMap(mmToPx), ...mmToPx(pxToMm(x, y))];
                                linePreview.points(previewPoints);
                                layer.batchDraw();
                        });

                        stage.on('wheel', (e: any) => {
                                if (!ctrlPressed) return;
                                e.evt.preventDefault();
                                zoomPercent += e.evt.deltaY < 0 ? 10 : -10;
                                zoomPercent = Math.max(10, Math.min(500, zoomPercent));
                                zoomPercent = snapZoomToNearest10(zoomPercent);
                                redrawAll();
                        });

                        stage.on('dragmove', updateIndicators);

                        keydownHandler = (e) => {
                                if (e.key === 'Control') ctrlPressed = true;
                                if (e.key === ' ' || e.code === 'Space') spacePressed = true;
                                if (e.key === '+' || e.key === '=') zoomIn();
                                if (e.key === '-') zoomOut();
                                if (e.key === '0') resetZoom();
                                if (e.key === 'f') zoomToFit();
                                const step = 10;
                                if (e.key === 'ArrowUp') stage.y(stage.y() + step);
                                if (e.key === 'ArrowDown') stage.y(stage.y() - step);
                                if (e.key === 'ArrowLeft') stage.x(stage.x() + step);
                                if (e.key === 'ArrowRight') stage.x(stage.x() - step);
                                updateIndicators();

                                if (ctrlPressed || spacePressed) {
                                        stage.draggable(true);
                                }
                        };

                        keyupHandler = (e) => {
                                if (e.key === 'Control') ctrlPressed = false;
                                if (e.key === ' ' || e.code === 'Space') spacePressed = false;
                                if (!ctrlPressed && !spacePressed) {
                                        stage.draggable(false);
                                }
                        };

                        window.addEventListener('keydown', keydownHandler);
                        window.addEventListener('keyup', keyupHandler);
                        window.addEventListener('resize', resizeHandler);
                        window.addEventListener('resize', debouncedResizeHandler);
                };

                init();

                return () => {
                        window.removeEventListener('keydown', keydownHandler);
                        window.removeEventListener('keyup', keyupHandler);
                        window.removeEventListener('resize', resizeHandler);
                        window.removeEventListener('resize', debouncedResizeHandler);
                };
        });
</script>

<!-- PAGE LAYOUT -->
<div class="relative min-h-screen bg-gray-100">
	<!-- Canvas container -->
	<div class="flex justify-center pt-12">
    <div class="absolute w-full top-2 max-w-screen-xl overflow-hidden bg-white p-5">
      <!-- Canvas Mode Label + Mode Switch Buttons (Top Right Above Zoom Controls) -->
      <div class="absolute h-[32px] top-1 right-30 z-1 bg-black text-white px-3 py-1 rounded shadow font-mono text-sm" style="align-content: center;color: black;">
        {#if canvasState === 'draw'}
          Drawing Mode – Click to place anchors
        {:else if canvasState === 'manipulate'}
          Move Mode – Drag anchors or segments
        {:else if canvasState === 'view'}
          View Mode – Zoom/Pan only
        {/if}
      </div>

      <div class="absolute top-1 right-1 z-30 flex gap-1">
        <button
          on:click={() => canvasState = 'draw'}
          class="w-8 h-8 rounded shadow font-bold text-sm transition 
                {canvasState === 'draw' ? 'bg-amber-500 text-white' : 'bg-white text-gray-700'}">1</button>
        
        <button
          on:click={() => canvasState = 'manipulate'}
          class="w-8 h-8 rounded shadow font-bold text-sm transition 
                {canvasState === 'manipulate' ? 'bg-purple-500 text-white' : 'bg-white text-gray-700'}">2</button>
        
        <button
          on:click={() => canvasState = 'view'}
          class="w-8 h-8 rounded shadow font-bold text-sm transition 
                {canvasState === 'view' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}">3</button>
      </div>
    </div>

		<!-- Immersive Tint Overlay -->
    <div class={`absolute inset-0 z-0 pointer-events-none transition-all duration-500 backdrop-blur-sm
      ${canvasState === 'draw' ? 'bg-[rgb(255,237,213)/0.3]' : ''}
      ${canvasState === 'manipulate' ? 'bg-[rgb(254,202,202)/0.3]' : ''}
      ${canvasState === 'view' ? 'bg-[rgb(191,219,254)/0.3]' : ''}
    `}></div>

    <!-- Subtle Canvas Wrapper -->
    <div class={`relative h-[85vh] w-full max-w-screen-xl overflow-hidden rounded-2xl p-4 shadow-2xl border-2 transition-all duration-500
      ${canvasState === 'draw' ? 'border-amber-400 bg-amber-50 animate-neon-wave-draw' : ''}
      ${canvasState === 'manipulate' ? 'border-purple-500 bg-purple-50 animate-neon-wave-manipulate' : ''}
      ${canvasState === 'view' ? 'border-blue-400 bg-blue-50 animate-neon-wave-view' : ''}
    `}>
			<!-- Zoom Controls (Top Right) -->
			<div class="absolute right-4 top-4 z-20 flex flex-col gap-2">
				<button on:click={zoomIn} class="rounded bg-white px-2 py-1 shadow" title="Zoom In"
					>＋</button
				>
				<button on:click={zoomOut} class="rounded bg-white px-2 py-1 shadow" title="Zoom Out"
					>－</button
				>
				<button on:click={resetZoom} class="rounded bg-white px-2 py-1 shadow" title="Reset Zoom"
					>⭯</button
				>
				<button on:click={zoomToFit} class="rounded bg-white px-2 py-1 shadow" title="Zoom to Fit"
					>⛶</button
				>
			</div>

			<!-- Help Button (Top Left) -->
			<div class="absolute left-4 top-4 z-20">
				<button on:click={() => (showHelp = !showHelp)} class="rounded bg-white px-2 py-1 shadow"
					>?</button
				>
				{#if showHelp}
					<div
						class="mt-2 max-w-sm space-y-4 rounded-xl border border-gray-300 bg-white p-4 text-sm leading-relaxed shadow-xl"
					>
						<div>
							<strong class="block text-blue-600">🖱️ Mouse</strong>
							<ul class="list-inside list-disc">
								<li>Ctrl + Scroll = Zoom</li>
								<li>Ctrl/Space + Drag = Pan</li>
							</ul>
						</div>
						<div>
							<strong class="block text-green-600">🧱 Draw Lines</strong>
							<ul class="list-inside list-disc">
								<li>Click to Start</li>
								<li>Click to Anchor</li>
								<li>Double-Click to Commit</li>
							</ul>
						</div>
						<div>
							<strong class="block text-purple-600">⌨️ Keyboard</strong>
							<ul class="list-inside list-disc">
								<li>+ / - / 0 = Zoom / Reset</li>
								<li>F = Zoom & Center to Fit</li>
							</ul>
						</div>
						<div>
							<strong class="block text-yellow-600">🧭 Canvas View</strong>
							<ul class="list-inside list-disc">
								<li>⛶ = Zoom & Center to Fit</li>
								<li>↑ / ↓ / ← / → = Offscreen Indicators</li>
								<li>↶ / ↷ = Undo & Redo</li>
							</ul>
						</div>
					</div>
				{/if}
			</div>

			<!-- Direction Indicators -->
			{#if visibleIndicators.top}
				<div
					class="animate-pulse-soft absolute left-1/2 top-2 z-30 -translate-x-1/2 text-green-500"
				>
					↑
				</div>
			{/if}
			{#if visibleIndicators.bottom}
				<div
					class="animate-pulse-soft absolute bottom-6 left-1/2 z-30 -translate-x-1/2 text-green-500"
				>
					↓
				</div>
			{/if}
			{#if visibleIndicators.left}
				<div
					class="animate-pulse-soft absolute left-2 top-1/2 z-30 -translate-y-1/2 text-green-500"
				>
					←
				</div>
			{/if}
			{#if visibleIndicators.right}
				<div
					class="animate-pulse-soft absolute right-2 top-1/2 z-30 -translate-y-1/2 text-green-500"
				>
					→
				</div>
			{/if}

      <!-- Canvas Container -->
      <div class="h-full w-full" bind:this={container}></div>
    

			{#if snapActive}
				<div
					class="absolute left-1/2 top-2 z-30 -translate-x-1/2 rounded bg-white px-2 py-1 text-xs font-semibold text-red-600 shadow"
				>
					Snapping Active 🧲
					{#if snappedAngleDeg !== null}
						({snappedAngleDeg}°)
					{/if}
				</div>
			{/if}

			<!-- Footer Info Bar -->
			<div
				class="absolute bottom-0 z-20 w-full rounded-2xl bg-white/70 p-1 text-center font-mono text-xs shadow-2xl"
			>
				{zoomPercent}% zoom &mdash; {getRenderScale().toFixed(2)}px = 1mm
			</div>

			<!-- Undo/Redo Controls (Bottom Right) -->
			<div class="absolute bottom-4 right-4 z-20 flex gap-2">
				<button on:click={undo} class="rounded bg-white px-2 py-1 shadow" title="Undo (Ctrl+Z)"
					>↶</button
				>
				<button on:click={redo} class="rounded bg-white px-2 py-1 shadow" title="Redo (Ctrl+Y)"
					>↷</button
				>
			</div>
		</div>
	</div>

	<!-- 🔽 STATS DRAWER (fixed to bottom) -->
	<div
                class="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-300 bg-white shadow-xl"
                style="height: {$statsHeight}px; min-height: {$statsHeight}px; max-height: {statsMaxHeight}px;"
	>
                <!-- Drag handle -->
                <button
                        class="resize-handle relative flex w-full select-none items-center justify-center"
                        type="button"
                        aria-label="Resize statistics panel"
                        on:mousedown={startResize}
                        on:keydown={handleResizeKey}
                >
			<div class="text-lg leading-none text-gray-400">⠿</div>

                        {#if $statsHeight === statsMinHeight}
                                <div class="absolute top-full mt-1 animate-pulse text-xs text-gray-400">
                                        <b>Click</b> and <b>Drag</b> to Expand
                                </div>
                        {/if}
                </button>

		<!-- Panel content -->
		<div class="mx-auto h-full max-w-screen-xl overflow-y-auto px-6 py-4 font-mono text-xs">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {#each anchors as segment, segIndex}
          <div class="rounded-md bg-white shadow p-3 border border-gray-200">
            <div class="space-y-1">
              <h3 class="font-semibold text-sm text-gray-600">Segment {segIndex + 1}</h3>
              <ul class="pl-4 list-disc text-xs text-gray-700">
                {#each segment.slice(1) as point, i}
                  <li>
                    Line {i + 1}: {Math.hypot(point.x - segment[i].x, point.y - segment[i].y).toFixed(2)} mm
                  </li>
                {/each}
              </ul>
            </div>
          </div>
        {/each}
      </div>
		</div>
	</div>
</div>

<style>
	div {
		background-color: #f8fafc;
	}

	@keyframes pulse-soft {
		0%,
		100% {
			opacity: 0.3;
			transform: scale(1);
		}
		50% {
			opacity: 1;
			transform: scale(1.15);
		}
	}

	.animate-pulse-soft {
		animation: pulse-soft 1.2s ease-in-out infinite;
	}

	.resize-handle {
		cursor: row-resize;
		height: 15px;
		background: #e2e8f0;
		transition: background 0.2s;
	}
	.resize-handle:hover {
		background: #94a3b8;
	}

  @keyframes neon-wave-draw {
  0%, 100% {
    box-shadow: 0 0 5px 2px rgba(251, 191, 36, 0.3);
  }
  25% {
    box-shadow: 0 0 15px 6px rgba(251, 191, 36, 0.6);
  }
  50% {
    box-shadow: 0 0 25px 10px rgba(251, 191, 36, 0.8);
  }
  75% {
    box-shadow: 0 0 15px 6px rgba(251, 191, 36, 0.6);
  }
}

@keyframes neon-wave-manipulate {
  0%, 100% {
    box-shadow: 0 0 5px 2px rgba(168, 85, 247, 0.3);
  }
  25% {
    box-shadow: 0 0 15px 6px rgba(168, 85, 247, 0.6);
  }
  50% {
    box-shadow: 0 0 25px 10px rgba(168, 85, 247, 0.8);
  }
  75% {
    box-shadow: 0 0 15px 6px rgba(168, 85, 247, 0.6);
  }
}

@keyframes neon-wave-view {
  0%, 100% {
    box-shadow: 0 0 5px 2px rgba(96, 165, 250, 0.3);
  }
  25% {
    box-shadow: 0 0 15px 6px rgba(96, 165, 250, 0.6);
  }
  50% {
    box-shadow: 0 0 25px 10px rgba(96, 165, 250, 0.8);
  }
  75% {
    box-shadow: 0 0 15px 6px rgba(96, 165, 250, 0.6);
  }
}


.animate-neon-wave-draw {
  animation: neon-wave-draw 2.5s ease-in-out infinite;
}
.animate-neon-wave-manipulate {
  animation: neon-wave-manipulate 2.5s ease-in-out infinite;
}
.animate-neon-wave-view {
  animation: neon-wave-view 2.5s ease-in-out infinite;
}

</style>
