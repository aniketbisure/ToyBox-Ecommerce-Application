import authReducer, { logout, clearError, setTokens } from '../redux/slices/authSlice';

describe('authSlice reducer', () => {
  const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    selectedPhoneNumber: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  test('should return the initial state', () => {
    expect(authReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should handle logout', () => {
    const loggedInState = {
      ...initialState,
      user: { id: '1', name: 'Test User', email: 'test@test.com', role: 'user' as const },
      token: 'token123',
      isAuthenticated: true,
    };
    const actual = authReducer(loggedInState, logout());
    expect(actual).toEqual(initialState);
  });

  test('should handle clearError', () => {
    const errorState = {
      ...initialState,
      error: 'Some error',
    };
    const actual = authReducer(errorState, clearError());
    expect(actual.error).toBeNull();
  });

  test('should handle setTokens', () => {
    const tokens = { token: 'new_token', refreshToken: 'new_refresh' };
    const actual = authReducer(initialState, setTokens(tokens));
    expect(actual.token).toBe('new_token');
    expect(actual.refreshToken).toBe('new_refresh');
  });
});
