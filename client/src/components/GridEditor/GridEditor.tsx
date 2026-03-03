import { useElementTree } from '@/hooks/useElementTree';
import { useCollapseEnrichment } from '@/hooks/useCollapseEnrichment';
import { ElementActionsProvider } from '@/hooks/ElementActionsContext';
import { ViewportProvider } from '@/hooks/ViewportContext';
import { isSectionNode } from '@/types/elements';
import ViewportSwitcher from '@/components/ViewportSwitcher/ViewportSwitcher';
import SectionBlock from '@/components/SectionBlock/SectionBlock';
import AddElementButton from '@/components/AddElementButton/AddElementButton';
import EmptyState from '@/components/EmptyState/EmptyState';

interface GridEditorProps {
  readonly areaId: number;
  readonly pageId: number | null;
}

/**
 * Root component for the grid editor. Mounted by the entwine bridge
 * inside each `.grid-editor__container` element in the CMS.
 *
 * Composes ViewportSwitcher (viewport breakpoint selection) with
 * SectionBlock (section > row > column > element card hierarchy)
 * to render the full grid editing interface.
 *
 * Wraps the content area in ElementActionsProvider so all descendant
 * components can trigger create/publish/delete/duplicate mutations
 * without prop drilling.
 */
export default function GridEditor({ areaId, pageId }: GridEditorProps) {
  const { data, isLoading, error } = useElementTree(pageId);

  const sections = data === undefined
    ? []
    : (data[String(areaId)] ?? []).filter(isSectionNode);

  const enrichedSections = useCollapseEnrichment(sections, areaId);

  // Collect the allowed section types from the first section if available,
  // otherwise fall back to the raw (non-enriched) section data.
  // For a fresh page with no sections, we use allowedTypes from the page's
  // elemental area configuration — currently defaulting to the SectionNode
  // allowedTypes from the page config passed via the tree API.
  const sectionAllowedTypes = sections.length > 0
    ? sections[0].allowedTypes
    : { 'WeDevelop\\ElementalGrid\\Elements\\ElementSection': 'Section' };

  return (
    <div className="grid-editor" data-area-id={areaId} data-page-id={pageId ?? undefined}>
      {isLoading && <p className="grid-editor__loading" data-testid="grid-editor-loading">Loading elements...</p>}
      {error !== null && (
        <p className="grid-editor__error">
          Failed to load elements: {error.message}
        </p>
      )}
      {data !== undefined && pageId !== null && (
        <ElementActionsProvider pageId={pageId}>
          <ViewportProvider>
            <ViewportSwitcher />
            {enrichedSections.length > 0
              ? enrichedSections.map((section) => (
                <SectionBlock
                  key={section.id}
                  section={section}
                />
              ))
              : <EmptyState message="No sections yet" variant="centered" />}
            <AddElementButton
              areaId={areaId}
              allowedTypes={sectionAllowedTypes}
              label="Add section"
            />
          </ViewportProvider>
        </ElementActionsProvider>
      )}
      {data !== undefined && pageId === null && (
        <ViewportProvider>
          <ViewportSwitcher />
          <EmptyState message="No sections yet" variant="centered" />
        </ViewportProvider>
      )}
    </div>
  );
}
