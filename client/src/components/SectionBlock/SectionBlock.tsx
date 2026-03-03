import type { EnrichedSectionNode } from '@/types/enriched';
import { getElementStatus } from '@/types/status';
import CollapseToggle from '@/components/CollapseToggle/CollapseToggle';
import RowBlock from '@/components/RowBlock/RowBlock';
import AddElementButton from '@/components/AddElementButton/AddElementButton';
import EmptyState from '@/components/EmptyState/EmptyState';
import PublishToggle from '@/components/PublishToggle/PublishToggle';
import ElementActionsMenu from '@/components/ElementActionsMenu/ElementActionsMenu';

interface SectionBlockProps {
  readonly section: EnrichedSectionNode;
}

export default function SectionBlock({ section }: SectionBlockProps) {
  const status = getElementStatus(section.statusFlags);
  const { isCollapsed, toggle } = section;

  const rootClasses = [
    'section-block',
    `section-block--${status}`,
    ...(isCollapsed ? ['section-block--collapsed'] : []),
  ].join(' ');

  return (
    <section className={rootClasses} data-testid="section-block">
      <div className="section-block__header">
        <CollapseToggle isCollapsed={isCollapsed} onToggle={toggle} label={section.title} />
        <h2 className="section-block__title">{section.title}</h2>
        <div className="section-block__actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <PublishToggle element={section} />
          <ElementActionsMenu element={section} />
        </div>
      </div>
      <div className="section-block__body">
        {section.children !== null && section.children.length > 0
          ? section.children.map((row) => (
            <RowBlock
              key={row.id}
              row={row}
            />
          ))
          : <EmptyState message="No rows" />}
        {section.childAreaId != null && (
          <AddElementButton
            areaId={section.childAreaId}
            allowedTypes={section.allowedTypes}
            label="Add row"
          />
        )}
      </div>
    </section>
  );
}
