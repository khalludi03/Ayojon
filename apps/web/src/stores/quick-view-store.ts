import { useSyncExternalStore } from 'react';
import type { Product } from '@/types';

interface QuickViewState {
  isOpen: boolean;
  product: Product | null;
}

const INITIAL_STATE: QuickViewState = {
  isOpen: false,
  product: null,
};

// Vanilla store implementation
class QuickViewStore {
  private state: QuickViewState = INITIAL_STATE;
  private listeners = new Set<() => void>();

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = () => {
    return this.state;
  };

  openQuickView = (product: Product) => {
    this.state = { isOpen: true, product };
    this.emitChange();
  };

  closeQuickView = () => {
    this.state = INITIAL_STATE;
    this.emitChange();
  };

  private emitChange() {
    this.listeners.forEach((listener) => listener());
  }
}

const quickViewStore = new QuickViewStore();

// React hook
export function useQuickView() {
  const state = useSyncExternalStore(
    quickViewStore.subscribe,
    quickViewStore.getSnapshot,
    () => INITIAL_STATE
  );

  return {
    isOpen: state.isOpen,
    product: state.product,
    openQuickView: quickViewStore.openQuickView,
    closeQuickView: quickViewStore.closeQuickView,
  };
}
