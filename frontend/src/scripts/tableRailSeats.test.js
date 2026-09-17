import { tableRailSeats } from './tableRailSeats';

const bounds = { x: 120, y: 350, width: 840, height: 868 };
const gameSize = { width: 1080, height: 1920 };
test.each([[1440, 900], [1920, 1080], [1283, 1822]])('seats follow the rail at %s × %s', (width, height) => {
    const scale = Math.min(width / gameSize.width, height / gameSize.height);
    const canvas = { x: (width - gameSize.width * scale) / 2, y: 54, width: gameSize.width * scale, height: gameSize.height * scale };
    const area = { x: canvas.x - 20, y: 54 };
    const seats = tableRailSeats({ bounds, canvas, area, gameSize });
    const centreX = canvas.x - area.x + (bounds.x + bounds.width / 2) * scale;
    for (const [left, right] of [[4, 5], [3, 6], [2, 7], [1, 8]]) {
        expect(seats[left].y).toBeCloseTo(seats[right].y);
        expect((seats[left].x + seats[right].x) / 2).toBeCloseTo(centreX);
    }
    expect(seats[4].y).toBeLessThan(seats[3].y);
    expect(seats[3].y).toBeLessThan(seats[2].y);
    expect(seats[2].y).toBeLessThan(seats[1].y);
    const pedestalTop = canvas.y - area.y + (bounds.y + bounds.height * .8) * scale;
    Object.values(seats).forEach(seat => expect(seat.y).toBeLessThan(pedestalTop));
    const moved = tableRailSeats({ bounds: { ...bounds, x: bounds.x + 60, y: bounds.y + 100 }, canvas, area, gameSize });
    Object.keys(seats).forEach(seat => {
        expect(moved[seat].x - seats[seat].x).toBeCloseTo(60 * scale);
        expect(moved[seat].y - seats[seat].y).toBeCloseTo(100 * scale);
    });
});
