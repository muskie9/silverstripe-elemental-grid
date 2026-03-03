import type { EnrichedRowNode } from '@/types/enriched';
import { getElementStatus } from '@/types/status';
import { getRowClasses } from '@/utils/gridAdapter';
import CollapseToggle from '@/components/CollapseToggle/CollapseToggle';
import ColumnBlock from '@/components/ColumnBlock/ColumnBlock';
import EmptyState from '@/components/EmptyState/EmptyState';
import PublishToggle from '@/components/PublishToggle/PublishToggle';
import ElementActionsMenu from '@/components/ElementActionsMenu/ElementActionsMenu';

interface RowBlockProps {
  readonly row: EnrichedRowNode;
}

export default function RowBlock({ row }: RowBlockProps) {
  const rowClasses = getRowClasses();
  const status = getElementStatus(row.statusFlags);
  const { isCollapsed, toggle } = row;

  const rootClasses = [
    'row-block',
    `row-block--${status}`,
    ...(isCollapsed ? ['row-block--collapsed'] : []),
  ].join(' ');

  return (
    <div className={rootClasses}>
      <div className="row-block__header">
        <CollapseToggle isCollapsed={isCollapsed} onToggle={toggle} label={row.title} />
        <h3 className="row-block__title">{row.title}</h3>
        <div className="row-block__actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
          <PublishToggle element={row} />
          <ElementActionsMenu element={row} />
        </div>
      </div>
      <div className={rowClasses}>
        {row.children !== null && row.children.length > 0
          ? row.children.map((column) => (
            <ColumnBlock
              key={column.id}
              column={column}
            />
          ))
          : <EmptyState message="No columns" />}
      </div>
    </div>
  );
}
