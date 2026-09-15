/* global test, expect */
import { playInformation } from './playInformation';

const tables = [{ sName: 'High', nMinBuyIn: 10000 }, { sName: 'Starter', nMinBuyIn: 100 }, { sName: 'Club', nMinBuyIn: 1000 }];
test('finds the highest affordable buy-in including the exact balance boundary', () => {
    expect(playInformation({ signedIn: true, chips: 1000, tables })).toContain('Club with a 1,000-chip buy-in');
    expect(playInformation({ signedIn: true, chips: '15000', tables })).toContain('High with a 10,000-chip buy-in');
    expect(tables[0].sName).toBe('High');
});
test('handles zero balance and excludes invalid buy-ins', () => {
    expect(playInformation({ signedIn: true, chips: 0, tables })).toContain('100 more chips');
    expect(playInformation({ signedIn: true, chips: 1000, tables: [...tables, { sName: 'Invalid', nMinBuyIn: null }] })).toContain('Club');
});
test('does not invent a balance or recommendation while signed out or data is unavailable', () => {
    expect(playInformation({ signedIn: false, chips: 1000, tables })).toMatch(/^Sign in/);
    expect(playInformation({ signedIn: true, tables })).toContain('not available yet');
    expect(playInformation({ signedIn: true, chips: 1000, loading: true })).toContain('Checking');
    expect(playInformation({ signedIn: true, chips: 1000 })).toContain('currently unavailable');
});
