import { createContext, type ReactNode } from 'react';
import type { BuilderContextType } from './hooks/useBuilder';

export const BuilderContext = createContext<BuilderContextType | null>(null);

export function BuilderProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: BuilderContextType;
}) {
  return (
    <BuilderContext.Provider value={value}>
      {children}
    </BuilderContext.Provider>
  );
}
