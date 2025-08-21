export const getRenderScale = (baseScale: number, zoomPercent: number) =>
	baseScale * (zoomPercent / 100);

export const mmToPx = (
	point: { x: number; y: number },
	baseScale: number,
	zoomPercent: number
): [number, number] => {
	const s = getRenderScale(baseScale, zoomPercent);
	return [point.x * s, point.y * s];
};

export const pxToMm = (
	x: number,
	y: number,
	baseScale: number,
	zoomPercent: number
): { x: number; y: number } => {
	const s = getRenderScale(baseScale, zoomPercent);
	return { x: x / s, y: y / s };
};

export const snapZoomToNearest10 = (percent: number) => Math.max(10, Math.round(percent / 10) * 10);
