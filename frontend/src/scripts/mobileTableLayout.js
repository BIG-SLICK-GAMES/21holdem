// Screen-space layout for the existing table artwork and HTML player seats.
export function mobileTableLayout({ width, height, canvasWidth, imageRatio }) {
    const tableWidth = Math.min(canvasWidth * .92, width - 70);
    const tableHeight = Math.min(height - 112, Math.max(tableWidth * imageRatio, 330));
    const left = (width - tableWidth) / 2;
    const top = Math.min(height * .5 + 20 - tableHeight / 2, height - 45 - tableHeight);
    const anchors = { 4: [.3, 0], 5: [.7, 0], 3: [0, .25], 6: [1, .25], 2: [0, .5], 7: [1, .5], 1: [.2, .76], 8: [.8, .76] };
    return { left, top, width: tableWidth, height: tableHeight, seats: Object.fromEntries(Object.entries(anchors).map(([seat, [x, y]]) => [seat, { x: left + x * tableWidth, y: top + y * tableHeight }])) };
}
