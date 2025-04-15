
import { useContext } from 'react';
import { NostrContext } from '../contexts/NostrContext';

export const useNostr = () => {
  const context = useContext(NostrContext);
  if (context === null) {
    throw new Error('useNostr must be used within a NostrProvider');
  }
  return context;
};
