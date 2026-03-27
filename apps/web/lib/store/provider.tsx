'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';

import { makeStore } from './store';

export function StoreProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // Keep a stable store instance across re-renders in the client tree.
  const [store] = useState(makeStore);

  return <Provider store={store}>{children}</Provider>;
}
