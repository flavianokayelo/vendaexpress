import type { Page, PageSection, PageStatus } from './page';
import type { BlockDefinition } from './block';

export type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export type EditorMode = 'edit' | 'preview' | 'responsive';

export interface EditorState {
  page: Page | null;
  sections: PageSection[];
  selectedId: string | null;
  history: EditorHistoryEntry[];
  historyIndex: number;
  clipboard: PageSection | null;
  device: DeviceMode;
  mode: EditorMode;
  isDragging: boolean;
  zoom: number;
  dirty: boolean;
}

export interface EditorHistoryEntry {
  sections: PageSection[];
  description: string;
}

export type EditorAction =
  | { type: 'SET_PAGE'; page: Page }
  | { type: 'ADD_SECTION'; section: PageSection; index?: number }
  | { type: 'REMOVE_SECTION'; id: string }
  | { type: 'UPDATE_SECTION'; id: string; settings: Record<string, unknown> }
  | { type: 'UPDATE_SECTION_STYLE'; id: string; style: Record<string, unknown> }
  | { type: 'REORDER_SECTIONS'; sections: PageSection[] }
  | { type: 'SELECT_SECTION'; id: string | null }
  | { type: 'DESELECT_ALL' }
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'CUT_SECTION'; id: string }
  | { type: 'COPY_SECTION'; id: string }
  | { type: 'PASTE_SECTION'; index?: number }
  | { type: 'DUPLICATE_SECTION'; id: string }
  | { type: 'SET_DEVICE'; device: DeviceMode }
  | { type: 'SET_MODE'; mode: EditorMode }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'MARK_CLEAN' }
  | { type: 'SET_DRAGGING'; isDragging: boolean }
  | { type: 'SET_STATUS'; status: PageStatus }
  | { type: 'SET_TITLE'; title: string };

export interface BuilderContextType {
  state: EditorState;
  blocks: Map<string, BlockDefinition>;
  dispatch: React.Dispatch<EditorAction>;
  getBlock: (type: string) => BlockDefinition | undefined;
  getSelected: () => PageSection | null;
  canUndo: boolean;
  canRedo: boolean;
}
