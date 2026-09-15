/* global test, expect */
import { mobileTableLayout } from './mobileTableLayout';

test('eight mobile seats fit the playfield without overlapping at short and tall phone sizes', () => {
    for (const [width, height, canvasWidth, seatHeight] of [[320, 410, 230.625, 72], [390, 686, 385.875, 80], [430, 774, 430, 80]]) {
        const layout = mobileTableLayout({ width, height, canvasWidth, imageRatio: 1.0324 });
        const seats = Object.values(layout.seats);
        expect(seats).toHaveLength(8);
        seats.forEach(a => {
            expect(a.x - 35).toBeGreaterThanOrEqual(0);
            expect(a.x + 35).toBeLessThanOrEqual(width);
            expect(a.y - seatHeight / 2).toBeGreaterThanOrEqual(0);
            expect(a.y + seatHeight / 2).toBeLessThanOrEqual(height);
            seats.filter(b => b !== a).forEach(b => expect(Math.abs(a.x - b.x) >= 70 || Math.abs(a.y - b.y) >= seatHeight).toBe(true));
        });
    }
});
