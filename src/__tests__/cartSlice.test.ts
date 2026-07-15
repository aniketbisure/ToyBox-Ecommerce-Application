import cartReducer, {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  saveForLater,
  moveToCart
} from '../redux/slices/cartSlice';

describe('cartSlice reducer', () => {
  const initialState = {
    items: [],
    savedItems: [],
    totalAmount: 0,
    loading: false,
  };

  const mockProduct = {
    id: '1',
    name: 'Test Toy',
    price: 500,
    image: 'test.jpg',
    quantity: 1,
  };

  test('should return the initial state', () => {
    expect(cartReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  test('should handle addToCart', () => {
    const actual = cartReducer(initialState, addToCart(mockProduct));
    expect(actual.items.length).toBe(1);
    expect(actual.items[0].id).toBe('1');
    expect(actual.totalAmount).toBe(500);
  });

  test('should increase quantity if item already in cart', () => {
    const stateWithItem = {
      ...initialState,
      items: [{ ...mockProduct }],
      totalAmount: 500
    };
    const actual = cartReducer(stateWithItem, addToCart(mockProduct));
    expect(actual.items[0].quantity).toBe(2);
    expect(actual.totalAmount).toBe(1000);
  });

  test('should handle removeFromCart', () => {
    const stateWithItem = {
      ...initialState,
      items: [{ ...mockProduct }],
      totalAmount: 500
    };
    const actual = cartReducer(stateWithItem, removeFromCart('1'));
    expect(actual.items.length).toBe(0);
    expect(actual.totalAmount).toBe(0);
  });

  test('should handle updateQuantity', () => {
    const stateWithItem = {
      ...initialState,
      items: [{ ...mockProduct }],
      totalAmount: 500
    };
    const actual = cartReducer(stateWithItem, updateQuantity({ id: '1', quantity: 3 }));
    expect(actual.items[0].quantity).toBe(3);
    expect(actual.totalAmount).toBe(1500);
  });

  test('should handle clearCart', () => {
    const stateWithItem = {
      ...initialState,
      items: [{ ...mockProduct }],
      totalAmount: 500
    };
    const actual = cartReducer(stateWithItem, clearCart());
    expect(actual.items.length).toBe(0);
    expect(actual.totalAmount).toBe(0);
  });

  test('should handle saveForLater', () => {
    const stateWithItem = {
      ...initialState,
      items: [{ ...mockProduct }],
      totalAmount: 500
    };
    const actual = cartReducer(stateWithItem, saveForLater('1'));
    expect(actual.items.length).toBe(0);
    expect(actual.savedItems.length).toBe(1);
    expect(actual.savedItems[0].id).toBe('1');
    expect(actual.totalAmount).toBe(0);
  });

  test('should handle moveToCart', () => {
    const stateWithSaved = {
      ...initialState,
      savedItems: [{ ...mockProduct }],
    };
    const actual = cartReducer(stateWithSaved, moveToCart('1'));
    expect(actual.savedItems.length).toBe(0);
    expect(actual.items.length).toBe(1);
    expect(actual.items[0].id).toBe('1');
    expect(actual.totalAmount).toBe(500);
  });
});
