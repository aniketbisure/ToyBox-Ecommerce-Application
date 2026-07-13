import { createRef } from 'react';
import { ToastRef } from '../components/Toast';

export const toastRef = createRef<ToastRef>();

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
  toastRef.current?.show(message, type);
};
