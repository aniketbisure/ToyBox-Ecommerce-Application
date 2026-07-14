import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onProductAdded, onProductUpdated, onProductDeleted, fetchProducts } from '../redux/slices/productSlice';
import { AppDispatch } from '../redux/store';

/**
 * Hook to handle real-time updates from the admin side.
 * Currently uses a simple polling mechanism as a robust baseline.
 * For true real-time, it is recommended to integrate Socket.io.
 */
export const useRealTimeUpdates = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // 1. Initial Fetch
    dispatch(fetchProducts());

    // 2. Background Polling (Every 30 seconds)
    // This ensures that new products, price changes, or deletions
    // from the admin side appear without the user needing to refresh.
    const intervalId = setInterval(() => {
      console.log('🔄 Syncing with admin changes...');
      dispatch(fetchProducts());
    }, 30000);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Note: If you install socket.io-client, you would replace the interval
  // with socket listeners like:
  /*
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socket.on('product:created', (newProduct) => dispatch(onProductAdded(newProduct)));
    socket.on('product:updated', (updatedProduct) => dispatch(onProductUpdated(updatedProduct)));
    socket.on('product:deleted', (productId) => dispatch(onProductDeleted(productId)));
    return () => socket.disconnect();
  }, []);
  */
};
