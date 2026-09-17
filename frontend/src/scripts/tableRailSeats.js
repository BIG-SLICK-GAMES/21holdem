// Avatar centres on the rail of the existing perspective table artwork.
// The lower quarter of the image is the pedestal, not a seating surface.
const RAIL_ANCHORS = {
    4: [.26, .055], 5: [.74, .055],
    3: [.12, .27], 6: [.88, .27],
    2: [.035, .49], 7: [.965, .49],
    1: [.20, .70], 8: [.80, .70],
};

export function tableRailSeats({ bounds, canvas, area, gameSize }) {
    const scaleX = canvas.width / gameSize.width;
    const scaleY = canvas.height / gameSize.height;
    return Object.fromEntries(Object.entries(RAIL_ANCHORS).map(([seat, [x, y]]) => [seat, {
        x: canvas.x - area.x + (bounds.x + bounds.width * x) * scaleX,
        y: canvas.y - area.y + (bounds.y + bounds.height * y) * scaleY,
    }]));
}
