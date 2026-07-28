import type { EditorAction, EditorState, EditorHistoryEntry } from '../types/editor';
import type { PageSection } from '../types/page';

const MAX_HISTORY = 50;

function pushHistory(state: EditorState, description: string): EditorHistoryEntry[] {
  const entry: EditorHistoryEntry = { sections: structuredClone(state.sections), description };
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(entry);
  if (newHistory.length > MAX_HISTORY) newHistory.shift();
  return newHistory;
}

function generateId(): string {
  return `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const initialEditorState: EditorState = {
  page: null,
  sections: [],
  selectedId: null,
  history: [{ sections: [], description: 'Estado inicial' }],
  historyIndex: 0,
  clipboard: null,
  device: 'desktop',
  mode: 'edit',
  isDragging: false,
  zoom: 100,
  dirty: false,
};

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SET_PAGE': {
      const sections = action.page?.sections ?? [];
      return {
        ...initialEditorState,
        page: action.page,
        sections,
        history: [{ sections: structuredClone(sections), description: 'Carregar página' }],
        historyIndex: 0,
      };
    }

    case 'ADD_SECTION': {
      const section: PageSection = { ...action.section, id: action.section.id || generateId() };
      const sections = [...state.sections];
      const idx = action.index ?? sections.length;
      sections.splice(idx, 0, section);
      return {
        ...state,
        sections,
        selectedId: section.id,
        dirty: true,
        history: pushHistory(state, `Adicionar ${action.section.type}`),
        historyIndex: state.history.length,
      };
    }

    case 'REMOVE_SECTION': {
      const sections = state.sections.filter((s) => s.id !== action.id);
      return {
        ...state,
        sections,
        selectedId: state.selectedId === action.id ? null : state.selectedId,
        dirty: true,
        history: pushHistory(state, 'Remover secção'),
        historyIndex: state.history.length,
      };
    }

    case 'UPDATE_SECTION': {
      const sections = state.sections.map((s) =>
        s.id === action.id ? { ...s, settings: { ...s.settings, ...action.settings } } : s
      );
      return {
        ...state,
        sections,
        dirty: true,
        history: pushHistory(state, 'Atualizar secção'),
        historyIndex: state.history.length,
      };
    }

    case 'UPDATE_SECTION_STYLE': {
      const sections = state.sections.map((s) =>
        s.id === action.id ? { ...s, style: { ...(s.style ?? {}), ...action.style } } : s
      );
      return {
        ...state,
        sections,
        dirty: true,
        history: pushHistory(state, 'Atualizar estilo'),
        historyIndex: state.history.length,
      };
    }

    case 'REORDER_SECTIONS': {
      return {
        ...state,
        sections: action.sections,
        dirty: true,
        history: pushHistory(state, 'Reordenar secções'),
        historyIndex: state.history.length,
      };
    }

    case 'SELECT_SECTION':
      return { ...state, selectedId: action.id };

    case 'DESELECT_ALL':
      return { ...state, selectedId: null };

    case 'UNDO': {
      if (state.historyIndex <= 0) return state;
      const newIndex = state.historyIndex - 1;
      return {
        ...state,
        sections: structuredClone(state.history[newIndex].sections),
        historyIndex: newIndex,
        dirty: true,
      };
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state;
      const newIndex = state.historyIndex + 1;
      return {
        ...state,
        sections: structuredClone(state.history[newIndex].sections),
        historyIndex: newIndex,
        dirty: true,
      };
    }

    case 'CUT_SECTION': {
      const section = state.sections.find((s) => s.id === action.id);
      if (!section) return state;
      return {
        ...state,
        clipboard: section,
        sections: state.sections.filter((s) => s.id !== action.id),
        selectedId: null,
        dirty: true,
        history: pushHistory(state, 'Cortar secção'),
        historyIndex: state.history.length,
      };
    }

    case 'COPY_SECTION': {
      const section = state.sections.find((s) => s.id === action.id);
      if (!section) return state;
      return { ...state, clipboard: { ...section } };
    }

    case 'PASTE_SECTION': {
      if (!state.clipboard) return state;
      const newSection: PageSection = { ...structuredClone(state.clipboard), id: generateId() };
      const sections = [...state.sections];
      sections.splice(action.index ?? sections.length, 0, newSection);
      return {
        ...state,
        sections,
        selectedId: newSection.id,
        dirty: true,
        history: pushHistory(state, 'Colar secção'),
        historyIndex: state.history.length,
      };
    }

    case 'DUPLICATE_SECTION': {
      const idx = state.sections.findIndex((s) => s.id === action.id);
      if (idx === -1) return state;
      const original = state.sections[idx];
      const duplicate: PageSection = { ...structuredClone(original), id: generateId() };
      const sections = [...state.sections];
      sections.splice(idx + 1, 0, duplicate);
      return {
        ...state,
        sections,
        selectedId: duplicate.id,
        dirty: true,
        history: pushHistory(state, 'Duplicar secção'),
        historyIndex: state.history.length,
      };
    }

    case 'SET_DEVICE':
      return { ...state, device: action.device };

    case 'SET_MODE':
      return { ...state, mode: action.mode };

    case 'SET_ZOOM':
      return { ...state, zoom: action.zoom };

    case 'MARK_CLEAN':
      return { ...state, dirty: false };

    case 'SET_DRAGGING':
      return { ...state, isDragging: action.isDragging };

    case 'SET_STATUS': {
      if (!state.page) return state;
      return {
        ...state,
        page: { ...state.page, status: action.status },
        dirty: true,
      };
    }

    case 'SET_TITLE': {
      if (!state.page) return state;
      return {
        ...state,
        page: { ...state.page, title: action.title },
        dirty: true,
      };
    }

    default:
      return state;
  }
}
