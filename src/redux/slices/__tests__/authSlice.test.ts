import authReducer, { logout, clearError } from '../authSlice';

describe('Auth Slice Logic', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle logout', () => {
    const loggedInState = {
      user: { id: '1', name: 'Test', email: 't@t.com', role: 'user' as const },
      token: 'secret-token',
      isAuthenticated: true,
      loading: false,
      error: null,
    };
    const actual = authReducer(loggedInState, logout());
    expect(actual.isAuthenticated).toBe(false);
    expect(actual.user).toBeNull();
  });

  it('should handle clearError', () => {
    const errorState = { ...initialState, error: 'Wrong Password' };
    const actual = authReducer(errorState, clearError());
    expect(actual.error).toBeNull();
  });
});
