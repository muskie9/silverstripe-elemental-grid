import { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { CreateElementParams } from '@/api/endpoints';
import {
  useCreateElement,
  usePublishElement,
  useUnpublishElement,
  useDeleteElement,
  useDuplicateElement,
} from './useElementMutations';

export interface ElementActions {
  readonly createElement: (params: CreateElementParams) => void;
  readonly publishElement: (id: number) => void;
  readonly unpublishElement: (id: number) => void;
  readonly deleteElement: (id: number) => void;
  readonly duplicateElement: (id: number) => void;
}

const ElementActionsContext = createContext<ElementActions | null>(null);

interface ElementActionsProviderProps {
  readonly pageId: number;
  readonly children: ReactNode;
}

/**
 * Provides element mutation actions to all descendant components via React context.
 * Wraps the TanStack Query mutation hooks so deeply nested components can trigger
 * create, publish, unpublish, delete, and duplicate without prop drilling.
 */
export function ElementActionsProvider({ pageId, children }: ElementActionsProviderProps) {
  const createMutation = useCreateElement(pageId);
  const publishMutation = usePublishElement(pageId);
  const unpublishMutation = useUnpublishElement(pageId);
  const deleteMutation = useDeleteElement(pageId);
  const duplicateMutation = useDuplicateElement(pageId);

  const actions: ElementActions = useMemo(() => ({
    createElement: (params: CreateElementParams) => createMutation.mutate(params),
    publishElement: (id: number) => publishMutation.mutate(id),
    unpublishElement: (id: number) => unpublishMutation.mutate(id),
    deleteElement: (id: number) => deleteMutation.mutate(id),
    duplicateElement: (id: number) => duplicateMutation.mutate(id),
  }), [createMutation, publishMutation, unpublishMutation, deleteMutation, duplicateMutation]);

  return (
    <ElementActionsContext.Provider value={actions}>
      {children}
    </ElementActionsContext.Provider>
  );
}

/**
 * Access element action callbacks from any component inside an ElementActionsProvider.
 *
 * @throws Error if called outside an ElementActionsProvider
 */
export function useElementActions(): ElementActions {
  const context = useContext(ElementActionsContext);

  if (context === null) {
    throw new Error(
      'useElementActions must be used within an ElementActionsProvider. ' +
      'Wrap a parent component with <ElementActionsProvider pageId={...}>.',
    );
  }

  return context;
}
