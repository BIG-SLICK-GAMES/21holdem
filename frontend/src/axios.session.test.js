const mockResponseInterceptor = jest.fn();
const mockGetCookie = jest.fn();
const mockRemoveToken = jest.fn();

jest.mock('axios', () => ({
    create: () => ({ interceptors: {
        request: { use: jest.fn() },
        response: { use: mockResponseInterceptor },
    } }),
}));
jest.mock('./helper/helper', () => ({ removeToken: mockRemoveToken }));
jest.mock('shared/utils', () => ({ getCookie: mockGetCookie, ReactToastify: jest.fn() }));

require('./axios');
const onError = mockResponseInterceptor.mock.calls[0][1];

beforeEach(() => {
    mockRemoveToken.mockClear();
    mockGetCookie.mockReturnValue('current-session');
    window.history.replaceState({}, '', '/lobby?tab=lobby-missions');
});

test('an expired lobby session is cleared so login and public prizes can recover', async () => {
    const error = { response: { status: 401 }, config: { headers: { Authorization: 'current-session' } } };
    await expect(onError(error)).rejects.toBe(error);
    expect(mockRemoveToken).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe('/lobby');
});

test('a late rejection for an older session preserves the current login', async () => {
    const error = { response: { status: 401 }, config: { headers: { Authorization: 'old-session' } } };
    await expect(onError(error)).rejects.toBe(error);
    expect(mockRemoveToken).not.toHaveBeenCalled();
});

test('failed login credentials do not clear another existing session', async () => {
    window.history.replaceState({}, '', '/login');
    const error = { response: { status: 401 }, config: { headers: { Authorization: 'current-session' } } };
    await expect(onError(error)).rejects.toBe(error);
    expect(mockRemoveToken).not.toHaveBeenCalled();
});

test('a temporary rewards server failure preserves the session', async () => {
    const error = { response: { status: 503 }, config: { headers: { Authorization: 'current-session' } } };
    await expect(onError(error)).rejects.toBe(error);
    expect(mockRemoveToken).not.toHaveBeenCalled();
});

test('failed header sign-in credentials do not clear an existing session', async () => {
    const error = { response: { status: 401 }, config: { url: '/api/v1/auth/login', headers: { Authorization: 'current-session' } } };
    await expect(onError(error)).rejects.toBe(error);
    expect(mockRemoveToken).not.toHaveBeenCalled();
});
