import { useContext } from 'react';
import type { EditorAction, EditorState, BuilderContextType } from '../types/editor';
import type { BlockDefinition } from '../types/block';
import type { PageSection } from '../types/page';
import { useReducer, useMemo, useCallback } from 'react';
import { editorReducer, initialEditorState } from '../core/BuilderEngine';
import { globalBlockRegistry } from '../core/BlockRegistry';

export function useBuilderEngine(): BuilderContextType {
  const [state, dispatch] = useReducer(editorReducer, initialEditorState);

  const getBlock = useCallback((type: string): BlockDefinition | undefined => {
    return globalBlockRegistry.get(type);
  }, []);

  const getSelected = useCallback((): PageSection | null => {
    if (!state.selectedId) return null;
    return state.sections.find((s) => s.id === state.selectedId) ?? null;
  }, [state.selectedId, state.sections]);

  const value = useMemo<BuilderContextType>(() => ({
    state,
    blocks: useMemo(() => {
      const m = new Map<string, BlockDefinition>();
      for (const b of globalBlockRegistry.getAll()) m.set(b.type, b);
      return m;
    }, []),
    dispatch,
    getBlock,
    getSelected,
    canUndo: state.historyIndex > 0,
    canRedo: state.historyIndex < state.history.length - 1,
  }), [state, getBlock, getSelected]);

  return value;
}

export type { BuilderContextType };
