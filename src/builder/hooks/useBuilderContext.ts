import { useContext } from 'react';
import { BuilderContext } from '../BuilderProvider';
import type { BuilderContextType } from './useBuilder';

export function useBuilder(): BuilderContextType {
  const ctx = useContext(BuilderContext);
  if (!ctx) {
    throw new Error('useBuilder must be used within a BuilderProvider');
  }
  return ctx;
}
