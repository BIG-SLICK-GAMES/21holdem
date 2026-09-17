import React from 'react';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayerTurnTimer from './PlayerTurnTimer';

beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(100000); });
afterEach(() => jest.useRealTimers());
test('counts down from a deadline without restarting on player updates', () => {
    const { rerender, container, unmount } = render(<PlayerTurnTimer endsAt={112000} totalMs={12000} />);
    expect(screen.getByLabelText('12 seconds remaining')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(4000));
    rerender(<PlayerTurnTimer endsAt={112000} totalMs={12000} />);
    expect(screen.getByLabelText('8 seconds remaining')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(9000));
    expect(screen.getByLabelText('0 seconds remaining')).toBeInTheDocument();
    expect(container.querySelector('.is-low')).toBeInTheDocument();
    unmount();
    expect(jest.getTimerCount()).toBe(0);
});
test('a resumed turn displays its remaining fraction and a new turn resets', () => {
    const { rerender, container } = render(<PlayerTurnTimer endsAt={106000} totalMs={12000} />);
    expect(container.querySelector('circle[pathLength]')).toHaveAttribute('stroke-dasharray', '0.5 1');
    act(() => jest.advanceTimersByTime(2000));
    rerender(<PlayerTurnTimer endsAt={114000} totalMs={12000} />);
    expect(screen.getByLabelText('12 seconds remaining')).toBeInTheDocument();
});
